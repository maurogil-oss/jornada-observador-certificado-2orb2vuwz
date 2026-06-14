migrate(
  (app) => {
    const records = app.findRecordsByFilter(
      '_pb_users_auth_',
      "name ~ 'Omir' || full_name ~ 'Omir'",
      '',
      10,
      0,
    )

    for (const record of records) {
      record.setPassword('Miguelraul2024!')
      record.set('is_active', true)
      record.set('onboarding_completed', true)

      const role = record.get('role')
      if (!role) {
        record.set('role', 'observer')
      }

      app.save(record)
    }
  },
  (app) => {
    // Reverting passwords is not safely possible
  },
)
