migrate(
  (app) => {
    const email = 'isabela.lopes@onsv.org.br'

    // 1. Idempotência: verificar se a usuária já existe pelo e-mail
    try {
      app.findAuthRecordByEmail('_pb_users_auth_', email)
      console.log('Migração 0128: usuária ' + email + ' já existe — criação ignorada.')
      return
    } catch (_) {
      // Usuária não existe, prosseguir com a criação
    }

    const TEMP_PASSWORD = 'Obs@Admin12!2026'

    const usersCol = app.findCollectionByNameOrId('_pb_users_auth_')
    const record = new Record(usersCol)

    record.setEmail(email)
    record.setPassword(TEMP_PASSWORD)
    record.setVerified(true)
    record.set('emailVisibility', true)
    record.set('name', 'Isabela')
    record.set('full_name', 'Isabela Lopes Araújo')
    record.set('nickname', 'Isabela')
    record.set('role', 'admin')
    record.set('is_active', true)
    record.set('points', 0)
    record.set('level', 'Nível I')
    record.set('onboarding_completed', false)
    record.set('privacy_policy_accepted', false)

    app.save(record)

    console.log(
      'Migração 0128: Administradora Isabela Lopes Araújo cadastrada com sucesso (' + email + ').',
    )
  },
  (app) => {
    // Down da migration: reverter apenas a criação desta usuária
    try {
      const record = app.findAuthRecordByEmail('_pb_users_auth_', 'isabela.lopes@onsv.org.br')
      app.delete(record)
      console.log('Migração 0128 (down): usuária isabela.lopes@onsv.org.br removida com sucesso.')
    } catch (_) {
      // Registro não encontrado, nada a reverter
    }
  },
)
