import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import useSubmissionsStore from '@/stores/useSubmissionsStore'
import useAuthStore from '@/stores/useAuthStore'
import { calculateUserPoints } from '@/lib/scoring'

export function AxesBadges() {
  const { submissions } = useSubmissionsStore()
  const { user } = useAuthStore()

  const { eixo1Points, eixo2Points, eixo3Points } = calculateUserPoints(submissions, user?.level)

  return (
    <Card className="shadow-subtle border-border/60">
      <CardHeader>
        <CardTitle className="text-lg">Perfil Curricular</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium text-foreground">E1 - Titulação e Formação</span>
            <span className="text-muted-foreground font-semibold">{eixo1Points} pts</span>
          </div>
          <Progress value={Math.min((eixo1Points / 500) * 100, 100)} className="h-2" />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium text-foreground">E2 - Competência Técnica</span>
            <span className="text-muted-foreground font-semibold">{eixo2Points} pts</span>
          </div>
          <Progress
            value={Math.min((eixo2Points / 1000) * 100, 100)}
            className="h-2 [&>div]:bg-secondary"
          />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium text-foreground">E3 - Atuação Externa e Impacto</span>
            <span className="text-muted-foreground font-semibold">{eixo3Points} pts</span>
          </div>
          <Progress
            value={Math.min((eixo3Points / 1000) * 100, 100)}
            className="h-2 [&>div]:bg-accent"
          />
        </div>
      </CardContent>
    </Card>
  )
}
