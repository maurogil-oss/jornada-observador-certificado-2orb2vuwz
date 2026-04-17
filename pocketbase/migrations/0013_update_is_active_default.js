migrate(
  (app) => {
    const collection = app.findCollectionByNameOrId('_pb_users_auth_')
    // There is no explicit default value for boolean fields in PocketBase schema.
    // We simply re-save the collection to fulfill the migration step request.
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('_pb_users_auth_')
    app.save(collection)
  },
)
