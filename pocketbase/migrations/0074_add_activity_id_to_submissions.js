migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('submissions')

    if (!col.fields.getByName('activity_id')) {
      col.fields.add(
        new RelationField({
          name: 'activity_id',
          collectionId: app.findCollectionByNameOrId('activities_metadata').id,
          maxSelect: 1,
          cascadeDelete: false,
        }),
      )
      app.save(col)
    }

    // Backfill existing records
    const submissions = app.findRecordsByFilter('submissions', '1=1', '', 10000, 0)
    const metadata = app.findRecordsByFilter('activities_metadata', '1=1', '', 10000, 0)

    for (let i = 0; i < submissions.length; i++) {
      const s = submissions[i]
      if (!s.get('activity_id')) {
        const title = s.getString('title').trim().toLowerCase()
        const match = metadata.find((m) => m.getString('title').trim().toLowerCase() === title)
        if (match) {
          s.set('activity_id', match.id)
          app.saveNoValidate(s)
        }
      }
    }
  },
  (app) => {
    const col = app.findCollectionByNameOrId('submissions')
    if (col.fields.getByName('activity_id')) {
      col.fields.removeByName('activity_id')
      app.save(col)
    }
  },
)
