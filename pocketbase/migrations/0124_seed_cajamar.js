migrate(
  (app) => {
    let country = null
    try {
      const countries = app.findRecordsByFilter('countries', '', '', 1000, 0)
      for (const c of countries) {
        const name = c.getString('name').toLowerCase()
        if (name === 'brasil' || name === 'brazil') {
          country = c
          break
        }
      }
    } catch (_) {}

    if (!country) {
      const cColl = app.findCollectionByNameOrId('countries')
      country = new Record(cColl)
      country.set('name', 'Brasil')
      country.set('code', 'BR')
      app.save(country)
    }

    let state = null
    try {
      const states = app.findRecordsByFilter('states', 'country_id = {:cid}', '', 1000, 0, {
        cid: country.id,
      })
      for (const s of states) {
        const name = s.getString('name').toLowerCase()
        const code = s.getString('code').toUpperCase()
        if (name === 'são paulo' || name === 'sao paulo' || code === 'SP') {
          state = s
          break
        }
      }
    } catch (_) {}

    if (!state) {
      const sColl = app.findCollectionByNameOrId('states')
      state = new Record(sColl)
      state.set('name', 'São Paulo')
      state.set('code', 'SP')
      state.set('country_id', country.id)
      app.save(state)
    }

    let city = null
    try {
      const cities = app.findRecordsByFilter('cities', 'state_id = {:sid}', '', 10000, 0, {
        sid: state.id,
      })
      for (const c of cities) {
        if (c.getString('name').toLowerCase() === 'cajamar') {
          city = c
          break
        }
      }
    } catch (_) {}

    if (!city) {
      const cityColl = app.findCollectionByNameOrId('cities')
      city = new Record(cityColl)
      city.set('name', 'Cajamar')
      city.set('state_id', state.id)
      app.save(city)
    }

    try {
      const users = app.findRecordsByFilter('users', '', '', 10000, 0)
      for (const u of users) {
        const fullName = (u.getString('full_name') || '').toLowerCase()
        if (
          (fullName.includes('césar') || fullName.includes('cesar')) &&
          fullName.includes('souza')
        ) {
          u.set('country', country.getString('name'))
          u.set('state', state.getString('name'))
          u.set('city', 'Cajamar')
          app.save(u)
          break
        }
      }
    } catch (_) {}
  },
  (app) => {},
)
