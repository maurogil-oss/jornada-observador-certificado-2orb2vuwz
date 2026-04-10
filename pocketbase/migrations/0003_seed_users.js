migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('users')

    try {
      app.findAuthRecordByEmail('users', 'maurog1@hotmail.com')
    } catch (_) {
      const admin = new Record(users)
      admin.setEmail('maurog1@hotmail.com')
      admin.setPassword('Skip@Pass')
      admin.setVerified(true)
      admin.set('name', 'Admin ONSV')
      admin.set('role', 'admin')
      admin.set('points', 0)
      admin.set('level', 'Admin')
      app.save(admin)
    }

    try {
      app.findAuthRecordByEmail('users', 'user@onsv.org')
    } catch (_) {
      const obs = new Record(users)
      obs.setEmail('user@onsv.org')
      obs.setPassword('123456')
      obs.setVerified(true)
      obs.set('name', 'Observador Teste')
      obs.set('role', 'observer')
      obs.set('points', 150)
      obs.set('level', 'Nível I - Observador Certificado (Iniciante)')
      app.save(obs)
    }
  },
  (app) => {
    try {
      const admin = app.findAuthRecordByEmail('users', 'maurog1@hotmail.com')
      app.delete(admin)
    } catch (_) {}
    try {
      const obs = app.findAuthRecordByEmail('users', 'user@onsv.org')
      app.delete(obs)
    } catch (_) {}
  },
)
