migrate(
  (app) => {
    const submissions = app.findRecordsByFilter('submissions', '1=1', '', 10000, 0)

    const scoreMap = {
      'Graduação (Reconhecida MEC)': 80,
      'Pós-graduação Lato Sensu': 100,
      Mestrado: 150,
      Doutorado: 200,
      'Pós-Doutorado (Estágio concluído)': 250,
    }

    // 1. Update submissions
    let updatedSubmissions = 0
    for (let i = 0; i < submissions.length; i++) {
      const sub = submissions[i]
      const title = sub.getString('title')
      let needsSave = false

      // Identify if it's an academic degree
      let exactMatch = scoreMap[title]
      let mappedScore = exactMatch
      let newTitle = title

      if (!exactMatch) {
        const lowerTitle = title.toLowerCase()
        if (
          lowerTitle.includes('pós-doutorado') ||
          lowerTitle.includes('pos-doutorado') ||
          lowerTitle.includes('pós doutorado')
        ) {
          mappedScore = 250
          newTitle = 'Pós-Doutorado (Estágio concluído)'
        } else if (lowerTitle.includes('doutorado')) {
          mappedScore = 200
          newTitle = 'Doutorado'
        } else if (lowerTitle.includes('mestrado')) {
          mappedScore = 150
          newTitle = 'Mestrado'
        } else if (
          lowerTitle.includes('pós-graduação') ||
          lowerTitle.includes('pos-graduação') ||
          lowerTitle.includes('lato sensu') ||
          lowerTitle.includes('pos graduação') ||
          lowerTitle.includes('pós graduação')
        ) {
          mappedScore = 100
          newTitle = 'Pós-graduação Lato Sensu'
        } else if (lowerTitle.includes('graduação') || lowerTitle.includes('graduacao')) {
          mappedScore = 80
          newTitle = 'Graduação (Reconhecida MEC)'
        }
      }

      if (mappedScore) {
        if (sub.getFloat('score') !== mappedScore) {
          sub.set('score', mappedScore)
          needsSave = true
        }
        if (sub.getString('type') !== 'titulation') {
          sub.set('type', 'titulation')
          needsSave = true
        }
        if (title !== newTitle) {
          sub.set('title', newTitle)
          needsSave = true
        }

        if (needsSave) {
          app.save(sub)
          updatedSubmissions++
        }
      }
    }

    console.log(`Updated ${updatedSubmissions} academic submissions.`)

    // 2. Recalculate users
    const users = app.findRecordsByFilter('users', '1=1', '', 10000, 0)
    let updatedUsers = 0

    for (let i = 0; i < users.length; i++) {
      const user = users[i]

      const userSubs = app.findRecordsByFilter(
        'submissions',
        "user_id = {:userId} && status = 'Aprovado'",
        '',
        1000,
        0,
        { userId: user.id },
      )

      let totalPoints = 0
      let axes = {}
      let courseCount = 0
      let maxTitulationScore = 0

      for (let j = 0; j < userSubs.length; j++) {
        const sub = userSubs[j]
        const score = sub.getFloat('score') || 0
        const title = sub.getString('title')
        const type = sub.getString('type')

        if (type === 'titulation') {
          if (score > maxTitulationScore) {
            maxTitulationScore = score
          }
        } else if (title === 'Curso geral na área de trânsito/mobilidade (Mínimo 8h)') {
          if (courseCount < 5) {
            totalPoints += score
            courseCount++
          }
        } else {
          totalPoints += score
        }

        if (type) {
          axes[type] = true
        }
      }

      totalPoints += maxTitulationScore
      totalPoints = Math.round(totalPoints * 100) / 100
      let axesCount = Object.keys(axes).length

      const turma = user.getInt('turma') || 15
      const createdDateStr = user.getString('created')
      let isProbationary = false
      if (turma >= 15 && createdDateStr) {
        const createdDate = new Date(createdDateStr.replace(' ', 'T'))
        const oneYearAgo = new Date()
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
        if (createdDate > oneYearAgo) {
          isProbationary = true
        }
      }

      let newLevel =
        turma <= 14
          ? 'Nível II - Observador Certificado Pleno'
          : 'Nível I - Observador Certificado (Iniciante)'

      if (isProbationary) {
        newLevel = 'Nível I - Observador Certificado (Iniciante)'
      } else {
        if (totalPoints >= 1000 && axesCount >= 3) {
          newLevel = 'Nível III - Mobilizador'
        } else if (totalPoints >= 500 && axesCount >= 2) {
          newLevel = 'Nível II - Observador Certificado Pleno'
        } else if (axesCount >= 1) {
          newLevel = 'Nível I - Observador Certificado (Iniciante)'
        }
      }

      const originalPoints = user.getFloat('points')
      const originalLevel = user.getString('level')

      if (originalPoints !== totalPoints || originalLevel !== newLevel) {
        user.set('points', totalPoints)
        user.set('level', newLevel)
        app.save(user)
        updatedUsers++

        // Create activity log
        try {
          const logs = app.findCollectionByNameOrId('activity_logs')
          const log = new Record(logs)
          log.set('entity_type', 'users')
          log.set('entity_id', user.id)
          log.set('action', 'Points/Level Recalculated (Migration 0048)')

          let desc = []
          if (originalPoints !== totalPoints)
            desc.push(`Points: ${originalPoints} -> ${totalPoints}`)
          if (originalLevel !== newLevel) desc.push(`Level: ${originalLevel} -> ${newLevel}`)
          log.set('description', desc.join(' | '))

          app.save(log)
        } catch (err) {
          console.log('Error creating activity log for user', user.id, err)
        }
      }
    }

    console.log(`Recalculated and updated ${updatedUsers} users.`)
  },
  (app) => {
    // Down migration is empty because we don't store previous titles/points dynamically
  },
)
