migrate(
  (app) => {
    app.db().newQuery('DELETE FROM submissions').execute()
    app.db().newQuery("DELETE FROM users WHERE email != 'maurog1@hotmail.com'").execute()
  },
  (app) => {
    // down migration
  },
)
