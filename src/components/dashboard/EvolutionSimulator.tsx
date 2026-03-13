import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Target, Zap } from 'lucide-react'
import useGameStore from '@/stores/useGameStore'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'

export function EvolutionSimulator() {
  const { eixosProgress } = useGameStore()

  const getRecommendation = (eixoId: string, currentLevel: string, points: number) => {
    if (currentLevel === 'Mobilizador') {
      return {
        msg: 'Nível Máximo Atingido!',
        target: 'Manter engajamento contínuo na rede',
        percent: 100,
      }
    }
    if (currentLevel === 'Pleno') {
      const needed = 500 - points
      let action =
        needed > 100
          ? `Faltam ${Math.ceil(needed / 150)} projetos de impacto para o Nível Mobilizador`
          : `Faltam ${Math.ceil(needed / 50)} publicações para o Nível Mobilizador`
      if (eixoId === 'III') {
        action = `Faltam ${Math.ceil(needed / 100)} representações em comitês para o Nível Mobilizador`
      }
      return {
        msg: `Faltam ${needed} pts para Mobilizador`,
        target: action,
        percent: Math.round((points / 500) * 100),
      }
    }
    // Iniciante
    const needed = 200 - points
    let action = `Faltam ${Math.ceil(needed / 50)} cursos para o Nível Pleno`
    if (eixoId === 'III') action = `Faltam ${Math.ceil(needed / 200)} mentorias para o Nível Pleno`

    return {
      msg: `Faltam ${needed} pts para Pleno`,
      target: action,
      percent: Math.round((points / 200) * 100),
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
          {eixosProgress.map((eixo) => {
            const rec = getRecommendation(eixo.id, eixo.level, eixo.points)
            return (
              <div
                key={eixo.id}
                className="flex flex-col space-y-3 p-4 bg-muted/30 rounded-xl border border-border/50 shadow-sm hover:border-primary/30 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-sm text-foreground">
                    Eixo {eixo.id} - {eixo.name}
                  </h4>
                  <Badge variant="outline" className="text-[10px] font-bold uppercase shrink-0">
                    {eixo.level}
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
