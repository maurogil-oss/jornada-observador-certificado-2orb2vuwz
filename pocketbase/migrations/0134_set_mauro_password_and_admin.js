migrate(
  (app) => {
    try {
      const record = app.findAuthRecordByEmail('_pb_users_auth_', 'maurog1@hotmail.com')
      record.setPassword('maurogil7004')
      record.setVerified(true)
      record.set('role', 'admin')
      record.set('is_active', true)
      app.save(record)
    } catch (err) {
      console.log('Error updating maurog1@hotmail.com in migration 0134:', err)
      throw err
    }
  },
  (app) => {
    // Reverting passwords is not possible
  },
)
