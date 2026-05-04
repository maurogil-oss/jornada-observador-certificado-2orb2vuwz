import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { getActivityLogs, type ActivityLog } from '@/services/activity_logs'
import { useRealtime } from '@/hooks/use-realtime'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ScrollArea } from '@/components/ui/scroll-area'
import { History, ShieldAlert } from 'lucide-react'

export default function AdminLogs() {
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchLogs = async () => {
    try {
      const data = await getActivityLogs()
      setLogs(data)
    } catch (error) {
      console.error('Failed to fetch activity logs', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [])

  useRealtime('activity_logs', () => {
    fetchLogs()
  })

  return (
    <div className="p-6 max-w-7xl mx-auto flex flex-col gap-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <History className="w-8 h-8 text-primary" />
            Log de Atividade
          </h1>
          <p className="text-muted-foreground mt-1">
            Histórico completo de alterações e ações do sistema.
          </p>
        </div>
      </div>

      <div className="bg-card border border-border/50 rounded-xl shadow-sm overflow-hidden flex flex-col h-[600px]">
        <ScrollArea className="flex-1">
          <Table>
            <TableHeader className="bg-muted/50 sticky top-0 z-10 shadow-sm">
              <TableRow>
                <TableHead className="w-[200px]">Data/Hora</TableHead>
                <TableHead className="w-[250px]">Usuário/Admin</TableHead>
                <TableHead className="w-[200px]">Ação</TableHead>
                <TableHead>Detalhes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                    Carregando logs...
                  </TableCell>
                </TableRow>
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                    Nenhum registro de atividade encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id} className="group hover:bg-muted/30 transition-colors">
                    <TableCell className="text-sm font-medium whitespace-nowrap">
                      {format(new Date(log.created), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR })}
                    </TableCell>
                    <TableCell>
                      {log.expand?.actor_id ? (
                        <div className="flex flex-col">
                          <span className="font-semibold text-sm">
                            {log.expand.actor_id.name || 'Admin'}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {log.expand.actor_id.email}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <ShieldAlert className="w-4 h-4" />
                          <span className="text-sm font-medium">Sistema</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex px-2 py-1 rounded bg-secondary text-secondary-foreground text-xs font-semibold whitespace-nowrap">
                        {log.action}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {log.description || '-'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>
    </div>
  )
}
