import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Users, FileText, CheckCircle, Clock, ShieldAlert, Upload, Download } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import useSubmissionsStore, { Submission } from '@/stores/useSubmissionsStore'
import { ImportSpreadsheetDialog } from '@/components/admin/ImportSpreadsheetDialog'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { exportToCSV } from '@/lib/utils'

export default function AdminDashboard() {
  const { submissions, updateSubmissionStatus } = useSubmissionsStore()
  const { toast } = useToast()
  const pendingSubmissions = submissions.filter((s) => s.status === 'Em Análise')

  const [isImportOpen, setIsImportOpen] = useState(false)
  const [selectedSub, setSelectedSub] = useState<Submission | null>(null)

  const handleExport = () => {
    // Mock export data matching acceptance criteria
    const reportData = [
      {
        Nome: 'Carlos Silva',
        'Eixo I': 450,
        'Eixo II': 300,
        'Eixo III': 600,
        Total: 1350,
        Nivel: 'Mobilizador',
      },
      {
        Nome: 'Ana Souza',
        'Eixo I': 500,
        'Eixo II': 400,
        'Eixo III': 200,
        Total: 1100,
        Nivel: 'Pleno',
      },
      {
        Nome: 'Roberto Almeida',
        'Eixo I': 150,
        'Eixo II': 100,
        'Eixo III': 50,
        Total: 300,
        Nivel: 'Iniciante',
      },
      {
        Nome: 'Mariana Costa',
        'Eixo I': 300,
        'Eixo II': 500,
        'Eixo III': 150,
        Total: 950,
        Nivel: 'Pleno',
      },
    ]
    exportToCSV(reportData, 'relatorio_observadores.csv')
    toast({
      title: 'Relatório Exportado',
      description: 'O download do arquivo CSV iniciou com sucesso.',
    })
  }

  const handleReview = (status: string) => {
    if (selectedSub) {
      updateSubmissionStatus(selectedSub.id, status)
      toast({
        title: `Evidência ${status}`,
        description: `O observador foi notificado por e-mail sobre a atualização de status.`,
      })
      setSelectedSub(null)
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Painel de Gestão ONSV
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Visão geral administrativa e curadoria de submissões estratégicas.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Badge
            variant="outline"
            className="px-4 py-2.5 text-sm bg-primary/5 text-primary border-primary/20 flex items-center gap-2 shadow-sm mr-auto md:mr-0"
          >
            <ShieldAlert className="w-4 h-4" />
            Admin
          </Badge>
          <Button
            onClick={handleExport}
            variant="outline"
            className="shadow-sm border-border/60 hover:bg-muted"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar Relatório
          </Button>
          <Button
            onClick={() => setIsImportOpen(true)}
            className="bg-amber-600 hover:bg-amber-700 text-white shadow-sm"
          >
            <Upload className="w-4 h-4 mr-2" />
            Importar Lote
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {/* Metric Cards remain unchanged... */}
        <Card className="border-emerald-200 shadow-sm bg-emerald-50/50 dark:bg-emerald-950/20 dark:border-emerald-900/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-emerald-800 dark:text-emerald-400 flex items-center gap-2">
              <Users className="w-4 h-4" /> Observadores Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-emerald-950 dark:text-emerald-50">800</div>
          </CardContent>
        </Card>
        <Card className="border-blue-200 shadow-sm bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-900/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-blue-800 dark:text-blue-400 flex items-center gap-2">
              <FileText className="w-4 h-4" /> Submissões
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-blue-950 dark:text-blue-50">8,432</div>
          </CardContent>
        </Card>
        <Card className="border-amber-200 shadow-sm bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-900/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-amber-800 dark:text-amber-400 flex items-center gap-2">
              <Clock className="w-4 h-4" /> Fila
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-amber-950 dark:text-amber-50">
              {pendingSubmissions.length}
            </div>
          </CardContent>
        </Card>
        <Card className="border-primary/20 shadow-sm bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-primary flex items-center gap-2">
              <CheckCircle className="w-4 h-4" /> Aprovadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-foreground">312</div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-subtle border-border/60">
        <CardHeader className="bg-muted/30 border-b border-border/50">
          <CardTitle>Ações Pendentes de Curadoria</CardTitle>
          <CardDescription>
            Evidências submetidas aguardando validação para cômputo de pontos e insígnias.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/10">
              <TableRow>
                <TableHead className="pl-6">ID</TableHead>
                <TableHead>Observador</TableHead>
                <TableHead>Evidência (Tipo)</TableHead>
                <TableHead>Eixo</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="text-right pr-6">Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingSubmissions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Nenhuma submissão pendente no momento.
                  </TableCell>
                </TableRow>
              ) : (
                pendingSubmissions.map((sub) => (
                  <TableRow key={sub.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-mono text-xs text-muted-foreground pl-6">
                      {sub.id}
                    </TableCell>
                    <TableCell className="font-semibold">{sub.user}</TableCell>
                    <TableCell>{sub.title}</TableCell>
                    <TableCell>
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        {sub.axis}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{sub.date}</TableCell>
                    <TableCell className="text-right pr-6">
                      <Button
                        size="sm"
                        onClick={() => setSelectedSub(sub)}
                        className="h-8 font-semibold shadow-sm"
                      >
                        Analisar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ImportSpreadsheetDialog isOpen={isImportOpen} onClose={() => setIsImportOpen(false)} />

      <Dialog open={!!selectedSub} onOpenChange={(open) => !open && setSelectedSub(null)}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Analisar Comprovação</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="bg-muted/30 p-4 rounded-lg border border-border/50 text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Observador:</span>
                <span className="font-semibold text-foreground">{selectedSub?.user}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Atividade:</span>
                <span className="font-semibold text-foreground text-right">
                  {selectedSub?.title}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Eixo de Evolução:</span>
                <span className="font-semibold text-foreground">{selectedSub?.axis}</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              A avaliação desta evidência enviará automaticamente um e-mail ao observador
              notificando sobre a aprovação ou necessidade de ajustes.
            </p>
          </div>
          <DialogFooter className="flex gap-2 sm:justify-end">
            <Button
              variant="destructive"
              className="w-full sm:w-auto"
              onClick={() => handleReview('Ajuste Necessário')}
            >
              Devolver p/ Ajuste
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white w-full sm:w-auto"
              onClick={() => handleReview('Aprovado')}
            >
              Aprovar Evidência
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
