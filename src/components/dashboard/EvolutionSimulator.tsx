import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Target, Zap } from 'lucide-react'
import useGameStore from '@/stores/useGameStore'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'

export function EvolutionSimulator() {
  const { niveisProgress } = useGameStore()

  const getRecommendation = (id: string, status: string, points: number) => {
    if (id === 'III') {
      return {
        msg: 'Foco em Representatividade',
        target: 'Manter engajamento contínuo na rede e atuar como mentor',
        percent: Math.min(100, Math.round((points / 1000) * 100)),
      }
    }
    if (id === 'II') {
      const needed = 500 - points
      let action = `Faltam ${Math.ceil(needed / 150)} projetos de impacto`
      return {
        msg: `Faltam ${needed > 0 ? needed : 0} pts para concluir o Nível II`,
        target: needed > 0 ? action : 'Meta Atingida',
        percent: Math.min(100, Math.round((points / 500) * 100)),
      }
    }
    // Nível I
    const needed = 200 - points
    let action = `Faltam ${Math.ceil(needed / 50)} cursos ou publicações`
    return {
      msg: `Faltam ${needed > 0 ? needed : 0} pts para concluir o Nível I`,
      target: needed > 0 ? action : 'Meta Atingida',
      percent: Math.min(100, Math.round((points / 200) * 100)),
    }
  }

  return (
    <Card className="shadow-subtle border-border/60">
      <CardHeader className="bg-primary/5 border-b border-border/30">
        <CardTitle className="text-lg flex items-center gap-2 text-primary">
          <Target className="w-5 h-5" /> Simulador de Evolução
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {niveisProgress.map((nivel) => {
            const rec = getRecommendation(nivel.id, nivel.status, nivel.points)
            return (
              <div
                key={nivel.id}
                className="flex flex-col space-y-3 p-4 bg-muted/30 rounded-xl border border-border/50 shadow-sm hover:border-primary/30 transition-colors"
              >
                <div className="flex justify-between items-start gap-2">
                  <h4
                    className="font-bold text-sm text-foreground line-clamp-2"
                    title={`Nível ${nivel.id} - ${nivel.name}`}
                  >
                    Nível {nivel.id} - {nivel.name}
                  </h4>
                  <Badge variant="outline" className="text-[9px] font-bold uppercase shrink-0">
                    {nivel.status}
                  </Badge>
                </div>
                <Progress value={rec.percent} className="h-2 bg-muted-foreground/20" />
                <div className="text-sm flex-1 flex flex-col justify-between">
                  <p className="font-semibold text-foreground/80 mb-2">{rec.msg}</p>
                  {rec.percent < 100 && (
                    <p className="text-xs text-muted-foreground flex items-start gap-2 bg-background p-3 rounded-md border border-border/60 shadow-sm mt-2">
                      <Zap className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <span className="leading-relaxed font-medium text-foreground">
                        {rec.target}
                      </span>
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
