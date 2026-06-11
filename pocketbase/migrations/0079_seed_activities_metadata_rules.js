migrate(
  (app) => {
    const metadata = [
      // Eixo 1 - Titulação
      {
        title: 'Graduação (Reconhecida MEC)',
        axis: 'E1',
        category: 'Titulação Acadêmica',
        group_id: 'titulacao',
        points_type: 'fixed',
        points: 80,
        is_unique: true,
        max_occurrences: 1,
      },
      {
        title: 'Pós-graduação Lato Sensu',
        axis: 'E1',
        category: 'Titulação Acadêmica',
        group_id: 'titulacao',
        points_type: 'fixed',
        points: 100,
        is_unique: true,
        max_occurrences: 1,
      },
      {
        title: 'Mestrado',
        axis: 'E1',
        category: 'Titulação Acadêmica',
        group_id: 'titulacao',
        points_type: 'fixed',
        points: 150,
        is_unique: true,
        max_occurrences: 1,
      },
      {
        title: 'Doutorado',
        axis: 'E1',
        category: 'Titulação Acadêmica',
        group_id: 'titulacao',
        points_type: 'fixed',
        points: 200,
        is_unique: true,
        max_occurrences: 1,
      },
      {
        title: 'Pós-Doutorado (Estágio concluído)',
        axis: 'E1',
        category: 'Titulação Acadêmica',
        group_id: 'titulacao',
        points_type: 'fixed',
        points: 250,
        is_unique: true,
        max_occurrences: 1,
      },

      // Eixo 1 - Capacitação
      {
        title: 'Curso geral na área de trânsito/mobilidade (Mínimo 8h)',
        axis: 'E1',
        category: 'Capacitação Contínua',
        points_type: 'fixed',
        points: 30,
        max_occurrences: 5,
      },
      {
        title: 'Curso oficial promovido pelo ONSV',
        axis: 'E1',
        category: 'Capacitação Contínua',
        points_type: 'fixed',
        points: 50,
        max_occurrences: 5,
      },

      // Eixo 1 - Produção
      {
        title: 'Artigos publicados',
        axis: 'E1',
        category: 'Produção Acadêmica',
        points_type: 'fixed',
        points: 50,
        max_occurrences: 5,
      },
      {
        title: 'Estudos publicados',
        axis: 'E1',
        category: 'Produção Acadêmica',
        points_type: 'fixed',
        points: 50,
        max_occurrences: 5,
      },
      {
        title: 'Papers publicados em revistas/anais',
        axis: 'E1',
        category: 'Produção Acadêmica',
        points_type: 'fixed',
        points: 50,
        max_occurrences: 5,
      },

      // Eixo 2 - Atuação
      {
        title: 'Trabalhar com trânsito/mobilidade (Validação anual)',
        axis: 'E2',
        category: 'Atuação Profissional e Dados',
        points_type: 'fixed',
        points: 50,
      },
      {
        title: 'Trabalhar em estandes/feiras relacionadas (Até 5x)',
        axis: 'E2',
        category: 'Atuação Profissional e Dados',
        points_type: 'fixed',
        points: 50,
        max_occurrences: 5,
      },
      {
        title: 'Organização de banco de dados local de sinistros (Até 2x)',
        axis: 'E2',
        category: 'Atuação Profissional e Dados',
        points_type: 'fixed',
        points: 70,
        max_occurrences: 2,
      },
      {
        title: 'Aplicação de pesquisa com usuários de trânsito (Até 5x)',
        axis: 'E2',
        category: 'Atuação Profissional e Dados',
        points_type: 'fixed',
        points: 50,
        max_occurrences: 5,
      },

      // Eixo 2 - Inovação
      {
        title: 'Desenvolver projetos viários (traffic calming, ruas completas) (Até 5x)',
        axis: 'E2',
        category: 'Inovação e Projetos Viários',
        points_type: 'fixed',
        points: 50,
        max_occurrences: 5,
      },
      {
        title: 'Inovação técnica inédita e estruturada (Até 2x)',
        axis: 'E2',
        category: 'Inovação e Projetos Viários',
        points_type: 'fixed',
        points: 100,
        max_occurrences: 2,
      },
      {
        title: 'Inovação aplicada (implementada com impacto) (Única)',
        axis: 'E2',
        category: 'Inovação e Projetos Viários',
        points_type: 'fixed',
        points: 300,
        max_occurrences: 1,
      },

      // Eixo 2 - Projetos
      {
        title: 'Implementação de projeto escolar contínuo',
        axis: 'E2',
        category: 'Implementação de Projetos Estruturados',
        points_type: 'fixed',
        points: 70,
        max_occurrences: 3,
      },
      {
        title: 'Projeto Local (Municipal)',
        axis: 'E2',
        category: 'Implementação de Projetos Estruturados',
        points_type: 'fixed',
        points: 50,
        max_occurrences: 3,
      },
      {
        title: 'Projeto Estadual',
        axis: 'E2',
        category: 'Implementação de Projetos Estruturados',
        points_type: 'fixed',
        points: 100,
        max_occurrences: 3,
      },
      {
        title: 'Projeto Nacional',
        axis: 'E2',
        category: 'Implementação de Projetos Estruturados',
        points_type: 'fixed',
        points: 150,
        max_occurrences: 2,
      },
      {
        title: 'Projeto Internacional',
        axis: 'E2',
        category: 'Implementação de Projetos Estruturados',
        points_type: 'fixed',
        points: 200,
        max_occurrences: 2,
      },

      // Eixo 2 - Conteudo
      {
        title: 'Livro publicado com ISBN (Até 2x)',
        axis: 'E2',
        category: 'Produção de Conteúdo',
        points_type: 'fixed',
        points: 150,
        max_occurrences: 2,
      },
      {
        title: 'EBook publicado na Plataforma Digital (Até 2x)',
        axis: 'E2',
        category: 'Produção de Conteúdo',
        points_type: 'fixed',
        points: 150,
        max_occurrences: 2,
      },
      {
        title: 'Produção de material educativo (Até 3x)',
        axis: 'E2',
        category: 'Produção de Conteúdo',
        points_type: 'fixed',
        points: 100,
        max_occurrences: 3,
      },
      {
        title: 'Produção de vídeo técnico educativo (Até 3x)',
        axis: 'E2',
        category: 'Produção de Conteúdo',
        points_type: 'fixed',
        points: 100,
        max_occurrences: 3,
      },
      {
        title: 'Publicar gratuitamente materiais/artigos (Até 5x)',
        axis: 'E2',
        category: 'Produção de Conteúdo',
        points_type: 'fixed',
        points: 50,
        max_occurrences: 5,
      },

      // Eixo 2 - Ações
      {
        title: 'Criar e coordenar ações educativas (Até 3x)',
        axis: 'E2',
        category: 'Ações e Eventos Educativos',
        points_type: 'fixed',
        points: 100,
        max_occurrences: 3,
      },
      {
        title: 'Trabalhar como colaborador em ações educativas (Até 5x)',
        axis: 'E2',
        category: 'Ações e Eventos Educativos',
        points_type: 'fixed',
        points: 20,
        max_occurrences: 5,
      },
      {
        title: 'Ser instrutor/dar aulas de trânsito (Até 5x)',
        axis: 'E2',
        category: 'Ações e Eventos Educativos',
        points_type: 'fixed',
        points: 50,
        max_occurrences: 5,
      },
      {
        title: 'Ministrar palestras técnicas (Até 5x)',
        axis: 'E2',
        category: 'Ações e Eventos Educativos',
        points_type: 'fixed',
        points: 100,
        max_occurrences: 5,
      },
      {
        title: 'Participar de eventos/conferências ONSV (Até 3x)',
        axis: 'E2',
        category: 'Ações e Eventos Educativos',
        points_type: 'fixed',
        points: 100,
        max_occurrences: 3,
      },
      {
        title: 'Organizar eventos técnicos (Até 3x)',
        axis: 'E2',
        category: 'Ações e Eventos Educativos',
        points_type: 'fixed',
        points: 80,
        max_occurrences: 3,
      },

      // Eixo 2 - Midia
      {
        title: 'Administrar site ou canal ativo sobre Segurança Viária (Até 3x)',
        axis: 'E2',
        category: 'Mídia e Digital',
        points_type: 'fixed',
        points: 80,
        max_occurrences: 3,
      },
      {
        title: 'Compartilhamento: Mín. 15 reposts/mês no Instagram ONSV (Até 6 meses)',
        axis: 'E2',
        category: 'Mídia e Digital',
        points_type: 'fixed',
        points: 50,
        max_occurrences: 6,
      },
      {
        title: 'Entrevista TV/Impresso (Até 5x)',
        axis: 'E2',
        category: 'Mídia e Digital',
        points_type: 'fixed',
        points: 30,
        max_occurrences: 5,
      },
      {
        title: 'Entrevista Online/Rádio (Até 5x)',
        axis: 'E2',
        category: 'Mídia e Digital',
        points_type: 'fixed',
        points: 20,
        max_occurrences: 5,
      },

      // Eixo 2 - Participação Publica
      {
        title: 'Participação e contribuição em Audiência Pública',
        axis: 'E2',
        category: 'Participação Pública',
        points_type: 'fixed',
        points: 30,
        max_occurrences: 5,
      },
      {
        title: 'Participação e contribuição técnica em Consulta Pública',
        axis: 'E2',
        category: 'Participação Pública',
        points_type: 'fixed',
        points: 30,
        max_occurrences: 5,
      },
      {
        title: 'Proposição formal de melhoria viária protocolada (Até 3x)',
        axis: 'E2',
        category: 'Participação Pública',
        points_type: 'fixed',
        points: 70,
        max_occurrences: 3,
      },
      {
        title: 'Apresentar o Cadastro Positivo de Condutores (RNPC) (Até 5x)',
        axis: 'E2',
        category: 'Participação Pública',
        points_type: 'fixed',
        points: 70,
        max_occurrences: 5,
      },

      // Eixo 2 - Reconhecimento
      {
        title: 'Recebimento de prêmio nacional',
        axis: 'E2',
        category: 'Reconhecimento Institucional',
        points_type: 'fixed',
        points: 100,
      },
      {
        title: 'Recebimento de prêmio regional',
        axis: 'E2',
        category: 'Reconhecimento Institucional',
        points_type: 'fixed',
        points: 50,
      },
      {
        title: 'Recebimento de moção/homenagem pública',
        axis: 'E2',
        category: 'Reconhecimento Institucional',
        points_type: 'fixed',
        points: 100,
      },
      {
        title: 'Destaque anual do programa (Reconhecimento ONSV interno, 1x/ano)',
        axis: 'E2',
        category: 'Reconhecimento Institucional',
        points_type: 'fixed',
        points: 100,
      },

      // Eixo 2 - Engajamento
      {
        title: 'Atualização anual de cadastro técnico (Obrigatório, 1x/ano)',
        axis: 'E2',
        category: 'Engajamento Institucional',
        points_type: 'fixed',
        points: 30,
      },
      {
        title: 'Representação formal do ONSV em eventos técnicos (Até 5x)',
        axis: 'E2',
        category: 'Engajamento Institucional',
        points_type: 'fixed',
        points: 70,
        max_occurrences: 5,
      },
      {
        title: 'Atuar como voluntário formal em ONG de trânsito (Até 5x)',
        axis: 'E2',
        category: 'Engajamento Institucional',
        points_type: 'fixed',
        points: 50,
        max_occurrences: 5,
      },

      // Eixo 3
      {
        title: 'Mentoria: Atuação formal como mentor no programa (Validado pela coordenação)',
        axis: 'E3',
        category: 'Mentoria',
        points_type: 'fixed',
        points: 200,
        max_occurrences: 3,
      },
      {
        title: 'Representante de Comitês estratégicos',
        axis: 'E3',
        category: 'Comitês e Conselhos',
        points_type: 'fixed',
        points: 100,
      },
      {
        title: 'Representante da campanha Maio Amarelo',
        axis: 'E3',
        category: 'Comitês e Conselhos',
        points_type: 'fixed',
        points: 50,
      },
      {
        title: 'Representante de JARI (Junta Administrativa de Recursos de Infrações)',
        axis: 'E3',
        category: 'Comitês e Conselhos',
        points_type: 'fixed',
        points: 50,
      },
      {
        title: 'Representante de Câmaras Técnicas',
        axis: 'E3',
        category: 'Comitês e Conselhos',
        points_type: 'fixed',
        points: 50,
      },
      {
        title: 'Representante de Conselhos',
        axis: 'E3',
        category: 'Comitês e Conselhos',
        points_type: 'fixed',
        points: 50,
      },
    ]

    const col = app.findCollectionByNameOrId('activities_metadata')

    metadata.forEach((m) => {
      try {
        let record
        try {
          record = app.findFirstRecordByData('activities_metadata', 'title', m.title)
        } catch (err) {
          record = new Record(col)
          record.set('title', m.title)
        }
        record.set('axis', m.axis || '')
        record.set('category', m.category || '')
        record.set('group_id', m.group_id || '')
        record.set('points_type', m.points_type || 'fixed')
        record.set('points', m.points || 0)
        record.set('is_unique', m.is_unique || false)
        record.set('max_occurrences', m.max_occurrences || 0)
        app.save(record)
      } catch (e) {
        console.log('Error saving metadata', m.title, e.message)
      }
    })

    const all = app.findRecordsByFilter('activities_metadata', "points_type = ''", '', 1000, 0)
    for (let r of all) {
      r.set('points_type', 'fixed')
      app.save(r)
    }
  },
  (app) => {
    // Revert not strictly necessary for seed data
  },
)
