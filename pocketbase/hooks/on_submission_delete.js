onRecordAfterDeleteSuccess((e) => {
  if (e.record.getString('status') === 'Aprovado') {
    const userId = e.record.getString('user_id')
    if (!userId) return e.next()

    try {
      const user = $app.findRecordById('users', userId)

      const submissions = $app.findRecordsByFilter(
        'submissions',
        "user_id = {:userId} && status = 'Aprovado'",
        '',
        1000,
        0,
        { userId: userId },
      )

      const activities = $app.findRecordsByFilter('activities_metadata', '1=1', '', 1000, 0)
      const actMap = {}
      for (let i = 0; i < activities.length; i++) {
        actMap[activities[i].id] = activities[i]
      }

      const eixo1Titles = [
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

      const eixo3Titles = [
        'Mentoria: Atuação formal como mentor no programa (Validado pela coordenação)',
        'Representante de Comitês estratégicos',
        'Representante da campanha Maio Amarelo',
        'Representante de JARI (Junta Administrativa de Recursos de Infrações)',
        'Representante de Câmaras Técnicas',
        'Representante de Conselhos',
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

      let totalPoints = 0
      let maxTitulationScore = 0
      let axes = {}

      for (let i = 0; i < submissions.length; i++) {
        const sub = submissions[i]
        const type = sub.getString('type')
        if (type === 'titulation') {
          const score = sub.getFloat('score') || 0
          if (score > maxTitulationScore) {
            maxTitulationScore = score
          }
        }
      }

      totalPoints += maxTitulationScore

      submissions.sort((a, b) => a.getString('created').localeCompare(b.getString('created')))

      let itemCounts = {}

      for (let i = 0; i < submissions.length; i++) {
        const sub = submissions[i]
        const type = sub.getString('type')
        const title = sub.getString('title')
        const actId = sub.getString('activity_id')
        const act = actId ? actMap[actId] : null

        let score = sub.getFloat('score') || 0

        if (act && act.getString('points_type') === 'level_based') {
          const userLevel = user.getString('level') || ''
          if (
            userLevel.includes('Nível III') ||
            userLevel.includes('3') ||
            userLevel.includes('Mobilizador')
          ) {
            score = act.getFloat('points_level_3') || 0
          } else if (
            userLevel.includes('Nível II') ||
            userLevel.includes('2') ||
            userLevel.includes('Pleno')
          ) {
            score = act.getFloat('points_level_2') || 0
          } else {
            score = act.getFloat('points_level_1') || 0
          }
        } else if (act && act.getString('points_type') === 'fixed') {
          score = act.getFloat('points') || score
        }

        if (act) {
          const axis = act.getString('axis')
          if (axis) axes[axis] = true
        } else {
          if (eixo1Titles.indexOf(title) !== -1) axes['E1'] = true
          else if (eixo3Titles.indexOf(title) !== -1) axes['E3'] = true
          else axes['E2'] = true
        }

        if (type === 'titulation') continue

        let maxOcc = act ? act.getInt('max_occurrences') || 0 : 0
        if (!act) {
          if (title === 'Projeto Local (Municipal)' || title === 'Projeto Estadual') maxOcc = 3
          else if (title === 'Projeto Nacional' || title === 'Projeto Internacional') maxOcc = 2
          else maxOcc = ITEM_CAPS[title] || 999
        }

        const key = actId || title
        itemCounts[key] = (itemCounts[key] || 0) + 1

        if (maxOcc > 0) {
          if (itemCounts[key] <= maxOcc) {
            totalPoints += score
          }
        } else {
          totalPoints += score
        }
      }

      totalPoints = Math.round(totalPoints * 100) / 100
      let axesCount = Object.keys(axes).length

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

      let newLevel =
        turma <= 14
          ? 'Nível II - Observador Certificado Pleno'
          : 'Nível I - Observador Certificado (Iniciante)'

      if (isProbationary) {
        newLevel = 'Nível I - Observador Certificado (Iniciante)'
      } else {
        if (totalPoints >= 1000 && axesCount >= 3) {
          newLevel = 'Nível III - Mobilizador'
        } else if (totalPoints >= 500 && axesCount >= 2) {
          newLevel = 'Nível II - Observador Certificado Pleno'
        } else if (axesCount >= 1) {
          newLevel = 'Nível I - Observador Certificado (Iniciante)'
        }
      }

      const originalUserPoints = user.getFloat('points') || 0
      const originalUserLevel = user.getString('level')

      user.set('points', totalPoints)
      user.set('level', newLevel)

      $app.save(user)

      if (originalUserPoints !== totalPoints || originalUserLevel !== newLevel) {
        const logs = $app.findCollectionByNameOrId('activity_logs')
        const log = new Record(logs)
        log.set('entity_type', 'users')
        log.set('entity_id', user.id)
        log.set('action', 'Points/Level Recalculated (Submission Deleted)')

        let desc = []
        if (originalUserPoints !== totalPoints)
          desc.push(`Points: ${originalUserPoints} -> ${totalPoints}`)
        if (originalUserLevel !== newLevel) desc.push(`Level: ${originalUserLevel} -> ${newLevel}`)
        log.set('description', desc.join(' | '))

        $app.save(log)
      }
    } catch (err) {
      console.log('Error updating user points after deletion: ', err)
    }
  }
  e.next()
}, 'submissions')
