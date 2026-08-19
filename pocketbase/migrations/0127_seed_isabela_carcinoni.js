migrate(
  (app) => {
    // ---------------------------------------------------------------------------
    // 1) Garantir que a cidade "Ribeirão Preto" exista na tabela `cities`
    //    vinculada ao estado SP.
    // ---------------------------------------------------------------------------
    let spState = null
    try {
      spState = app.findFirstRecordByData('states', 'code', 'SP')
    } catch (_) {
      console.log('Migração 0127: estado SP não encontrado na tabela states.')
      return
    }

    let ribeiraoCity = null
    try {
      ribeiraoCity = app.findFirstRecordByData('cities', 'name', 'Ribeirão Preto')
    } catch (_) {}

    if (!ribeiraoCity) {
      const citiesCol = app.findCollectionByNameOrId('cities')
      const city = new Record(citiesCol)
      city.set('name', 'Ribeirão Preto')
      city.set('state_id', spState.id)
      app.save(city)
      console.log(
        'Migração 0127: cidade "Ribeirão Preto" criada e vinculada ao estado SP (state_id=' +
          spState.id +
          ').',
      )
    } else {
      console.log(
        'Migração 0127: cidade "Ribeirão Preto" já existe e está vinculada ao estado SP (state_id=' +
          ribeiraoCity.getString('state_id') +
          ').',
      )
    }

    // ---------------------------------------------------------------------------
    // 2) Criar a usuária Isabela Guiaro Carcinoni (idempotente).
    //    Senha temporária segura gerada para primeiro acesso.
    // ---------------------------------------------------------------------------
    const email = 'isabela_carcinoni@hotmail.com'

    try {
      app.findAuthRecordByEmail('users', email)
      console.log('Migração 0127: usuária ' + email + ' já existe — nenhuma alteração feita.')
      return
    } catch (_) {}

    const TEMP_PASSWORD = 'Obs@Turma12!2026'

    const usersCol = app.findCollectionByNameOrId('_pb_users_auth_')
    const record = new Record(usersCol)
    record.setEmail(email)
    record.setPassword(TEMP_PASSWORD)
    record.setVerified(true)
    record.set('emailVisibility', true)
    record.set('name', 'Isabela')
    record.set('full_name', 'Isabela Guiaro Carcinoni')
    record.set('nickname', 'Isabela')
    record.set('turma', 12)
    record.set('role', 'observer')
    record.set('is_active', true)
    record.set('points', 0)
    record.set('level', 'Nível I')
    record.set('onboarding_completed', false)
    record.set('privacy_policy_accepted', false)
    record.set('country', 'Brasil')
    record.set('state', 'SP')
    record.set('city', 'Ribeirão Preto')
    app.save(record)

    console.log(
      'Migração 0127: usuária Isabela Guiaro Carcinoni criada com sucesso (' + email + ').',
    )
  },
  (app) => {
    // Reverte apenas a criação da usuária (a cidade pré-existente não é tocada).
    try {
      const record = app.findAuthRecordByEmail('users', 'isabela_carcinoni@hotmail.com')
      app.delete(record)
    } catch (_) {}
  },
)
