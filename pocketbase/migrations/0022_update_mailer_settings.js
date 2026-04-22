migrate((app) => {
  app
    .db()
    .newQuery(`
    UPDATE _params 
    SET value = json_set(
      value, 
      '$.meta.senderName', 'Jornada Observador Certificado', 
      '$.meta.senderAddress', 'noreply@anamob.org.br', 
      '$.meta.passwordResetActionUrl', 'https://jornada-observador-certificado-1427c.goskip.app/reset-password?token={token}'
    ) 
    WHERE id = 'settings'
  `)
    .execute()
})
