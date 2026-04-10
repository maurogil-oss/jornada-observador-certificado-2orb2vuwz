migrate(
  (app) => {
    // Add points and level to existing users auth collection
    const users = app.findCollectionByNameOrId('users')
    let usersChanged = false
    if (!users.fields.getByName('points')) {
      users.fields.add(new NumberField({ name: 'points' }))
      usersChanged = true
    }
    if (!users.fields.getByName('level')) {
      users.fields.add(new TextField({ name: 'level' }))
      usersChanged = true
    }
    if (usersChanged) {
      app.save(users)
    }

    // Create submissions collection
    const submissions = new Collection({
      name: 'submissions',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'nivel', type: 'text', required: true },
        {
          name: 'status',
          type: 'select',
          values: ['Em Análise', 'Aprovado', 'Ajuste Necessário'],
          required: true,
          maxSelect: 1,
        },
        { name: 'score', type: 'number' },
        {
          name: 'user_id',
          type: 'relation',
          collectionId: users.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'type',
          type: 'select',
          values: ['titulation', 'competency', 'other'],
          required: true,
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(submissions)
  },
  (app) => {
    const users = app.findCollectionByNameOrId('users')
    users.fields.removeByName('points')
    users.fields.removeByName('level')
    app.save(users)

    try {
      const submissions = app.findCollectionByNameOrId('submissions')
      app.delete(submissions)
    } catch (_) {}
  },
)
