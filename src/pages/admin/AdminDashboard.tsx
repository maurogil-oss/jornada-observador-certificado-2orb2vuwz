import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Users,
  FileText,
  CheckCircle,
  Clock,
  ShieldAlert,
  Upload,
  Download,
  FileSpreadsheet,
  FileType2,
} from 'lucide-react'
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
import useSubmissionsStore from '@/stores/useSubmissionsStore'
import { ImportSpreadsheetDialog } from '@/components/admin/ImportSpreadsheetDialog'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts'
import { useToast } from '@/hooks/use-toast'
import { exportRanking } from '@/lib/export'
import pb from '@/lib/pocketbase/client'
import { Link } from 'react-router-dom'
import { useRealtime } from '@/hooks/use-realtime'

export default function AdminDashboard() {
  const { updateSubmissionStatus } = useSubmissionsStore()
  const { toast } = useToast()

  const [stats, setStats] = useState({
    observers: 0,
    totalSubmissions: 0,
    pendingSubmissions: 0,
    approvedSubmissions: 0,
  })

  const [pendingSubmissions, setPendingSubmissions] = useState<any[]>([])
  const [importLogs, setImportLogs] = useState<any[]>([])
  const [isImportOpen, setIsImportOpen] = useState(false)
  const [chartData, setChartData] = useState<any[]>([])

  const loadData = useCallback(async () => {
    try {
      const [
        usersRes,
        subsTotalRes,
        subsPendingRes,
        subsApprovedRes,
        pendingListRes,
        logsRes,
        allApprovedRes,
      ] = await Promise.all([
        pb.collection('users').getList(1, 1, { filter: "role = 'observer'" }),
        pb.collection('submissions').getList(1, 1),
        pb.collection('submissions').getList(1, 1, { filter: "status = 'Em Análise'" }),
        pb.collection('submissions').getList(1, 1, { filter: "status = 'Aprovado'" }),
        pb.collection('submissions').getFullList({
          filter: "status = 'Em Análise'",
          expand: 'user_id',
          sort: '-created',
        }),
        pb.collection('import_logs').getList(1, 10, { sort: '-created' }),
        pb.collection('submissions').getFullList({
          filter: "status = 'Aprovado'",
          sort: 'created',
        }),
      ])

      setStats({
        observers: usersRes.totalItems,
        totalSubmissions: subsTotalRes.totalItems,
        pendingSubmissions: subsPendingRes.totalItems,
        approvedSubmissions: subsApprovedRes.totalItems,
      })

      setPendingSubmissions(
        pendingListRes.map((r) => ({
          id: r.id,
          title: r.title,
          status: r.status,
          user:
            r.expand?.user_id?.full_name || r.expand?.user_id?.name || 'Usuário não identificado',
          axis: r.nivel || 'N/A',
        })),
      )

      setImportLogs(logsRes.items)

      // Process chart data for Score Evolution
      const monthlyMap: Record<string, number> = {}
      allApprovedRes.forEach((sub) => {
        const d = new Date(sub.created)
        const month = d.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })
        monthlyMap[month] = (monthlyMap[month] || 0) + (sub.score || 0)
      })
      let cumulative = 0
      const cData = Object.entries(monthlyMap).map(([month, points]) => {
        cumulative += points
        return { month, points: cumulative }
      })
      setChartData(cData)
    } catch (err) {
      console.error('Failed to load dashboard data', err)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Real-time updates for statistics and lists
  useRealtime('users', loadData)
  useRealtime('submissions', loadData)
  useRealtime('import_logs', loadData)

  const handleExport = async (format: 'excel' | 'pdf') => {
    toast({
      title: 'Gerando relatório...',
      description: 'Aguarde enquanto os dados são processados.',
    })
    try {
      await exportRanking(format)
      toast({
        title: 'Exportação Concluída',
        description:
          format === 'excel'
            ? 'O download do arquivo CSV foi iniciado com sucesso.'
            : 'A janela de impressão do PDF foi aberta.',
      })
    } catch (err: any) {
      toast({
        title: 'Erro na Exportação',
        description: err.message || 'Não foi possível gerar o relatório.',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in-up pb-10">
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="shadow-sm border-border/60 hover:bg-muted">
                <Download className="w-4 h-4 mr-2" />
                Exportar Relatório
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExport('excel')} className="cursor-pointer">
                <FileSpreadsheet className="w-4 h-4 mr-2 text-emerald-600" />
                Excel (.xlsx)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('pdf')} className="cursor-pointer">
                <FileType2 className="w-4 h-4 mr-2 text-red-600" />
                PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
        {/* Metric Cards */}
        <Card className="border-emerald-200 shadow-sm bg-emerald-50/50 dark:bg-emerald-950/20 dark:border-emerald-900/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-emerald-800 dark:text-emerald-400 flex items-center gap-2">
              <Users className="w-4 h-4" /> Observadores Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-emerald-950 dark:text-emerald-50">
              {stats.observers}
            </div>
          </CardContent>
        </Card>
        <Card className="border-blue-200 shadow-sm bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-900/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-blue-800 dark:text-blue-400 flex items-center gap-2">
              <FileText className="w-4 h-4" /> Submissões
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-blue-950 dark:text-blue-50">
              {stats.totalSubmissions}
            </div>
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
              {stats.pendingSubmissions}
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
            <div className="text-3xl font-black text-foreground">{stats.approvedSubmissions}</div>
          </CardContent>
        </Card>
      </div>

      {chartData.length > 0 && (
        <Card className="shadow-subtle border-border/60">
          <CardHeader className="bg-muted/30 border-b border-border/50">
            <CardTitle>Evolução de Pontuação</CardTitle>
            <CardDescription>
              Progresso do total de pontos distribuídos aos observadores ao longo do tempo.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 pb-2 pl-0">
            <ChartContainer
              config={{
                points: {
                  label: 'Pontos',
                  color: 'hsl(var(--primary))',
                },
              }}
              className="h-[300px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="hsl(var(--muted))"
                  />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    dy={10}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    dx={-10}
                  />
                  <ChartTooltip content={(props: any) => <ChartTooltipContent {...props} />} />
                  <Line
                    type="monotone"
                    dataKey="points"
                    stroke="var(--color-points)"
                    strokeWidth={3}
                    dot={{ fill: 'var(--color-points)', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="shadow-subtle border-border/60">
          <CardHeader className="bg-muted/30 border-b border-border/50">
            <CardTitle>Log de Importação</CardTitle>
            <CardDescription>
              Histórico de sucesso e erros das últimas importações em lote.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/10">
                  <TableRow>
                    <TableHead className="pl-6 whitespace-nowrap">Data</TableHead>
                    <TableHead>Nome do Arquivo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="whitespace-nowrap">Linhas Afetadas</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {importLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        Nenhum log de importação encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    importLogs.map((log) => (
                      <TableRow key={log.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="text-muted-foreground pl-6 whitespace-nowrap">
                          {new Date(log.created).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </TableCell>
                        <TableCell className="font-medium">{log.file_name}</TableCell>
                        <TableCell>
                          {log.status === 'Success' ? (
                            <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm">
                              Sucesso
                            </Badge>
                          ) : (
                            <Badge variant="destructive" className="shadow-sm">
                              Erro
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {log.row_count || 0} registros
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-subtle border-border/60">
          <CardHeader className="bg-muted/30 border-b border-border/50">
            <CardTitle>Ações Pendentes</CardTitle>
            <CardDescription>
              Evidências submetidas aguardando validação para cômputo de pontos.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/10">
                  <TableRow>
                    <TableHead className="pl-6">Observador</TableHead>
                    <TableHead>Evidência</TableHead>
                    <TableHead className="text-right pr-6">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingSubmissions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                        Nenhuma submissão pendente no momento.
                      </TableCell>
                    </TableRow>
                  ) : (
                    pendingSubmissions.map((sub) => (
                      <TableRow key={sub.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="font-semibold pl-6 whitespace-nowrap">
                          {sub.user}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate" title={sub.title}>
                          {sub.title}
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <Button size="sm" asChild className="h-8 font-semibold shadow-sm">
                            <Link to="/admin/submissions" state={{ selectedSubId: sub.id }}>
                              Analisar
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <ImportSpreadsheetDialog isOpen={isImportOpen} onClose={() => setIsImportOpen(false)} />
    </div>
  )
}
