migrate(
  (app) => {
    const users = app.findRecordsByFilter('users', "state != ''", '', 10000, 0)

    const stateMap = {
      acre: 'AC',
      alagoas: 'AL',
      amapá: 'AP',
      amapa: 'AP',
      amazonas: 'AM',
      bahia: 'BA',
      ceará: 'CE',
      ceara: 'CE',
      'distrito federal': 'DF',
      'espírito santo': 'ES',
      'espirito santo': 'ES',
      goiás: 'GO',
      goias: 'GO',
      maranhão: 'MA',
      maranhao: 'MA',
      'mato grosso': 'MT',
      'mato grosso do sul': 'MS',
      'minas gerais': 'MG',
      pará: 'PA',
      para: 'PA',
      paraíba: 'PB',
      paraiba: 'PB',
      paraná: 'PR',
      parana: 'PR',
      pernambuco: 'PE',
      piauí: 'PI',
      piaui: 'PI',
      'rio de janeiro': 'RJ',
      'rio grande do norte': 'RN',
      'rio grande do sul': 'RS',
      rondônia: 'RO',
      rondonia: 'RO',
      roraima: 'RR',
      'santa catarina': 'SC',
      'são paulo': 'SP',
      'sao paulo': 'SP',
      sergipe: 'SE',
      tocantins: 'TO',
    }

    for (const user of users) {
      const originalState = user.getString('state')
      let newState = originalState.trim()

      if (newState.length === 2) {
        newState = newState.toUpperCase()
      } else {
        const lower = newState.toLowerCase()
        if (stateMap[lower]) {
          newState = stateMap[lower]
        }
      }

      if (newState !== originalState) {
        user.set('state', newState)
        app.saveNoValidate(user)
      }
    }
  },
  (app) => {
    // Reverting data transformation is not reliably possible
  },
)
