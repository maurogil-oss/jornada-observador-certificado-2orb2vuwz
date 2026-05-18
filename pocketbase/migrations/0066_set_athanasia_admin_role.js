migrate(
  (app) => {
    try {
      const record = app.findAuthRecordByEmail('users', 'athanasiadias@gmail.com')
      record.set('role', 'admin')
      record.set('is_active', true)
      app.save(record)
    } catch (err) {
      console.log('User athanasiadias@gmail.com not found. Skipping.')
    }
  },
  (app) => {
    try {
      const record = app.findAuthRecordByEmail('users', 'athanasiadias@gmail.com')
      record.set('role', 'observer')
      app.save(record)
    } catch (err) {
      // Ignore if not found
    }
  },
)
