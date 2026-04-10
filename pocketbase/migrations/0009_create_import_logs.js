migrate(
  (app) => {
    const usersCol = app.findCollectionByNameOrId('users')

    const collection = new Collection({
      name: 'import_logs',
      type: 'base',
      listRule: "@request.auth.role = 'admin'",
      viewRule: "@request.auth.role = 'admin'",
      createRule: "@request.auth.role = 'admin'",
      updateRule: "@request.auth.role = 'admin'",
      deleteRule: "@request.auth.role = 'admin'",
      fields: [
        { name: 'file_name', type: 'text', required: true },
        { name: 'row_count', type: 'number', required: false },
        {
          name: 'status',
          type: 'select',
          required: true,
          values: ['Success', 'Error'],
          maxSelect: 1,
        },
        { name: 'details', type: 'text', required: false },
        {
          name: 'user_id',
          type: 'relation',
          required: true,
          collectionId: usersCol.id,
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })

    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('import_logs')
    app.delete(collection)
  },
)
