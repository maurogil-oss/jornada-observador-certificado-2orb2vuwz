routerAdd(
  'POST',
  '/backend/v1/audit/reconcile-levels',
  (e) => {
    if (!e.auth || e.auth.getString('role') !== 'admin') {
      return e.forbiddenError('Apenas administradores podem executar esta ação')
    }

    const users = $app.findRecordsByFilter('users', '1=1', '', 10000, 0)
    const submissions = $app.findRecordsByFilter(
      'submissions',
      "status = 'Aprovado'",
      '',
      100000,
      0,
    )
    const metadatas = $app.findRecordsByFilter('activities_metadata', '1=1', '', 1000, 0)

    const metaMap = {}
    for (const m of metadatas) {
      metaMap[m.id] = m
    }

    const submissionsByUser = {}
    for (const sub of submissions) {
      const uid = sub.getString('user_id')
      if (!submissionsByUser[uid]) submissionsByUser[uid] = []
      submissionsByUser[uid].push(sub)
    }

    for (const uid in submissionsByUser) {
      submissionsByUser[uid].sort((a, b) => {
        const d1 = new Date(a.getString('created').replace(' ', 'T')).getTime()
        const d2 = new Date(b.getString('created').replace(' ', 'T')).getTime()
        return d1 - d2
      })
    }

    const ACADEMIC_DEGREES = [
      'Graduação (Reconhecida MEC)',
      'Pós-graduação Lato Sensu',
      'Mestrado',
      'Doutorado',
      'Pós-Doutorado (Estágio concluído)',
      'Graduação',
      'Pós-graduação',
    ]

    const ITEM_CAPS = {
      'Curso geral na área de trânsito/mobilidade (Mínimo 8h)': 5,
      'Curso oficial promovido pelo ONSV': 5,
      'Artigos publicados': 5,
      'Estudos publicados': 5,
      'Papers publicados em revistas/anais': 5,
      'Trabalhar com trânsito/mobilidade (Validação anual)': 1,
      'Trabalhar em estandes/feiras relacionadas (Até 5x)': 5,
      'Organização de banco de dados local de sinistros (Até 2x)': 2,
      'Aplicação de pesquisa com usuários de trânsito (Até 5x)': 5,
      'Desenvolver projetos viários (traffic calming, ruas completas) (Até 5x)': 5,
      'Inovação técnica inédita e estruturada (Até 2x)': 2,
      'Inovação aplicada (implementada com impacto) (Única)': 1,
      'Implementação de projeto escolar contínuo': 3,
      'Projeto Local (Municipal)': 3,
      'Projeto Estadual': 3,
      'Projeto Nacional': 2,
      'Projeto Internacional': 2,
      'Livro publicado com ISBN (Até 2x)': 2,
      'EBook publicado na Plataforma Digital (Até 2x)': 2,
      'Produção de material educativo (Até 3x)': 3,
      'Produção de vídeo técnico educativo (Até 3x)': 3,
      'Publicar gratuitamente materiais/artigos (Até 5x)': 5,
      'Criar e coordenar ações educativas (Até 3x)': 3,
      'Trabalhar como colaborador em ações educativas (Até 5x)': 5,
      'Ser instrutor/dar aulas de trânsito (Até 5x)': 5,
      'Ministrar palestras técnicas (Até 5x)': 5,
      'Participar de eventos/conferências ONSV (Até 3x)': 3,
      'Organizar eventos técnicos (Até 3x)': 3,
      'Administrar site ou canal ativo sobre Segurança Viária (Até 3x)': 3,
      'Compartilhamento: Mín. 15 reposts/mês no Instagram ONSV (Até 6 meses)': 6,
      'Entrevista TV/Impresso (Até 5x)': 5,
      'Entrevista Online/Rádio (Até 5x)': 5,
      'Participação e contribuição em Audiência Pública': 5,
      'Participação e contribuição técnica em Consulta Pública': 5,
      'Proposição formal de melhoria viária protocolada (Até 3x)': 3,
      'Apresentar o Cadastro Positivo de Condutores (RNPC) (Até 5x)': 5,
      'Destaque anual do programa (Reconhecimento ONSV interno, 1x/ano)': 1,
      'Destaque anual do programa (Reconhecimento ONSV interno)': 1,
      'Atualização anual de cadastro técnico (Obrigatório, 1x/ano)': 1,
      'Representação formal do ONSV em eventos técnicos (Até 5x)': 5,
      'Atuar como voluntário formal em ONG de trânsito (Até 5x)': 5,
      'Mentoria: Atuação formal como mentor no programa (Validado pela coordenação)': 3,
      'Representante de Comitês estratégicos': 1,
      'Representante da campanha Maio Amarelo': 1,
      'Representante de JARI (Junta Administrativa de Recursos de Infrações)': 1,
      'Representante de Câmaras Técnicas': 1,
      'Representante de Conselhos': 1,
    }

    const EIXO1_TITLES = [
      'Graduação (Reconhecida MEC)',
      'Pós-graduação Lato Sensu',
      'Mestrado',
      'Doutorado',
      'Pós-Doutorado (Estágio concluído)',
      'Curso geral na área de trânsito/mobilidade (Mínimo 8h)',
      'Curso oficial promovido pelo ONSV',
      'Artigos publicados',
      'Estudos publicados',
      'Papers publicados em revistas/anais',
    ]

    const EIXO3_TITLES = [
      'Mentoria: Atuação formal como mentor no programa (Validado pela coordenação)',
      'Representante de Comitês estratégicos',
      'Representante da campanha Maio Amarelo',
      'Representante de JARI (Junta Administrativa de Recursos de Infrações)',
      'Representante de Câmaras Técnicas',
      'Representante de Conselhos',
    ]

    let updatedCount = 0

    $app.runInTransaction((txApp) => {
      for (const user of users) {
        const userId = user.id
        const oldPoints = user.getInt('points') || 0
        const oldLevel = user.getString('level') || ''
        const userSubs = submissionsByUser[userId] || []

        let maxAcademicScore = 0
        let maxAcademicId = ''

        for (const sub of userSubs) {
          const actId = sub.getString('activity_id')
          const act = actId ? metaMap[actId] : null
          const title = sub.getString('title')
          const isAcademic =
            ACADEMIC_DEGREES.includes(title) ||
            (act &&
              (act.getString('group_id') === 'academic' ||
                act.getString('title').includes('Graduação') ||
                act.getString('title').includes('Mestrado') ||
                act.getString('title').includes('Doutorado')))

          if (isAcademic) {
            let score = sub.getFloat('score') || 0
            if (act && act.getString('points_type') === 'fixed') {
              score = act.getFloat('points') || score
            }
            if (score > maxAcademicScore) {
              maxAcademicScore = score
              maxAcademicId = sub.id
            }
          }
        }

        let calculatedPoints = 0
        let eixo1Points = 0
        let eixo2Points = 0
        let eixo3Points = 0
        const itemCounts = {}

        for (const sub of userSubs) {
          const actId = sub.getString('activity_id')
          const act = actId ? metaMap[actId] : null
          const title = sub.getString('title')
          let score = sub.getFloat('score') || 0

          if (act && act.getString('points_type') === 'level_based') {
            const ul = oldLevel.toLowerCase()
            if (ul.includes('iii') || ul.includes('3') || ul.includes('mobilizador')) {
              score = act.getFloat('points_level_3') || 0
            } else if (ul.includes('ii') || ul.includes('2') || ul.includes('pleno')) {
              score = act.getFloat('points_level_2') || 0
            } else {
              score = act.getFloat('points_level_1') || 0
            }
          } else if (act && act.getString('points_type') === 'fixed') {
            score = act.getFloat('points') || score
          }

          let isCounted = false
          const isAcademic =
            ACADEMIC_DEGREES.includes(title) ||
            (act &&
              (act.getString('group_id') === 'academic' ||
                act.getString('title').includes('Graduação') ||
                act.getString('title').includes('Mestrado') ||
                act.getString('title').includes('Doutorado')))

          const isProducaoAcademica =
            title === 'Artigos publicados' ||
            title === 'Estudos publicados' ||
            title === 'Papers publicados em revistas/anais'

          if (isAcademic) {
            if (sub.id === maxAcademicId) {
              isCounted = true
            }
          } else if (isProducaoAcademica) {
            itemCounts['PRODUCAO_ACADEMICA'] = (itemCounts['PRODUCAO_ACADEMICA'] || 0) + 1
            if (itemCounts['PRODUCAO_ACADEMICA'] <= 5) {
              isCounted = true
            }
          } else {
            let maxOccurrences = 0
            if (act) {
              maxOccurrences = act.getBool('is_unique') ? 1 : act.getInt('max_occurrences') || 0
            } else {
              if (title.includes('Projeto Local') || title.includes('Projeto Estadual'))
                maxOccurrences = 3
              else if (
                title.includes('Projeto Nacional') ||
                title.includes('Projeto Internacional')
              )
                maxOccurrences = 2
              else maxOccurrences = ITEM_CAPS[title] || 999
            }

            const key = actId || title
            itemCounts[key] = (itemCounts[key] || 0) + 1
            if (maxOccurrences > 0) {
              if (itemCounts[key] <= maxOccurrences) {
                isCounted = true
              }
            } else {
              isCounted = true
            }
          }

          if (isCounted) {
            calculatedPoints += score

            const axis = act ? (act.getString('axis') || '').trim() : null
            const isEixo1 = axis === 'Eixo 1' || axis === '1' || EIXO1_TITLES.includes(title)
            const isEixo3 = axis === 'Eixo 3' || axis === '3' || EIXO3_TITLES.includes(title)

            if (isEixo1) eixo1Points += score
            else if (isEixo3) eixo3Points += score
            else eixo2Points += score
          }
        }

        calculatedPoints = Math.round(calculatedPoints * 100) / 100

        const turma = user.getInt('turma') || 0
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

        const activeEixos = [eixo1Points > 0, eixo2Points > 0, eixo3Points > 0].filter(
          Boolean,
        ).length

        let calculatedLevel = 'Nível I - Observador Certificado (Iniciante)'

        if (isProbationary) {
          calculatedLevel = 'Nível I - Observador Certificado (Iniciante)'
        } else {
          if (calculatedPoints >= 1000 && activeEixos >= 3) {
            calculatedLevel = 'Nível III - Mobilizador'
          } else if (calculatedPoints >= 500 && activeEixos >= 2) {
            calculatedLevel = 'Nível II - Observador Certificado Pleno'
          } else {
            calculatedLevel = 'Nível I - Observador Certificado (Iniciante)'
          }
        }

        if (oldPoints !== calculatedPoints || oldLevel !== calculatedLevel) {
          user.set('points', calculatedPoints)
          user.set('level', calculatedLevel)
          txApp.save(user)
          updatedCount++

          try {
            const logCollection = txApp.findCollectionByNameOrId('activity_logs')
            const logRecord = new Record(logCollection)
            logRecord.set('actor_id', e.auth?.id || null)
            logRecord.set('action', 'global_score_audit_sync')
            logRecord.set('entity_type', 'users')
            logRecord.set('entity_id', userId)
            logRecord.set(
              'description',
              `Global Audit. Points: ${oldPoints} -> ${calculatedPoints}, Level: ${oldLevel} -> ${calculatedLevel}`,
            )
            txApp.save(logRecord)
          } catch (err) {}
        }
      }
    })

    return e.json(200, { updated_count: updatedCount })
  },
  $apis.requireAuth(),
)
