migrate(
  (app) => {
    const topics = app.findCollectionByNameOrId('representation_topics')

    const topicReplies = new Collection({
      name: 'representation_topic_replies',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule:
        "@request.auth.id != '' && (user_id = @request.auth.id || @request.auth.role = 'admin')",
      deleteRule:
        "@request.auth.id != '' && (user_id = @request.auth.id || @request.auth.role = 'admin')",
      fields: [
        {
          name: 'topic_id',
          type: 'relation',
          required: true,
          collectionId: topics.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'user_id',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          cascadeDelete: false,
          maxSelect: 1,
        },
        {
          name: 'content',
          type: 'text',
          required: true,
        },
        {
          name: 'created',
          type: 'autodate',
          onCreate: true,
          onUpdate: false,
        },
        {
          name: 'updated',
          type: 'autodate',
          onCreate: true,
          onUpdate: true,
        },
      ],
      indexes: [
        'CREATE INDEX idx_rep_topic_replies_topic ON representation_topic_replies (topic_id)',
        'CREATE INDEX idx_rep_topic_replies_user ON representation_topic_replies (user_id)',
      ],
    })
    app.save(topicReplies)
  },
  (app) => {
    try {
      const col = app.findCollectionByNameOrId('representation_topic_replies')
      app.delete(col)
    } catch (_) {}
  },
)
