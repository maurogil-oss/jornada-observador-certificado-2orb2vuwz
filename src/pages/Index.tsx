import { DonutChart } from '@/components/shared/DonutChart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { principles, axesData, recentActivity } from '@/lib/data'
import useGameStore from '@/stores/useGameStore'
import { ArrowRight, Trophy, Clock, CheckCircle2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

export default function Index() {
  const { levelName, points } = useGameStore()
  const nextLevelPoints = 2000
  const progressToNext = Math.min(100, Math.round((points / nextLevelPoints) * 100))

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in-up">
      {/* Hero Progress Card */}
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
              className="mt-4 bg-background text-foreground hover:bg-background/90 font-bold"
            >
              <Link to="/eixos">
                Ver Missões e Evoluir <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Principles */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
        {principles.map((p) => (
          <Card
            key={p.title}
            className="bg-card/60 hover:bg-card hover:shadow-subtle transition-all duration-300 border-border/50 group"
          >
            <CardContent className="p-4 flex flex-col items-center text-center gap-2">
              <div className="p-3 bg-primary/10 rounded-full text-primary group-hover:scale-110 transition-transform">
                <p.icon className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-sm">{p.title}</h3>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Axes Status */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold">Status dos Eixos</h3>
          <Button variant="link" asChild>
            <Link to="/eixos">Explorar todos</Link>
          </Button>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {axesData.map((eixo) => (
            <Card key={eixo.id} className="hover:shadow-elevation transition-all border-border/60">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-primary/10 rounded-md text-primary">
                    <eixo.icon className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                    Eixo {eixo.id}
                  </span>
                </div>
                <CardTitle className="text-lg leading-tight">{eixo.title}</CardTitle>
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

      <div className="grid md:grid-cols-2 gap-6 pb-8">
        <Card className="shadow-subtle border-border/60">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Trophy className="w-5 h-5 text-accent" /> Missões Recomendadas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { t: 'Submeter Artigo Técnico', p: '+100 pts' },
              { t: 'Registrar Atuação em Evento', p: '+150 pts' },
            ].map((q) => (
              <div
                key={q.t}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 bg-muted/30 rounded-lg border border-border/50 hover:border-accent/40 transition-colors"
              >
                <span className="font-medium text-sm">{q.t}</span>
                <Badge variant="outline" className="text-accent border-accent/30 bg-accent/5">
                  {q.p}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="shadow-subtle border-border/60">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="w-5 h-5 text-muted-foreground" /> Atividade Recente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivity.map((act) => (
              <div key={act.id} className="flex items-start gap-3">
                <div
                  className={cn(
                    'p-1.5 rounded-full mt-0.5',
                    act.type === 'success'
                      ? 'bg-primary/10 text-primary'
                      : 'bg-yellow-500/10 text-yellow-600',
                  )}
                >
                  {act.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <Clock className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium leading-tight">{act.action}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {act.time} &bull;{' '}
                    <span className="font-semibold text-foreground">{act.points}</span>
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
