migrate(
  (app) => {
    // Conta de usuário: Ronaldo Rodrigues da Cunha Filho
    // id: m9j1alxbt3v7hy5, email: ronaldo.rodrigues@onsv.org.br
    // 1. Definir senha para 'ronaldo@onsv'
    // 2. Definir verified = true
    try {
      let record
      try {
        record = app.findFirstRecordByData('_pb_users_auth_', 'id', 'm9j1alxbt3v7hy5')
      } catch (_) {
        record = app.findAuthRecordByEmail('_pb_users_auth_', 'ronaldo.rodrigues@onsv.org.br')
      }

      record.setPassword('ronaldo@onsv')
      record.setVerified(true)
      app.save(record)
      console.log(
        'Conta ronaldo.rodrigues@onsv.org.br (id: m9j1alxbt3v7hy5) atualizada: senha definida e verified = true',
      )
    } catch (err) {
      console.log('Erro ao atualizar ronaldo.rodrigues@onsv.org.br:', err)
      throw err
    }
  },
  (app) => {
    // Reversão do status verified (reversão de senha não é possível)
    try {
      let record
      try {
        record = app.findFirstRecordByData('_pb_users_auth_', 'id', 'm9j1alxbt3v7hy5')
      } catch (_) {
        record = app.findAuthRecordByEmail('_pb_users_auth_', 'ronaldo.rodrigues@onsv.org.br')
      }
      record.setVerified(false)
      app.save(record)
    } catch (_) {}
  },
)
