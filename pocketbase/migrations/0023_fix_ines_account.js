migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')

    // Try to find by wrong email
    try {
      const wrongUser = app.findAuthRecordByEmail('_pb_users_auth_', 'psicoinesarend@gmail')
      wrongUser.setEmail('psicoinesarend@gmail.com')
      wrongUser.set('is_active', true)
      app.save(wrongUser)
      return
    } catch (_) {}

    // If not found by wrong email, ensure she exists with the correct one
    try {
      const existing = app.findAuthRecordByEmail('_pb_users_auth_', 'psicoinesarend@gmail.com')
      if (!existing.getBool('is_active')) {
        existing.set('is_active', true)
        app.save(existing)
      }
      return
    } catch (_) {}

    // If not exists at all, create it so she can reset
    const record = new Record(users)
    record.setEmail('psicoinesarend@gmail.com')
    record.setPassword('Skip@Pass123')
    record.setVerified(true)
    record.set('is_active', true)
    record.set('name', 'Inês Arend')
    record.set('full_name', 'Inês Arend')
    app.save(record)
  },
  (app) => {
    // down migration intentionally left empty
  },
)
