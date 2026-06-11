// Synchronizes any new geographic data entered by users into the respective collections
onRecordValidate((e) => {
  const record = e.record
  let countryName = record.getString('country')
  let stateName = record.getString('state')
  let cityName = record.getString('city')

  if (!countryName || !stateName || !cityName) return e.next()

  countryName = countryName.trim()
  stateName = stateName.trim()
  cityName = cityName.trim()

  try {
    const countries = $app.findRecordsByFilter('countries', '', '', 1000, 0)
    let country = null
    for (const c of countries) {
      if (c.getString('name').toLowerCase() === countryName.toLowerCase()) {
        country = c
        break
      }
    }

    let countryId = ''
    let exactCountryName = countryName

    if (country) {
      countryId = country.id
      exactCountryName = country.getString('name')
    } else {
      const cColl = $app.findCollectionByNameOrId('countries')
      const newC = new Record(cColl)
      newC.set('name', countryName)
      newC.set('code', countryName.substring(0, 2).toUpperCase())
      $app.saveNoValidate(newC)
      countryId = newC.id
    }

    record.set('country', exactCountryName)

    const states = $app.findRecordsByFilter('states', 'country_id = {:cid}', '', 1000, 0, {
      cid: countryId,
    })
    let state = null
    for (const s of states) {
      if (s.getString('name').toLowerCase() === stateName.toLowerCase()) {
        state = s
        break
      }
    }

    let stateId = ''
    let exactStateName = stateName

    if (state) {
      stateId = state.id
      exactStateName = state.getString('name')
    } else {
      const sColl = $app.findCollectionByNameOrId('states')
      const newS = new Record(sColl)
      newS.set('name', stateName)
      newS.set('code', stateName.substring(0, 2).toUpperCase())
      newS.set('country_id', countryId)
      $app.saveNoValidate(newS)
      stateId = newS.id
    }

    record.set('state', exactStateName)

    const cities = $app.findRecordsByFilter('cities', 'state_id = {:sid}', '', 10000, 0, {
      sid: stateId,
    })
    let city = null
    for (const c of cities) {
      if (c.getString('name').toLowerCase() === cityName.toLowerCase()) {
        city = c
        break
      }
    }

    let exactCityName = cityName

    if (city) {
      exactCityName = city.getString('name')
    } else {
      const cityColl = $app.findCollectionByNameOrId('cities')
      const newCity = new Record(cityColl)
      newCity.set('name', cityName)
      newCity.set('state_id', stateId)
      $app.saveNoValidate(newCity)
    }

    record.set('city', exactCityName)
  } catch (err) {
    $app.logger().error('Geo sync validation error', 'error', String(err))
  }

  return e.next()
}, 'users')
