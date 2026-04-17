migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('submissions')

    if (!col.fields.getByName('link')) {
      col.fields.add(new URLField({ name: 'link', exceptDomains: [], onlyDomains: [] }))
    }

    if (!col.fields.getByName('description')) {
      col.fields.add(new TextField({ name: 'description' }))
    }

    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('submissions')

    col.fields.removeByName('link')
    col.fields.removeByName('description')

    app.save(col)
  },
)
