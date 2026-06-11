migrate(
  (app) => {
    const submissions = app.findRecordsByFilter(
      'submissions',
      'score = 0 || score = null',
      '',
      10000,
      0,
    )
    const allMeta = app.findRecordsByFilter('activities_metadata', '', '', 1000, 0)

    const metaMap = {}
    for (let i = 0; i < allMeta.length; i++) {
      const title = allMeta[i].getString('title').trim().toLowerCase()
      metaMap[title] = allMeta[i]
    }

    for (let i = 0; i < submissions.length; i++) {
      const sub = submissions[i]
      const title = sub.getString('title').trim().toLowerCase()
      const nivel = sub.getString('nivel').trim().toLowerCase()
      const meta = metaMap[title]

      if (meta) {
        let score = meta.getFloat('points') || 0
        const p1 = meta.getFloat('points_level_1')
        const p2 = meta.getFloat('points_level_2')
        const p3 = meta.getFloat('points_level_3')

        if (nivel.includes('nível iii') || nivel.includes('eixo iii') || nivel.includes('eixo 3')) {
          score = p3
        } else if (
          nivel.includes('nível ii') ||
          nivel.includes('eixo ii') ||
          nivel.includes('eixo 2')
        ) {
          score = p2
        } else if (
          nivel.includes('nível i') ||
          nivel.includes('eixo i') ||
          nivel.includes('eixo 1')
        ) {
          score = p1
        }

        if (score > 0) {
          sub.set('score', score)
          app.saveNoValidate(sub)
        }
      }
    }
  },
  (app) => {
    // Irreversible migration
  },
)
