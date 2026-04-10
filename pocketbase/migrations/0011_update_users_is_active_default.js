migrate(
  (app) => {
    // Update all existing users to be active by default, fixing the issue where
    // new accounts were incorrectly created with is_active = false.
    app
      .db()
      .newQuery('UPDATE users SET is_active = 1 WHERE is_active = 0 OR is_active IS NULL')
      .execute()
  },
  (app) => {
    // Data migration - no rollback needed
  },
)
