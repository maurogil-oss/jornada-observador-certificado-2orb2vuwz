migrate(
  (app) => {
    let record = null

    try {
      record = app.findAuthRecordByEmail('users', 'cesar.souza@jornada.com')
    } catch (_) {
      const records = app.findRecordsByFilter(
        'users',
        "name ~ 'César' || full_name ~ 'César' || name ~ 'cesar' || full_name ~ 'cesar'",
        '',
        50,
        0,
      )
      for (const r of records) {
        const name = (r.get('name') || '').toLowerCase()
        const fullName = (r.get('full_name') || '').toLowerCase()
        if (
          name.includes('souza') ||
          name.includes('souxa') ||
          fullName.includes('souza') ||
          fullName.includes('souxa')
        ) {
          record = app.findAuthRecordById('users', r.getId())
          break
        }
      }
    }

    if (!record) {
      try {
        const existing = app.findAuthRecordByEmail('users', 'cesar.souza@cajamar.sp.gov.br')
        record = existing
      } catch (_) {}
    }

    if (!record) {
      return
    }

    const currentEmail = record.get('email')
    if (currentEmail === 'cesar.souza@cajamar.sp.gov.br') {
      return
    }

    record.set('email', 'cesar.souza@cajamar.sp.gov.br')
    record.set('verified', true)
    app.save(record)
  },
  (app) => {
    try {
      const record = app.findAuthRecordByEmail('users', 'cesar.souza@cajamar.sp.gov.br')
      record.set('email', 'cesar.souza@jornada.com')
      app.save(record)
    } catch (_) {}
  },
)
