migrate(
  (app) => {
    const users = app.findRecordsByFilter(
      'users',
      "country != '' || state != '' || city != ''",
      '',
      10000,
      0,
    )
    const countriesCol = app.findCollectionByNameOrId('countries')
    const statesCol = app.findCollectionByNameOrId('states')
    const citiesCol = app.findCollectionByNameOrId('cities')

    const allCountries = app.findRecordsByFilter('countries', '1=1', '', 10000, 0)
    const allStates = app.findRecordsByFilter('states', '1=1', '', 10000, 0)
    const allCities = app.findRecordsByFilter('cities', '1=1', '', 100000, 0)

    const cMap = new Map()
    for (const c of allCountries) {
      cMap.set(c.getString('name').toLowerCase(), c)
    }

    const sMap = new Map()
    for (const s of allStates) {
      sMap.set(s.getString('country_id') + '_' + s.getString('name').toLowerCase(), s)
    }

    const cityMap = new Map()
    for (const c of allCities) {
      cityMap.set(c.getString('state_id') + '_' + c.getString('name').toLowerCase(), c)
    }

    function capitalize(str) {
      if (!str) return ''
      const lowers = ['de', 'da', 'do', 'das', 'dos', 'e']
      return str
        .trim()
        .split(/\s+/)
        .map((w, i) => {
          if (i > 0 && lowers.includes(w.toLowerCase())) return w.toLowerCase()
          return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
        })
        .join(' ')
    }

    for (const user of users) {
      let uCountry = user.getString('country').trim()
      let uState = user.getString('state').trim()
      let uCity = user.getString('city').trim()

      if (!uCountry && (uState || uCity)) uCountry = 'Brasil'
      if (!uState && uCity) uState = 'Não Informado'

      let countryId = null

      if (uCountry) {
        const cKey = uCountry.toLowerCase()
        if (cMap.has(cKey)) {
          const cRec = cMap.get(cKey)
          uCountry = cRec.getString('name')
          countryId = cRec.id
        } else {
          const norm = capitalize(uCountry)
          const newC = new Record(countriesCol)
          newC.set('name', norm)
          newC.set('code', norm.substring(0, 2).toUpperCase() || 'BR')
          app.save(newC)
          cMap.set(cKey, newC)
          uCountry = norm
          countryId = newC.id
        }
      }

      let stateId = null
      if (uState && countryId) {
        const sKey = countryId + '_' + uState.toLowerCase()
        if (sMap.has(sKey)) {
          const sRec = sMap.get(sKey)
          uState = sRec.getString('name')
          stateId = sRec.id
        } else {
          const norm = capitalize(uState)
          const newS = new Record(statesCol)
          newS.set('name', norm)
          newS.set('code', norm.substring(0, 2).toUpperCase() || 'ST')
          newS.set('country_id', countryId)
          app.save(newS)
          sMap.set(sKey, newS)
          uState = norm
          stateId = newS.id
        }
      }

      if (uCity && stateId) {
        const cKey = stateId + '_' + uCity.toLowerCase()
        if (cityMap.has(cKey)) {
          const cRec = cityMap.get(cKey)
          uCity = cRec.getString('name')
        } else {
          const norm = capitalize(uCity)
          const newCity = new Record(citiesCol)
          newCity.set('name', norm)
          newCity.set('state_id', stateId)
          app.save(newCity)
          cityMap.set(cKey, newCity)
          uCity = norm
        }
      }

      if (
        user.getString('country') !== uCountry ||
        user.getString('state') !== uState ||
        user.getString('city') !== uCity
      ) {
        user.set('country', uCountry)
        user.set('state', uState)
        user.set('city', uCity)
        app.saveNoValidate(user)
      }
    }
  },
  (app) => {
    // Down migration does not revert data cleanup safely without a previous snapshot.
  },
)
