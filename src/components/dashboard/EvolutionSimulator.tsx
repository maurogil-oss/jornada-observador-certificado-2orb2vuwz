import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, Clock } from 'lucide-react'
import useGameStore from '@/stores/useGameStore'

export function EvolutionSimulator() {
  const { niveisProgress } = useGameStore()

  return (
    <Card className="shadow-subtle border-border/60">
      <CardHeader>
        <CardTitle className="text-lg">Jornada de Evolução</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {niveisProgress.map((nivel) => (
          <div
            key={nivel.id}
            className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-card hover:bg-muted/10 transition-colors"
          >
            <div>
              <p className="font-bold text-base text-foreground">{nivel.name}</p>
              <p className="text-sm text-muted-foreground mt-0.5 font-medium">
                {nivel.points} pontos acumulados
              </p>
            </div>
            {nivel.status === 'Concluído' ? (
              <span className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-full">
                <CheckCircle2 className="w-4 h-4 mr-1.5" /> Concluído
              </span>
            ) : nivel.status === 'Em Andamento' ? (
              <span className="flex items-center text-xs font-bold text-amber-600 bg-amber-500/10 px-2.5 py-1 rounded-full">
                <Clock className="w-4 h-4 mr-1.5" /> Em Andamento
              </span>
            ) : (
              <span className="text-xs font-bold text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                Pendente
              </span>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
