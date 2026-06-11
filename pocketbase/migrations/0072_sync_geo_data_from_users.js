migrate(
  (app) => {
    const users = app.findRecordsByFilter(
      'users',
      "country != '' && state != '' && city != ''",
      '',
      10000,
      0,
    )

    const countriesCache = new Map()
    const statesCache = new Map()
    const citiesCache = new Map()

    const allCountries = app.findRecordsByFilter('countries', '', '', 10000, 0)
    for (const c of allCountries) {
      countriesCache.set(c.getString('name').toLowerCase().trim(), c)
    }

    const allStates = app.findRecordsByFilter('states', '', '', 10000, 0)
    for (const s of allStates) {
      statesCache.set(s.getString('country_id') + '_' + s.getString('name').toLowerCase().trim(), s)
    }

    const allCities = app.findRecordsByFilter('cities', '', '', 100000, 0)
    for (const c of allCities) {
      citiesCache.set(c.getString('state_id') + '_' + c.getString('name').toLowerCase().trim(), c)
    }

    for (const user of users) {
      let countryName = user.getString('country')
      let stateName = user.getString('state')
      let cityName = user.getString('city')

      if (!countryName || !stateName || !cityName) continue

      countryName = countryName.trim()
      stateName = stateName.trim()
      cityName = cityName.trim()

      const lowerCountry = countryName.toLowerCase()
      let country = countriesCache.get(lowerCountry)

      let countryId = ''
      let exactCountryName = countryName

      if (country) {
        countryId = country.id
        exactCountryName = country.getString('name')
      } else {
        const cColl = app.findCollectionByNameOrId('countries')
        const newC = new Record(cColl)
        newC.set('name', countryName)
        newC.set('code', countryName.substring(0, 2).toUpperCase())
        app.save(newC)
        country = newC
        countriesCache.set(lowerCountry, newC)
        countryId = newC.id
      }

      const lowerState = stateName.toLowerCase()
      const stateKey = countryId + '_' + lowerState
      let state = statesCache.get(stateKey)

      let stateId = ''
      let exactStateName = stateName

      if (state) {
        stateId = state.id
        exactStateName = state.getString('name')
      } else {
        const sColl = app.findCollectionByNameOrId('states')
        const newS = new Record(sColl)
        newS.set('name', stateName)
        newS.set('code', stateName.substring(0, 2).toUpperCase())
        newS.set('country_id', countryId)
        app.save(newS)
        state = newS
        statesCache.set(stateKey, newS)
        stateId = newS.id
      }

      const lowerCity = cityName.toLowerCase()
      const cityKey = stateId + '_' + lowerCity
      let city = citiesCache.get(cityKey)

      let exactCityName = cityName

      if (city) {
        exactCityName = city.getString('name')
      } else {
        const cityColl = app.findCollectionByNameOrId('cities')
        const newCity = new Record(cityColl)
        newCity.set('name', cityName)
        newCity.set('state_id', stateId)
        app.save(newCity)
        city = newCity
        citiesCache.set(cityKey, newCity)
      }

      let needsSave = false
      if (user.getString('country') !== exactCountryName) {
        user.set('country', exactCountryName)
        needsSave = true
      }
      if (user.getString('state') !== exactStateName) {
        user.set('state', exactStateName)
        needsSave = true
      }
      if (user.getString('city') !== exactCityName) {
        user.set('city', exactCityName)
        needsSave = true
      }

      if (needsSave) {
        app.saveNoValidate(user)
      }
    }
  },
  (app) => {},
)
