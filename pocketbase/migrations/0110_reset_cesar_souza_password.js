migrate(
  (app) => {
    const record = app.findAuthRecordByEmail('users', 'cesar.souza@jornada.com')
    record.setPassword('Cesar@2026')
    record.setVerified(true)
    app.save(record)
  },
  (app) => {
    // Reverting passwords is not safely possible
  },
)
