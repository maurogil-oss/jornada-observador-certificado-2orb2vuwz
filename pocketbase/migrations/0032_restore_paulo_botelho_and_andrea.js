migrate(
  (app) => {
    const validTitles = [
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
      'Trabalhar com trânsito/mobilidade (Validação anual)',
      'Trabalhar em estandes/feiras relacionadas (Até 5x)',
      'Organização de banco de dados local de sinistros (Até 2x)',
      'Aplicação de pesquisa com usuários de trânsito (Até 5x)',
      'Desenvolver projetos viários (traffic calming, ruas completas) (Até 5x)',
      'Inovação técnica inédita e estruturada (Até 2x)',
      'Inovação aplicada (implementada com impacto) (Única)',
      'Implementação de projeto escolar contínuo',
      'Projeto Local (Municipal)',
      'Projeto Estadual',
      'Projeto Nacional',
      'Projeto Internacional',
      'Livro publicado com ISBN (Até 2x)',
      'EBook publicado na Plataforma Digital (Até 2x)',
      'Produção de material educativo (Até 3x)',
      'Produção de vídeo técnico educativo (Até 3x)',
      'Publicar gratuitamente materiais/artigos (Até 5x)',
      'Criar e coordenar ações educativas (Até 3x)',
      'Trabalhar como colaborador em ações educativas (Até 5x)',
      'Ser instrutor/dar aulas de trânsito (Até 5x)',
      'Ministrar palestras técnicas (Até 5x)',
      'Participar de eventos/conferências ONSV (Até 3x)',
      'Organizar eventos técnicos (Até 3x)',
      'Administrar site ou canal ativo sobre Segurança Viária (Até 3x)',
      'Compartilhamento: Mín. 15 reposts/mês no Instagram ONSV (Até 6 meses)',
      'Entrevista TV/Impresso (Até 5x)',
      'Entrevista Online/Rádio (Até 5x)',
      'Participação e contribuição em Audiência Pública',
      'Participação e contribuição técnica em Consulta Pública',
      'Proposição formal de melhoria viária protocolada (Até 3x)',
      'Apresentar o Cadastro Positivo de Condutores (RNPC) (Até 5x)',
      'Recebimento de prêmio nacional',
      'Recebimento de prêmio regional',
      'Recebimento de moção/homenagem pública',
      'Destaque anual do programa (Reconhecimento ONSV interno, 1x/ano)',
      'Atualização anual de cadastro técnico (Obrigatório, 1x/ano)',
      'Representação formal do ONSV em eventos técnicos (Até 5x)',
      'Atuar como voluntário formal em ONG de trânsito (Até 5x)',
      'Mentoria: Atuação formal como mentor no programa (Validado pela coordenação)',
      'Representante de Comitês estratégicos',
      'Representante da campanha Maio Amarelo',
      'Representante de JARI (Junta Administrativa de Recursos de Infrações)',
      'Representante de Câmaras Técnicas',
      'Representante de Conselhos',
    ]

    // 1. Restore Paulo Botelho's submissions
    try {
      const paulos = app.findRecordsByFilter(
        'users',
        "name ~ 'Paulo' || full_name ~ 'Paulo'",
        '',
        100,
        0,
      )
      for (let p = 0; p < paulos.length; p++) {
        const paulo = paulos[p]
        const n = paulo.getString('name').toLowerCase()
        const fn = paulo.getString('full_name').toLowerCase()

        if (n.includes('botelho') || fn.includes('botelho')) {
          const submissions = app.findRecordsByFilter(
            'submissions',
            'user_id = {:userId}',
            '',
            1000,
            0,
            { userId: paulo.id },
          )

          for (let i = 0; i < submissions.length; i++) {
            const sub = submissions[i]
            const currentTitle = sub.getString('title')

            if (!validTitles.includes(currentTitle)) {
              let bestMatch = ''
              let maxOverlap = 0
              const currentWords = currentTitle.toLowerCase().split(' ')

              for (const vt of validTitles) {
                const vtWords = vt.toLowerCase().split(' ')
                const overlap = currentWords.filter(
                  (w) => w.length > 2 && vtWords.some((vw) => vw.includes(w) || w.includes(vw)),
                ).length

                if (overlap > maxOverlap) {
                  maxOverlap = overlap
                  bestMatch = vt
                }
              }

              if (bestMatch) {
                sub.set('title', bestMatch)
                app.saveNoValidate(sub)
              }
            }
          }
        }
      }
    } catch (e) {
      console.log('Error restoring Paulo Botelho:', e)
    }

    // 2. Correct Andrea's points
    try {
      const andreas = app.findRecordsByFilter(
        'users',
        "name ~ 'Andrea' || full_name ~ 'Andrea'",
        '',
        100,
        0,
      )
      for (let a = 0; a < andreas.length; a++) {
        const andrea = andreas[a]

        const submissions = app.findRecordsByFilter(
          'submissions',
          "user_id = {:userId} && status = 'Aprovado'",
          '',
          1000,
          0,
          { userId: andrea.id },
        )

        let titulationMax = 0
        let competencySum = 0

        for (let i = 0; i < submissions.length; i++) {
          const sub = submissions[i]
          const type = sub.getString('type')
          const score = sub.getFloat('score') || 0

          if (type === 'titulation') {
            if (score > titulationMax) titulationMax = score
          } else {
            competencySum += score
          }
        }

        if (titulationMax > 250) titulationMax = 250
        const totalPoints = titulationMax + competencySum

        andrea.set('points', totalPoints)

        const turma = andrea.getInt('turma') || 15
        let baseLevel =
          turma <= 14
            ? 'Nível II - Observador Certificado Pleno'
            : 'Nível I - Observador Certificado (Iniciante)'
        let newLevel = andrea.getString('level') || baseLevel

        if (totalPoints >= 500) {
          newLevel = 'Nível III - Mobilizador'
        } else {
          if (totalPoints < 500 && andrea.getString('level') === 'Nível III - Mobilizador') {
            newLevel = baseLevel
          } else if (totalPoints < 500) {
            newLevel = andrea.getString('level') || baseLevel
          }
        }

        andrea.set('level', newLevel)
        app.saveNoValidate(andrea)
      }
    } catch (e) {
      console.log('Error correcting Andrea:', e)
    }
  },
  (app) => {
    // Revert not applicable for this data correction migration
  },
)
