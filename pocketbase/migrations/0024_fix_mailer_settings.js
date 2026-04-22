migrate((app) => {
  app
    .db()
    .newQuery(`
    UPDATE _params 
    SET value = json_set(
      value, 
      '$.meta.senderAddress', 'noreply@goskip.app'
    ) 
    WHERE id = 'settings'
  `)
    .execute()
})
