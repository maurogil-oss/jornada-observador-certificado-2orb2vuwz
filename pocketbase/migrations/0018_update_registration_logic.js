migrate(
  (app) => {
    const collection = app.findCollectionByNameOrId('users')
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('users')
    app.save(collection)
  },
)
