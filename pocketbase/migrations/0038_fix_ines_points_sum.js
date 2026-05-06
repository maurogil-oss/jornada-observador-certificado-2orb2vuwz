migrate(
  (app) => {
    const users = app.findRecordsByFilter(
      'users',
      "name ~ 'Inês' || full_name ~ 'Inês' || name ~ 'Ines' || full_name ~ 'Ines' || email ~ 'ines'",
      '',
      100,
      0,
    )

    for (let i = 0; i < users.length; i++) {
      const user = users[i]
      const submissions = app.findRecordsByFilter(
        'submissions',
        "user_id = {:userId} && status = 'Aprovado'",
        '',
        1000,
        0,
        { userId: user.id },
      )

      let titulationSum = 0
      let competencySum = 0

      for (let j = 0; j < submissions.length; j++) {
        const sub = submissions[j]
        const type = sub.getString('type')
        const score = sub.getFloat('score') || 0

        if (type === 'titulation') {
          titulationSum += score
        } else {
          competencySum += score
        }
      }

      if (titulationSum > 250) titulationSum = 250
      const totalPoints = titulationSum + competencySum

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

      user.set('points', totalPoints)
      user.set('level', newLevel)

      app.save(user)

      try {
        const logs = app.findCollectionByNameOrId('activity_logs')
        const log = new Record(logs)
        log.set('entity_type', 'users')
        log.set('entity_id', user.id)
        log.set('action', 'Points Synced (Migration 0038)')
        log.set('description', 'Recalculated Inês points using sum logic')
        app.save(log)
      } catch (e) {
        // Ignore if logs fail
      }
    }
  },
  (app) => {
    // Revert not applicable
  },
)
