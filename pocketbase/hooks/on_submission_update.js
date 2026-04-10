onRecordAfterUpdateSuccess((e) => {
  if (e.record.get('status') === 'Aprovado') {
    const userId = e.record.get('user_id')
    if (!userId) return

    try {
      const user = $app.findRecordById('users', userId)

      const submissions = $app.findRecordsByFilter(
        'submissions',
        "user_id = {:userId} && status = 'Aprovado'",
        '',
        1000,
        0,
        { userId: userId },
      )

      let titulationMax = 0
      let competencySum = 0

      for (let i = 0; i < submissions.length; i++) {
        const sub = submissions[i]
        const type = sub.get('type')
        const score = sub.get('score') || 0

        if (type === 'titulation') {
          if (score > titulationMax) titulationMax = score
        } else {
          competencySum += score
        }
      }

      if (titulationMax > 250) titulationMax = 250

      const totalPoints = titulationMax + competencySum

      let newLevel = 'Nível I - Observador Certificado (Iniciante)'
      if (totalPoints >= 500) {
        newLevel = 'Nível III - Mobilizador'
      } else if (totalPoints >= 200) {
        newLevel = 'Nível II - Observador Certificado Pleno'
      }

      user.set('points', totalPoints)
      user.set('level', newLevel)

      $app.save(user)
    } catch (err) {
      console.log('Error updating user points: ', err)
    }
  }
  e.next()
}, 'submissions')
