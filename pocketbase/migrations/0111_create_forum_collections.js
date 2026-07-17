migrate(
  (app) => {
    const forums = new Collection({
      name: 'forums',
      type: 'base',
      listRule: '@request.auth.id != ""',
      viewRule: '@request.auth.id != ""',
      createRule: "@request.auth.role = 'admin'",
      updateRule: "@request.auth.role = 'admin'",
      deleteRule: "@request.auth.role = 'admin'",
      fields: [
        { name: 'code', type: 'text', required: true },
        { name: 'title', type: 'text', required: true },
        { name: 'objective', type: 'text' },
        {
          name: 'relator_id',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          maxSelect: 1,
        },
        { name: 'opening_date', type: 'date' },
        { name: 'closing_date', type: 'date' },
        {
          name: 'status',
          type: 'select',
          required: true,
          values: ['Aberto', 'Em Consolidação', 'Encerrado'],
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE UNIQUE INDEX idx_forums_code ON forums (code)'],
    })
    app.save(forums)

    const forumMessages = new Collection({
      name: 'forum_messages',
      type: 'base',
      listRule: '@request.auth.id != ""',
      viewRule: '@request.auth.id != ""',
      createRule: '@request.auth.id != ""',
      updateRule: '@request.auth.id = user_id',
      deleteRule: '@request.auth.id = user_id',
      fields: [
        {
          name: 'forum_id',
          type: 'relation',
          required: true,
          collectionId: forums.id,
          maxSelect: 1,
          cascadeDelete: true,
        },
        {
          name: 'user_id',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          maxSelect: 1,
        },
        { name: 'content', type: 'text', required: true },
        {
          name: 'attachments',
          type: 'file',
          maxSelect: 10,
          maxSize: 10485760,
          mimeTypes: [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'image/jpeg',
            'image/png',
            'image/webp',
          ],
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(forumMessages)

    const fmCol = app.findCollectionByNameOrId('forum_messages')
    fmCol.fields.add(
      new RelationField({
        name: 'parent_id',
        collectionId: fmCol.id,
        maxSelect: 1,
        cascadeDelete: true,
      }),
    )
    app.save(fmCol)

    const forumLibrary = new Collection({
      name: 'forum_library',
      type: 'base',
      listRule: '@request.auth.id != ""',
      viewRule: '@request.auth.id != ""',
      createRule: "@request.auth.role = 'admin' || @request.auth.id = forum_id.relator_id",
      updateRule: "@request.auth.role = 'admin' || @request.auth.id = forum_id.relator_id",
      deleteRule: "@request.auth.role = 'admin' || @request.auth.id = forum_id.relator_id",
      fields: [
        {
          name: 'forum_id',
          type: 'relation',
          required: true,
          collectionId: forums.id,
          maxSelect: 1,
          cascadeDelete: true,
        },
        { name: 'title', type: 'text' },
        {
          name: 'file',
          type: 'file',
          maxSelect: 1,
          maxSize: 10485760,
          mimeTypes: [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'image/jpeg',
            'image/png',
            'image/webp',
          ],
        },
        {
          name: 'category',
          type: 'select',
          values: ['Legislação', 'Estudos', 'Normas Técnicas', 'Apresentações', 'Outros'],
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(forumLibrary)

    const forumDrafts = new Collection({
      name: 'forum_drafts',
      type: 'base',
      listRule: '@request.auth.id != ""',
      viewRule: '@request.auth.id != ""',
      createRule: "@request.auth.role = 'admin' || @request.auth.id = forum_id.relator_id",
      updateRule: "@request.auth.role = 'admin' || @request.auth.id = forum_id.relator_id",
      deleteRule: "@request.auth.role = 'admin' || @request.auth.id = forum_id.relator_id",
      fields: [
        {
          name: 'forum_id',
          type: 'relation',
          required: true,
          collectionId: forums.id,
          maxSelect: 1,
          cascadeDelete: true,
        },
        { name: 'title', type: 'text' },
        { name: 'file', type: 'file', maxSelect: 1, maxSize: 10485760 },
        { name: 'is_official', type: 'bool' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(forumDrafts)
  },
  (app) => {
    app.delete(app.findCollectionByNameOrId('forum_drafts'))
    app.delete(app.findCollectionByNameOrId('forum_library'))
    app.delete(app.findCollectionByNameOrId('forum_messages'))
    app.delete(app.findCollectionByNameOrId('forums'))
  },
)
