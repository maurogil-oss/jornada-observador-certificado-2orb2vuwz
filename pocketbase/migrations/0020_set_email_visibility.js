migrate(
  (app) => {
    const users = app.findRecordsByFilter('users', '1=1', '', 10000, 0)
    for (let i = 0; i < users.length; i++) {
      try {
        users[i].set('emailVisibility', true)
        app.save(users[i])
      } catch (err) {
        console.log('Falha ao atualizar visibilidade de email para o usuario: ' + users[i].id)
      }
    }
  },
  (app) => {
    const users = app.findRecordsByFilter('users', '1=1', '', 10000, 0)
    for (let i = 0; i < users.length; i++) {
      try {
        users[i].set('emailVisibility', false)
        app.save(users[i])
      } catch (err) {
        console.log('Falha ao reverter visibilidade de email para o usuario: ' + users[i].id)
      }
    }
  },
)
