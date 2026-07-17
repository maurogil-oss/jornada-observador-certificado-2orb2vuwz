migrate(
  (app) => {
    function removeField(col, name) {
      var f = col.fields.getByName(name)
      if (!f) return
      var i = col.fields.indexOf(f)
      if (i >= 0) col.fields.splice(i, 1)
    }

    var forumsCol = app.findCollectionByNameOrId('forums')
    removeField(forumsCol, 'status')
    forumsCol.fields.add(
      new SelectField({
        name: 'status',
        required: true,
        values: ['Abertura', 'Discussões', 'Consolidação', 'Aprovação', 'Publicação'],
        maxSelect: 1,
      }),
    )
    app.save(forumsCol)

    var existingStatusMap = {
      Aberto: 'Abertura',
      'Em Consolidação': 'Consolidação',
      Encerrado: 'Publicação',
    }
    var forums = app.findRecordsByFilter('forums', '1=1', '', 1000, 0)
    for (var i = 0; i < forums.length; i++) {
      var oldStatus = forums[i].getString('status')
      if (existingStatusMap[oldStatus]) {
        forums[i].set('status', existingStatusMap[oldStatus])
        app.save(forums[i])
      }
    }

    var libCol = app.findCollectionByNameOrId('forum_library')
    removeField(libCol, 'category')
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

    var existingCatMap = {
      Legislação: 'Documento Técnico',
      Estudos: 'Nota Técnica',
      'Normas Técnicas': 'Guia Prático',
      Apresentações: 'Documento Técnico',
      Outros: 'Nota Técnica',
    }
    var libItems = app.findRecordsByFilter('forum_library', '1=1', '', 1000, 0)
    for (var j = 0; j < libItems.length; j++) {
      var oldCat = libItems[j].getString('category')
      if (existingCatMap[oldCat]) {
        libItems[j].set('category', existingCatMap[oldCat])
        app.save(libItems[j])
      }
    }
  },
  (app) => {
    function removeField(col, name) {
      var f = col.fields.getByName(name)
      if (!f) return
      var i = col.fields.indexOf(f)
      if (i >= 0) col.fields.splice(i, 1)
    }

    var forumsCol = app.findCollectionByNameOrId('forums')
    removeField(forumsCol, 'status')
    forumsCol.fields.add(
      new SelectField({
        name: 'status',
        required: true,
        values: ['Aberto', 'Em Consolidação', 'Encerrado'],
        maxSelect: 1,
      }),
    )
    app.save(forumsCol)

    var libCol = app.findCollectionByNameOrId('forum_library')
    removeField(libCol, 'category')
    libCol.fields.add(
      new SelectField({
        name: 'category',
        values: ['Legislação', 'Estudos', 'Normas Técnicas', 'Apresentações', 'Outros'],
        maxSelect: 1,
      }),
    )
    removeField(libCol, 'code')
    libCol.removeIndex('idx_forum_library_code')
    app.save(libCol)
  },
)
