migrate(
  (app) => {
    try {
      const repliesCol = app.findCollectionByNameOrId('representation_topic_replies')
      const topicsCol = app.findCollectionByNameOrId('representation_topics')
      const usersCol = app.findCollectionByNameOrId('_pb_users_auth_')

      // Find an existing topic and user to seed an initial reply
      const topics = app.findRecordsByFilter('representation_topics', '', '-created', 1, 0)
      const users = app.findRecordsByFilter('_pb_users_auth_', '', 'created', 1, 0)

      if (topics.length > 0 && users.length > 0) {
        const reply = new Record(repliesCol)
        reply.set('topic_id', topics[0].id)
        reply.set('user_id', users[0].id)
        reply.set(
          'content',
          'Posicionamento preliminar registrado: alinhado aos princípios do PNATRANS e às diretrizes técnicas de segurança viária do ONSV.',
        )
        app.save(reply)
      }
    } catch (e) {
      console.log('Seed topic reply note:', e)
    }
  },
  (app) => {
    // Revert logic if needed
  },
)
