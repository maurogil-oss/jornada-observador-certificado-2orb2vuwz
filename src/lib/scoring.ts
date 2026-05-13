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

export function calculateUserPoints(submissions: any[]) {
  let totalPoints = 0
  let eixo1Points = 0
  let eixo2Points = 0
  let eixo3Points = 0

  let maxTitulationScore = 0
  let maxTitulationId = ''

  submissions.forEach((sub) => {
    if (sub.status === 'Aprovado' && sub.type === 'titulation') {
      const score = typeof sub.score === 'number' ? sub.score : Number(sub.score) || 0
      if (score > maxTitulationScore) {
        maxTitulationScore = score
        maxTitulationId = sub.id
      }
    }
  })

  let projectLocalCount = 0
  let projectNacCount = 0
  const itemCounts: Record<string, number> = {}
  const ignoredSubmissionIds = new Set<string>()

  submissions.forEach((sub) => {
    if (sub.status !== 'Aprovado') return
    const score = typeof sub.score === 'number' ? sub.score : Number(sub.score) || 0
    const title = sub.title

    let isCounted = false

    if (sub.type === 'titulation') {
      if (sub.id === maxTitulationId) {
        isCounted = true
      }
    } else if (title === 'Projeto Local (Municipal)' || title === 'Projeto Estadual') {
      if (projectLocalCount < 3) {
        isCounted = true
        projectLocalCount++
      }
    } else if (title === 'Projeto Nacional' || title === 'Projeto Internacional') {
      if (projectNacCount < 2) {
        isCounted = true
        projectNacCount++
      }
    } else if (ITEM_CAPS[title]) {
      itemCounts[title] = (itemCounts[title] || 0) + 1
      if (itemCounts[title] <= ITEM_CAPS[title]) {
        isCounted = true
      }
    } else {
      isCounted = true
    }

    if (isCounted) {
      totalPoints += score
      if (EIXO1_TITLES.has(title)) eixo1Points += score
      else if (EIXO3_TITLES.has(title)) eixo3Points += score
      else eixo2Points += score
    } else {
      ignoredSubmissionIds.add(sub.id)
    }
  })

  return {
    totalPoints,
    eixo1Points,
    eixo2Points,
    eixo3Points,
    ignoredSubmissionIds,
  }
}
