migrate(
  (app) => {
    const tagsCol = new Collection({
      name: 'forum_tags',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.role = 'admin'",
      deleteRule: "@request.auth.role = 'admin'",
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE UNIQUE INDEX idx_forum_tags_name ON forum_tags (name)'],
    })
    app.save(tagsCol)

    const forumsCol = app.findCollectionByNameOrId('forums')
    forumsCol.fields.add(
      new SelectField({
        name: 'pilar_pnatrans',
        values: [
          'Pilar 1: Gestão da Segurança no Trânsito',
          'Pilar 2: Vias Seguras',
          'Pilar 3: Segurança Veicular',
          'Pilar 4: Educação para o Trânsito',
          'Pilar 5: Atendimento às Vítimas',
          'Pilar 6: Normatização e Fiscalização',
          'Não Definido',
        ],
        required: true,
        maxSelect: 1,
      }),
    )
    forumsCol.fields.add(
      new RelationField({
        name: 'theme_tags',
        collectionId: tagsCol.id,
        maxSelect: 10,
      }),
    )
    app.save(forumsCol)

    const forums = app.findRecordsByFilter('forums', '1=1', '', 1000, 0)
    for (let i = 0; i < forums.length; i++) {
      forums[i].set('pilar_pnatrans', 'Não Definido')
      app.save(forums[i])
    }

    const relsCol = new Collection({
      name: 'forum_relations',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule:
        "@request.auth.role = 'admin' || @request.auth.id = source_forum_id.relator_id || @request.auth.id = target_forum_id.relator_id",
      deleteRule:
        "@request.auth.role = 'admin' || @request.auth.id = source_forum_id.relator_id || @request.auth.id = target_forum_id.relator_id",
      fields: [
        {
          name: 'source_forum_id',
          type: 'relation',
          required: true,
          collectionId: forumsCol.id,
          maxSelect: 1,
          cascadeDelete: true,
        },
        {
          name: 'target_forum_id',
          type: 'relation',
          required: true,
          collectionId: forumsCol.id,
          maxSelect: 1,
          cascadeDelete: true,
        },
        {
          name: 'status',
          type: 'select',
          required: true,
          values: ['Pending', 'Approved'],
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE UNIQUE INDEX idx_forum_relations_unique ON forum_relations (source_forum_id, target_forum_id)',
      ],
    })
    app.save(relsCol)
  },
  (app) => {
    try {
      const relsCol = app.findCollectionByNameOrId('forum_relations')
      app.delete(relsCol)
    } catch (e) {}

    try {
      const forumsCol = app.findCollectionByNameOrId('forums')
      let tField = forumsCol.fields.getByName('theme_tags')
      if (tField) {
        let idx = forumsCol.fields.indexOf(tField)
        forumsCol.fields.splice(idx, 1)
      }
      let pField = forumsCol.fields.getByName('pilar_pnatrans')
      if (pField) {
        let idx = forumsCol.fields.indexOf(pField)
        forumsCol.fields.splice(idx, 1)
      }
      app.save(forumsCol)
    } catch (e) {}

    try {
      const tagsCol = app.findCollectionByNameOrId('forum_tags')
      app.delete(tagsCol)
    } catch (e) {}
  },
)
