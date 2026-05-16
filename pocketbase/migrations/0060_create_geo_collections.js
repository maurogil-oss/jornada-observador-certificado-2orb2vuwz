migrate(
  (app) => {
    const countries = new Collection({
      name: 'countries',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: "@request.auth.role = 'admin'",
      updateRule: "@request.auth.role = 'admin'",
      deleteRule: "@request.auth.role = 'admin'",
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'code', type: 'text', required: true },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE UNIQUE INDEX idx_countries_name ON countries (name)'],
    })
    app.save(countries)

    const states = new Collection({
      name: 'states',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: "@request.auth.role = 'admin'",
      updateRule: "@request.auth.role = 'admin'",
      deleteRule: "@request.auth.role = 'admin'",
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'code', type: 'text', required: true },
        {
          name: 'country_id',
          type: 'relation',
          required: true,
          collectionId: countries.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_states_country ON states (country_id)',
        'CREATE UNIQUE INDEX idx_states_name_country ON states (name, country_id)',
      ],
    })
    app.save(states)

    const cities = new Collection({
      name: 'cities',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: "@request.auth.role = 'admin'",
      updateRule: "@request.auth.role = 'admin'",
      deleteRule: "@request.auth.role = 'admin'",
      fields: [
        { name: 'name', type: 'text', required: true },
        {
          name: 'state_id',
          type: 'relation',
          required: true,
          collectionId: states.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_cities_state ON cities (state_id)',
        'CREATE UNIQUE INDEX idx_cities_name_state ON cities (name, state_id)',
      ],
    })
    app.save(cities)
  },
  (app) => {
    app.delete(app.findCollectionByNameOrId('cities'))
    app.delete(app.findCollectionByNameOrId('states'))
    app.delete(app.findCollectionByNameOrId('countries'))
  },
)
