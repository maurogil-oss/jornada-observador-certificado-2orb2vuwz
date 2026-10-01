migrate(
  (app) => {
    // 1. Vincular as 4 submissões órfãs de 30/09 às atividades correspondentes existentes
    // Atividades conhecidas:
    // - Ministrar palestras técnicas (Até 5x): '71ljxohovexn13s' (100 pts, Eixo 2)
    // - Desenvolver projetos viários (traffic calming, ruas completas) (Até 5x): 'nt04pmgn01554n9' (50 pts, Eixo 2)
    // - Representante da campanha Maio Amarelo: '43dz8qixpc01179' (50 pts, Eixo 3)

    const knownSubmissions = [
      { id: 'ys6nn9o9jarg1ir', activityId: '71ljxohovexn13s' },
      { id: '720q387m0a94eof', activityId: '71ljxohovexn13s' },
      { id: 'owtiq7x7yv3ls2z', activityId: 'nt04pmgn01554n9' },
      { id: '80lrvfxqxam5lcr', activityId: '43dz8qixpc01179' },
    ]

    for (const item of knownSubmissions) {
      try {
        const sub = app.findFirstRecordByData('submissions', 'id', item.id)
        if (sub) {
          sub.set('activity_id', item.activityId)
          app.save(sub)
          console.log(
            `[Migration 0140] Linked submission ${item.id} to activity ${item.activityId}`,
          )
        }
      } catch (e) {
        console.log(`[Migration 0140] Error linking submission ${item.id}: ${e}`)
      }
    }

    // 2. Para as duas submissões sem correspondência no catálogo, criar no catálogo 'activities_metadata'
    // as atividades necessárias (se não existirem) com o valor de 50 pontos cada, e vinculá-las:
    // a) "Cursos Complementares" (submissão de 13/04 '1hxh4qlzeewhij9', status "Ajuste Necessário")
    // b) "video educativo" (submissão de 28/05 'bp0kqx4064jupvj', status "Aprovado", atualmente 0 pontos)
    const activitiesCol = app.findCollectionByNameOrId('activities_metadata')

    // 2a. Atividade "Cursos Complementares"
    let cursosCompAct
    try {
      cursosCompAct = app.findFirstRecordByData(
        'activities_metadata',
        'title',
        'Cursos Complementares',
      )
    } catch (_) {
      cursosCompAct = new Record(activitiesCol)
      cursosCompAct.set('title', 'Cursos Complementares')
      cursosCompAct.set('axis', 'Eixo 1')
      cursosCompAct.set('category', 'Titulação e Formação')
      cursosCompAct.set('points_type', 'fixed')
      cursosCompAct.set('points', 50)
      cursosCompAct.set('points_level_1', 0)
      cursosCompAct.set('points_level_2', 0)
      cursosCompAct.set('points_level_3', 0)
      cursosCompAct.set('is_unique', false)
      cursosCompAct.set('max_occurrences', 0)
      app.save(cursosCompAct)
      console.log(
        `[Migration 0140] Created activity 'Cursos Complementares' with id ${cursosCompAct.id}`,
      )
    }

    // Vincular submissão "Cursos Complementares" (mantendo status "Ajuste Necessário")
    try {
      const subCursos = app.findFirstRecordByData('submissions', 'id', '1hxh4qlzeewhij9')
      if (subCursos) {
        subCursos.set('activity_id', cursosCompAct.id)
        app.save(subCursos)
        console.log(
          `[Migration 0140] Linked submission 1hxh4qlzeewhij9 to activity ${cursosCompAct.id}`,
        )
      }
    } catch (e) {
      console.log(`[Migration 0140] Error updating submission 1hxh4qlzeewhij9: ${e}`)
    }

    // 2b. Atividade "video educativo"
    let videoAct
    try {
      videoAct = app.findFirstRecordByData('activities_metadata', 'title', 'video educativo')
    } catch (_) {
      videoAct = new Record(activitiesCol)
      videoAct.set('title', 'video educativo')
      videoAct.set('axis', 'Eixo 2')
      videoAct.set('category', 'Produção de Conteúdo')
      videoAct.set('points_type', 'fixed')
      videoAct.set('points', 50)
      videoAct.set('points_level_1', 0)
      videoAct.set('points_level_2', 0)
      videoAct.set('points_level_3', 0)
      videoAct.set('is_unique', false)
      videoAct.set('max_occurrences', 0)
      app.save(videoAct)
      console.log(`[Migration 0140] Created activity 'video educativo' with id ${videoAct.id}`)
    }

    // Vincular submissão "video educativo" e atualizar score para 50 pontos
    let videoAuthorId = ''
    try {
      const subVideo = app.findFirstRecordByData('submissions', 'id', 'bp0kqx4064jupvj')
      if (subVideo) {
        subVideo.set('activity_id', videoAct.id)
        subVideo.set('score', 50)
        videoAuthorId = subVideo.getString('user_id')
        app.save(subVideo)
        console.log(
          `[Migration 0140] Linked submission bp0kqx4064jupvj to activity ${videoAct.id} and set score=50`,
        )
      }
    } catch (e) {
      console.log(`[Migration 0140] Error updating submission bp0kqx4064jupvj: ${e}`)
    }

    // 3. Atualizar o autor da submissão "video educativo" (Airton Rocha Alves, 4ltf2g7ndsl0wzu)
    // recalculando pontos (+50) e nível canônico caso necessário
    if (!videoAuthorId) {
      videoAuthorId = '4ltf2g7ndsl0wzu'
    }

    try {
      const author = app.findFirstRecordByData('users', 'id', videoAuthorId)
      if (author) {
        const currentPoints = author.getFloat('points') || 0
        const newPoints = currentPoints + 50
        author.set('points', newPoints)

        // Regra canônica:
        // 0 a 499: Nível I
        // 500 a 999: Nível II
        // 1000+: Nível III
        let canonicalLevel = 'Nível I'
        if (newPoints >= 1000) {
          canonicalLevel = 'Nível III'
        } else if (newPoints >= 500) {
          canonicalLevel = 'Nível II'
        }

        author.set('level', canonicalLevel)
        app.save(author)
        console.log(
          `[Migration 0140] Updated author ${author.id}: points ${currentPoints} -> ${newPoints}, level -> ${canonicalLevel}`,
        )

        try {
          const logCollection = app.findCollectionByNameOrId('activity_logs')
          const logRecord = new Record(logCollection)
          logRecord.set('actor_id', null)
          logRecord.set('action', 'recalc_points_level_migration_0140')
          logRecord.set('entity_type', 'users')
          logRecord.set('entity_id', author.id)
          logRecord.set(
            'description',
            `Migration 0140: +50 points for submission 'video educativo' (points: ${currentPoints} -> ${newPoints}, level: ${canonicalLevel})`,
          )
          app.save(logRecord)
        } catch (_) {}
      }
    } catch (e) {
      console.log(`[Migration 0140] Error updating author ${videoAuthorId}: ${e}`)
    }
  },
  (app) => {
    // Revert submissões de 30/09
    const subIds = ['ys6nn9o9jarg1ir', '720q387m0a94eof', 'owtiq7x7yv3ls2z', '80lrvfxqxam5lcr']
    for (const id of subIds) {
      try {
        const sub = app.findFirstRecordByData('submissions', 'id', id)
        if (sub) {
          sub.set('activity_id', '')
          app.save(sub)
        }
      } catch (_) {}
    }

    // Revert "Cursos Complementares"
    try {
      const subCursos = app.findFirstRecordByData('submissions', 'id', '1hxh4qlzeewhij9')
      if (subCursos) {
        subCursos.set('activity_id', '')
        app.save(subCursos)
      }
    } catch (_) {}

    // Revert "video educativo"
    try {
      const subVideo = app.findFirstRecordByData('submissions', 'id', 'bp0kqx4064jupvj')
      if (subVideo) {
        subVideo.set('activity_id', '')
        subVideo.set('score', 0)
        app.save(subVideo)
      }
    } catch (_) {}

    // Revert pontos do autor
    try {
      const author = app.findFirstRecordByData('users', 'id', '4ltf2g7ndsl0wzu')
      if (author) {
        const currentPoints = author.getFloat('points') || 0
        const revertedPoints = Math.max(0, currentPoints - 50)
        author.set('points', revertedPoints)
        let canonicalLevel = 'Nível I'
        if (revertedPoints >= 1000) canonicalLevel = 'Nível III'
        else if (revertedPoints >= 500) canonicalLevel = 'Nível II'
        author.set('level', canonicalLevel)
        app.save(author)
      }
    } catch (_) {}
  },
)
