migrate(
  (app) => {
    const collection = app.findCollectionByNameOrId('activities_metadata')

    const playbookActivities = [
      { title: 'Graduação (Reconhecida MEC)', axis: 'E2', p1: 10, p2: 15, p3: 20 },
      { title: 'Pós-graduação Lato Sensu (Especialização)', axis: 'E2', p1: 15, p2: 20, p3: 25 },
      { title: 'Pós-graduação Stricto Sensu (Mestrado)', axis: 'E2', p1: 25, p2: 30, p3: 35 },
      { title: 'Pós-graduação Stricto Sensu (Doutorado)', axis: 'E2', p1: 35, p2: 40, p3: 45 },
      { title: 'Certificação ONSV (Observador Certificado)', axis: 'E1', p1: 50, p2: 50, p3: 50 },
      { title: 'Artigos em Revistas Científicas', axis: 'E2', p1: 10, p2: 15, p3: 20 },
      { title: 'Palestras / Seminários', axis: 'E3', p1: 5, p2: 10, p3: 15 },
      { title: 'Cursos de Formação (Trânsito)', axis: 'E2', p1: 5, p2: 10, p3: 15 },
      { title: 'Cursos de Formação (Gestão / Liderança)', axis: 'E2', p1: 5, p2: 10, p3: 15 },
      { title: 'Projetos de Impacto na Comunidade', axis: 'E3', p1: 20, p2: 30, p3: 40 },
      { title: 'Experiência Profissional (Trânsito)', axis: 'E2', p1: 10, p2: 15, p3: 20 },
      { title: 'Representação Institucional (Eixo 3)', axis: 'E3', p1: 15, p2: 20, p3: 25 },
    ]

    const renames = [
      { old: 'Graduação', new: 'Graduação (Reconhecida MEC)' },
      { old: 'Especialização', new: 'Pós-graduação Lato Sensu (Especialização)' },
      { old: 'Mestrado', new: 'Pós-graduação Stricto Sensu (Mestrado)' },
      { old: 'Doutorado', new: 'Pós-graduação Stricto Sensu (Doutorado)' },
    ]

    // Apply renames mapping to existing entries
    for (const r of renames) {
      try {
        const record = app.findFirstRecordByData('activities_metadata', 'title', r.old)
        record.set('title', r.new)
        app.save(record)
      } catch (_) {
        // Ignore if not found
      }
    }

    // Ensure all core Playbook activities exist and have points populated
    for (const activity of playbookActivities) {
      try {
        const record = app.findFirstRecordByData('activities_metadata', 'title', activity.title)
        if (!record.get('points_level_1')) record.set('points_level_1', activity.p1)
        if (!record.get('points_level_2')) record.set('points_level_2', activity.p2)
        if (!record.get('points_level_3')) record.set('points_level_3', activity.p3)
        if (!record.get('axis')) record.set('axis', activity.axis)
        app.save(record)
      } catch (_) {
        const record = new Record(collection)
        record.set('title', activity.title)
        record.set('axis', activity.axis)
        record.set('points_level_1', activity.p1)
        record.set('points_level_2', activity.p2)
        record.set('points_level_3', activity.p3)
        app.save(record)
      }
    }
  },
  (app) => {
    // Revert not strictly necessary as this is a data standardization migration
  },
)
