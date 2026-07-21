import { DonutChart } from '@/components/shared/DonutChart'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import useGameStore from '@/stores/useGameStore'
import { ArrowRight, Trophy, Clock } from 'lucide-react'
import { Link } from 'react-router-dom'
import useAuthStore from '@/stores/useAuthStore'
import { CertificatesModal } from '@/components/dashboard/CertificatesModal'

export function HeroProgress() {
  const { points, level } = useGameStore()
  const { user } = useAuthStore()

  const isProbationary = (() => {
    if (!user || (user.turma || 15) < 15 || !user.created) return false
    const createdDate = new Date(user.created.replace(' ', 'T'))
    const oneYearAgo = new Date()
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
    return createdDate > oneYearAgo
  })()

  const levelName =
    level === 3
      ? 'Nível III - Observador Certificado Mobilizador'
      : level === 2
        ? 'Nível II - Observador Certificado Pleno'
        : 'Nível I - Observador Certificado'

  const nextLevelPoints = level === 1 ? 500 : level === 2 ? 1000 : 1000
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
        <div className="space-y-4 text-center md:text-left flex-1 min-w-0">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight break-words">
            Maturidade:{' '}
            <span className="text-accent block mt-1 leading-tight text-2xl md:text-3xl lg:text-4xl">
              {levelName}
            </span>
          </h2>
          <div className="space-y-2">
            <p className="text-secondary-foreground/80 text-lg max-w-xl">
              Você possui{' '}
              <strong>
                {points} / {nextLevelPoints} pts
              </strong>{' '}
              de impacto institucional no nível atual. Faltam{' '}
              {Math.max(0, nextLevelPoints - points)} pontos para avançar.
            </p>
            {isProbationary && points >= nextLevelPoints && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 text-amber-700 dark:text-amber-500 rounded-md text-sm font-medium border border-amber-500/20">
                <Clock className="w-4 h-4" />
                No período probatório (1 ano). Seu nível será liberado ao fim do prazo.
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-4 mt-4 justify-center md:justify-start">
            <Button
              asChild
              variant="secondary"
              className="bg-background text-foreground hover:bg-background/90 font-bold h-11 px-6 shadow-sm"
            >
              <Link to="/niveis">
                Ver Missões e Evoluir <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
            <CertificatesModal />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
