migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('users')
    // Ensure the delete rule explicitly allows admins
    users.deleteRule = "id = @request.auth.id || @request.auth.role = 'admin'"
    app.save(users)
  },
  (app) => {
    // rollback not necessary as it enforces intended behavior
  },
)
