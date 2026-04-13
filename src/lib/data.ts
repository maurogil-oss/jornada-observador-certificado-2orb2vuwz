import { BookOpen, Activity, Users, Award, Flag, Sprout, Eye } from 'lucide-react'

export const principles = [
  { title: 'Meritocracia', desc: 'Impacto real e comprovado.', icon: Award },
  { title: 'Valorização', desc: 'Foco na produção técnica.', icon: Award },
  { title: 'Liderança', desc: 'Atuação institucional.', icon: Flag },
  { title: 'Maturidade', desc: 'Progressão estruturada.', icon: Sprout },
  { title: 'Transparência', desc: 'Rastreabilidade total.', icon: Eye },
]

export const niveisData = [
  {
    id: 'I',
    title: 'Nível I - Observador Certificado',
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
    title: 'Nível II - Observador Certificado Pleno',
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
    title: 'Nível III - Observador Certificado Mobilizador',
    purpose: 'Ocupação de espaços estratégicos e formação de novas lideranças.',
    progress: 15,
    icon: Users,
    items: [
      {
        title: 'Mentoria e Repasse',
        points: 200,
        desc: 'Atuação formal como mentor no programa. (Até 3x)',
      },
      {
        title: 'Representação em Comitês',
        points: 100,
        desc: 'Participação estratégica em comitês.',
      },
      {
        title: 'Campanhas (Maio Amarelo, JARI)',
        points: 50,
        desc: 'Atuação ativa em conselhos e câmaras técnicas.',
      },
    ],
  },
]
