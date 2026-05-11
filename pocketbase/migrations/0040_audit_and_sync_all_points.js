migrate(
  (app) => {
    const users = app.findRecordsByFilter('users', '1=1', '', 10000, 0)
    const logs = app.findCollectionByNameOrId('activity_logs')

    for (let i = 0; i < users.length; i++) {
      const user = users[i]

      let submissions = []
      try {
        submissions = app.findRecordsByFilter(
          'submissions',
          "user_id = {:userId} && status = 'Aprovado'",
          '',
          1000,
          0,
          { userId: user.id },
        )
      } catch (e) {
        // no submissions found for this user, leave array empty
      }

      let totalPoints = 0
      for (let j = 0; j < submissions.length; j++) {
        totalPoints += submissions[j].getFloat('score') || 0
      }
      totalPoints = Math.round(totalPoints * 100) / 100

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

      const originalPoints = user.getFloat('points')
      const originalLevel = user.getString('level')

      if (originalPoints !== totalPoints || originalLevel !== newLevel) {
        user.set('points', totalPoints)
        user.set('level', newLevel)
        app.save(user)

        const log = new Record(logs)
        log.set('entity_type', 'users')
        log.set('entity_id', user.id)
        log.set('action', 'System Audit: Points Recalculated')

        let desc = []
        if (originalPoints !== totalPoints) desc.push(`Points: ${originalPoints} -> ${totalPoints}`)
        if (originalLevel !== newLevel) desc.push(`Level: ${originalLevel} -> ${newLevel}`)
        log.set('description', desc.join(' | '))
        app.save(log)
      }
    }
  },
  (app) => {
    // Revert not feasible automatically as we don't store previous points globally
  },
)
