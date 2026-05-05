migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('submissions')
    const fileField = col.fields.getByName('file')

    if (fileField) {
      fileField.maxSize = 20971520 // 20MB
      fileField.mimeTypes = ['application/pdf', 'image/jpeg', 'image/png']
    }

    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('submissions')
    const fileField = col.fields.getByName('file')

    if (fileField) {
      fileField.maxSize = 5242880 // Revert to generic default
      fileField.mimeTypes = []
    }

    app.save(col)
  },
)
