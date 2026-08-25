migrate(
  (app) => {
    try {
      const record = app.findAuthRecordByEmail('_pb_users_auth_', 'alvarolcsantos@gmail.com')
      record.setVerified(true)
      app.save(record)
    } catch (err) {
      console.log('Error verifying user alvarolcsantos@gmail.com:', err)
    }
  },
  (app) => {
    try {
      const record = app.findAuthRecordByEmail('_pb_users_auth_', 'alvarolcsantos@gmail.com')
      record.setVerified(false)
      app.save(record)
    } catch (err) {
      console.log('Error rolling back verification for alvarolcsantos@gmail.com:', err)
    }
  },
)
