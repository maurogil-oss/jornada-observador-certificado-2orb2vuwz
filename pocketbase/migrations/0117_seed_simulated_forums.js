migrate(
  (app) => {
    var relatorId = ''
    try {
      var relator = app.findAuthRecordByEmail('users', 'maurog1@hotmail.com')
      relatorId = relator.id
    } catch (_) {
      return
    }

    var now = new Date()
    var openingDate = now
      .toISOString()
      .replace('T', ' ')
      .replace(/\.\d+Z$/, 'Z')
    var future = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    var closingDate = future
      .toISOString()
      .replace('T', ' ')
      .replace(/\.\d+Z$/, 'Z')

    var forumsCol = app.findCollectionByNameOrId('forums')
    var tagsCol = app.findCollectionByNameOrId('forum_tags')

    function getOrCreateTag(name) {
      try {
        return app.findFirstRecordByData('forum_tags', 'name', name).id
      } catch (_) {
        var record = new Record(tagsCol)
        record.set('name', name)
        app.save(record)
        return record.id
      }
    }

    var forums = [
      {
        code: 'FOR-P1-001',
        title:
          'Quais são os principais desafios para a integração de dados estatísticos municipais no RENAEST?',
        objective:
          'Discutir métodos para unificar a coleta de dados de acidentes entre municípios e órgãos federais.',
        pilar: 'Pilar 1: Gestão da Segurança no Trânsito',
        tags: ['Dados', 'Integração', 'Gestão'],
      },
      {
        code: 'FOR-P2-001',
        title:
          'Como o desenho de ruas completas pode influenciar na redução de mortes de pedestres em centros urbanos?',
        objective:
          'Avaliar o impacto de intervenções de engenharia viária na segurança de usuários vulneráveis.',
        pilar: 'Pilar 2: Vias Seguras',
        tags: ['Infraestrutura', 'Urbanismo', 'Pedestres'],
      },
      {
        code: 'FOR-P3-001',
        title:
          'Qual a viabilidade técnica de tornar obrigatórios sistemas de frenagem automática em veículos de carga no Brasil?',
        objective:
          'Analisar custos e benefícios da implementação de tecnologias de segurança ativa em frotas pesadas.',
        pilar: 'Pilar 3: Segurança Veicular',
        tags: ['Tecnologia', 'Veículos', 'Segurança Ativa'],
      },
      {
        code: 'FOR-P4-001',
        title:
          'Como medir a eficácia de campanhas educativas de trânsito em ambientes escolares de ensino médio?',
        objective:
          'Propor indicadores de desempenho para ações educativas focadas no público jovem.',
        pilar: 'Pilar 4: Educação para o Trânsito',
        tags: ['Educação', 'Escolas', 'Campanhas'],
      },
      {
        code: 'FOR-P5-001',
        title:
          'Quais protocolos de atendimento pré-hospitalar são mais críticos para a preservação da vida em áreas rurais?',
        objective:
          'Debater a logística e o treinamento necessário para otimizar o tempo de resposta em locais remotos.',
        pilar: 'Pilar 5: Atendimento às Vítimas',
        tags: ['Saúde', 'Emergência', 'Resgate'],
      },
      {
        code: 'FOR-P6-001',
        title:
          'De que forma a fiscalização eletrônica por videomonitoramento pode auxiliar na coibição do uso de celular?',
        objective:
          'Discutir a legalidade e a eficiência técnica do monitoramento remoto para infrações comportamentais.',
        pilar: 'Pilar 6: Normatização e Fiscalização',
        tags: ['Fiscalização', 'Monitoramento', 'Legislação'],
      },
    ]

    for (var i = 0; i < forums.length; i++) {
      var f = forums[i]

      try {
        app.findFirstRecordByData('forums', 'code', f.code)
        continue
      } catch (_) {}

      try {
        app.findFirstRecordByData('forums', 'title', f.title)
        continue
      } catch (_) {}

      var tagIds = []
      for (var j = 0; j < f.tags.length; j++) {
        tagIds.push(getOrCreateTag(f.tags[j]))
      }

      var record = new Record(forumsCol)
      record.set('code', f.code)
      record.set('title', f.title)
      record.set('objective', f.objective)
      record.set('relator_id', relatorId)
      record.set('opening_date', openingDate)
      record.set('closing_date', closingDate)
      record.set('status', 'Discussões')
      record.set('pilar_pnatrans', f.pilar)
      record.set('theme_tags', tagIds)
      app.save(record)
    }
  },
  (app) => {
    var codes = ['FOR-P1-001', 'FOR-P2-001', 'FOR-P3-001', 'FOR-P4-001', 'FOR-P5-001', 'FOR-P6-001']
    for (var i = 0; i < codes.length; i++) {
      try {
        var record = app.findFirstRecordByData('forums', 'code', codes[i])
        app.delete(record)
      } catch (_) {}
    }

    var tagNames = [
      'Dados',
      'Integração',
      'Gestão',
      'Infraestrutura',
      'Urbanismo',
      'Pedestres',
      'Tecnologia',
      'Veículos',
      'Segurança Ativa',
      'Educação',
      'Escolas',
      'Campanhas',
      'Saúde',
      'Emergência',
      'Resgate',
      'Fiscalização',
      'Monitoramento',
      'Legislação',
    ]
    for (var j = 0; j < tagNames.length; j++) {
      try {
        var tag = app.findFirstRecordByData('forum_tags', 'name', tagNames[j])
        app.delete(tag)
      } catch (_) {}
    }
  },
)
