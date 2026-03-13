import { DonutChart } from '@/components/shared/DonutChart'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import useGameStore from '@/stores/useGameStore'
import { ArrowRight, Trophy } from 'lucide-react'
import { Link } from 'react-router-dom'

export function HeroProgress() {
  const { levelName, points } = useGameStore()
  const nextLevelPoints = 2000
  const progressToNext = Math.min(100, Math.round((points / nextLevelPoints) * 100))

  return (
    <Card className="bg-secondary text-secondary-foreground overflow-hidden relative border-none shadow-elevation">
      <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
        <Trophy size={200} />
      </div>
      <CardContent className="p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 relative z-10">
        <DonutChart
          progress={progressToNext}
          size={160}
          strokeWidth={12}
          className="text-primary-foreground drop-shadow-lg shrink-0"
        />
        <div className="space-y-4 text-center md:text-left">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Maturidade: <span className="text-accent">{levelName}</span>
          </h2>
          <p className="text-secondary-foreground/80 text-lg max-w-xl">
            Você possui <strong>{points} pontos</strong> de impacto institucional. Faltam{' '}
            {nextLevelPoints - points} pontos para desbloquear a próxima insígnia estratégica.
          </p>
          <Button
            asChild
            variant="secondary"
            className="mt-4 bg-background text-foreground hover:bg-background/90 font-bold h-11 px-6 shadow-sm"
          >
            <Link to="/eixos">
              Ver Missões e Evoluir <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
