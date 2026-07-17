migrate(
  (app) => {
    const forumsCol = app.findCollectionByNameOrId('forums')
    const statusField = forumsCol.fields.getByName('status')
    if (statusField) {
      forumsCol.fields.remove(statusField)
    }
    forumsCol.fields.add(
      new SelectField({
        name: 'status',
        required: true,
        values: ['Abertura', 'Discussões', 'Consolidação', 'Aprovação', 'Publicação'],
        maxSelect: 1,
      }),
    )
    app.save(forumsCol)

    const existingStatusMap = {
      Aberto: 'Abertura',
      'Em Consolidação': 'Consolidação',
      Encerrado: 'Publicação',
    }
    const forums = app.findRecordsByFilter('forums', '1=1', '', 1000, 0)
    for (let i = 0; i < forums.length; i++) {
      const oldStatus = forums[i].getString('status')
      if (existingStatusMap[oldStatus]) {
        forums[i].set('status', existingStatusMap[oldStatus])
        app.save(forums[i])
      }
    }

    const libCol = app.findCollectionByNameOrId('forum_library')
    const catField = libCol.fields.getByName('category')
    if (catField) {
      libCol.fields.remove(catField)
    }
    libCol.fields.add(
      new SelectField({
        name: 'category',
        values: ['Documento Técnico', 'Nota Técnica', 'Guia Prático'],
        maxSelect: 1,
      }),
    )
    if (!libCol.fields.getByName('code')) {
      libCol.fields.add(new TextField({ name: 'code' }))
    }
    libCol.addIndex('idx_forum_library_code', true, 'code', '')
    app.save(libCol)

    const existingCatMap = {
      Legislação: 'Documento Técnico',
      Estudos: 'Nota Técnica',
      'Normas Técnicas': 'Guia Prático',
      Apresentações: 'Documento Técnico',
      Outros: 'Nota Técnica',
    }
    const libItems = app.findRecordsByFilter('forum_library', '1=1', '', 1000, 0)
    for (let i = 0; i < libItems.length; i++) {
      const oldCat = libItems[i].getString('category')
      if (existingCatMap[oldCat]) {
        libItems[i].set('category', existingCatMap[oldCat])
        app.save(libItems[i])
      }
    }
  },
  (app) => {
    const forumsCol = app.findCollectionByNameOrId('forums')
    const statusField = forumsCol.fields.getByName('status')
    if (statusField) {
      forumsCol.fields.remove(statusField)
    }
    forumsCol.fields.add(
      new SelectField({
        name: 'status',
        required: true,
        values: ['Aberto', 'Em Consolidação', 'Encerrado'],
        maxSelect: 1,
      }),
    )
    app.save(forumsCol)

    const libCol = app.findCollectionByNameOrId('forum_library')
    const catField = libCol.fields.getByName('category')
    if (catField) {
      libCol.fields.remove(catField)
    }
    libCol.fields.add(
      new SelectField({
        name: 'category',
        values: ['Legislação', 'Estudos', 'Normas Técnicas', 'Apresentações', 'Outros'],
        maxSelect: 1,
      }),
    )
    const codeField = libCol.fields.getByName('code')
    if (codeField) {
      libCol.fields.remove(codeField)
    }
    libCol.removeIndex('idx_forum_library_code')
    app.save(libCol)
  },
)
