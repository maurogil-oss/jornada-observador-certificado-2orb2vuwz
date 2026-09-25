migrate(
  (app) => {
    // 1. Conta principal: jramalho@onsv.org.br
    // - Definir senha exatamente para 'jramalho@onsv'
    // - Alterar verified para true
    try {
      const record = app.findAuthRecordByEmail('_pb_users_auth_', 'jramalho@onsv.org.br')
      record.setPassword('jramalho@onsv')
      record.setVerified(true)
      app.save(record)
      console.log('Conta jramalho@onsv.org.br atualizada: senha definida e verified = true')
    } catch (err) {
      console.log('Erro ao atualizar jramalho@onsv.org.br:', err)
      throw err
    }

    // 2. Conta duplicada: jjramalho@onsv.org.br (se existir no banco)
    // - Desativar: is_active = false (sem excluir)
    try {
      const dupRecord = app.findAuthRecordByEmail('_pb_users_auth_', 'jjramalho@onsv.org.br')
      dupRecord.set('is_active', false)
      app.save(dupRecord)
      console.log('Conta duplicada jjramalho@onsv.org.br desativada: is_active = false')
    } catch (err) {
      console.log('Conta jjramalho@onsv.org.br não encontrada diretamente:', err)
      try {
        const records = app.findRecordsByFilter('_pb_users_auth_', "email ~ 'jjramalho'", '', 1, 0)
        if (records && records.length > 0) {
          const rec = records[0]
          rec.set('is_active', false)
          app.save(rec)
          console.log('Conta duplicada encontrada por filtro e desativada:', rec.getString('email'))
        } else {
          console.log('Nenhuma conta duplicada jjramalho encontrada para desativar.')
        }
      } catch (filterErr) {
        console.log('Erro ao buscar conta duplicada por filtro:', filterErr)
      }
    }
  },
  (app) => {
    // Reversão
    try {
      const record = app.findAuthRecordByEmail('_pb_users_auth_', 'jramalho@onsv.org.br')
      record.setVerified(false)
      app.save(record)
    } catch (_) {}

    try {
      const dupRecord = app.findAuthRecordByEmail('_pb_users_auth_', 'jjramalho@onsv.org.br')
      dupRecord.set('is_active', true)
      app.save(dupRecord)
    } catch (_) {}
  },
)
