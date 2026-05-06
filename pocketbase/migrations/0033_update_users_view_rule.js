migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('users')
    col.viewRule = '' // Allow public view (fields will be filtered by hook)
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('users')
    col.viewRule = "id = @request.auth.id || @request.auth.role = 'admin'"
    app.save(col)
  },
)
