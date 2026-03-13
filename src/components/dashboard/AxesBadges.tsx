import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { axesData } from '@/lib/data'
import useGameStore from '@/stores/useGameStore'
import { ShieldCheck, Award } from 'lucide-react'
import { cn } from '@/lib/utils'

export function AxesBadges() {
  const { eixosProgress } = useGameStore()

  return (
    <div className="space-y-8">
      {/* Gamification Badges */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold">Insígnias de Excelência</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {eixosProgress.map((ep) => (
            <Card
              key={ep.id}
              className={cn(
                'border-l-4 shadow-sm transition-all hover:shadow-md',
                ep.level === 'Mobilizador'
                  ? 'border-l-amber-500 bg-amber-50/40 dark:bg-amber-950/20'
                  : ep.level === 'Pleno'
                    ? 'border-l-blue-500 bg-blue-50/40 dark:bg-blue-950/20'
                    : 'border-l-muted bg-muted/20',
              )}
            >
              <CardContent className="p-5 flex items-center gap-5">
                <div
                  className={cn(
                    'p-3.5 rounded-full shadow-sm',
                    ep.level === 'Mobilizador'
                      ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400'
                      : ep.level === 'Pleno'
                        ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400'
                        : 'bg-muted text-muted-foreground',
                  )}
                >
                  {ep.level === 'Mobilizador' ? (
                    <Award className="w-7 h-7" />
                  ) : ep.level === 'Pleno' ? (
                    <ShieldCheck className="w-7 h-7" />
                  ) : (
                    <div className="w-7 h-7 rounded-full border-2 border-dashed border-current opacity-50" />
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Eixo {ep.id} - {ep.name}
                  </p>
                  <p className="text-xl font-black text-foreground mt-0.5">{ep.level}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Axes Status */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold">Progresso das Missões</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {axesData.map((eixo) => (
            <Card key={eixo.id} className="hover:shadow-elevation transition-all border-border/60">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-primary/10 rounded-md text-primary shrink-0">
                    <eixo.icon className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                    Eixo {eixo.id}
                  </span>
                </div>
                <CardTitle className="text-base leading-tight">{eixo.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Progresso</span>
                  <span className="font-bold text-primary">{eixo.progress}%</span>
                </div>
                <Progress value={eixo.progress} className="h-2.5 bg-muted/50" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
