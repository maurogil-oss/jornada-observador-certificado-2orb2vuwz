import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { submissionsData } from '@/lib/data'
import { CheckCircle2, Clock, AlertCircle, FileSearch, Upload, BookOpen } from 'lucide-react'
import { SubmitEvidenceDialog } from '@/components/submissions/SubmitEvidenceDialog'

const eixo1Sections = [
  {
    title: 'Titulação Acadêmica',
    desc: '(Envio de Diploma, Pontuação Única):',
    items: [
      { points: 80, text: 'Graduação (Reconhecida MEC)' },
      { points: 100, text: 'Pós-graduação Lato Sensu' },
      { points: 150, text: 'Mestrado' },
      { points: 200, text: 'Doutorado' },
      { points: 250, text: 'Pós-Doutorado (Estágio concluído)' },
    ],
  },
  {
    title: 'Capacitação Contínua',
    desc: '(Até 5x cada):',
    items: [
      { points: 30, text: 'Curso geral na área de trânsito/mobilidade (Mínimo 8h)' },
      { points: 50, text: 'Curso oficial promovido pelo ONSV' },
    ],
  },
  {
    title: 'Produção Acadêmica',
    desc: '(Até 5x, Análise Técnica):',
    items: [
      { points: 50, text: 'Artigos publicados' },
      { points: 50, text: 'Estudos publicados' },
      { points: 50, text: 'Papers publicados em revistas/anais' },
    ],
  },
]

export default function Submissions() {
  const [selectedItem, setSelectedItem] = useState<{
    title: string
    points: number
    axis: string
  } | null>(null)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Aprovado':
        return (
          <Badge className="bg-primary hover:bg-primary/90 font-medium px-2.5 py-0.5">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Aprovado
          </Badge>
        )
      case 'Em Análise':
        return (
          <Badge
            variant="secondary"
            className="bg-yellow-500/15 text-yellow-700 hover:bg-yellow-500/25 font-medium px-2.5 py-0.5"
          >
            <Clock className="w-3.5 h-3.5 mr-1.5" /> Em Análise
          </Badge>
        )
      case 'Ajuste Necessário':
        return (
          <Badge variant="destructive" className="font-medium px-2.5 py-0.5">
            <AlertCircle className="w-3.5 h-3.5 mr-1.5" /> Ajuste Necessário
          </Badge>
        )
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cofre de Evidências</h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Acompanhe o status das suas submissões garantindo a rastreabilidade.
          </p>
        </div>
        <div className="p-3 bg-primary/10 text-primary rounded-xl flex items-center gap-3 shadow-sm border border-primary/20">
          <FileSearch className="w-6 h-6" />
          <div className="flex flex-col">
            <span className="text-xs font-semibold uppercase tracking-wider">Transparência</span>
            <span className="text-sm font-bold">100% Auditável</span>
          </div>
        </div>
      </div>

      <Tabs defaultValue="playbook" className="w-full">
        <TabsList className="mb-6 grid w-full grid-cols-2 max-w-md bg-muted/60 p-1.5 rounded-lg h-auto">
          <TabsTrigger
            value="playbook"
            className="text-sm py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md rounded-md transition-all"
          >
            Playbook Eixo I
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className="text-sm py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md rounded-md transition-all"
          >
            Histórico
          </TabsTrigger>
        </TabsList>

        <TabsContent value="playbook" className="space-y-6 animate-slide-up outline-none">
          <div className="bg-emerald-50 text-emerald-950 dark:bg-emerald-950/20 dark:text-emerald-50 p-6 md:p-8 rounded-xl flex flex-col md:flex-row items-start md:items-center gap-6 shadow-elevation border border-emerald-200 dark:border-emerald-900/50">
            <div className="p-4 bg-emerald-100 dark:bg-emerald-900/50 rounded-2xl shrink-0">
              <BookOpen className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight">
                Playbook Eixo I: Formação e Conhecimento
              </h2>
              <p className="opacity-90 mt-2 text-lg">
                Construa sua base e autoridade técnica. Atividades estruturais (Titulação) não são
                cumulativas.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {eixo1Sections.map((section, sIdx) => (
              <Card key={sIdx} className="overflow-hidden border-border/60 shadow-subtle">
                <CardHeader className="bg-muted/30 border-b border-border/50 py-4">
                  <CardTitle className="text-lg flex flex-wrap items-baseline gap-2">
                    <span>{section.title}</span>
                    <span className="text-muted-foreground font-normal text-sm md:text-base">
                      {section.desc}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-border/50">
                    {section.items.map((item, iIdx) => (
                      <div
                        key={iIdx}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-4 hover:bg-muted/20 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white font-mono px-2 py-0.5 rounded shadow-sm whitespace-nowrap">
                            [{item.points} pts]
                          </Badge>
                          <span className="font-medium text-sm md:text-base">{item.text}</span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="shrink-0 sm:w-auto w-full border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 dark:border-emerald-800 dark:hover:bg-emerald-950 dark:hover:text-emerald-300"
                          onClick={() =>
                            setSelectedItem({
                              title: item.text,
                              points: item.points,
                              axis: 'Eixo I: Formação e Conhecimento',
                            })
                          }
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Upload
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="history" className="animate-slide-up outline-none">
          <Card className="shadow-subtle border-border/60">
            <CardHeader className="bg-muted/30 border-b border-border/50">
              <CardTitle>Histórico de Submissões</CardTitle>
              <CardDescription>
                Todas as evidências enviadas e seus respectivos status na curadoria.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/10">
                  <TableRow>
                    <TableHead className="pl-6">Data</TableHead>
                    <TableHead>Identificador</TableHead>
                    <TableHead>Título da Evidência</TableHead>
                    <TableHead>Eixo Referência</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right pr-6">Pontos Obtidos</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissionsData.map((sub) => (
                    <TableRow key={sub.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-medium text-muted-foreground pl-6">
                        {sub.date}
                      </TableCell>
                      <TableCell className="font-mono text-xs">{sub.id}</TableCell>
                      <TableCell className="font-semibold">{sub.title}</TableCell>
                      <TableCell>
                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          {sub.axis}
                        </span>
                      </TableCell>
                      <TableCell>{getStatusBadge(sub.status)}</TableCell>
                      <TableCell className="text-right pr-6 font-bold text-lg text-accent">
                        {sub.points !== '-' ? (
                          `+${sub.points}`
                        ) : (
                          <span className="text-muted-foreground/50">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <SubmitEvidenceDialog
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        item={selectedItem}
      />
    </div>
  )
}
