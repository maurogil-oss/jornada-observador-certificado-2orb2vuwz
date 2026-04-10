migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('submissions')
    col.addIndex('idx_submissions_status', false, 'status', '')
    col.addIndex('idx_submissions_user_id', false, 'user_id', '')
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('submissions')
    col.removeIndex('idx_submissions_status')
    col.removeIndex('idx_submissions_user_id')
    app.save(col)
  },
)
