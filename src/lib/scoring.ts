export const ITEM_CAPS: Record<string, number> = {
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

export const EIXO1_TITLES = new Set([
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
])

export const EIXO3_TITLES = new Set([
  'Mentoria: Atuação formal como mentor no programa (Validado pela coordenação)',
  'Representante de Comitês estratégicos',
  'Representante da campanha Maio Amarelo',
  'Representante de JARI (Junta Administrativa de Recursos de Infrações)',
  'Representante de Câmaras Técnicas',
  'Representante de Conselhos',
])

export function calculateUserPoints(submissions: any[], userLevel?: string) {
  let totalPoints = 0
  let eixo1Points = 0
  let eixo2Points = 0
  let eixo3Points = 0

  let maxTitulationScore = 0
  let maxTitulationId = ''

  submissions.forEach((sub) => {
    const isTitulation =
      sub.type === 'titulation' || sub.expand?.activity_id?.category === 'Titulação'
    if (sub.status === 'Aprovado' && isTitulation) {
      const score = typeof sub.score === 'number' ? sub.score : Number(sub.score) || 0
      if (score > maxTitulationScore) {
        maxTitulationScore = score
        maxTitulationId = sub.id
      }
    }
  })

  const itemCounts: Record<string, number> = {}
  const ignoredSubmissionIds = new Set<string>()

  // Sort submissions by created ascending to apply caps on the newest items
  const sortedSubmissions = [...submissions].sort((a, b) => {
    return new Date(a.created).getTime() - new Date(b.created).getTime()
  })

  sortedSubmissions.forEach((sub) => {
    if (sub.status !== 'Aprovado') return
    let score = typeof sub.score === 'number' ? sub.score : Number(sub.score) || 0
    const title = sub.title

    let act = sub.expand?.activity_id

    if (act?.points_type === 'level_based' && userLevel) {
      if (
        userLevel.includes('Nível III') ||
        userLevel.includes('3') ||
        userLevel.includes('Mobilizador')
      ) {
        score = act.points_level_3 || 0
      } else if (
        userLevel.includes('Nível II') ||
        userLevel.includes('2') ||
        userLevel.includes('Pleno')
      ) {
        score = act.points_level_2 || 0
      } else {
        score = act.points_level_1 || 0
      }
    } else if (act?.points_type === 'fixed') {
      score = act.points || score
    }

    let isCounted = false

    const isTitulation = sub.type === 'titulation' || act?.category === 'Titulação'
    if (isTitulation) {
      if (sub.id === maxTitulationId) {
        isCounted = true
      }
    } else {
      let maxOccurrences = act ? (act.is_unique ? 1 : act.max_occurrences || 0) : 0
      if (!act) {
        if (title === 'Projeto Local (Municipal)' || title === 'Projeto Estadual')
          maxOccurrences = 3
        else if (title === 'Projeto Nacional' || title === 'Projeto Internacional')
          maxOccurrences = 2
        else maxOccurrences = ITEM_CAPS[title] || 999
      }

      const key = act ? act.id : title
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
      totalPoints += score
      const axis = act ? act.axis : null
      if (axis === 'Eixo 1' || EIXO1_TITLES.has(title)) eixo1Points += score
      else if (axis === 'Eixo 3' || EIXO3_TITLES.has(title)) eixo3Points += score
      else eixo2Points += score
    } else {
      ignoredSubmissionIds.add(sub.id)
    }
  })

  // Avoid floating point precision issues
  totalPoints = Math.round(totalPoints * 100) / 100

  return {
    totalPoints,
    eixo1Points,
    eixo2Points,
    eixo3Points,
    ignoredSubmissionIds,
  }
}
