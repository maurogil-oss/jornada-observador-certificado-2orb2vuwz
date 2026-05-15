migrate(
  (app) => {
    let users = []
    try {
      users = app.findRecordsByFilter(
        '_pb_users_auth_',
        "email = 'athanasia@anamob.org.br' || name ~ 'Athanasia' || full_name ~ 'Athanasia'",
        'created',
        100,
        0,
      )
    } catch (e) {
      return
    }

    if (!users || users.length === 0) return

    // Find the primary record (prioritize the exact email, then admin role, then the oldest)
    let primary = users.find(
      (u) => u.getString('email').toLowerCase() === 'athanasia@anamob.org.br',
    )
    if (!primary) {
      primary = users.find((u) => u.getString('role') === 'admin') || users[0]
    }

    let totalPoints = 0
    for (const u of users) {
      totalPoints += u.getInt('points') || 0
    }

    // Deduplicate and reassign records
    for (const u of users) {
      if (u.id !== primary.id) {
        // re-assign submissions
        try {
          const submissions = app.findRecordsByFilter(
            'submissions',
            `user_id = '${u.id}'`,
            '',
            1000,
            0,
          )
          for (const sub of submissions) {
            sub.set('user_id', primary.id)
            app.save(sub)
          }
        } catch (e) {}

        // re-assign import_logs
        try {
          const importLogs = app.findRecordsByFilter(
            'import_logs',
            `user_id = '${u.id}'`,
            '',
            1000,
            0,
          )
          for (const log of importLogs) {
            log.set('user_id', primary.id)
            app.save(log)
          }
        } catch (e) {}

        // re-assign activity_logs
        try {
          const activityLogs = app.findRecordsByFilter(
            'activity_logs',
            `actor_id = '${u.id}'`,
            '',
            1000,
            0,
          )
          for (const log of activityLogs) {
            log.set('actor_id', primary.id)
            app.save(log)
          }
        } catch (e) {}

        // delete the duplicate user
        try {
          app.delete(u)
        } catch (e) {}
      }
    }

    // Force properties on primary account to bypass any block/analysis state and ensure admin
    primary.setEmail('athanasia@anamob.org.br')
    primary.setVerified(true)
    primary.set('is_active', true)
    primary.set('onboarding_completed', true)
    primary.set('role', 'admin')

    if (!primary.getString('full_name') || primary.getString('full_name').trim() === '') {
      primary.set('full_name', 'Athanasia')
    }

    // Re-compute points based on approved submissions to guarantee data integrity
    let computedPoints = 0
    try {
      const approvedSubmissions = app.findRecordsByFilter(
        'submissions',
        `user_id = '${primary.id}' && status = 'Aprovado'`,
        '',
        1000,
        0,
      )
      for (const sub of approvedSubmissions) {
        computedPoints += sub.getInt('score') || 0
      }
    } catch (e) {}

    if (computedPoints > 0) {
      primary.set('points', computedPoints)
    } else if (totalPoints > 0) {
      primary.set('points', totalPoints)
    }

    app.save(primary)
  },
  (app) => {
    // Irreversible data cleanup
  },
)
