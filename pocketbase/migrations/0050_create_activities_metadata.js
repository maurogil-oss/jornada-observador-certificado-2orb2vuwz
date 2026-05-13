migrate(
  (app) => {
    const collection = new Collection({
      name: 'activities_metadata',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: "@request.auth.role = 'admin'",
      updateRule: "@request.auth.role = 'admin'",
      deleteRule: "@request.auth.role = 'admin'",
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'axis', type: 'text' },
        { name: 'definition', type: 'text' },
        { name: 'required_evidence', type: 'text' },
        { name: 'validation_method', type: 'text' },
        { name: 'max_limit', type: 'text' },
        { name: 'points', type: 'number' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(collection)

    collection.addIndex('idx_activities_metadata_title', true, 'title', '')
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('activities_metadata')
    app.delete(collection)
  },
)
