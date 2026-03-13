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
        target: 'Manter engajamento contínuo',
        percent: 100,
      }
    }
    if (currentLevel === 'Pleno') {
      const needed = 500 - points
      let action = needed > 100 ? 'Submeter Projeto de Inovação' : 'Publicar 1 Artigo Técnico'
      if (eixoId === 'III') {
        action = `${Math.ceil(needed / 100)} Representações Formais em Comitês`
      }
      return {
        msg: `Faltam ${needed} pontos para Nível Mobilizador`,
        target: action,
        percent: Math.round((points / 500) * 100),
      }
    }
    // Iniciante
    const needed = 200 - points
    let action = 'Concluir 1 Curso Oficial ONSV e 1 Ação de Impacto'
    if (eixoId === 'III') action = 'Realizar 1 Mentoria ou Representação em Campanha'
    return {
      msg: `Faltam ${needed} pontos para Nível Pleno`,
      target: action,
      percent: Math.round((points / 200) * 100),
    }
  }

  return (
    <Card className="shadow-subtle border-border/60">
      <CardHeader className="bg-primary/5 border-b border-border/30">
        <CardTitle className="text-lg flex items-center gap-2 text-primary">
          <Target className="w-5 h-5" /> Simulador de Projeção (Próxima Insígnia)
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
                      <span className="leading-relaxed">
                        Ação sugerida:{' '}
                        <strong className="text-foreground font-semibold">{rec.target}</strong>
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
