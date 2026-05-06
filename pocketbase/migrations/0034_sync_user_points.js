migrate(
  (app) => {
    const users = app.findRecordsByFilter('users', '1=1', '', 10000, 0)

    for (let i = 0; i < users.length; i++) {
      const user = users[i]

      // Skip admins
      if (user.getString('role') === 'admin') continue

      const submissions = app.findRecordsByFilter(
        'submissions',
        "user_id = {:uid} && status = 'Aprovado'",
        '',
        10000,
        0,
        { uid: user.id },
      )

      let titulationMax = 0
      let competencySum = 0

      for (let j = 0; j < submissions.length; j++) {
        const sub = submissions[j]
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

      let newLevel = baseLevel
      if (totalPoints >= 500) {
        newLevel = 'Nível III - Mobilizador'
      }

      const originalPoints = user.getFloat('points')

      if (originalPoints !== totalPoints || currentLevel !== newLevel) {
        user.set('points', totalPoints)
        user.set('level', newLevel)
        app.save(user)

        try {
          const logs = app.findCollectionByNameOrId('activity_logs')
          const log = new Record(logs)
          log.set('entity_type', 'users')
          log.set('entity_id', user.id)
          log.set('action', 'Migration 0034 - Sync Points Data Correction')
          log.set(
            'description',
            `Points: ${originalPoints} -> ${totalPoints} | Level: ${currentLevel} -> ${newLevel}`,
          )
          app.save(log)
        } catch (e) {
          console.log('Could not write activity log for user sync:', e)
        }
      }
    }
  },
  (app) => {
    // Irreversible since we do not store the previous arbitrary state
  },
)
