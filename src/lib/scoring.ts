export const ITEM_CAPS: Record<string, number> = {
  'Curso geral na área de trânsito/mobilidade (Mínimo 8h)': 5,
  'Curso oficial promovido pelo ONSV': 5,
  'Artigos publicados': 5,
  'Estudos publicados': 5,
  'Papers publicados em revistas/anais': 5,
  'Trabalhar com trânsito/mobilidade (Validação anual)': 1,
  'Trabalhar em estandes/feiras relacionadas (Até 5x)': 5,
  'Organização de banco de dados local de sinistros (Até 2x)': 2,
  'Aplicação de pesquisa com usuários de trânsito (Até 5x)': 5,
  'Desenvolver projetos viários (traffic calming, ruas completas) (Até 5x)': 5,
  'Inovação técnica inédita e estruturada (Até 2x)': 2,
  'Inovação aplicada (implementada com impacto) (Única)': 1,
  'Implementação de projeto escolar contínuo': 3,
  'Projeto Local (Municipal)': 3,
  'Projeto Estadual': 3,
  'Projeto Nacional': 2,
  'Projeto Internacional': 2,
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
  'Destaque anual do programa (Reconhecimento ONSV interno, 1x/ano)': 1,
  'Atualização anual de cadastro técnico (Obrigatório, 1x/ano)': 1,
  'Representação formal do ONSV em eventos técnicos (Até 5x)': 5,
  'Atuar como voluntário formal em ONG de trânsito (Até 5x)': 5,
  'Mentoria: Atuação formal como mentor no programa (Validado pela coordenação)': 3,
  'Representante de Comitês estratégicos': 1,
  'Representante da campanha Maio Amarelo': 1,
  'Representante de JARI (Junta Administrativa de Recursos de Infrações)': 1,
  'Representante de Câmaras Técnicas': 1,
  'Representante de Conselhos': 1,
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

export const ACADEMIC_DEGREES = new Set([
  'Graduação (Reconhecida MEC)',
  'Pós-graduação Lato Sensu',
  'Mestrado',
  'Doutorado',
  'Pós-Doutorado (Estágio concluído)',
  'Graduação',
  'Pós-graduação',
])

export const EIXO3_TITLES = new Set([
  'Mentoria: Atuação formal como mentor no programa (Validado pela coordenação)',
  'Representante de Comitês estratégicos',
  'Representante da campanha Maio Amarelo',
  'Representante de JARI (Junta Administrativa de Recursos de Infrações)',
  'Representante de Câmaras Técnicas',
  'Representante de Conselhos',
])

function getActivity(sub: any) {
  return sub?.expand?.activity_id ?? sub?.activity ?? null
}

function getScore(sub: any): number {
  if (typeof sub.score === 'number') return sub.score
  if (typeof sub.points === 'number') return sub.points
  const s = Number(sub.score)
  return Number.isFinite(s) && s > 0 ? s : 0
}

export function calculateUserPoints(submissions: any[], userLevel?: string) {
  let totalPoints = 0
  let eixo1Points = 0
  let eixo2Points = 0
  let eixo3Points = 0

  let maxAcademicScore = 0
  let maxAcademicId = ''

  submissions.forEach((sub) => {
    const act = getActivity(sub)
    const isAcademic =
      ACADEMIC_DEGREES.has(sub.title) ||
      (act &&
        (act.group_id === 'academic' ||
          act.title?.includes('Graduação') ||
          act.title?.includes('Mestrado') ||
          act.title?.includes('Doutorado')))

    if (sub.status === 'Aprovado' && isAcademic) {
      const score = getScore(sub)
      if (score > maxAcademicScore) {
        maxAcademicScore = score
        maxAcademicId = sub.id
      }
    }
  })

  const itemCounts: Record<string, number> = {}
  const ignoredSubmissionIds = new Set<string>()

  const sortedSubmissions = [...submissions].sort((a, b) => {
    return new Date(a.created).getTime() - new Date(b.created).getTime()
  })

  sortedSubmissions.forEach((sub) => {
    if (sub.status !== 'Aprovado') return
    let score = getScore(sub)
    const title = sub.title

    let act = getActivity(sub)

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

    const isAcademic =
      ACADEMIC_DEGREES.has(title) ||
      (act &&
        (act.group_id === 'academic' ||
          act.title?.includes('Graduação') ||
          act.title?.includes('Mestrado') ||
          act.title?.includes('Doutorado')))

    const isProducaoAcademica =
      title === 'Artigos publicados' ||
      title === 'Estudos publicados' ||
      title === 'Papers publicados em revistas/anais'

    if (isAcademic) {
      if (sub.id === maxAcademicId) {
        isCounted = true
      }
    } else if (isProducaoAcademica) {
      itemCounts['PRODUCAO_ACADEMICA'] = (itemCounts['PRODUCAO_ACADEMICA'] || 0) + 1
      if (itemCounts['PRODUCAO_ACADEMICA'] <= 5) {
        isCounted = true
      }
    } else {
      let maxOccurrences = act ? (act.is_unique ? 1 : act.max_occurrences || 0) : 0
      if (!act) {
        if (title.includes('Projeto Local') || title.includes('Projeto Estadual'))
          maxOccurrences = 3
        else if (title.includes('Projeto Nacional') || title.includes('Projeto Internacional'))
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
      const axis = act ? String(act.axis).trim() : null
      const isEixo1 = axis === 'Eixo 1' || axis === '1' || EIXO1_TITLES.has(title)
      const isEixo3 = axis === 'Eixo 3' || axis === '3' || EIXO3_TITLES.has(title)

      if (isEixo1) eixo1Points += score
      else if (isEixo3) eixo3Points += score
      else eixo2Points += score
    } else {
      ignoredSubmissionIds.add(sub.id)
    }
  })

  totalPoints = Math.round(totalPoints * 100) / 100
  eixo1Points = Math.round(eixo1Points * 100) / 100
  eixo2Points = Math.round(eixo2Points * 100) / 100
  eixo3Points = Math.round(eixo3Points * 100) / 100

  const rejectionReasons: Record<string, string> = {}

  ignoredSubmissionIds.forEach((id) => {
    const sub = submissions.find((s) => s.id === id)
    if (!sub) return
    const act = getActivity(sub)
    const isAcademic =
      ACADEMIC_DEGREES.has(sub.title) ||
      (act &&
        (act.group_id === 'academic' ||
          act.title?.includes('Graduação') ||
          act.title?.includes('Mestrado') ||
          act.title?.includes('Doutorado')))
    if (isAcademic) {
      rejectionReasons[id] =
        'Hierarquia de Titulação: Somente a maior titulação acadêmica é pontuada.'
    } else {
      rejectionReasons[id] =
        'Limite Atingido: O número máximo de ocorrências (CAP) para esta atividade já foi alcançado.'
    }
  })

  return {
    totalPoints,
    eixo1Points,
    eixo2Points,
    eixo3Points,
    ignoredSubmissionIds,
    rejectionReasons,
  }
}
