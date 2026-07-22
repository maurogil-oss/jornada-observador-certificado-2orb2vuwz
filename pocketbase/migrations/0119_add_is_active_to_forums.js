migrate(
  (app) => {
    const forumsCol = app.findCollectionByNameOrId('forums')
    if (!forumsCol.fields.getByName('is_active')) {
      forumsCol.fields.add(new BoolField({ name: 'is_active', presentable: true }))
    }
    app.save(forumsCol)

    app
      .db()
      .newQuery('UPDATE forums SET is_active = 1 WHERE is_active IS NULL OR is_active = 0')
      .execute()
  },
  (app) => {
    const forumsCol = app.findCollectionByNameOrId('forums')
    if (forumsCol.fields.getByName('is_active')) {
      forumsCol.fields.removeByName('is_active')
    }
    app.save(forumsCol)
  },
)
