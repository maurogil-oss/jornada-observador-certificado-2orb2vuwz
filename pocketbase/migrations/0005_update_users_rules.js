migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('users')
    col.listRule = "id = @request.auth.id || @request.auth.role = 'admin'"
    col.viewRule = "id = @request.auth.id || @request.auth.role = 'admin'"
    col.updateRule = "id = @request.auth.id || @request.auth.role = 'admin'"
    col.deleteRule = "id = @request.auth.id || @request.auth.role = 'admin'"
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('users')
    col.listRule = 'id = @request.auth.id'
    col.viewRule = 'id = @request.auth.id'
    col.updateRule = 'id = @request.auth.id'
    col.deleteRule = 'id = @request.auth.id'
    app.save(col)
  },
)
