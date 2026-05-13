import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock, CheckCircle2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import useSubmissionsStore from '@/stores/useSubmissionsStore'

export function RecentActivity() {
  const { submissions } = useSubmissionsStore()

  const recent = submissions.slice(0, 5)

  return (
    <Card className="shadow-subtle border-border/60 h-full">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="w-5 h-5 text-muted-foreground" /> Atividade Recente
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {recent.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            <span>Nenhuma atividade recente.</span>
          </p>
        ) : (
          recent.map((act) => (
            <div key={act.id} className="flex items-start gap-3">
              <div
                className={cn(
                  'p-1.5 rounded-full mt-0.5 shrink-0',
                  act.status === 'Aprovado'
                    ? 'bg-emerald-500/10 text-emerald-600'
                    : act.status === 'Ajuste Necessário'
                      ? 'bg-destructive/10 text-destructive'
                      : 'bg-amber-500/10 text-amber-600',
                )}
              >
                {act.status === 'Aprovado' ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : act.status === 'Ajuste Necessário' ? (
                  <AlertCircle className="w-4 h-4" />
                ) : (
                  <Clock className="w-4 h-4" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium leading-tight text-foreground">
                  <span>{act.title}</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
                  <span>{act.date}</span>
                  <span>&bull;</span>
                  <span
                    className={cn(
                      'font-bold',
                      act.status === 'Aprovado'
                        ? 'text-emerald-600'
                        : act.status === 'Ajuste Necessário'
                          ? 'text-destructive'
                          : 'text-amber-600',
                    )}
                  >
                    {act.status === 'Aprovado' ? `+${act.points} pts` : act.status}
                  </span>
                </p>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
