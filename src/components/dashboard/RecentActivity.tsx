import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock, CheckCircle2 } from 'lucide-react'
import { recentActivity } from '@/lib/data'
import { cn } from '@/lib/utils'

export function RecentActivity() {
  return (
    <Card className="shadow-subtle border-border/60 h-full">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="w-5 h-5 text-muted-foreground" /> Atividade Recente
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {recentActivity.map((act) => (
          <div key={act.id} className="flex items-start gap-3">
            <div
              className={cn(
                'p-1.5 rounded-full mt-0.5 shrink-0',
                act.type === 'success'
                  ? 'bg-emerald-500/10 text-emerald-600'
                  : 'bg-amber-500/10 text-amber-600',
              )}
            >
              {act.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <Clock className="w-4 h-4" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium leading-tight text-foreground">{act.action}</p>
              <p className="text-xs text-muted-foreground mt-1.5">
                {act.time} &bull;{' '}
                <span
                  className={cn(
                    'font-bold',
                    act.type === 'success' ? 'text-emerald-600' : 'text-amber-600',
                  )}
                >
                  {act.points}
                </span>
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
