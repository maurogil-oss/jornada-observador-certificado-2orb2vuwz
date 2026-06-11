import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useRealtime } from '@/hooks/use-realtime'
import { useEffect, useState } from 'react'
import pb from '@/lib/pocketbase/client'
import { format } from 'date-fns'
import { Activity } from 'lucide-react'

export function HighlightsMural() {
  const [logs, setLogs] = useState<any[]>([])

  const fetchLogs = async () => {
    try {
      const records = await pb.collection('activity_logs').getList(1, 5, {
        sort: '-created',
        expand: 'actor_id',
      })
      setLogs(records.items)
    } catch (e) {
      console.error('Failed to load activity logs', e)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [])

  useRealtime('activity_logs', () => {
    fetchLogs()
  })

  return (
    <Card className="h-full border-primary/10 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Mural de Destaques</CardTitle>
        </div>
        <CardDescription>Atividades recentes na plataforma</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {logs.map((log) => (
            <div key={log.id} className="flex flex-col gap-1 border-b pb-3 last:border-0 last:pb-0">
              <span className="text-sm">
                <span className="font-semibold text-primary">
                  {log.expand?.actor_id?.name || 'Sistema'}
                </span>{' '}
                <span className="text-muted-foreground">{log.action}</span>{' '}
                <span className="font-medium">{log.entity_type}</span>
              </span>
              <span className="text-xs text-muted-foreground opacity-80">
                {format(new Date(log.created), 'dd/MM/yyyy HH:mm')}
              </span>
            </div>
          ))}
          {logs.length === 0 && (
            <div className="text-sm text-muted-foreground text-center py-4 bg-slate-50 dark:bg-zinc-900/50 rounded-md">
              Nenhuma atividade recente encontrada.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
