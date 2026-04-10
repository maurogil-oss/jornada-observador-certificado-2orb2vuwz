migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('users')

    users.fields.add(new TextField({ name: 'birth_date' }))
    users.fields.add(new TextField({ name: 'city' }))
    users.fields.add(new TextField({ name: 'state' }))
    users.fields.add(new TextField({ name: 'country' }))
    users.fields.add(new TextField({ name: 'workplace' }))

    users.addIndex('idx_users_city', false, 'city', '')
    users.addIndex('idx_users_state', false, 'state', '')
    users.addIndex('idx_users_country', false, 'country', '')

    app.save(users)
  },
  (app) => {
    const users = app.findCollectionByNameOrId('users')

    users.fields.removeByName('birth_date')
    users.fields.removeByName('city')
    users.fields.removeByName('state')
    users.fields.removeByName('country')
    users.fields.removeByName('workplace')

    users.removeIndex('idx_users_city')
    users.removeIndex('idx_users_state')
    users.removeIndex('idx_users_country')

    app.save(users)
  },
)
