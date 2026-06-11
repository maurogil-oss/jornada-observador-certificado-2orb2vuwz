migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('activities_metadata')

    col.fields.add(new TextField({ name: 'category' }))
    col.fields.add(new BoolField({ name: 'is_unique' }))
    col.fields.add(new TextField({ name: 'group_id' }))
    col.fields.add(
      new SelectField({ name: 'points_type', values: ['fixed', 'level_based'], maxSelect: 1 }),
    )
    col.fields.add(new NumberField({ name: 'max_occurrences' }))

    col.addIndex('idx_activities_metadata_axis_category', false, 'axis, category', '')

    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('activities_metadata')
    col.fields.removeByName('category')
    col.fields.removeByName('is_unique')
    col.fields.removeByName('group_id')
    col.fields.removeByName('points_type')
    col.fields.removeByName('max_occurrences')
    col.removeIndex('idx_activities_metadata_axis_category')
    app.save(col)
  },
)
