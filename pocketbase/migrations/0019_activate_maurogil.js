migrate(
  (app) => {
    let record
    try {
      record = app.findAuthRecordByEmail('users', 'maurogil@anamob.org.br')
    } catch (_) {
      const users = app.findCollectionByNameOrId('users')
      record = new Record(users)
      record.setEmail('maurogil@anamob.org.br')
      record.setPassword('Skip@Pass')
      record.setVerified(true)
      record.set('name', 'Mauro Gil')
      record.set('role', 'observer')
      record.set('is_active', false)
      app.save(record)
    }

    // Activating the user will trigger the on_user_activation_email hook
    // which verifies the backend automation for sending activation emails
    if (!record.getBool('is_active')) {
      record.set('is_active', true)
      app.save(record)
    }
  },
  (app) => {
    try {
      const record = app.findAuthRecordByEmail('users', 'maurogil@anamob.org.br')
      app.delete(record)
    } catch (_) {}
  },
)
