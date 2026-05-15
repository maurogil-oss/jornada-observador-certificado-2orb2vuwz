migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('_pb_users_auth_')
    col.fields.add(new BoolField({ name: 'onboarding_completed' }))
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('_pb_users_auth_')
    col.fields.removeByName('onboarding_completed')
    app.save(col)
  },
)
