migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('users')
    if (!users.fields.getByName('is_active')) {
      users.fields.add(new BoolField({ name: 'is_active', presentable: true }))
    }
    app.save(users)

    app
      .db()
      .newQuery('UPDATE users SET is_active = 1 WHERE is_active IS NULL OR is_active = 0')
      .execute()
  },
  (app) => {
    const users = app.findCollectionByNameOrId('users')
    if (users.fields.getByName('is_active')) {
      users.fields.removeByName('is_active')
    }
    app.save(users)
  },
)
