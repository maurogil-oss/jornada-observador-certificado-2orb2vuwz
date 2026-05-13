migrate(
  (app) => {
    const users = app.findRecordsByFilter('users', '1=1', '', 10000, 0)

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

      let totalPoints = 0
      let axes = {}
      let courseCount = 0
      let maxTitulationScore = 0

      for (let j = 0; j < submissions.length; j++) {
        const sub = submissions[j]
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

      const originalPoints = user.getFloat('points')
      if (originalPoints !== totalPoints) {
        user.set('points', totalPoints)

        let axesCount = Object.keys(axes).length
        let newLevel = ''
        if (totalPoints >= 1000 && axesCount >= 3) {
          newLevel = 'Nível III - Mobilizador'
        } else if (totalPoints >= 500 && axesCount >= 2) {
          newLevel = 'Nível II - Observador Certificado Pleno'
        } else if (axesCount >= 1) {
          newLevel = 'Nível I - Observador Certificado (Iniciante)'
        }

        if (newLevel) {
          user.set('level', newLevel)
        }

        app.save(user)

        try {
          const logs = app.findCollectionByNameOrId('activity_logs')
          const log = new Record(logs)
          log.set('entity_type', 'users')
          log.set('entity_id', user.id)
          log.set('action', 'Points Recalculated (Education Logic Update)')
          log.set('description', `Points: ${originalPoints} -> ${totalPoints}`)
          app.save(log)
        } catch (e) {
          console.log('Error creating activity log:', e)
        }
      }
    }
  },
  (app) => {
    const users = app.findRecordsByFilter('users', '1=1', '', 10000, 0)

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

      let totalPoints = 0
      let courseCount = 0

      for (let j = 0; j < submissions.length; j++) {
        const sub = submissions[j]
        const score = sub.getFloat('score') || 0
        const title = sub.getString('title')

        if (title === 'Curso geral na área de trânsito/mobilidade (Mínimo 8h)') {
          if (courseCount < 5) {
            totalPoints += score
            courseCount++
          }
        } else {
          totalPoints += score
        }
      }

      totalPoints = Math.round(totalPoints * 100) / 100

      if (user.getFloat('points') !== totalPoints) {
        user.set('points', totalPoints)
        app.save(user)
      }
    }
  },
)
