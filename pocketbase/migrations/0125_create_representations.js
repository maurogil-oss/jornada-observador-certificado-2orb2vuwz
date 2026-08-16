migrate(
  (app) => {
    // 1. representation_institutions
    const institutions = new Collection({
      name: 'representation_institutions',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.role = 'admin'",
      updateRule: "@request.auth.role = 'admin'",
      deleteRule: "@request.auth.role = 'admin'",
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'acronym', type: 'text', required: true },
        {
          name: 'category',
          type: 'select',
          required: true,
          values: ['Federal', 'Estadual', 'Municipal'],
          maxSelect: 1,
        },
        { name: 'state', type: 'text' }, // e.g., 'SP', 'DF'
        { name: 'city', type: 'text' },
        { name: 'description', type: 'text' },
        { name: 'scope', type: 'text' }, // ex: "Colegiado Consultivo de Trânsito"
        { name: 'term_start', type: 'date' },
        { name: 'term_end', type: 'date' },
        { name: 'is_active', type: 'bool' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_rep_inst_category ON representation_institutions (category)',
        'CREATE INDEX idx_rep_inst_acronym ON representation_institutions (acronym)',
      ],
    })
    app.save(institutions)

    // 2. representation_members
    const members = new Collection({
      name: 'representation_members',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.role = 'admin'",
      updateRule: "@request.auth.role = 'admin'",
      deleteRule: "@request.auth.role = 'admin'",
      fields: [
        {
          name: 'institution_id',
          type: 'relation',
          required: true,
          collectionId: institutions.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'user_id',
          type: 'relation',
          required: false,
          collectionId: '_pb_users_auth_',
          cascadeDelete: false,
          maxSelect: 1,
        },
        { name: 'name', type: 'text', required: true }, // Name if user record isn't linked or for easy reference
        { name: 'email', type: 'email' },
        {
          name: 'role_type',
          type: 'select',
          required: true,
          values: ['Titular', 'Suplente'],
          maxSelect: 1,
        },
        { name: 'term_start', type: 'date' },
        { name: 'term_end', type: 'date' },
        { name: 'commitment_term_signed', type: 'bool' },
        { name: 'commitment_term_file', type: 'file', maxSelect: 1, maxSize: 10485760 },
        { name: 'appointment_act', type: 'text' }, // Ex: Portaria nº 123/2024
        {
          name: 'status',
          type: 'select',
          required: true,
          values: ['Ativo', 'Encerrado', 'Pendente'],
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_rep_mem_inst ON representation_members (institution_id)',
        'CREATE INDEX idx_rep_mem_user ON representation_members (user_id)',
      ],
    })
    app.save(members)

    // 3. representation_documents
    const documents = new Collection({
      name: 'representation_documents',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.role = 'admin'",
      fields: [
        {
          name: 'institution_id',
          type: 'relation',
          required: true,
          collectionId: institutions.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'title', type: 'text', required: true },
        {
          name: 'category',
          type: 'select',
          required: true,
          values: [
            'Legislação',
            'Regimento Interno',
            'Edital',
            'Ato de Nomeação',
            'Nota Técnica',
            'Outros',
          ],
          maxSelect: 1,
        },
        { name: 'file', type: 'file', maxSelect: 1, maxSize: 20971520 },
        { name: 'url', type: 'url' },
        { name: 'description', type: 'text' },
        { name: 'published_date', type: 'date' },
        { name: 'uploaded_by', type: 'relation', collectionId: '_pb_users_auth_', maxSelect: 1 },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_rep_docs_inst ON representation_documents (institution_id)'],
    })
    app.save(documents)

    // 4. representation_meetings
    const meetings = new Collection({
      name: 'representation_meetings',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.role = 'admin'",
      fields: [
        {
          name: 'institution_id',
          type: 'relation',
          required: true,
          collectionId: institutions.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'title', type: 'text', required: true },
        {
          name: 'meeting_type',
          type: 'select',
          required: true,
          values: ['Ordinária', 'Extraordinária', 'Câmara Temática', 'Grupo de Trabalho'],
          maxSelect: 1,
        },
        { name: 'meeting_date', type: 'date', required: true },
        { name: 'location_or_link', type: 'text' },
        { name: 'agenda', type: 'text' }, // Pauta
        { name: 'minutes_summary', type: 'text' }, // Resumo da Ata
        { name: 'report_file', type: 'file', maxSelect: 1, maxSize: 20971520 }, // Relatório/Ata em PDF
        { name: 'decisions', type: 'text' }, // Decisões e Deliberações
        { name: 'attendees_count', type: 'number' },
        { name: 'created_by', type: 'relation', collectionId: '_pb_users_auth_', maxSelect: 1 },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_rep_meet_inst ON representation_meetings (institution_id)'],
    })
    app.save(meetings)

    // 5. representation_topics
    const topics = new Collection({
      name: 'representation_topics',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.role = 'admin'",
      fields: [
        {
          name: 'institution_id',
          type: 'relation',
          required: true,
          collectionId: institutions.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'text' },
        {
          name: 'status',
          type: 'select',
          required: true,
          values: ['Em Discussão', 'Sinalizado ONSV', 'Orientado ONSV', 'Concluído'],
          maxSelect: 1,
        },
        { name: 'attention_flag', type: 'bool' }, // Sinalização para atenção do ONSV
        { name: 'onsv_guidance', type: 'text' }, // Orientação / Posicionamento oficial do ONSV
        { name: 'onsv_guidance_date', type: 'date' },
        { name: 'author_id', type: 'relation', collectionId: '_pb_users_auth_', maxSelect: 1 },
        { name: 'decisions_forwarded', type: 'text' }, // Encaminhamentos
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_rep_top_inst ON representation_topics (institution_id)'],
    })
    app.save(topics)

    // SEED INITIAL REPRESENTATIONS (CONTRAN, CETRAN-SP, JARI - DER/SP, etc.)
    try {
      const ctran = new Record(institutions)
      ctran.set('name', 'Conselho Nacional de Trânsito - CONTRAN')
      ctran.set('acronym', 'CONTRAN')
      ctran.set('category', 'Federal')
      ctran.set(
        'description',
        'Órgão máximo normativo e consultivo do Sistema Nacional de Trânsito.',
      )
      ctran.set('scope', 'Câmaras Temáticas e Reuniões Plenárias')
      ctran.set('term_start', '2024-01-01')
      ctran.set('term_end', '2025-12-31')
      ctran.set('is_active', true)
      app.save(ctran)

      const cetranSp = new Record(institutions)
      cetranSp.set('name', 'Conselho Estadual de Trânsito de São Paulo - CETRAN-SP')
      cetranSp.set('acronym', 'CETRAN-SP')
      cetranSp.set('category', 'Estadual')
      cetranSp.set('state', 'SP')
      cetranSp.set(
        'description',
        'Órgão normativo, consultivo e coordenador do Sistema Estadual de Trânsito de SP.',
      )
      cetranSp.set('scope', 'Conselho Pleno')
      cetranSp.set('term_start', '2023-06-01')
      cetranSp.set('term_end', '2025-06-01')
      cetranSp.set('is_active', true)
      app.save(cetranSp)

      const jariDer = new Record(institutions)
      jariDer.set('name', 'Junta Administrativa de Recursos de Infrações - DER/SP')
      jariDer.set('acronym', 'JARI – DER/SP')
      jariDer.set('category', 'Estadual')
      jariDer.set('state', 'SP')
      jariDer.set(
        'description',
        'Órgão colegiado encarregado do julgamento dos recursos interpostos contra penalidades aplicadas pelo DER/SP.',
      )
      jariDer.set('scope', 'Colegiado de Recursos')
      jariDer.set('term_start', '2024-02-15')
      jariDer.set('term_end', '2026-02-15')
      jariDer.set('is_active', true)
      app.save(jariDer)

      const comtran = new Record(institutions)
      comtran.set('name', 'Conselho Municipal de Trânsito e Transporte - CMTT/SP')
      comtran.set('acronym', 'CMTT - São Paulo')
      comtran.set('category', 'Municipal')
      comtran.set('state', 'SP')
      comtran.set('city', 'São Paulo')
      comtran.set(
        'description',
        'Espaço de participação popular e representação institucional nas políticas de mobilidade e trânsito municipal.',
      )
      comtran.set('scope', 'Comitê Técnico de Segurança Viária')
      comtran.set('term_start', '2024-01-10')
      comtran.set('term_end', '2025-12-31')
      comtran.set('is_active', true)
      app.save(comtran)

      // Seed sample members for CONTRAN
      const m1 = new Record(members)
      m1.set('institution_id', ctran.id)
      m1.set('name', 'Dr. Paulo Botelho')
      m1.set('email', 'paulo.botelho@onsv.org.br')
      m1.set('role_type', 'Titular')
      m1.set('term_start', '2024-01-01')
      m1.set('term_end', '2025-12-31')
      m1.set('commitment_term_signed', true)
      m1.set('appointment_act', 'Portaria Senatran nº 45/2024')
      m1.set('status', 'Ativo')
      app.save(m1)

      const m2 = new Record(members)
      m2.set('institution_id', ctran.id)
      m2.set('name', 'Ingrid Neto')
      m2.set('email', 'ingrid.neto@onsv.org.br')
      m2.set('role_type', 'Suplente')
      m2.set('term_start', '2024-01-01')
      m2.set('term_end', '2025-12-31')
      m2.set('commitment_term_signed', true)
      m2.set('appointment_act', 'Portaria Senatran nº 45/2024')
      m2.set('status', 'Ativo')
      app.save(m2)

      // Seed sample topic with ONSV guidance (Flow 6.10)
      const t1 = new Record(topics)
      t1.set('institution_id', ctran.id)
      t1.set(
        'title',
        'Revisão da Resolução sobre Equipamentos Obrigatórios para Ciclistas e E-bikes',
      )
      t1.set(
        'description',
        'Discussão referente às novas diretrizes de velocidade máxima e capacete obrigatório para ciclomotores em vias urbanas.',
      )
      t1.set('status', 'Orientado ONSV')
      t1.set('attention_flag', true)
      t1.set(
        'onsv_guidance',
        'O ONSV defende a padronização das regras nacionais alinhadas com as metas da Década de Ação para Segurança Viária (PNATRANS), priorizando os usuários vulneráveis e exigindo capacete certificado para veículos de micromobilidade acima de 25 km/h.',
      )
      t1.set('onsv_guidance_date', '2024-03-10')
      t1.set(
        'decisions_forwarded',
        'Representante ONSV manifestou voto favorável com ressalvas no parecer da Câmara Temática.',
      )
      app.save(t1)

      // Seed sample meeting
      const mt1 = new Record(meetings)
      mt1.set('institution_id', ctran.id)
      mt1.set('title', '128ª Reunião Ordinária da Câmara Temática de Esforço Legal')
      mt1.set('meeting_type', 'Ordinária')
      mt1.set('meeting_date', '2024-03-15')
      mt1.set('location_or_link', 'Brasília / Híbrido')
      mt1.set(
        'agenda',
        '1. Leitura da ata anterior; 2. Análise do parecer sobre micromobilidade elétrica; 3. Encaminhamentos.',
      )
      mt1.set(
        'minutes_summary',
        'Reunião transcorreu com debate intenso sobre velocidades máximas autorizadas. Representação do ONSV enfatizou dados técnicos sobre gravidade de sinistros.',
      )
      mt1.set('decisions', 'Aprovado encaminhamento de nota técnica consultiva ao plenário.')
      mt1.set('attendees_count', 18)
      app.save(mt1)
    } catch (e) {
      console.log('Error seeding representation records:', e)
    }
  },
  (app) => {
    const collections = [
      'representation_topics',
      'representation_meetings',
      'representation_documents',
      'representation_members',
      'representation_institutions',
    ]
    for (let i = 0; i < collections.length; i++) {
      try {
        const col = app.findCollectionByNameOrId(collections[i])
        app.delete(col)
      } catch (_) {}
    }
  },
)
