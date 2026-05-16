migrate(
  (app) => {
    const countriesCol = app.findCollectionByNameOrId('countries')
    const statesCol = app.findCollectionByNameOrId('states')
    const citiesCol = app.findCollectionByNameOrId('cities')

    const data = {
      Brasil: {
        AC: ['Rio Branco', 'Cruzeiro do Sul', 'Sena Madureira'],
        AL: ['Maceió', 'Arapiraca', 'Rio Largo'],
        AP: ['Macapá', 'Santana', 'Laranjal do Jari'],
        AM: ['Manaus', 'Parintins', 'Itacoatiara'],
        BA: ['Salvador', 'Feira de Santana', 'Vitória da Conquista', 'Camaçari'],
        CE: ['Fortaleza', 'Caucaia', 'Juazeiro do Norte', 'Maracanaú'],
        DF: ['Brasília'],
        ES: ['Vitória', 'Vila Velha', 'Serra', 'Cariacica'],
        GO: ['Goiânia', 'Aparecida de Goiânia', 'Anápolis'],
        MA: ['São Luís', 'Imperatriz', 'São José de Ribamar'],
        MT: ['Cuiabá', 'Várzea Grande', 'Rondonópolis'],
        MS: ['Campo Grande', 'Dourados', 'Três Lagoas'],
        MG: ['Belo Horizonte', 'Uberlândia', 'Contagem', 'Juiz de Fora', 'Betim'],
        PA: ['Belém', 'Ananindeua', 'Santarém'],
        PB: ['João Pessoa', 'Campina Grande', 'Santa Rita'],
        PR: ['Curitiba', 'Londrina', 'Maringá', 'Foz do Iguaçu', 'Ponta Grossa'],
        PE: ['Recife', 'Jaboatão dos Guararapes', 'Olinda', 'Caruaru'],
        PI: ['Teresina', 'Parnaíba', 'Picos'],
        RJ: ['Rio de Janeiro', 'São Gonçalo', 'Duque de Caxias', 'Nova Iguaçu', 'Niterói'],
        RN: ['Natal', 'Mossoró', 'Parnamirim'],
        RS: ['Porto Alegre', 'Caxias do Sul', 'Pelotas', 'Canoas', 'Santa Maria'],
        RO: ['Porto Velho', 'Ji-Paraná', 'Ariquemes'],
        RR: ['Boa Vista', 'Rorainópolis'],
        SC: ['Florianópolis', 'Joinville', 'Blumenau', 'São José', 'Chapecó'],
        SP: [
          'São Paulo',
          'Guarulhos',
          'Campinas',
          'São Bernardo do Campo',
          'São José dos Campos',
          'Santo André',
          'Ribeirão Preto',
          'Osasco',
          'Sorocaba',
          'Mauá',
        ],
        SE: ['Aracaju', 'Nossa Senhora do Socorro', 'Lagarto'],
        TO: ['Palmas', 'Araguaína', 'Gurupi'],
      },
      Portugal: {
        Lisboa: ['Lisboa', 'Sintra', 'Cascais', 'Loures', 'Amadora'],
        Porto: ['Porto', 'Vila Nova de Gaia', 'Matosinhos', 'Gondomar'],
        Braga: ['Braga', 'Guimarães', 'Vila Nova de Famalicão'],
        Setúbal: ['Setúbal', 'Almada', 'Seixal'],
        Faro: ['Faro', 'Portimão', 'Loulé'],
        Coimbra: ['Coimbra', 'Figueira da Foz'],
        Aveiro: ['Aveiro', 'Ílhavo'],
        Madeira: ['Funchal', 'Câmara de Lobos'],
        Açores: ['Ponta Delgada', 'Angra do Heroísmo'],
      },
      Angola: {
        Luanda: ['Luanda', 'Viana', 'Cacuaco', 'Talatona', 'Belas'],
        Benguela: ['Benguela', 'Lobito', 'Baía Farta'],
        Huíla: ['Lubango', 'Matala'],
        Huambo: ['Huambo', 'Caála'],
        Cabinda: ['Cabinda'],
        Malanje: ['Malanje'],
      },
      Uruguai: {
        Montevideo: ['Montevideo'],
        Canelones: ['Ciudad de la Costa', 'Las Piedras', 'Barros Blancos'],
        Maldonado: ['Maldonado', 'Punta del Este', 'San Carlos'],
        Salto: ['Salto'],
        Paysandú: ['Paysandú'],
      },
    }

    for (const [countryName, states] of Object.entries(data)) {
      let countryRecord
      try {
        countryRecord = app.findFirstRecordByData('countries', 'name', countryName)
      } catch (_) {
        countryRecord = new Record(countriesCol)
        countryRecord.set('name', countryName)
        countryRecord.set('code', countryName.substring(0, 2).toUpperCase())
        app.save(countryRecord)
      }

      for (const [stateName, cities] of Object.entries(states)) {
        let stateRecord
        try {
          stateRecord = app.findFirstRecordByData('states', 'name', stateName)
        } catch (_) {
          stateRecord = new Record(statesCol)
          stateRecord.set('name', stateName)
          stateRecord.set('code', stateName.substring(0, 2).toUpperCase())
          stateRecord.set('country_id', countryRecord.id)
          app.save(stateRecord)
        }

        for (const cityName of cities) {
          try {
            app.findFirstRecordByFilter('cities', 'name = {:name} && state_id = {:state}', {
              name: cityName,
              state: stateRecord.id,
            })
          } catch (_) {
            const cityRecord = new Record(citiesCol)
            cityRecord.set('name', cityName)
            cityRecord.set('state_id', stateRecord.id)
            app.save(cityRecord)
          }
        }
      }
    }
  },
  (app) => {
    app.truncateCollection(app.findCollectionByNameOrId('cities'))
    app.truncateCollection(app.findCollectionByNameOrId('states'))
    app.truncateCollection(app.findCollectionByNameOrId('countries'))
  },
)
