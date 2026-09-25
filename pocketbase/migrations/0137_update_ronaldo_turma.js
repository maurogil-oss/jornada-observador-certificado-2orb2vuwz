migrate(
  (app) => {
    // Atualizar a turma do usuário Ronaldo Rodrigues da Cunha Filho para 15 (15ª Turma)
    // id: m9j1alxbt3v7hy5, email: ronaldo.rodrigues@onsv.org.br
    try {
      let record
      try {
        record = app.findFirstRecordByData('_pb_users_auth_', 'id', 'm9j1alxbt3v7hy5')
      } catch (_) {
        record = app.findAuthRecordByEmail('_pb_users_auth_', 'ronaldo.rodrigues@onsv.org.br')
      }

      record.set('turma', 15)
      app.save(record)
      console.log(
        'Conta ronaldo.rodrigues@onsv.org.br (id: m9j1alxbt3v7hy5) atualizada com sucesso: turma definida para 15.',
      )
    } catch (err) {
      console.log('Erro ao atualizar a turma de ronaldo.rodrigues@onsv.org.br:', err)
      throw err
    }
  },
  (app) => {
    // Reverter a turma para 0
    try {
      let record
      try {
        record = app.findFirstRecordByData('_pb_users_auth_', 'id', 'm9j1alxbt3v7hy5')
      } catch (_) {
        record = app.findAuthRecordByEmail('_pb_users_auth_', 'ronaldo.rodrigues@onsv.org.br')
      }
      record.set('turma', 0)
      app.save(record)
      console.log('Migração 0137 revertida: turma de Ronaldo redefinida para 0.')
    } catch (_) {}
  },
)
