migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('users')
    if (!users.fields.getByName('role')) {
      users.fields.add(
        new SelectField({
          name: 'role',
          values: ['admin', 'observer'],
          maxSelect: 1,
        }),
      )
    }
    app.save(users)
  },
  (app) => {
    const users = app.findCollectionByNameOrId('users')
    if (users.fields.getByName('role')) {
      users.fields.removeByName('role')
      app.save(users)
    }
  },
)
