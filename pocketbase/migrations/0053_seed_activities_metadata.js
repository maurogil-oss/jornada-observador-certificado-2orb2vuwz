migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('activities_metadata')

    const activities = [
      {
        title: 'Participação em Palestra de Sensibilização',
        axis: 'Educação',
        max_limit: '5x por ano',
        points_level_1: 10,
        points_level_2: 20,
        points_level_3: 30,
      },
      {
        title: 'Organização de Evento Maio Amarelo',
        axis: 'Mobilização',
        max_limit: '1x por ano',
        points_level_1: 50,
        points_level_2: 75,
        points_level_3: 100,
      },
      {
        title: 'Publicação de Artigo Técnico',
        axis: 'Pesquisa',
        max_limit: '3x por ano',
        points_level_1: 30,
        points_level_2: 45,
        points_level_3: 60,
      },
      {
        title: 'Mentoria de Novos Observadores',
        axis: 'Liderança',
        max_limit: '2x por ano',
        points_level_1: 20,
        points_level_2: 40,
        points_level_3: 60,
      },
      {
        title: 'Atuação em Comitê de Trânsito',
        axis: 'Representação Institucional',
        max_limit: 'Sem limite específico',
        points_level_1: 40,
        points_level_2: 60,
        points_level_3: 80,
      },
    ]

    for (const act of activities) {
      try {
        app.findFirstRecordByData('activities_metadata', 'title', act.title)
      } catch (_) {
        const record = new Record(col)
        record.set('title', act.title)
        record.set('axis', act.axis)
        record.set('max_limit', act.max_limit)
        record.set('points_level_1', act.points_level_1)
        record.set('points_level_2', act.points_level_2)
        record.set('points_level_3', act.points_level_3)
        app.save(record)
      }
    }
  },
  (app) => {
    const titles = [
      'Participação em Palestra de Sensibilização',
      'Organização de Evento Maio Amarelo',
      'Publicação de Artigo Técnico',
      'Mentoria de Novos Observadores',
      'Atuação em Comitê de Trânsito',
    ]

    for (const t of titles) {
      try {
        const record = app.findFirstRecordByData('activities_metadata', 'title', t)
        app.delete(record)
      } catch (_) {}
    }
  },
)
