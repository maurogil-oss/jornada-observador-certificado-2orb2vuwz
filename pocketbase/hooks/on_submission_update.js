onRecordAfterUpdateSuccess((e) => {
  const originalStatus = e.record.original().getString('status')
  const newStatus = e.record.getString('status')
  const originalScore = e.record.original().getFloat('score')
  const newScore = e.record.getFloat('score')
  const originalType = e.record.original().getString('type')
  const newType = e.record.getString('type')

  if (
    newStatus === 'Aprovado' ||
    (originalStatus === 'Aprovado' && newStatus !== 'Aprovado') ||
    (newStatus === 'Aprovado' && originalScore !== newScore) ||
    (newStatus === 'Aprovado' && originalType !== newType)
  ) {
    const userId = e.record.getString('user_id')
    if (!userId) return e.next()

    try {
      const user = $app.findRecordById('users', userId)

      const submissions = $app.findRecordsByFilter(
        'submissions',
        "user_id = {:userId} && status = 'Aprovado'",
        '',
        1000,
        0,
        { userId: userId },
      )

      let totalPoints = 0
      let axes = {}
      let courseCount = 0
      let maxTitulationScore = 0

      for (let i = 0; i < submissions.length; i++) {
        const sub = submissions[i]
        const score = sub.getFloat('score') || 0
        const title = sub.getString('title')
        const type = sub.getString('type')

        if (type === 'titulation') {
          if (score > maxTitulationScore) {
            maxTitulationScore = score
          }
        } else if (title === 'Curso geral na área de trânsito/mobilidade (Mínimo 8h)') {
          if (courseCount < 5) {
            totalPoints += score
            courseCount++
          }
        } else {
          totalPoints += score
        }

        if (type) {
          axes[type] = true
        }
      }

      totalPoints += maxTitulationScore
      totalPoints = Math.round(totalPoints * 100) / 100
      let axesCount = Object.keys(axes).length

      const turma = user.getInt('turma') || 15
      const createdDateStr = user.getString('created')
      let isProbationary = false
      if (turma >= 15 && createdDateStr) {
        const createdDate = new Date(createdDateStr.replace(' ', 'T'))
        const oneYearAgo = new Date()
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
        if (createdDate > oneYearAgo) {
          isProbationary = true
        }
      }

      let newLevel = ''
      if (isProbationary) {
        newLevel = 'Nível I - Observador Certificado (Iniciante)'
      } else {
        if (totalPoints >= 1000 && axesCount >= 3) {
          newLevel = 'Nível III - Mobilizador'
        } else if (totalPoints >= 500 && axesCount >= 2) {
          newLevel = 'Nível II - Observador Certificado Pleno'
        } else if (axesCount >= 1) {
          newLevel = 'Nível I - Observador Certificado (Iniciante)'
        }
      }

      const originalUserPoints = user.getFloat('points')
      const originalUserLevel = user.getString('level')

      user.set('points', totalPoints)
      user.set('level', newLevel)

      $app.save(user)

      if (originalUserPoints !== totalPoints || originalUserLevel !== newLevel) {
        const logs = $app.findCollectionByNameOrId('activity_logs')
        const log = new Record(logs)
        log.set('entity_type', 'users')
        log.set('entity_id', user.id)
        log.set('action', 'Points/Level Recalculated')

        let desc = []
        if (originalUserPoints !== totalPoints)
          desc.push(`Points: ${originalUserPoints} -> ${totalPoints}`)
        if (originalUserLevel !== newLevel) desc.push(`Level: ${originalUserLevel} -> ${newLevel}`)
        log.set('description', desc.join(' | '))

        $app.save(log)
      }
    } catch (err) {
      console.log('Error updating user points: ', err)
    }
  }
  e.next()
}, 'submissions')
