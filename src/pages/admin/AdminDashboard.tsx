import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Users, FileText, CheckCircle, Clock, ShieldAlert } from 'lucide-react'
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

export default function AdminDashboard() {
  const { submissions } = useSubmissionsStore()
  const pendingSubmissions = submissions.filter((s) => s.status === 'Em Análise')

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
        <Badge
          variant="outline"
          className="px-4 py-2 text-sm bg-primary/5 text-primary border-primary/20 flex items-center gap-2 w-fit shadow-sm"
        >
          <ShieldAlert className="w-4 h-4" />
          Modo Administrador
        </Badge>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-emerald-200 shadow-sm bg-emerald-50/50 dark:bg-emerald-950/20 dark:border-emerald-900/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-emerald-800 dark:text-emerald-400 flex items-center gap-2">
              <Users className="w-4 h-4" /> Observadores Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-emerald-950 dark:text-emerald-50">1,248</div>
            <p className="text-xs font-medium text-emerald-600 dark:text-emerald-500 mt-1">
              +12 este mês
            </p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 shadow-sm bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-900/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-blue-800 dark:text-blue-400 flex items-center gap-2">
              <FileText className="w-4 h-4" /> Total de Submissões
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-blue-950 dark:text-blue-50">8,432</div>
            <p className="text-xs font-medium text-blue-600 dark:text-blue-500 mt-1">
              Nível de engajamento alto
            </p>
          </CardContent>
        </Card>

        <Card className="border-amber-200 shadow-sm bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-900/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-amber-800 dark:text-amber-400 flex items-center gap-2">
              <Clock className="w-4 h-4" /> Fila de Curadoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-amber-950 dark:text-amber-50">45</div>
            <p className="text-xs font-medium text-amber-600 dark:text-amber-500 mt-1">
              Ações requeridas hoje
            </p>
          </CardContent>
        </Card>

        <Card className="border-primary/20 shadow-sm bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-primary flex items-center gap-2">
              <CheckCircle className="w-4 h-4" /> Aprovadas (Mês)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-foreground">312</div>
            <p className="text-xs font-medium text-muted-foreground mt-1">Taxa de aprovação: 89%</p>
          </CardContent>
        </Card>
      </div>

      {/* Curation Table */}
      <Card className="shadow-subtle border-border/60">
        <CardHeader className="bg-muted/30 border-b border-border/50">
          <CardTitle>Ações Pendentes de Curadoria</CardTitle>
          <CardDescription>
            Evidências submetidas por Observadores aguardando validação do comitê de meritocracia.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/10">
              <TableRow>
                <TableHead className="pl-6">Identificador</TableHead>
                <TableHead>Observador</TableHead>
                <TableHead>Evidência (Tipo)</TableHead>
                <TableHead>Eixo</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right pr-6">Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingSubmissions.map((sub) => (
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
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className="bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400"
                    >
                      {sub.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <Button size="sm" variant="default" className="h-8 font-semibold shadow-sm">
                      Analisar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
