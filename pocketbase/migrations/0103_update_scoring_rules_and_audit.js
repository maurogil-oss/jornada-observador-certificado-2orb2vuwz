migrate(
  (app) => {
    const metadata = [
      {
        title: 'Graduação (Reconhecida MEC)',
        points: 80,
        is_unique: true,
        max_occurrences: 1,
        axis: 'Eixo 1',
      },
      {
        title: 'Pós-graduação Lato Sensu',
        points: 100,
        is_unique: true,
        max_occurrences: 1,
        axis: 'Eixo 1',
      },
      { title: 'Mestrado', points: 150, is_unique: true, max_occurrences: 1, axis: 'Eixo 1' },
      { title: 'Doutorado', points: 200, is_unique: true, max_occurrences: 1, axis: 'Eixo 1' },
      {
        title: 'Pós-Doutorado (Estágio concluído)',
        points: 250,
        is_unique: true,
        max_occurrences: 1,
        axis: 'Eixo 1',
      },

      {
        title: 'Curso geral na área de trânsito/mobilidade (Mínimo 8h)',
        points: 30,
        max_occurrences: 5,
        axis: 'Eixo 1',
      },
      {
        title: 'Curso oficial promovido pelo ONSV',
        points: 50,
        max_occurrences: 5,
        axis: 'Eixo 1',
      },

      { title: 'Artigos publicados', points: 50, max_occurrences: 5, axis: 'Eixo 1' },
      { title: 'Estudos publicados', points: 50, max_occurrences: 5, axis: 'Eixo 1' },
      {
        title: 'Papers publicados em revistas/anais',
        points: 50,
        max_occurrences: 5,
        axis: 'Eixo 1',
      },

      {
        title: 'Trabalhar com trânsito/mobilidade (Validação anual)',
        points: 50,
        max_occurrences: 1,
        axis: 'Eixo 2',
      },
      {
        title: 'Trabalhar em estandes/feiras relacionadas (Até 5x)',
        points: 50,
        max_occurrences: 5,
        axis: 'Eixo 2',
      },
      {
        title: 'Organização de banco de dados local de sinistros (Até 2x)',
        points: 70,
        max_occurrences: 2,
        axis: 'Eixo 2',
      },
      {
        title: 'Aplicação de pesquisa com usuários de trânsito (Até 5x)',
        points: 50,
        max_occurrences: 5,
        axis: 'Eixo 2',
      },

      {
        title: 'Desenvolver projetos viários (traffic calming, ruas completas) (Até 5x)',
        points: 50,
        max_occurrences: 5,
        axis: 'Eixo 2',
      },
      {
        title: 'Inovação técnica inédita e estruturada (Até 2x)',
        points: 100,
        max_occurrences: 2,
        axis: 'Eixo 2',
      },
      {
        title: 'Inovação aplicada (implementada com impacto) (Única)',
        points: 300,
        is_unique: true,
        max_occurrences: 1,
        axis: 'Eixo 2',
      },

      {
        title: 'Implementação de projeto escolar contínuo',
        points: 70,
        max_occurrences: 3,
        axis: 'Eixo 2',
      },
      { title: 'Projeto Local (Municipal)', points: 50, max_occurrences: 3, axis: 'Eixo 2' },
      { title: 'Projeto Estadual', points: 100, max_occurrences: 3, axis: 'Eixo 2' },
      { title: 'Projeto Nacional', points: 150, max_occurrences: 2, axis: 'Eixo 2' },
      { title: 'Projeto Internacional', points: 200, max_occurrences: 2, axis: 'Eixo 2' },

      {
        title: 'Livro publicado com ISBN (Até 2x)',
        points: 150,
        max_occurrences: 2,
        axis: 'Eixo 2',
      },
      {
        title: 'EBook publicado na Plataforma Digital (Até 2x)',
        points: 150,
        max_occurrences: 2,
        axis: 'Eixo 2',
      },
      {
        title: 'Produção de material educativo (Até 3x)',
        points: 100,
        max_occurrences: 3,
        axis: 'Eixo 2',
      },
      {
        title: 'Produção de vídeo técnico educativo (Até 3x)',
        points: 100,
        max_occurrences: 3,
        axis: 'Eixo 2',
      },
      {
        title: 'Publicar gratuitamente materiais/artigos (Até 5x)',
        points: 50,
        max_occurrences: 5,
        axis: 'Eixo 2',
      },

      {
        title: 'Criar e coordenar ações educativas (Até 3x)',
        points: 100,
        max_occurrences: 3,
        axis: 'Eixo 2',
      },
      {
        title: 'Trabalhar como colaborador em ações educativas (Até 5x)',
        points: 20,
        max_occurrences: 5,
        axis: 'Eixo 2',
      },
      {
        title: 'Ser instrutor/dar aulas de trânsito (Até 5x)',
        points: 50,
        max_occurrences: 5,
        axis: 'Eixo 2',
      },
      {
        title: 'Ministrar palestras técnicas (Até 5x)',
        points: 100,
        max_occurrences: 5,
        axis: 'Eixo 2',
      },
      {
        title: 'Participar de eventos/conferências ONSV (Até 3x)',
        points: 100,
        max_occurrences: 3,
        axis: 'Eixo 2',
      },
      {
        title: 'Organizar eventos técnicos (Até 3x)',
        points: 80,
        max_occurrences: 3,
        axis: 'Eixo 2',
      },

      {
        title: 'Administrar site ou canal ativo sobre Segurança Viária (Até 3x)',
        points: 80,
        max_occurrences: 3,
        axis: 'Eixo 2',
      },
      {
        title: 'Compartilhamento: Mín. 15 reposts/mês no Instagram ONSV (Até 6 meses)',
        points: 50,
        max_occurrences: 6,
        axis: 'Eixo 2',
      },
      { title: 'Entrevista TV/Impresso (Até 5x)', points: 30, max_occurrences: 5, axis: 'Eixo 2' },
      { title: 'Entrevista Online/Rádio (Até 5x)', points: 20, max_occurrences: 5, axis: 'Eixo 2' },

      {
        title: 'Participação e contribuição em Audiência Pública',
        points: 30,
        max_occurrences: 5,
        axis: 'Eixo 2',
      },
      {
        title: 'Participação e contribuição técnica em Consulta Pública',
        points: 30,
        max_occurrences: 5,
        axis: 'Eixo 2',
      },
      {
        title: 'Proposição formal de melhoria viária protocolada (Até 3x)',
        points: 70,
        max_occurrences: 3,
        axis: 'Eixo 2',
      },
      {
        title: 'Apresentar o Cadastro Positivo de Condutores (RNPC) (Até 5x)',
        points: 70,
        max_occurrences: 5,
        axis: 'Eixo 2',
      },

      {
        title: 'Recebimento de prêmio nacional',
        points: 100,
        max_occurrences: 999,
        axis: 'Eixo 2',
      },
      { title: 'Recebimento de prêmio regional', points: 50, max_occurrences: 999, axis: 'Eixo 2' },
      {
        title: 'Recebimento de moção/homenagem pública',
        points: 100,
        max_occurrences: 999,
        axis: 'Eixo 2',
      },
      {
        title: 'Destaque anual do programa (Reconhecimento ONSV interno',
        points: 100,
        max_occurrences: 1,
        axis: 'Eixo 2',
      },

      {
        title: 'Atualização anual de cadastro técnico',
        points: 30,
        max_occurrences: 1,
        axis: 'Eixo 2',
      },
      {
        title: 'Representação formal do ONSV em eventos técnicos',
        points: 70,
        max_occurrences: 5,
        axis: 'Eixo 2',
      },
      {
        title: 'Atuar como voluntário formal em ONG de trânsito',
        points: 50,
        max_occurrences: 5,
        axis: 'Eixo 2',
      },

      {
        title: 'Mentoria: Atuação formal como mentor',
        points: 200,
        max_occurrences: 3,
        axis: 'Eixo 3',
      },
      {
        title: 'Representante de Comitês estratégicos',
        points: 100,
        max_occurrences: 1,
        axis: 'Eixo 3',
      },
      {
        title: 'Representante da campanha Maio Amarelo',
        points: 50,
        max_occurrences: 1,
        axis: 'Eixo 3',
      },
      { title: 'Representante de JARI', points: 50, max_occurrences: 1, axis: 'Eixo 3' },
      {
        title: 'Representante de Câmaras Técnicas',
        points: 50,
        max_occurrences: 1,
        axis: 'Eixo 3',
      },
      { title: 'Representante de Conselhos', points: 50, max_occurrences: 1, axis: 'Eixo 3' },
    ]

    const metadatas = app.findRecordsByFilter('activities_metadata', '1=1', '')
    const metaMap = {}

    for (const meta of metadatas) {
      const title = meta.getString('title')

      let matched = metadata.find((m) => title.includes(m.title) || m.title.includes(title))
      if (matched) {
        meta.set('points', matched.points)
        meta.set('points_type', 'fixed')
        meta.set('is_unique', matched.is_unique || false)
        meta.set('max_occurrences', matched.max_occurrences || 0)
        if (matched.axis) {
          meta.set('axis', matched.axis)
        }
        app.save(meta)
      }
      metaMap[meta.id] = meta
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

    const users = app.findRecordsByFilter('users', '1=1', '')
    for (const user of users) {
      const userId = user.id
      let submissions
      try {
        submissions = app.findRecordsByFilter(
          'submissions',
          `user_id = '${userId}' && status = 'Aprovado'`,
          'created ASC',
        )
      } catch (_) {
        submissions = []
      }

      let maxAcademicScore = 0
      let maxAcademicId = ''

      for (const sub of submissions) {
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
          } else {
            let matched = metadata.find((m) => title.includes(m.title) || m.title.includes(title))
            if (matched) score = matched.points
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

      for (const sub of submissions) {
        const actId = sub.getString('activity_id')
        const act = actId ? metaMap[actId] : null
        const title = sub.getString('title')

        let score = sub.getFloat('score') || 0
        let matched = metadata.find((m) => title.includes(m.title) || m.title.includes(title))

        if (act && act.getString('points_type') === 'fixed') {
          score = act.getFloat('points') || score
        } else if (matched) {
          score = matched.points
        }

        if (score !== sub.getFloat('score')) {
          sub.set('score', score)
          app.saveNoValidate(sub)
        }

        let isCounted = false
        const isAcademic =
          ACADEMIC_DEGREES.includes(title) ||
          (act &&
            (act.getString('group_id') === 'academic' ||
              act.getString('title').includes('Graduação') ||
              act.getString('title').includes('Mestrado') ||
              act.getString('title').includes('Doutorado')))

        if (isAcademic) {
          if (sub.id === maxAcademicId) {
            isCounted = true
          }
        } else {
          let maxOccurrences = 0
          if (act) {
            maxOccurrences = act.getBool('is_unique') ? 1 : act.getInt('max_occurrences') || 0
          } else if (matched) {
            maxOccurrences = matched.is_unique ? 1 : matched.max_occurrences || 0
          } else {
            maxOccurrences = 999
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
          const axis = act ? act.getString('axis') : matched ? matched.axis : null
          if (axis === 'Eixo 1' || EIXO1_TITLES.includes(title)) eixo1Points += score
          else if (axis === 'Eixo 3' || EIXO3_TITLES.includes(title)) eixo3Points += score
          else eixo2Points += score
        }
      }

      calculatedPoints = Math.round(calculatedPoints * 100) / 100

      let activeEixos = 0
      if (eixo1Points > 0) activeEixos++
      if (eixo2Points > 0) activeEixos++
      if (eixo3Points > 0) activeEixos++

      let calculatedLevelBase = 'Nível I'
      if (calculatedPoints >= 1000 && activeEixos >= 3) {
        calculatedLevelBase = 'Nível III'
      } else if (calculatedPoints >= 500 && activeEixos >= 2) {
        calculatedLevelBase = 'Nível II'
      }

      let calculatedLevel = calculatedLevelBase
      if (calculatedLevelBase === 'Nível III') {
        calculatedLevel = 'Nível III - Mobilizador'
      } else if (calculatedLevelBase === 'Nível II') {
        calculatedLevel = 'Nível II - Observador Certificado Pleno'
      } else if (calculatedLevelBase === 'Nível I') {
        calculatedLevel = 'Nível I - Observador Certificado (Iniciante)'
      }

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

      if (isProbationary) {
        calculatedLevel = 'Nível I - Observador Certificado (Iniciante)'
      }

      const oldPoints = user.getFloat('points') || 0
      const oldLevel = user.getString('level') || ''

      if (oldPoints !== calculatedPoints || oldLevel !== calculatedLevel) {
        user.set('points', calculatedPoints)
        user.set('level', calculatedLevel)
        app.save(user)

        try {
          const logCollection = app.findCollectionByNameOrId('activity_logs')
          const logRecord = new Record(logCollection)
          logRecord.set('actor_id', null)
          logRecord.set('action', 'migration_score_audit')
          logRecord.set('entity_type', 'users')
          logRecord.set('entity_id', userId)
          logRecord.set(
            'description',
            `Score adjusted via Migration 0103. Changed points from ${oldPoints} to ${calculatedPoints} and level from ${oldLevel} to ${calculatedLevel}`,
          )
          app.save(logRecord)
        } catch (err) {}
      }
    }
  },
  (app) => {},
)
