onRecordAfterUpdateSuccess((e) => {
  const originalStatus = e.record.original().getString('status')
  const newStatus = e.record.getString('status')
  const originalScore = e.record.original().getFloat('score')
  const newScore = e.record.getFloat('score')

  if (
    newStatus === 'Aprovado' ||
    (originalStatus === 'Aprovado' && newStatus !== 'Aprovado') ||
    (newStatus === 'Aprovado' && originalScore !== newScore)
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

      let titulationMax = 0
      let competencySum = 0

      for (let i = 0; i < submissions.length; i++) {
        const sub = submissions[i]
        const type = sub.getString('type')
        const score = sub.getFloat('score') || 0

        if (type === 'titulation') {
          if (score > titulationMax) titulationMax = score
        } else {
          competencySum += score
        }
      }

      if (titulationMax > 250) titulationMax = 250
      const totalPoints = titulationMax + competencySum

      const currentLevel = user.getString('level')
      const turma = user.getInt('turma') || 15

      let baseLevel =
        turma <= 14
          ? 'Nível II - Observador Certificado Pleno'
          : 'Nível I - Observador Certificado (Iniciante)'
      let newLevel = currentLevel || baseLevel

      if (totalPoints >= 500) {
        newLevel = 'Nível III - Mobilizador'
      } else {
        if (totalPoints < 500 && currentLevel === 'Nível III - Mobilizador') {
          newLevel = baseLevel
        } else if (totalPoints < 500) {
          newLevel = currentLevel || baseLevel
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
