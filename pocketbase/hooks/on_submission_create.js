/**
 * Hook disparado antes de criar uma submissão.
 * Implementa o modelo "TUDO AUTOMÁTICO" sem lista branca:
 * 1. Valida atividade vinculada e regras de pontuação
 * 2. Valida limite de repetição (ex: max_occurrences / "Até 5x")
 * 3. Valida se documento anexado está presente e legível (formato aceito)
 * 4. Valida nível e calcula pontuação canônica
 *
 * Se TUDO conforme:
 *   -> status: "Aprovado", score calculado, auto_evaluated: true
 * Se DIVERGÊNCIA:
 *   -> status: "Aguardando Complemento", divergence_reason: motivo detalhado, score: 0, auto_evaluated: true
 */

onRecordCreate((e) => {
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
  const userId = record.getString('user_id')
  let activityId = record.getString('activity_id')
  const title = record.getString('title') || ''

  // Suporte a arquivo tanto em 'file' quanto 'document_file'
  let docFile = record.getString('document_file')
  if (!docFile) {
    docFile = record.getString('file')
    if (docFile) {
      record.set('document_file', docFile)
    }
  }

  let user = null
  let userLevel = 'Nível I'

  if (userId) {
    try {
      user = e.app.findFirstRecordByData('users', 'id', userId)
      if (user) {
        userLevel = user.getString('level') || 'Nível I'
      }
    } catch (err) {
      console.log(`[Submission Auto-Approval] User ${userId} not found: ${err}`)
    }
  }

  const divergences = []

  // Validação (a): Atividade vinculada e presente no catálogo
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

  // Validação (d): Documento comprovatório anexado e legível/válido
  if (!docFile || docFile.trim() === '') {
    divergences.push('Nenhum documento ou evidência comprobatória foi anexado à submissão.')
  } else {
    // Validar extensão do arquivo (PDF, imagens, documentos oficiais)
    const validExts = ['.pdf', '.png', '.jpg', '.jpeg', '.webp', '.doc', '.docx']
    const lowerDoc = docFile.toLowerCase()
    const hasValidExt = validExts.some((ext) => lowerDoc.endsWith(ext))
    if (!hasValidExt) {
      divergences.push(
        `O formato do documento anexado (${docFile}) não é suportado. Formatos aceitos: PDF, JPG, PNG, DOC/DOCX.`,
      )
    }
  }

  // Validação (b): Limite de repetição da atividade respeitado
  if (activity && userId) {
    const isUnique = activity.getBool('is_unique')
    let maxOccurrences = activity.getInt('max_occurrences') || 0
    if (maxOccurrences === 0) {
      // Tenta inferir do título (ex: "Até 5x")
      maxOccurrences = extractMaxOccurrencesFromTitle(activity.getString('title'))
    }

    if (isUnique || maxOccurrences > 0) {
      try {
        // Busca submissões aprovadas do mesmo usuário para esta atividade
        const approvedSubmissions = e.app.findRecordsByFilter(
          'submissions',
          `user_id = '${userId}' && (activity_id = '${activity.id}' || title = '${activity.getString('title')}') && status = 'Aprovado'`,
          '-created',
          100,
          0,
        )
        const approvedCount = approvedSubmissions ? approvedSubmissions.length : 0

        if (isUnique && approvedCount >= 1) {
          divergences.push(
            `Esta atividade (${activity.getString('title')}) é de cumprimento único e você já possui uma submissão aprovada para ela.`,
          )
        } else if (maxOccurrences > 0 && approvedCount >= maxOccurrences) {
          divergences.push(
            `Limite máximo de repetições atingido (${maxOccurrences}x) para a atividade: "${activity.getString('title')}".`,
          )
        }
      } catch (err) {
        console.log(`[Submission Auto-Approval] Error checking repetition limit: ${err}`)
      }
    }
  }

  // Validação (e): Pontuação canônica
  let calculatedScore = 0
  if (activity) {
    calculatedScore = calculateActivityPoints(activity, userLevel)
  }

  // Avaliação do status
  record.set('auto_evaluated', true)

  if (divergences.length === 0) {
    // TUDO CONFORME -> APROVAÇÃO AUTOMÁTICA
    record.set('status', 'Aprovado')
    record.set('score', calculatedScore)
    record.set('divergence_reason', '')
    console.log(
      `[Submission Auto-Approval] Submission approved automatically. Score: ${calculatedScore} for user ${userId}`,
    )
  } else {
    // DIVERGÊNCIA ENCONTRADA -> Aguardando Complemento
    const fullReason = divergences.join(' ')
    record.set('status', 'Aguardando Complemento')
    record.set('score', 0)
    record.set('divergence_reason', fullReason)
    console.log(`[Submission Auto-Approval] Submission has divergences: ${fullReason}`)
  }

  e.next()
}, 'submissions')
