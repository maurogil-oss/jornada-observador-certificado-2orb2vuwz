migrate(
  (app) => {
    const users = app.findRecordsByFilter('users', 'turma >= 15', '', 10000, 0)

    const now = new Date()
    const oneYearAgo = new Date()
    oneYearAgo.setFullYear(now.getFullYear() - 1)

    for (let i = 0; i < users.length; i++) {
      const user = users[i]
      const createdDateStr = user.getString('created')
      if (!createdDateStr) continue

      const createdDate = new Date(createdDateStr.replace(' ', 'T'))
      if (createdDate > oneYearAgo) {
        const currentLevel = user.getString('level')
        const targetLevel = 'Nível I - Observador Certificado (Iniciante)'

        if (currentLevel !== targetLevel) {
          user.set('level', targetLevel)
          app.saveNoValidate(user)

          try {
            const logsCol = app.findCollectionByNameOrId('activity_logs')
            const log = new Record(logsCol)
            log.set('entity_type', 'users')
            log.set('entity_id', user.id)
            log.set('action', 'Probationary Period Reversion')
            log.set(
              'description',
              `Level reverted: ${currentLevel} -> ${targetLevel} (turma 15+ < 1yr)`,
            )
            app.saveNoValidate(log)
          } catch (_) {}
        }
      }
    }
  },
  (app) => {
    // Reverting would require recalculating the points of all users in Turma >= 15 to restore their real level.
    // Leaving this block empty as a strict point recalculation script should handle any potential rollback.
  },
)
