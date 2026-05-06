migrate(
  (app) => {
    try {
      const users = app.findRecordsByFilter(
        'users',
        "name ~ 'Adrea' || full_name ~ 'Adrea'",
        '',
        100,
        0,
      )
      for (let user of users) {
        let updated = false
        const name = user.getString('name') || ''
        const fullName = user.getString('full_name') || ''
        const email = user.getString('email') || ''

        const isTargetUser =
          name.includes('Moringo') || fullName.includes('Moringo') || email.includes('moringo')

        if (isTargetUser) {
          if (name.includes('Adrea')) {
            user.set('name', name.replace('Adrea', 'Andrea'))
            updated = true
          }
          if (fullName.includes('Adrea')) {
            user.set('full_name', fullName.replace('Adrea', 'Andrea'))
            updated = true
          }

          if (updated) {
            app.save(user)
          }
        }
      }
    } catch (err) {
      console.log('Migration 0039 up error:', err)
    }
  },
  (app) => {
    try {
      const users = app.findRecordsByFilter(
        'users',
        "name ~ 'Andrea' || full_name ~ 'Andrea'",
        '',
        100,
        0,
      )
      for (let user of users) {
        let updated = false
        const name = user.getString('name') || ''
        const fullName = user.getString('full_name') || ''
        const email = user.getString('email') || ''

        const isTargetUser =
          name.includes('Moringo') || fullName.includes('Moringo') || email.includes('moringo')

        if (isTargetUser) {
          if (name.includes('Andrea')) {
            user.set('name', name.replace('Andrea', 'Adrea'))
            updated = true
          }
          if (fullName.includes('Andrea')) {
            user.set('full_name', fullName.replace('Andrea', 'Adrea'))
            updated = true
          }

          if (updated) {
            app.save(user)
          }
        }
      }
    } catch (err) {
      console.log('Migration 0039 down error:', err)
    }
  },
)
