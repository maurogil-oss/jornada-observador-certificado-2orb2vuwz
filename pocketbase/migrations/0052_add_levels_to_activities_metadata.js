migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('activities_metadata')

    col.fields.add(new NumberField({ name: 'points_level_1' }))
    col.fields.add(new NumberField({ name: 'points_level_2' }))
    col.fields.add(new NumberField({ name: 'points_level_3' }))

    app.save(col)

    app
      .db()
      .newQuery(`
    UPDATE activities_metadata 
    SET points_level_1 = points, points_level_2 = points, points_level_3 = points 
    WHERE points IS NOT NULL
  `)
      .execute()
  },
  (app) => {
    const col = app.findCollectionByNameOrId('activities_metadata')

    col.fields.removeByName('points_level_1')
    col.fields.removeByName('points_level_2')
    col.fields.removeByName('points_level_3')

    app.save(col)
  },
)
