/**
 * Alinha as regras de aceitação de arquivo do campo `file` da coleção `submissions`
 * com o que a interface anuncia (PDF, PNG, JPG, JPEG, WEBP, DOC, DOCX).
 * Também remove a referência ao campo inexistente `document_file` nos hooks,
 * padronizando a leitura do nome do arquivo em `file`.
 */
migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('submissions')
    const fileField = col.fields.getByName('file')

    if (fileField) {
      fileField.maxSize = 20971520 // 20MB
      fileField.mimeTypes = [
        'application/pdf',
        'image/png',
        'image/jpeg',
        'image/webp',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ]
    }

    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('submissions')
    const fileField = col.fields.getByName('file')

    if (fileField) {
      fileField.maxSize = 20971520
      fileField.mimeTypes = ['application/pdf', 'image/jpeg', 'image/png']
    }

    app.save(col)
  },
)
