migrate(
  (app) => {
    const users = app.findRecordsByFilter('users', '1=1', '', 10000, 0)
    for (let i = 0; i < users.length; i++) {
      const user = users[i]
      const submissions = app.findRecordsByFilter(
        'submissions',
        "user_id = {:userId} && status = 'Aprovado'",
        '',
        1000,
        0,
        { userId: user.id },
      )

      let titulationMax = 0
      let competencySum = 0

      for (let j = 0; j < submissions.length; j++) {
        const sub = submissions[j]
        const type = sub.getString('type')
        const score = sub.getFloat('score') || 0

        if (type === 'titulation') {
          if (score > titulationMax) titulationMax = score
        } else {
          competencySum += score
        }
      }

      if (titulationMax > 250) titulationMax = 250
      const totalPoints = titulationMax + competencySum

      if (user.getFloat('points') !== totalPoints) {
        user.set('points', totalPoints)

        const currentLevel = user.getString('level')
        const turma = user.getInt('turma') || 15

        let baseLevel =
          turma <= 14
            ? 'Nível II - Observador Certificado Pleno'
            : 'Nível I - Observador Certificado (Iniciante)'

        let newLevel = currentLevel || baseLevel

        if (totalPoints >= 500) {
          newLevel = 'Nível III - Mobilizador'
        } else {
          if (totalPoints < 500 && currentLevel === 'Nível III - Mobilizador') {
            newLevel = baseLevel
          } else if (totalPoints < 500) {
            newLevel = currentLevel || baseLevel
          }
        }

        user.set('level', newLevel)
        app.save(user)
      }
    }
  },
  (app) => {
    // down migration not needed
  },
)
