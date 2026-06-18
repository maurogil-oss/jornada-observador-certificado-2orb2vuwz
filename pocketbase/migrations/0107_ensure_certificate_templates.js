migrate(
  (app) => {
    // Ensure that all three required template levels exist so the user can download their certificate
    // without getting a 404 error if the expected level document is missing from the database.
    const collection = app.findCollectionByNameOrId('certificate_templates')
    const requiredLevels = ['Nível I', 'Nível II', 'Nível III']

    for (const level of requiredLevels) {
      try {
        app.findFirstRecordByData('certificate_templates', 'level', level)
      } catch (_) {
        const record = new Record(collection)
        record.set('level', level)
        // Attach a minimal 1x1 transparent PNG as placeholder file to prevent empty file crashes.
        // Admin should upload actual PDF/Image templates in the dashboard later.
        const bytes = new Uint8Array([
          137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82, 0, 0, 0, 1, 0, 0, 0, 1, 8,
          6, 0, 0, 0, 31, 21, 196, 137, 0, 0, 0, 11, 73, 68, 65, 84, 8, 215, 99, 96, 0, 2, 0, 0, 5,
          0, 1, 226, 38, 5, 155, 0, 0, 0, 0, 73, 69, 78, 68, 174, 66, 96, 130,
        ])
        const file = $filesystem.fileFromBytes(bytes, 'placeholder_template.png')
        record.set('file', file)
        record.set(
          'settings',
          JSON.stringify({
            name: { x: 400, y: 300, size: 24, color: '#000000', align: 'center' },
            date: { x: 400, y: 400, size: 16, color: '#000000', align: 'center' },
          }),
        )
        app.save(record)
      }
    }
  },
  (app) => {
    // No down operation needed
  },
)
