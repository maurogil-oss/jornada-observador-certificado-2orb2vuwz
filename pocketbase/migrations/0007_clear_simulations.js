migrate((app) => {
  // Clear all mock submissions to ensure the database is truly empty of simulations
  app.db().newQuery('DELETE FROM submissions').execute()

  // Clear all users except administrators
  app.db().newQuery("DELETE FROM users WHERE role != 'admin' OR role IS NULL").execute()
})
