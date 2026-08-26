import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Building2,
  Users,
  Calendar,
  FileText,
  MessageSquare,
  ShieldCheck,
  AlertCircle,
  Clock,
  Plus,
  ArrowRight,
  Info,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Filter,
  Layers,
  Sparkles,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  getRepresentationInstitutions,
  RepresentationInstitution,
  RepresentationTopic,
} from '@/services/representations'
import { Skeleton } from '@/components/ui/skeleton'

export default function RepresentationsPage() {
  const [institutions, setInstitutions] = useState<RepresentationInstitution[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const navigate = useNavigate()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    const data = await getRepresentationInstitutions()
    setInstitutions(data)
    setLoading(false)
  }

  const filteredInstitutions = institutions.filter((inst) => {
    if (activeCategory === 'all') return true
    return inst.category.toLowerCase() === activeCategory.toLowerCase()
  })

  const federalCount = institutions.filter((i) => i.category === 'Federal').length
  const estadualCount = institutions.filter((i) => i.category === 'Estadual').length
  const municipalCount = institutions.filter((i) => i.category === 'Municipal').length

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-8 max-w-7xl animate-fade-in">
      {/* HEADER DA SEÇÃO */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b pb-6">
        <div>
          <div className="flex items-center gap-2 text-primary font-semibold text-sm uppercase tracking-wider mb-1">
            <ShieldCheck className="w-5 h-5 text-primary" />
            <span>Memória, Organização e Comunicação Institucional</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Representações ONSV
          </h1>
          <p className="text-muted-foreground mt-1 max-w-3xl">
            Acompanhamento das atividades e atuações dos Observadores do ONSV nos órgãos colegiados
            e comitês técnicos do Sistema Nacional de Trânsito.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Badge
            variant="outline"
            className="px-3 py-1.5 text-sm gap-1.5 bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-300"
          >
            <Building2 className="w-4 h-4" />
            <span>{institutions.length} Colegiados Mapeados</span>
          </Badge>
        </div>
      </div>

      {/* QUADRO DE PRINCÍPIO DA FERRAMENTA (Orientação 6.10) */}
      <Card className="border-l-4 border-l-primary bg-muted/20 shadow-sm">
        <CardContent className="p-4 md:p-6">
          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-primary/10 text-primary rounded-lg hidden sm:block shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="space-y-3">
              <h3 className="font-bold text-foreground text-base sm:text-lg flex items-center gap-2">
                <span>6.10. Princípio da Ferramenta</span>
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Esta área não é um mero sistema burocrático de prestação de contas, mas sim um{' '}
                <strong className="text-foreground font-semibold">
                  espaço de organização, memória e comunicação da representação do ONSV
                </strong>
                .
              </p>

              {/* Fluxo visual 6.10 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 pt-2 text-xs">
                <div className="bg-background p-2.5 rounded border text-center font-medium shadow-xs">
                  <span className="block text-primary font-bold mb-1">1. Participação</span>
                  Representante participa do colegiado
                </div>
                <div className="bg-background p-2.5 rounded border text-center font-medium shadow-xs">
                  <span className="block text-primary font-bold mb-1">2. Registro</span>
                  Registra o que é relevante
                </div>
                <div className="bg-background p-2.5 rounded border text-center font-medium shadow-xs">
                  <span className="block text-primary font-bold mb-1">3. Documentos</span>
                  Disponibiliza documentos e atas
                </div>
                <div className="bg-background p-2.5 rounded border text-center font-medium shadow-xs">
                  <span className="block text-amber-600 font-bold mb-1">4. Sinalização</span>
                  Sinaliza atenção ao ONSV
                </div>
                <div className="bg-background p-2.5 rounded border text-center font-medium shadow-xs">
                  <span className="block text-emerald-600 font-bold mb-1">5. Memória</span>
                  ONSV orienta & histórico fica registrado
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 6.9 ESTRUTURA VISUAL SUGERIDA - LISTA SIMPLES DE REPRESENTAÇÕES */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Layers className="w-5 h-5 text-primary" />
              <span>Colegiados e Instâncias de Representação</span>
            </h2>
            <p className="text-xs text-muted-foreground">
              Visualização conforme diretriz visual 6.9 com atalhos diretos para Representantes,
              Vigência, Documentos e Reuniões.
            </p>
          </div>

          {/* FILTRO DE CATEGORIA */}
          <div className="flex items-center gap-1.5 bg-muted p-1 rounded-lg text-sm w-full sm:w-auto overflow-x-auto">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-3 py-1.5 rounded-md transition-all text-xs font-semibold whitespace-nowrap ${
                activeCategory === 'all'
                  ? 'bg-background text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Todas ({institutions.length})
            </button>
            <button
              onClick={() => setActiveCategory('federal')}
              className={`px-3 py-1.5 rounded-md transition-all text-xs font-semibold whitespace-nowrap ${
                activeCategory === 'federal'
                  ? 'bg-background text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Federal ({federalCount})
            </button>
            <button
              onClick={() => setActiveCategory('estadual')}
              className={`px-3 py-1.5 rounded-md transition-all text-xs font-semibold whitespace-nowrap ${
                activeCategory === 'estadual'
                  ? 'bg-background text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Estadual ({estadualCount})
            </button>
            <button
              onClick={() => setActiveCategory('municipal')}
              className={`px-3 py-1.5 rounded-md transition-all text-xs font-semibold whitespace-nowrap ${
                activeCategory === 'municipal'
                  ? 'bg-background text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Municipal ({municipalCount})
            </button>
          </div>
        </div>

        {/* LISTAGEM PRINCIPAL SEGUINDO 6.9 */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : filteredInstitutions.length === 0 ? (
          <Card className="text-center p-8">
            <CardContent className="space-y-3 pt-6">
              <Building2 className="w-12 h-12 text-muted-foreground mx-auto" />
              <p className="text-muted-foreground font-medium">
                Nenhuma representação encontrada nesta categoria.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredInstitutions.map((inst) => {
              const membersCount =
                inst.expand?.representation_members_via_institution_id?.length || 0
              const docsCount =
                inst.expand?.representation_documents_via_institution_id?.length || 0
              const meetingsCount =
                inst.expand?.representation_meetings_via_institution_id?.length || 0
              const topicsCount = inst.expand?.representation_topics_via_institution_id?.length || 0

              // Format dates for vigência
              const termStart = inst.term_start
                ? new Date(inst.term_start).toLocaleDateString('pt-BR')
                : 'N/I'
              const termEnd = inst.term_end
                ? new Date(inst.term_end).toLocaleDateString('pt-BR')
                : 'Indeterminado'

              return (
                <Card
                  key={inst.id}
                  className="hover:border-primary/50 transition-all shadow-xs group bg-card"
                >
                  <CardContent className="p-5">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* LADO ESQUERDO: NOME DO COLEGIADO E ATALHOS DA 6.9 */}
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-lg font-black tracking-tight text-foreground group-hover:text-primary transition-colors">
                            [ {inst.acronym} ]
                          </span>
                          <span className="text-sm font-semibold text-muted-foreground">
                            – {inst.name}
                          </span>

                          <Badge
                            variant={
                              inst.category === 'Federal'
                                ? 'default'
                                : inst.category === 'Estadual'
                                  ? 'secondary'
                                  : 'outline'
                            }
                            className="ml-auto lg:ml-2 text-xs font-semibold"
                          >
                            {inst.category} {inst.state ? `(${inst.state})` : ''}
                          </Badge>
                        </div>

                        {inst.scope && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <Info className="w-3.5 h-3.5 text-primary shrink-0" />
                            <span>
                              Escopo/Atuação: <strong>{inst.scope}</strong>
                            </span>
                          </p>
                        )}

                        {/* ATALHOS RÁPIDOS NO ESTILO 6.9 (Representantes | Vigência | Documentos | Reuniões) */}
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs font-semibold text-muted-foreground pt-1 border-t border-border/40">
                          <button
                            onClick={() =>
                              navigate(`/representacoes/${inst.id}?tab=representantes`)
                            }
                            className="hover:text-primary transition-colors flex items-center gap-1 hover:underline"
                          >
                            <Users className="w-3.5 h-3.5 text-primary" />
                            <span>Representantes ({membersCount})</span>
                          </button>
                          <span>|</span>
                          <button
                            onClick={() => navigate(`/representacoes/${inst.id}?tab=identificacao`)}
                            className="hover:text-primary transition-colors flex items-center gap-1 hover:underline"
                          >
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            <span>
                              Vigência: {termStart} até {termEnd}
                            </span>
                          </button>
                          <span>|</span>
                          <button
                            onClick={() => navigate(`/representacoes/${inst.id}?tab=documentos`)}
                            className="hover:text-primary transition-colors flex items-center gap-1 hover:underline"
                          >
                            <FileText className="w-3.5 h-3.5 text-blue-600" />
                            <span>Documentos ({docsCount})</span>
                          </button>
                          <span>|</span>
                          <button
                            onClick={() => navigate(`/representacoes/${inst.id}?tab=reunioes`)}
                            className="hover:text-primary transition-colors flex items-center gap-1 hover:underline"
                          >
                            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Reuniões ({meetingsCount})</span>
                          </button>
                          {topicsCount > 0 && (
                            <>
                              <span>|</span>
                              <button
                                onClick={() =>
                                  navigate(`/representacoes/${inst.id}?tab=discussoes`)
                                }
                                className="hover:text-primary transition-colors flex items-center gap-1 hover:underline"
                              >
                                <MessageSquare className="w-3.5 h-3.5 text-purple-600" />
                                <span>Discussões ({topicsCount})</span>
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* LADO DIREITO: BOTAO ENTRAR NA REPRESENTACAO */}
                      <div className="flex items-center justify-end shrink-0 pt-2 lg:pt-0">
                        <Button
                          onClick={() => navigate(`/representacoes/${inst.id}`)}
                          className="gap-2 font-semibold shadow-xs"
                          size="sm"
                        >
                          <span>Acessar Detalhes</span>
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
