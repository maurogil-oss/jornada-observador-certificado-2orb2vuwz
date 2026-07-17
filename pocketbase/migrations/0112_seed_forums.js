migrate(
  (app) => {
    const forumsCol = app.findCollectionByNameOrId('forums')

    let relatorId = ''
    try {
      const relator = app.findAuthRecordByEmail('users', 'cesar.souza@jornada.com')
      relatorId = relator.id
    } catch (_) {
      try {
        const admin = app.findAuthRecordByEmail('users', 'maurog1@hotmail.com')
        relatorId = admin.id
      } catch (_) {
        return
      }
    }

    const forums = [
      {
        code: 'FT-2026-001',
        title: 'Atendimento às Vítimas',
        objective:
          'Discutir e propor diretrizes técnicas para o atendimento às vítimas de acidentes de trânsito, visando a humanização e a eficiência do socorro.',
        opening_date: '2026-01-15 00:00:00.000Z',
        closing_date: '2026-06-30 23:59:59.000Z',
        status: 'Aberto',
      },
      {
        code: 'FT-2026-002',
        title: 'Autopropelidos',
        objective:
          'Estabelecer critérios técnicos para regulamentação de veículos autopropelidos quanto à circulação e segurança no trânsito.',
        opening_date: '2026-02-01 00:00:00.000Z',
        closing_date: '2026-07-31 23:59:59.000Z',
        status: 'Aberto',
      },
      {
        code: 'FT-2026-003',
        title: 'Mobilidade Ativa',
        objective:
          'Promover políticas de mobilidade ativa, com foco na segurança de pedestres e ciclistas em vias urbanas.',
        opening_date: '2026-01-01 00:00:00.000Z',
        closing_date: '2026-05-31 23:59:59.000Z',
        status: 'Em Consolidação',
      },
    ]

    for (const f of forums) {
      try {
        app.findFirstRecordByData('forums', 'code', f.code)
      } catch (_) {
        const record = new Record(forumsCol)
        record.set('code', f.code)
        record.set('title', f.title)
        record.set('objective', f.objective)
        record.set('relator_id', relatorId)
        record.set('opening_date', f.opening_date)
        record.set('closing_date', f.closing_date)
        record.set('status', f.status)
        app.save(record)
      }
    }
  },
  (app) => {
    const codes = ['FT-2026-001', 'FT-2026-002', 'FT-2026-003']
    for (const code of codes) {
      try {
        const record = app.findFirstRecordByData('forums', 'code', code)
        app.delete(record)
      } catch (_) {}
    }
  },
)
