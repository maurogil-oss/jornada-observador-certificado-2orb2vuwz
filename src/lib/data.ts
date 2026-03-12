import { BookOpen, Activity, Users, Star, Award, Flag, Sprout, Eye } from 'lucide-react'

export const principles = [
  { title: 'Meritocracia', desc: 'Impacto real e comprovado.', icon: Star },
  { title: 'Valorização', desc: 'Foco na produção técnica.', icon: Award },
  { title: 'Liderança', desc: 'Atuação institucional.', icon: Flag },
  { title: 'Maturidade', desc: 'Progressão estruturada.', icon: Sprout },
  { title: 'Transparência', desc: 'Rastreabilidade total.', icon: Eye },
]

export const axesData = [
  {
    id: 'I',
    title: 'Formação e Produção',
    purpose: 'Construir autoridade técnica.',
    progress: 75,
    icon: BookOpen,
    items: [
      {
        title: 'Titulação Acadêmica',
        points: 200,
        desc: 'Comprovação de mestrado ou doutorado na área viária ou correlata.',
      },
      {
        title: 'Cursos Complementares',
        points: 50,
        desc: 'Certificados de cursos extracurriculares de especialização técnica.',
      },
      {
        title: 'Produção Técnica Publicada',
        points: 100,
        desc: 'Artigos, papers ou livros publicados e validados por pares.',
      },
    ],
  },
  {
    id: 'II',
    title: 'Atuação e Impacto',
    purpose: 'Gerar transformação prática.',
    progress: 40,
    icon: Activity,
    items: [
      {
        title: 'Intervenções Técnicas',
        points: 150,
        desc: 'Projetos aplicados com impacto comprovado na redução de sinistros.',
      },
      {
        title: 'Produção Educativa',
        points: 80,
        desc: 'Desenvolvimento de materiais didáticos e metodologias para o trânsito.',
      },
      {
        title: 'Mobilização Social',
        points: 120,
        desc: 'Organização de eventos comunitários ou campanhas de conscientização locais.',
      },
    ],
  },
  {
    id: 'III',
    title: 'Liderança Institucional',
    purpose: 'Consolidar influência e representação.',
    progress: 15,
    icon: Users,
    items: [
      {
        title: 'Representante Institucional',
        points: 300,
        desc: 'Atuação formal como porta-voz oficial do ONSV em eventos e fóruns.',
      },
      {
        title: 'Mentoria',
        points: 150,
        desc: 'Orientação ativa de novos observadores na jornada de certificação.',
      },
      {
        title: 'Instâncias Estratégicas',
        points: 200,
        desc: 'Participação ativa em comitês técnicos ou conselhos de decisão.',
      },
    ],
  },
]

export const recentActivity = [
  {
    id: 1,
    action: 'Artigo "Segurança Viária" aprovado',
    points: '+100',
    time: 'Há 2 horas',
    type: 'success',
  },
  {
    id: 2,
    action: 'Certificado de Curso ABNT em Análise',
    points: 'Pendente',
    time: 'Ontem',
    type: 'pending',
  },
  {
    id: 3,
    action: 'Mentoria nível I concluída',
    points: '+150',
    time: 'Há 3 dias',
    type: 'success',
  },
]

export const rankingData = [
  {
    rank: 1,
    name: 'Carlos Silva',
    level: 'Mestre',
    points: 4500,
    avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=male&seed=1',
  },
  {
    rank: 2,
    name: 'Ana Souza',
    level: 'Mestre',
    points: 4320,
    avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=female&seed=2',
  },
  {
    rank: 3,
    name: 'Roberto Almeida',
    level: 'Líder',
    points: 3900,
    avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=male&seed=3',
  },
  {
    rank: 4,
    name: 'Mariana Costa',
    level: 'Líder',
    points: 3750,
    avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=female&seed=4',
  },
  {
    rank: 5,
    name: 'Fernando Lima',
    level: 'Estrategista',
    points: 2800,
    avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=male&seed=5',
  },
  {
    rank: 6,
    name: 'Camila Barros',
    level: 'Estrategista',
    points: 2650,
    avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=female&seed=6',
  },
  {
    rank: 7,
    name: 'José Mendes',
    level: 'Engajado',
    points: 1900,
    avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=male&seed=7',
  },
]

export const submissionsData = [
  {
    id: 'SUB-001',
    date: '12/03/2026',
    title: 'Certificado Curso ABNT',
    axis: 'Eixo I',
    status: 'Aprovado',
    points: 50,
  },
  {
    id: 'SUB-002',
    date: '10/03/2026',
    title: 'Relatório de Palestra na Escola',
    axis: 'Eixo II',
    status: 'Em Análise',
    points: '-',
  },
  {
    id: 'SUB-003',
    date: '05/03/2026',
    title: 'Artigo Revista Trânsito Seguro',
    axis: 'Eixo I',
    status: 'Aprovado',
    points: 100,
  },
  {
    id: 'SUB-004',
    date: '01/03/2026',
    title: 'Participação Conselho Municipal',
    axis: 'Eixo III',
    status: 'Ajuste Necessário',
    points: '-',
  },
]
