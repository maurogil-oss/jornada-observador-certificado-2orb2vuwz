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
import { CheckCircle2, Clock, AlertCircle, FileSearch } from 'lucide-react'
import { SubmitEvidenceDialog } from '@/components/submissions/SubmitEvidenceDialog'
import { PlaybookEixo1 } from '@/components/submissions/PlaybookEixo1'
import { PlaybookEixo2 } from '@/components/submissions/PlaybookEixo2'
import useSubmissionsStore from '@/stores/useSubmissionsStore'

export default function Submissions() {
  const [selectedItem, setSelectedItem] = useState<{
    title: string
    points: number
    axis: string
  } | null>(null)

  const { submissions } = useSubmissionsStore()
  const mySubmissions = submissions.filter((s) => s.user === 'Você')

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

      <Tabs defaultValue="eixo1" className="w-full">
        <TabsList className="mb-6 grid w-full grid-cols-3 max-w-xl bg-muted/60 p-1.5 rounded-lg h-auto">
          <TabsTrigger
            value="eixo1"
            className="text-sm py-2.5 data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-md transition-all"
          >
            Playbook Eixo I
          </TabsTrigger>
          <TabsTrigger
            value="eixo2"
            className="text-sm py-2.5 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-md transition-all"
          >
            Playbook Eixo II
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className="text-sm py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md rounded-md transition-all"
          >
            Histórico
          </TabsTrigger>
        </TabsList>

        <TabsContent value="eixo1" className="animate-slide-up outline-none">
          <PlaybookEixo1 onSelect={setSelectedItem} />
        </TabsContent>

        <TabsContent value="eixo2" className="animate-slide-up outline-none">
          <PlaybookEixo2 onSelect={setSelectedItem} />
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
                  {mySubmissions.map((sub) => (
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
