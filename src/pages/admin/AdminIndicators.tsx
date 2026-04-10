import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Download, Users, BookOpen, Activity, Award, ArrowUpDown } from 'lucide-react'
import { exportToCSV } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { useRealtime } from '@/hooks/use-realtime'
import pb from '@/lib/pocketbase/client'

type SortKey = 'name' | 'level' | 'lastActivityDate'

export default function AdminIndicators() {
  const { toast } = useToast()
  const [isExporting, setIsExporting] = useState(false)
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'asc' | 'desc' } | null>(
    null,
  )
  const [users, setUsers] = useState<any[]>([])
  const [submissions, setSubmissions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadData = async () => {
    try {
      const [usersData, subsData] = await Promise.all([
        pb.collection('users').getFullList(),
        pb.collection('submissions').getFullList(),
      ])
      setUsers(usersData)
      setSubmissions(subsData)
    } catch (error) {
      toast({
        title: 'Erro ao carregar dados',
        description: 'Não foi possível carregar os indicadores reais.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('users', () => {
    loadData()
  })
  useRealtime('submissions', () => {
    loadData()
  })

  const observers = users.filter((u) => u.role === 'observer')
  const total = observers.length
  const nivel1 = observers.filter((u) => (u.level || '').includes('Nível I')).length
  const nivel2 = observers.filter((u) => (u.level || '').includes('Nível II')).length
  const nivel3 = observers.filter((u) => (u.level || '').includes('Nível III')).length

  const observersList = observers.map((obs) => {
    const userSubs = submissions.filter((s) => s.user_id === obs.id)
    const lastSub = userSubs.sort(
      (a, b) => new Date(b.created).getTime() - new Date(a.created).getTime(),
    )[0]

    const lastActivityDate = lastSub ? new Date(lastSub.created) : new Date(obs.created)

    return {
      id: obs.id,
      name: obs.name || obs.email,
      level: obs.level || 'Nível I - Observador Certificado (Iniciante)',
      lastActivityDate: lastActivityDate,
      lastActivity: lastActivityDate.toLocaleDateString('pt-BR'),
    }
  })

  const sortedData = [...observersList].sort((a, b) => {
    if (!sortConfig) return 0
    const { key, direction } = sortConfig
    const aVal = a[key]
    const bVal = b[key]

    if (aVal < bVal) return direction === 'asc' ? -1 : 1
    if (aVal > bVal) return direction === 'asc' ? 1 : -1
    return 0
  })

  const handleExport = () => {
    setIsExporting(true)
    try {
      const exportData = observersList.map((obs) => ({
        'Nome do Observador': obs.name,
        'Nível de Certificação': obs.level,
        'Última Atividade': obs.lastActivity,
      }))

      exportToCSV(exportData, 'indicadores_observadores.csv')

      toast({
        title: 'Exportação Concluída',
        description: 'O arquivo CSV com os indicadores foi baixado com sucesso.',
      })
    } catch (error) {
      toast({
        title: 'Erro na Exportação',
        description: 'Não foi possível gerar o arquivo CSV.',
        variant: 'destructive',
      })
    } finally {
      setIsExporting(false)
    }
  }

  const requestSort = (key: SortKey) => {
    let direction: 'asc' | 'desc' = 'asc'
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in-up pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Indicadores</h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Monitore o progresso e a distribuição dos observadores certificados.
          </p>
        </div>
        <Button
          onClick={handleExport}
          disabled={isExporting || isLoading}
          className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm w-full md:w-auto"
        >
          <Download className="w-4 h-4 mr-2" />
          {isExporting ? 'Exportando...' : 'Exportar Dados'}
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" /> Total de Observadores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-foreground">{isLoading ? '...' : total}</div>
            <p className="text-xs text-muted-foreground mt-1">Registros ativos na base</p>
          </CardContent>
        </Card>

        <Card className="border-emerald-200 shadow-sm bg-emerald-50/30 dark:bg-emerald-950/10 dark:border-emerald-900/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-emerald-800 dark:text-emerald-400 flex items-center gap-2">
              <BookOpen className="w-4 h-4" /> Nível I
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-emerald-950 dark:text-emerald-50">
              {isLoading ? '...' : nivel1}
            </div>
            <p className="text-xs text-emerald-700/70 dark:text-emerald-400/70 mt-1">
              Observador Certificado (Iniciante)
            </p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 shadow-sm bg-blue-50/30 dark:bg-blue-950/10 dark:border-blue-900/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-blue-800 dark:text-blue-400 flex items-center gap-2">
              <Activity className="w-4 h-4" /> Nível II
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-blue-950 dark:text-blue-50">
              {isLoading ? '...' : nivel2}
            </div>
            <p className="text-xs text-blue-700/70 dark:text-blue-400/70 mt-1">
              Observador Certificado Pleno
            </p>
          </CardContent>
        </Card>

        <Card className="border-amber-200 shadow-sm bg-amber-50/30 dark:bg-amber-950/10 dark:border-amber-900/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-amber-800 dark:text-amber-400 flex items-center gap-2">
              <Award className="w-4 h-4" /> Nível III
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-amber-950 dark:text-amber-50">
              {isLoading ? '...' : nivel3}
            </div>
            <p className="text-xs text-amber-700/70 dark:text-amber-400/70 mt-1">Mobilizador</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-elevation border-border/60 overflow-hidden">
        <CardHeader className="bg-muted/30 border-b border-border/50">
          <CardTitle>Progresso dos Observadores</CardTitle>
          <CardDescription>
            Lista detalhada com o status e a última atividade de cada observador na plataforma.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/10">
                <TableRow>
                  <TableHead
                    className="pl-6 w-[300px] cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => requestSort('name')}
                  >
                    <div className="flex items-center gap-2">
                      Nome do Observador <ArrowUpDown className="w-3 h-3 text-muted-foreground" />
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => requestSort('level')}
                  >
                    <div className="flex items-center gap-2">
                      Nível de Certificação{' '}
                      <ArrowUpDown className="w-3 h-3 text-muted-foreground" />
                    </div>
                  </TableHead>
                  <TableHead
                    className="text-right pr-6 cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => requestSort('lastActivityDate')}
                  >
                    <div className="flex items-center justify-end gap-2">
                      Última Atividade <ArrowUpDown className="w-3 h-3 text-muted-foreground" />
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center h-24 text-muted-foreground">
                      Carregando dados...
                    </TableCell>
                  </TableRow>
                ) : sortedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center h-24 text-muted-foreground">
                      Nenhum observador encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedData.map((obs) => {
                    const isAmber = obs.level.includes('Nível III')
                    const isBlue = obs.level.includes('Nível II')

                    return (
                      <TableRow key={obs.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="font-medium pl-6">{obs.name}</TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={cn(
                              'font-semibold px-2.5 py-0.5 whitespace-nowrap',
                              isAmber &&
                                'bg-amber-100 text-amber-800 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400',
                              isBlue &&
                                'bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400',
                              !isAmber &&
                                !isBlue &&
                                'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400',
                            )}
                          >
                            {obs.level}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right pr-6 text-muted-foreground">
                          {obs.lastActivity}
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
