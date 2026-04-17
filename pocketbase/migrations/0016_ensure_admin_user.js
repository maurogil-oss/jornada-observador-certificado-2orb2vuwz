migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')

    try {
      const record = app.findAuthRecordByEmail('_pb_users_auth_', 'maurog1@hotmail.com')
      record.set('role', 'admin')
      record.set('is_active', true)
      app.save(record)
    } catch (_) {
      const record = new Record(users)
      record.setEmail('maurog1@hotmail.com')
      record.setPassword('Skip@Pass')
      record.setVerified(true)
      record.set('role', 'admin')
      record.set('is_active', true)
      app.save(record)
    }
  },
  (app) => {
    try {
      const record = app.findAuthRecordByEmail('_pb_users_auth_', 'maurog1@hotmail.com')
      app.delete(record)
    } catch (_) {}
  },
)
