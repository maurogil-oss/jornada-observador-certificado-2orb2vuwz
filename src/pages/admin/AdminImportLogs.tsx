import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useRealtime } from '@/hooks/use-realtime'
import pb from '@/lib/pocketbase/client'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Database, CheckCircle2, XCircle } from 'lucide-react'

export default function AdminImportLogs() {
  const [logs, setLogs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchLogs = async () => {
    try {
      const data = await pb.collection('import_logs').getFullList({
        sort: '-created',
        expand: 'user_id',
      })
      setLogs(data)
    } catch (error) {
      console.error('Failed to fetch import logs', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [])

  useRealtime('import_logs', () => {
    fetchLogs()
  })

  return (
    <div className="p-6 max-w-7xl mx-auto flex flex-col gap-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Database className="w-8 h-8 text-primary" />
            Logs de Importação
          </h1>
          <p className="text-muted-foreground mt-1">
            Histórico das importações de dados realizadas no sistema.
          </p>
        </div>
      </div>

      <div className="bg-card border border-border/50 rounded-xl shadow-sm overflow-hidden flex flex-col h-[600px]">
        <ScrollArea className="flex-1">
          <Table>
            <TableHeader className="bg-muted/50 sticky top-0 z-10 shadow-sm">
              <TableRow>
                <TableHead className="w-[200px]">Data/Hora</TableHead>
                <TableHead>Arquivo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Registros</TableHead>
                <TableHead>Admin</TableHead>
                <TableHead>Detalhes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                    Carregando logs de importação...
                  </TableCell>
                </TableRow>
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                    Nenhuma importação registrada.
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id} className="group hover:bg-muted/30 transition-colors">
                    <TableCell className="text-sm font-medium whitespace-nowrap">
                      {format(new Date(log.created), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR })}
                    </TableCell>
                    <TableCell className="font-medium text-sm">{log.file_name}</TableCell>
                    <TableCell>
                      {log.status === 'Success' ? (
                        <span className="inline-flex items-center gap-1 text-green-600 font-medium text-xs bg-green-50 px-2 py-1 rounded-md">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Sucesso
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-red-600 font-medium text-xs bg-red-50 px-2 py-1 rounded-md">
                          <XCircle className="w-3.5 h-3.5" /> Erro
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-medium">{log.row_count || 0}</TableCell>
                    <TableCell className="text-sm">
                      {log.expand?.user_id?.name || log.expand?.user_id?.email || 'Sistema'}
                    </TableCell>
                    <TableCell
                      className="text-sm text-muted-foreground truncate max-w-[200px]"
                      title={log.details}
                    >
                      {log.details || '-'}
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
