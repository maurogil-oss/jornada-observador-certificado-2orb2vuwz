migrate(
  (app) => {
    // Find users that have invalid state or country
    const users = app.findRecordsByFilter(
      '_pb_users_auth_',
      "state = 'SSV' || country = 'waltdieney'",
      '',
      10000,
      0,
    )

    for (const user of users) {
      const userId = user.id

      // Cascade delete submissions related to the user
      const submissions = app.findRecordsByFilter(
        'submissions',
        `user_id = '${userId}'`,
        '',
        10000,
        0,
      )
      for (const sub of submissions) {
        app.delete(sub)
      }

      // Cascade delete import logs related to the user
      const importLogs = app.findRecordsByFilter(
        'import_logs',
        `user_id = '${userId}'`,
        '',
        10000,
        0,
      )
      for (const log of importLogs) {
        app.delete(log)
      }

      // Cascade delete activity logs related to the user
      const activityLogs = app.findRecordsByFilter(
        'activity_logs',
        `actor_id = '${userId}'`,
        '',
        10000,
        0,
      )
      for (const log of activityLogs) {
        app.delete(log)
      }

      // Finally delete the user
      app.delete(user)
    }
  },
  (app) => {
    // Cannot revert deleted users
  },
)
