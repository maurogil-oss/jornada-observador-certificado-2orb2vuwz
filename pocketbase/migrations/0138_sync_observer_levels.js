migrate(
  (app) => {
    // Busca todos os usuários ativos com role 'observer'
    const observers = app.findRecordsByFilter(
      'users',
      "is_active = true && role = 'observer'",
      'id',
      10000,
      0,
    )

    let updatedCount = 0
    const changedDetails = []

    for (const user of observers) {
      const points = user.getFloat('points') || 0
      const currentLevel = user.getString('level') || ''

      // Regra oficial do Manual:
      // Nível I: 0 a 499 pontos
      // Nível II: 500 a 999 pontos
      // Nível III: 1000+ pontos
      let canonicalLevel = 'Nível I'
      if (points >= 1000) {
        canonicalLevel = 'Nível III'
      } else if (points >= 500) {
        canonicalLevel = 'Nível II'
      } else {
        canonicalLevel = 'Nível I'
      }

      if (currentLevel !== canonicalLevel) {
        user.set('level', canonicalLevel)
        app.save(user)

        updatedCount++
        const info = {
          id: user.id,
          email: user.getString('email'),
          points: points,
          oldLevel: currentLevel,
          newLevel: canonicalLevel,
        }
        changedDetails.push(info)

        console.log(
          `[Migration 0138] Updated user ${info.email} (id: ${info.id}): points=${info.points}, level '${info.oldLevel}' -> '${info.newLevel}'`,
        )

        try {
          const logCollection = app.findCollectionByNameOrId('activity_logs')
          const logRecord = new Record(logCollection)
          logRecord.set('actor_id', null)
          logRecord.set('action', 'reconcile_observer_levels_migration_0138')
          logRecord.set('entity_type', 'users')
          logRecord.set('entity_id', user.id)
          logRecord.set(
            'description',
            `Migration 0138 Level Sync: Adjusted level from '${currentLevel}' to '${canonicalLevel}' for points=${points}`,
          )
          app.save(logRecord)
        } catch (_) {}
      }
    }

    console.log(
      `[Migration 0138] Finished reconciliation. Total observers updated: ${updatedCount}.`,
      JSON.stringify(changedDetails),
    )
  },
  (app) => {
    // Reversão pontual do Joe se necessário
    try {
      const joe = app.findFirstRecordByData('users', 'email', 'ojuara.joe@gmail.com')
      if (joe) {
        joe.set('level', 'Nível I - Observador Certificado (Iniciante)')
        app.save(joe)
      }
    } catch (_) {}
  },
)
