migrate(
  (app) => {
    const PDF_DOC_MIMES = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ]

    // 1. representation_meetings — add convocacao_file and ata_file
    const meetingsCol = app.findCollectionByNameOrId('representation_meetings')
    if (!meetingsCol.fields.getByName('convocacao_file')) {
      meetingsCol.fields.add(
        new FileField({
          name: 'convocacao_file',
          maxSelect: 1,
          maxSize: 20971520,
          mimeTypes: PDF_DOC_MIMES,
        }),
      )
    }
    if (!meetingsCol.fields.getByName('ata_file')) {
      meetingsCol.fields.add(
        new FileField({
          name: 'ata_file',
          maxSelect: 1,
          maxSize: 20971520,
          mimeTypes: PDF_DOC_MIMES,
        }),
      )
    }
    app.save(meetingsCol)

    // 2. representation_topics — add next_discussion_date and forum_id (relation to forums)
    const forumsColId = app.findCollectionByNameOrId('forums').id
    const topicsCol = app.findCollectionByNameOrId('representation_topics')
    if (!topicsCol.fields.getByName('next_discussion_date')) {
      topicsCol.fields.add(
        new DateField({
          name: 'next_discussion_date',
        }),
      )
    }
    if (!topicsCol.fields.getByName('forum_id')) {
      topicsCol.fields.add(
        new RelationField({
          name: 'forum_id',
          collectionId: forumsColId,
          cascadeDelete: false,
          maxSelect: 1,
        }),
      )
    }
    app.save(topicsCol)
  },
  (app) => {
    const meetingsCol = app.findCollectionByNameOrId('representation_meetings')
    try {
      meetingsCol.fields.removeByName('convocacao_file')
    } catch (_) {}
    try {
      meetingsCol.fields.removeByName('ata_file')
    } catch (_) {}
    app.save(meetingsCol)

    const topicsCol = app.findCollectionByNameOrId('representation_topics')
    try {
      topicsCol.fields.removeByName('next_discussion_date')
    } catch (_) {}
    try {
      topicsCol.fields.removeByName('forum_id')
    } catch (_) {}
    app.save(topicsCol)
  },
)
