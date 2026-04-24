migrate(
  (app) => {
    try {
      const record = app.findFirstRecordByFilter(
        '_pb_users_auth_',
        "name ~ 'Athanasia' || nickname ~ 'Athanasia' || full_name ~ 'Athanasia' || email ~ 'Athanasia'",
      )

      if (record) {
        record.set('role', 'admin')
        app.saveNoValidate(record)
        console.log('User Athanasia successfully updated to admin role.')
      }
    } catch (_) {
      console.log('User Athanasia not found. Skipping role update.')
    }
  },
  (app) => {
    try {
      const record = app.findFirstRecordByFilter(
        '_pb_users_auth_',
        "name ~ 'Athanasia' || nickname ~ 'Athanasia' || full_name ~ 'Athanasia' || email ~ 'Athanasia'",
      )

      if (record) {
        record.set('role', 'observer')
        app.saveNoValidate(record)
        console.log('User Athanasia successfully reverted to observer role.')
      }
    } catch (_) {
      console.log('User Athanasia not found. Skipping role revert.')
    }
  },
)
