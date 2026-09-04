migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('users')
    col.viewRule = "@request.auth.id != ''"
    col.listRule = "@request.auth.id != ''"
    col.updateRule = "id = @request.auth.id || @request.auth.role = 'admin'"
    col.deleteRule = "@request.auth.role = 'admin'"
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('users')
    col.viewRule = ''
    col.listRule = "id = @request.auth.id || @request.auth.role = 'admin'"
    col.updateRule = "id = @request.auth.id || @request.auth.role = 'admin'"
    col.deleteRule = "id = @request.auth.id || @request.auth.role = 'admin'"
    app.save(col)
  },
)
