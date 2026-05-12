migrate(
  (app) => {
    const users = app.findRecordsByFilter('users', '1=1', '', 10000, 0)

    for (let i = 0; i < users.length; i++) {
      const user = users[i]
      const userId = user.id

      let submissions = []
      try {
        submissions = app.findRecordsByFilter(
          'submissions',
          "user_id = {:userId} && status = 'Aprovado'",
          '',
          1000,
          0,
          { userId: userId },
        )
      } catch (e) {
        // User has no approved submissions
      }

      let totalPoints = 0
      let axes = {}

      for (let j = 0; j < submissions.length; j++) {
        const sub = submissions[j]
        totalPoints += sub.getFloat('score') || 0
        const type = sub.getString('type')
        if (type) {
          axes[type] = true
        }
      }

      totalPoints = Math.round(totalPoints * 100) / 100
      let axesCount = Object.keys(axes).length

      let newLevel = ''
      if (totalPoints >= 1000 && axesCount >= 3) {
        newLevel = 'Nível III - Mobilizador'
      } else if (totalPoints >= 500 && axesCount >= 2) {
        newLevel = 'Nível II - Observador Certificado Pleno'
      } else if (axesCount >= 1) {
        newLevel = 'Nível I - Observador Certificado (Iniciante)'
      }

      const originalPoints = user.getFloat('points')
      const originalLevel = user.getString('level')

      if (originalPoints !== totalPoints || originalLevel !== newLevel) {
        user.set('points', totalPoints)
        user.set('level', newLevel)
        app.saveNoValidate(user)

        try {
          const logs = app.findCollectionByNameOrId('activity_logs')
          const log = new Record(logs)
          log.set('entity_type', 'users')
          log.set('entity_id', user.id)
          log.set('action', 'Points/Level Recalculated (Migration 0042 Audit)')

          let desc = []
          if (originalPoints !== totalPoints) {
            desc.push(`Points: ${originalPoints} -> ${totalPoints}`)
          }
          if (originalLevel !== newLevel) {
            desc.push(`Level: '${originalLevel}' -> '${newLevel}'`)
          }
          log.set('description', desc.join(' | '))

          app.saveNoValidate(log)
        } catch (e) {
          // Ignore activity log failures
        }
      }
    }
  },
  (app) => {
    // Irreversible without snapshot
  },
)
