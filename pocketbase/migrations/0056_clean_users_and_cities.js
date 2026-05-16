migrate(
  (app) => {
    // 1. Find and delete specific test users and their cascading data
    const filter =
      "nickname ~ 'balantinis' || nickname ~ 'SSSV' || nickname ~ 'waltdisney' || name ~ 'balantinis' || name ~ 'SSSV' || name ~ 'waltdisney'"
    const users = app.findRecordsByFilter('users', filter, '', 100, 0)

    for (const user of users) {
      const submissions = app.findRecordsByFilter(
        'submissions',
        `user_id = '${user.id}'`,
        '',
        1000,
        0,
      )
      for (const s of submissions) {
        app.delete(s)
      }

      const importLogs = app.findRecordsByFilter(
        'import_logs',
        `user_id = '${user.id}'`,
        '',
        1000,
        0,
      )
      for (const i of importLogs) {
        app.delete(i)
      }

      const activityLogs = app.findRecordsByFilter(
        'activity_logs',
        `actor_id = '${user.id}'`,
        '',
        1000,
        0,
      )
      for (const a of activityLogs) {
        app.delete(a)
      }

      app.delete(user)
    }

    // 2. Normalize city names for São José dos Campos
    const cityUsers = app.findRecordsByFilter('users', "city != ''", '', 10000, 0)
    for (const user of cityUsers) {
      const city = user.getString('city').trim()
      const lowerCity = city.toLowerCase()

      if (lowerCity === 'sao jose dos campos' || lowerCity === 'são josé dos campos') {
        if (city !== 'São José dos Campos') {
          user.set('city', 'São José dos Campos')
          app.saveNoValidate(user)
        }
      }
    }
  },
  (app) => {
    // Revert not feasible for deleted test records
  },
)
