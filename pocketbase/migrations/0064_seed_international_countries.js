migrate(
  (app) => {
    const countries = [
      { name: 'Espanha', code: 'ES' },
      { name: 'México', code: 'MX' },
      { name: 'Guatemala', code: 'GT' },
      { name: 'El Salvador', code: 'SV' },
      { name: 'Honduras', code: 'HN' },
      { name: 'Nicarágua', code: 'NI' },
      { name: 'Costa Rica', code: 'CR' },
      { name: 'Panamá', code: 'PA' },
      { name: 'Cuba', code: 'CU' },
      { name: 'República Dominicana', code: 'DO' },
      { name: 'Porto Rico', code: 'PR' },
      { name: 'Argentina', code: 'AR' },
      { name: 'Bolívia', code: 'BO' },
      { name: 'Chile', code: 'CL' },
      { name: 'Colômbia', code: 'CO' },
      { name: 'Equador', code: 'EC' },
      { name: 'Paraguai', code: 'PY' },
      { name: 'Peru', code: 'PE' },
      { name: 'Uruguai', code: 'UY' },
      { name: 'Venezuela', code: 'VE' },
    ]

    const col = app.findCollectionByNameOrId('countries')

    for (const item of countries) {
      try {
        app.findFirstRecordByData('countries', 'name', item.name)
      } catch (_) {
        const record = new Record(col)
        record.set('name', item.name)
        record.set('code', item.code)
        app.save(record)
      }
    }
  },
  (app) => {
    const countriesToRemove = [
      'Espanha',
      'México',
      'Guatemala',
      'El Salvador',
      'Honduras',
      'Nicarágua',
      'Costa Rica',
      'Panamá',
      'Cuba',
      'República Dominicana',
      'Porto Rico',
      'Argentina',
      'Bolívia',
      'Chile',
      'Colômbia',
      'Equador',
      'Paraguai',
      'Peru',
      'Uruguai',
      'Venezuela',
    ]

    for (const name of countriesToRemove) {
      try {
        const record = app.findFirstRecordByData('countries', 'name', name)
        app.delete(record)
      } catch (_) {}
    }
  },
)
