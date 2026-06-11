migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('users')
    if (!users.fields.getByName('international_document')) {
      users.fields.add(
        new TextField({
          name: 'international_document',
          required: false,
        }),
      )
    }
    app.save(users)
  },
  (app) => {
    const users = app.findCollectionByNameOrId('users')
    users.fields.removeByName('international_document')
    app.save(users)
  },
)
