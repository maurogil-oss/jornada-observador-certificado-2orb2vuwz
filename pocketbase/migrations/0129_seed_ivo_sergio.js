migrate(
  (app) => {
    // ---------------------------------------------------------------------------
    // 1) Garantir que a cidade "São Roque" exista na tabela `cities`
    //    vinculada ao estado SP.
    // ---------------------------------------------------------------------------
    let spState = null
    try {
      spState = app.findFirstRecordByData('states', 'code', 'SP')
    } catch (_) {
      console.log('Migração 0129: estado SP não encontrado na tabela states pelo código SP.')
    }

    if (!spState) {
      try {
        spState = app.findFirstRecordByData('states', 'name', 'São Paulo')
      } catch (_) {
        console.log('Migração 0129: estado São Paulo não encontrado na tabela states.')
      }
    }

    if (spState) {
      let saoRoqueCity = null
      try {
        const cities = app.findRecordsByFilter('cities', 'state_id = {:sid}', '', 10000, 0, {
          sid: spState.id,
        })
        for (const c of cities) {
          const name = c.getString('name').trim().toLowerCase()
          if (name === 'são roque' || name === 'sao roque') {
            saoRoqueCity = c
            break
          }
        }
      } catch (_) {}

      if (!saoRoqueCity) {
        try {
          saoRoqueCity = app.findFirstRecordByData('cities', 'name', 'São Roque')
        } catch (_) {}
      }

      if (!saoRoqueCity) {
        const citiesCol = app.findCollectionByNameOrId('cities')
        const city = new Record(citiesCol)
        city.set('name', 'São Roque')
        city.set('state_id', spState.id)
        app.save(city)
        console.log(
          'Migração 0129: cidade "São Roque" criada e vinculada ao estado SP (state_id=' +
            spState.id +
            ').',
        )
      } else {
        console.log(
          'Migração 0129: cidade "São Roque" já existe (id=' +
            saoRoqueCity.id +
            ', state_id=' +
            saoRoqueCity.getString('state_id') +
            ').',
        )
      }
    }

    // ---------------------------------------------------------------------------
    // 2) Criar a conta do usuário Ivo Sérgio Da Silva (idempotente).
    //    - Nome completo: Ivo Sérgio Da Silva
    //    - E-mail: ivosergiodasilva@yahoo.com.br
    //    - Turma: 7
    //    - Cidade: São Roque
    //    - Estado: SP
    //    - Role: observer
    //    - Nível: Nível I
    //    - Ativa: is_active = true
    //    - E-mail verificado: verified = true, emailVisibility = true
    //    - Senha temporária: Obs@Turma7!2026
    // ---------------------------------------------------------------------------
    const email = 'ivosergiodasilva@yahoo.com.br'

    try {
      const existingUser = app.findAuthRecordByEmail('_pb_users_auth_', email)
      console.log(
        'Migração 0129: usuário ' +
          email +
          ' já existe (id=' +
          existingUser.id +
          ') — nenhuma alteração feita.',
      )
      return
    } catch (_) {
      // Usuário não existe, prosseguir com a criação
    }

    const TEMP_PASSWORD = 'Obs@Turma7!2026'

    const usersCol = app.findCollectionByNameOrId('_pb_users_auth_')
    const record = new Record(usersCol)

    record.setEmail(email)
    record.setPassword(TEMP_PASSWORD)
    record.setVerified(true)
    record.set('emailVisibility', true)
    record.set('name', 'Ivo Sérgio')
    record.set('full_name', 'Ivo Sérgio Da Silva')
    record.set('nickname', 'Ivo Sérgio')
    record.set('turma', 7)
    record.set('role', 'observer')
    record.set('is_active', true)
    record.set('points', 0)
    record.set('level', 'Nível I')
    record.set('onboarding_completed', false)
    record.set('privacy_policy_accepted', false)
    record.set('country', 'Brasil')
    record.set('state', 'SP')
    record.set('city', 'São Roque')

    app.save(record)

    console.log('Migração 0129: usuário Ivo Sérgio Da Silva criado com sucesso (' + email + ').')
  },
  (app) => {
    // Reverter apenas a criação do usuário Ivo Sérgio Da Silva
    try {
      const record = app.findAuthRecordByEmail('_pb_users_auth_', 'ivosergiodasilva@yahoo.com.br')
      app.delete(record)
      console.log(
        'Migração 0129 (down): usuário ivosergiodasilva@yahoo.com.br removido com sucesso.',
      )
    } catch (_) {}
  },
)
