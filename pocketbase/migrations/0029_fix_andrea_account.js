migrate(
  (app) => {
    // 1. Fix Andrea's account
    try {
      const record = app.findAuthRecordByEmail('users', 'andreamoringo11@gmail.com')
      record.set('is_active', true)
      record.set('name', 'Adrea Moringo')
      if (!record.get('full_name') || record.get('full_name') !== 'Adrea Moringo') {
        record.set('full_name', 'Adrea Moringo')
      }
      record.setVerified(true)
      app.save(record)
    } catch (_) {
      // If not found, create it
      const col = app.findCollectionByNameOrId('users')
      const record = new Record(col)
      record.setEmail('andreamoringo11@gmail.com')
      record.setPassword('Skip@Pass123')
      record.set('is_active', true)
      record.set('name', 'Adrea Moringo')
      record.set('full_name', 'Adrea Moringo')
      record.setVerified(true)
      app.save(record)
    }

    // 2. Configure Mailer reset link
    try {
      const col = app.findCollectionByNameOrId('users')
      if (col.resetPasswordTemplate) {
        col.resetPasswordTemplate.body =
          '<p>Olá,</p><p>Você solicitou a recuperação de senha da Jornada Observador Certificado.</p><p>Clique no link abaixo para redefinir sua senha:</p><p><a href="https://jornada-observador-certificado-1427c.goskip.app/reset-password?token={TOKEN}">Redefinir Senha</a></p><p>Se você não solicitou, ignore este e-mail.</p>'
        col.resetPasswordTemplate.actionUrl =
          'https://jornada-observador-certificado-1427c.goskip.app/reset-password?token={TOKEN}'
        col.resetPasswordTemplate.subject = 'Recuperação de Senha - Jornada Observador Certificado'
      }
      app.save(col)
    } catch (_) {}

    // 3. Try to configure sender address in settings (if applicable)
    try {
      app
        .db()
        .newQuery(
          `UPDATE _params SET value = json_set(value, '$.meta.senderAddress', 'noreply@goskip.app', '$.meta.senderName', 'Jornada Observador Certificado') WHERE id = 'settings'`,
        )
        .execute()
    } catch (_) {}
  },
  (app) => {
    // Revert not strictly necessary for this fix
  },
)
