migrate(
  (app) => {
    app.db().newQuery("UPDATE users SET state = '' WHERE LOWER(state) = 'ssv'").execute()
    app.db().newQuery("UPDATE users SET country = '' WHERE LOWER(country) = 'waltdisney'").execute()
    app
      .db()
      .newQuery("UPDATE users SET country = 'Brasil' WHERE LOWER(country) IN ('brazil', 'brasil')")
      .execute()
  },
  (app) => {
    // Irreversible
  },
)
