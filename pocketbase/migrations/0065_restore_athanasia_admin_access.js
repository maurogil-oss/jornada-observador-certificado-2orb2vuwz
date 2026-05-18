migrate(
  (app) => {
    try {
      const record = app.findAuthRecordByEmail('users', 'athanasia.janet@gmail.com')
      record.setPassword('Th@na*77')
      record.set('role', 'admin')
      record.set('is_active', true)
      record.set('onboarding_completed', true)
      app.save(record)
    } catch (_) {
      const users = app.findCollectionByNameOrId('users')
      const record = new Record(users)
      record.setEmail('athanasia.janet@gmail.com')
      record.setPassword('Th@na*77')
      record.setVerified(true)
      record.set('name', 'Athanasia')
      record.set('role', 'admin')
      record.set('is_active', true)
      record.set('onboarding_completed', true)
      app.save(record)
    }
  },
  (app) => {
    try {
      const record = app.findAuthRecordByEmail('users', 'athanasia.janet@gmail.com')
      record.set('role', 'observer')
      app.save(record)
    } catch (_) {}
  },
)
