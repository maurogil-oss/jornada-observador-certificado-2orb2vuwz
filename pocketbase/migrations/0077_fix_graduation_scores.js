migrate(
  (app) => {
    try {
      const record = app.findFirstRecordByData(
        'activities_metadata',
        'title',
        'Graduação (Reconhecida MEC)',
      )

      record.set('points_level_1', 10)
      record.set('points_level_2', 20)
      record.set('points_level_3', 30)

      app.save(record)

      try {
        const logsCollection = app.findCollectionByNameOrId('activity_logs')
        const logRecord = new Record(logsCollection)
        logRecord.set('action', 'update')
        logRecord.set('entity_type', 'activities_metadata')
        logRecord.set('entity_id', record.id)
        logRecord.set(
          'description',
          "Migração 0077: Atualizou points_level_2 para 20 na atividade 'Graduação (Reconhecida MEC)'",
        )
        app.save(logRecord)
      } catch (e) {
        console.log('Falha ao registrar activity_log', e)
      }
    } catch (_) {
      // Registro não encontrado, ignorar
    }
  },
  (app) => {
    try {
      const record = app.findFirstRecordByData(
        'activities_metadata',
        'title',
        'Graduação (Reconhecida MEC)',
      )

      record.set('points_level_1', 10)
      record.set('points_level_2', 15) // Reverter
      record.set('points_level_3', 30)

      app.save(record)

      try {
        const logsCollection = app.findCollectionByNameOrId('activity_logs')
        const logRecord = new Record(logsCollection)
        logRecord.set('action', 'update')
        logRecord.set('entity_type', 'activities_metadata')
        logRecord.set('entity_id', record.id)
        logRecord.set(
          'description',
          "Migração 0077 revertida: Atualizou points_level_2 para 15 na atividade 'Graduação (Reconhecida MEC)'",
        )
        app.save(logRecord)
      } catch (e) {
        console.log('Falha ao registrar activity_log', e)
      }
    } catch (_) {
      // Registro não encontrado, ignorar
    }
  },
)
