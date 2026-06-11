migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')

    // Idempotent: skip if user already exists
    try {
      app.findAuthRecordByEmail('_pb_users_auth_', 'observatorio.teste@jornada.com.br')
      return // already seeded
    } catch (_) {}

    const record = new Record(users)
    record.setEmail('observatorio.teste@jornada.com.br')
    record.setPassword('Skip@Pass')
    record.setVerified(true)
    record.set('name', 'Observatório Teste')
    record.set('full_name', 'Observatório Teste')
    record.set('role', 'observer')
    record.set('is_active', true)
    record.set('onboarding_completed', false)
    app.save(record)
  },
  (app) => {
    try {
      const record = app.findAuthRecordByEmail(
        '_pb_users_auth_',
        'observatorio.teste@jornada.com.br',
      )
      app.delete(record)
    } catch (_) {}
  },
)
