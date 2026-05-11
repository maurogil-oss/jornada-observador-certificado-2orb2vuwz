migrate(
  (app) => {
    const collection = app.findCollectionByNameOrId('submissions')
    collection.listRule =
      "@request.auth.role = 'admin' || user_id = @request.auth.id || (@request.auth.id != '' && status = 'Aprovado')"
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('submissions')
    collection.listRule = "@request.auth.role = 'admin' || user_id = @request.auth.id"
    app.save(collection)
  },
)
