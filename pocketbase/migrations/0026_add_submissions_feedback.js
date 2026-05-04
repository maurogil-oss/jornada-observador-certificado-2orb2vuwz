migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('submissions')

    if (!col.fields.getByName('feedback')) {
      col.fields.add(new TextField({ name: 'feedback' }))
    }

    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('submissions')

    if (col.fields.getByName('feedback')) {
      col.fields.removeByName('feedback')
      app.save(col)
    }
  },
)
