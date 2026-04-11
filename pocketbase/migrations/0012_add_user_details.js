migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('users')

    if (!users.fields.getByName('turma')) {
      users.fields.add(new NumberField({ name: 'turma', min: 0, max: 16 }))
    }
    if (!users.fields.getByName('full_name')) {
      users.fields.add(new TextField({ name: 'full_name' }))
    }
    if (!users.fields.getByName('nickname')) {
      users.fields.add(new TextField({ name: 'nickname' }))
    }
    if (!users.fields.getByName('cpf_document')) {
      users.fields.add(new TextField({ name: 'cpf_document' }))
    }
    if (!users.fields.getByName('rg')) {
      users.fields.add(new TextField({ name: 'rg' }))
    }
    if (!users.fields.getByName('rg_issuer')) {
      users.fields.add(new TextField({ name: 'rg_issuer' }))
    }
    if (!users.fields.getByName('rg_state')) {
      users.fields.add(new TextField({ name: 'rg_state' }))
    }

    app.save(users)
  },
  (app) => {
    const users = app.findCollectionByNameOrId('users')
    users.fields.removeByName('turma')
    users.fields.removeByName('full_name')
    users.fields.removeByName('nickname')
    users.fields.removeByName('cpf_document')
    users.fields.removeByName('rg')
    users.fields.removeByName('rg_issuer')
    users.fields.removeByName('rg_state')
    app.save(users)
  },
)
