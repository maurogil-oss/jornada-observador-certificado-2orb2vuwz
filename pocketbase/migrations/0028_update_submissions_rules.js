migrate(
  (app) => {
    const submissions = app.findCollectionByNameOrId('submissions')
    submissions.listRule = "@request.auth.role = 'admin' || user_id = @request.auth.id"
    app.save(submissions)
  },
  (app) => {
    const submissions = app.findCollectionByNameOrId('submissions')
    submissions.listRule = "@request.auth.id != ''"
    app.save(submissions)
  },
)
