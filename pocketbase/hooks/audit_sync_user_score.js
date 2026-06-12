routerAdd(
  'POST',
  '/backend/v1/audit/sync-user-score',
  (e) => {
    const body = e.requestInfo().body
    const userId = body.user_id

    if (!userId) {
      return e.badRequestError('Missing user_id')
    }

    const user = $app.findRecordById('users', userId)
    const oldPoints = user.getInt('points') || 0
    const oldLevel = user.getString('level') || ''

    // Calculate score directly in the backend
    const submissions = $app.findRecordsByFilter(
      'submissions',
      `user_id = '${userId}' && status = 'Aprovado'`,
      'created',
    )

    const metadatas = $app.findRecordsByFilter('activities_metadata', '1=1', '')
    const metaMap = {}
    for (const m of metadatas) {
      metaMap[m.id] = m
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
      'Trabalhar em estandes/feiras relacionadas (Até 5x)': 5,
      'Organização de banco de dados local de sinistros (Até 2x)': 2,
      'Aplicação de pesquisa com usuários de trânsito (Até 5x)': 5,
      'Desenvolver projetos viários (traffic calming, ruas completas) (Até 5x)': 5,
      'Inovação técnica inédita e estruturada (Até 2x)': 2,
      'Inovação aplicada (implementada com impacto) (Única)': 1,
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
      'Representação formal do ONSV em eventos técnicos (Até 5x)': 5,
      'Atuar como voluntário formal em ONG de trânsito (Até 5x)': 5,
      'Mentoria: Atuação formal como mentor no programa (Validado pela coordenação)': 3,
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
        const score = sub.getFloat('score') || 0
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

      if (isAcademic) {
        if (sub.id === maxAcademicId) {
          isCounted = true
        }
      } else {
        let maxOccurrences = 0
        if (act) {
          maxOccurrences = act.getBool('is_unique') ? 1 : act.getInt('max_occurrences') || 0
        } else {
          if (title.includes('Projeto Local') || title.includes('Projeto Estadual'))
            maxOccurrences = 3
          else if (title.includes('Projeto Nacional') || title.includes('Projeto Internacional'))
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
        const axis = act ? act.getString('axis') : null
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
      calculatedLevel = 'Nível III - Observador Certificado Mobilizador'
    } else if (calculatedLevelBase === 'Nível II') {
      calculatedLevel = 'Nível II - Observador Certificado Pleno'
    } else if (calculatedLevelBase === 'Nível I') {
      calculatedLevel = 'Nível I - Observador Certificado'
    }

    if (oldPoints === calculatedPoints && oldLevel === calculatedLevel) {
      return e.json(200, { message: 'Score already synchronized' })
    }

    // Update user
    user.set('points', calculatedPoints)
    user.set('level', calculatedLevel)

    $app.save(user)

    // Log in activity_logs
    try {
      const logCollection = $app.findCollectionByNameOrId('activity_logs')
      const logRecord = new Record(logCollection)
      logRecord.set('actor_id', e.auth?.id || null)
      logRecord.set('action', 'score_audit_sync')
      logRecord.set('entity_type', 'users')
      logRecord.set('entity_id', userId)
      logRecord.set(
        'description',
        `Score adjusted: Titration limit exceeded / Points audit. Changed points from ${oldPoints} to ${calculatedPoints}`,
      )
      $app.save(logRecord)
    } catch (err) {
      // Graceful fallback if activity_logs is not available
      console.error('Failed to create activity log for score sync:', err)
    }

    return e.json(200, { message: 'Score synchronized successfully', points: calculatedPoints })
  },
  $apis.requireAuth(),
)
