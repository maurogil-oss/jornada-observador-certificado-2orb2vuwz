migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('submissions')

    if (!col.fields.getByName('file')) {
      col.fields.add(
        new FileField({
          name: 'file',
          maxSelect: 1,
          maxSize: 10485760,
          mimeTypes: ['application/pdf', 'image/jpeg', 'image/png'],
        }),
      )
    }

    col.updateRule =
      "@request.auth.role = 'admin' || (user_id = @request.auth.id && status != 'Aprovado')"
    col.deleteRule =
      "@request.auth.role = 'admin' || (user_id = @request.auth.id && status != 'Aprovado')"

    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('submissions')
    try {
      col.fields.removeByName('file')
    } catch (e) {}
    col.updateRule = "@request.auth.id != ''"
    col.deleteRule = "@request.auth.id != ''"
    app.save(col)
  },
)
