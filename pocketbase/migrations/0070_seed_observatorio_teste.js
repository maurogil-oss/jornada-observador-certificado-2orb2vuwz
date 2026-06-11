migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')

    try {
      app.findAuthRecordByEmail('_pb_users_auth_', 'observatorio.teste@example.com')
      return // already seeded
    } catch (_) {}

    const record = new Record(users)
    record.setEmail('observatorio.teste@example.com')
    record.setPassword('Skip@Pass')
    record.setVerified(true)

    record.set('name', 'Observatório Teste')
    record.set('full_name', 'Observatório Teste')
    record.set('turma', 15)
    record.set('onboarding_completed', false)
    record.set('is_active', true)
    record.set('role', 'observer')

    app.save(record)
  },
  (app) => {
    try {
      const record = app.findAuthRecordByEmail('_pb_users_auth_', 'observatorio.teste@example.com')
      app.delete(record)
    } catch (_) {}
  },
)
