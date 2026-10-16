/**
 * Hook disparado antes de atualizar uma submissão.
 * Lida com:
 * 1. Complementação pelo usuário (status sai de 'Aguardando Complemento' para reanálise)
 * 2. Renúncia da submissão
 * 3. Validação de mudança de pontuação ou aprovação manual pelo admin
 */

onRecordUpdate((e) => {
  const calculateActivityPoints = (act, level) => {
    const pointsType = act.getString('points_type') || 'fixed'
    const defaultPoints = act.getFloat('points') || 0

    if (pointsType === 'level_based') {
      let lvlKey = 'points_level_1'
      if (level === 'Nível II') lvlKey = 'points_level_2'
      else if (level === 'Nível III') lvlKey = 'points_level_3'
      const lvlPts = act.getFloat(lvlKey)
      return lvlPts > 0 ? lvlPts : defaultPoints
    }

    return defaultPoints
  }

  const extractMaxOccurrencesFromTitle = (title) => {
    if (!title) return 0
    const match = title.match(/até\s+(\d+)x/i) || title.match(/ate\s+(\d+)x/i)
    if (match && match[1]) {
      return parseInt(match[1], 10)
    }
    return 0
  }

  const record = e.record
  const original = record.originalCopy()
  const origStatus = original ? original.getString('status') : ''
  const newStatus = record.getString('status')

  // Se o usuário estiver complementando (enviou novo arquivo ou solicitou reavaliação):
  // Detecta quando document_file ou file mudou ou o status foi definido para reanálise / 'Em Análise'
  const docFileChanged =
    original &&
    (original.getString('document_file') !== record.getString('document_file') ||
      original.getString('file') !== record.getString('file'))

  if (
    (origStatus === 'Aguardando Complemento' || origStatus === 'Ajuste Necessário') &&
    (docFileChanged || newStatus === 'Em Análise')
  ) {
    const userId = record.getString('user_id')
    let activityId = record.getString('activity_id')
    const title = record.getString('title') || ''
    let docFile = record.getString('document_file') || record.getString('file')

    if (docFile && !record.getString('document_file')) {
      record.set('document_file', docFile)
    }

    let userLevel = 'Nível I'
    if (userId) {
      try {
        const u = e.app.findFirstRecordByData('users', 'id', userId)
        if (u) userLevel = u.getString('level') || 'Nível I'
      } catch (_) {}
    }

    const divergences = []

    let activity = null
    if (activityId) {
      try {
        activity = e.app.findFirstRecordByData('activities_metadata', 'id', activityId)
      } catch (_) {}
    }

    if (!activity && title) {
      try {
        activity = e.app.findFirstRecordByData('activities_metadata', 'title', title)
        if (activity) {
          activityId = activity.id
          record.set('activity_id', activity.id)
        }
      } catch (_) {}
    }

    if (!activity) {
      divergences.push('Atividade não selecionada ou não identificada no catálogo oficial.')
    }

    if (!docFile || docFile.trim() === '') {
      divergences.push('Nenhum documento ou evidência comprobatória foi anexado à submissão.')
    } else {
      const validExts = ['.pdf', '.png', '.jpg', '.jpeg', '.webp', '.doc', '.docx']
      const lowerDoc = docFile.toLowerCase()
      const hasValidExt = validExts.some((ext) => lowerDoc.endsWith(ext))
      if (!hasValidExt) {
        divergences.push(`O formato do documento anexado (${docFile}) não é suportado.`)
      }
    }

    if (activity && userId) {
      const isUnique = activity.getBool('is_unique')
      let maxOccurrences = activity.getInt('max_occurrences') || 0
      if (maxOccurrences === 0) {
        maxOccurrences = extractMaxOccurrencesFromTitle(activity.getString('title'))
      }

      if (isUnique || maxOccurrences > 0) {
        try {
          // Submissões aprovadas exceto a atual
          const approvedSubmissions = e.app.findRecordsByFilter(
            'submissions',
            `user_id = '${userId}' && (activity_id = '${activity.id}' || title = '${activity.getString('title')}') && status = 'Aprovado' && id != '${record.id}'`,
            '-created',
            100,
            0,
          )
          const approvedCount = approvedSubmissions ? approvedSubmissions.length : 0

          if (isUnique && approvedCount >= 1) {
            divergences.push(
              `Esta atividade é de cumprimento único e você já possui uma submissão aprovada.`,
            )
          } else if (maxOccurrences > 0 && approvedCount >= maxOccurrences) {
            divergences.push(`Limite máximo de repetições atingido (${maxOccurrences}x).`)
          }
        } catch (_) {}
      }
    }

    record.set('auto_evaluated', true)
    if (divergences.length === 0) {
      // Reanálise aprovada
      const calculatedScore = activity ? calculateActivityPoints(activity, userLevel) : 0
      record.set('status', 'Aprovado')
      record.set('score', calculatedScore)
      record.set('divergence_reason', '')
    } else {
      // Continua com divergência
      record.set('status', 'Aguardando Complemento')
      record.set('score', 0)
      record.set('divergence_reason', divergences.join(' '))
    }
  }

  // Se o status for Renunciada, zerar score
  if (newStatus === 'Renunciada') {
    record.set('score', 0)
  }

  e.next()
}, 'submissions')
