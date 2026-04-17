migrate(
  (app) => {
    app
      .db()
      .newQuery('UPDATE users SET is_active = 1 WHERE is_active = 0 OR is_active IS NULL')
      .execute()
  },
  (app) => {
    // Empty down migration as we don't know the exact previous state of each user
  },
)
