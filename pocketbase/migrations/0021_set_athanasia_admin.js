migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')

    try {
      const record = app.findAuthRecordByEmail('_pb_users_auth_', 'athanasia@anamob.org.br')

      // User already exists, ensure they are active and have admin role
      let needsSave = false
      if (record.getString('role') !== 'admin') {
        record.set('role', 'admin')
        needsSave = true
      }
      if (record.getBool('is_active') !== true) {
        record.set('is_active', true)
        needsSave = true
      }

      if (needsSave) {
        app.save(record)
      }
    } catch (_) {
      // User does not exist, create new admin user
      const record = new Record(users)
      record.setEmail('athanasia@anamob.org.br')
      record.setPassword('Skip@Pass')
      record.setVerified(true)
      record.set('name', 'Athanasia')
      record.set('role', 'admin')
      record.set('is_active', true)

      app.save(record)
    }
  },
  (app) => {
    try {
      const record = app.findAuthRecordByEmail('_pb_users_auth_', 'athanasia@anamob.org.br')

      // Safely revert the role back to observer
      if (record.getString('role') === 'admin') {
        record.set('role', 'observer')
        app.save(record)
      }
    } catch (_) {
      // Record not found, ignore
    }
  },
)
