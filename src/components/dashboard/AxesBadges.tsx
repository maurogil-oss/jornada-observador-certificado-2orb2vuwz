import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import useSubmissionsStore from '@/stores/useSubmissionsStore'

export function AxesBadges() {
  const { submissions } = useSubmissionsStore()

  const titulationPoints = submissions
    .filter((s) => s.status === 'Aprovado' && s.type === 'titulation')
    .reduce(
      (acc, curr) =>
        acc + (typeof curr.points === 'number' ? curr.points : Number(curr.points) || 0),
      0,
    )

  const competencyPoints = submissions
    .filter((s) => s.status === 'Aprovado' && s.type === 'competency')
    .reduce(
      (acc, curr) =>
        acc + (typeof curr.points === 'number' ? curr.points : Number(curr.points) || 0),
      0,
    )

  const otherPoints = submissions
    .filter((s) => s.status === 'Aprovado' && s.type === 'other')
    .reduce(
      (acc, curr) =>
        acc + (typeof curr.points === 'number' ? curr.points : Number(curr.points) || 0),
      0,
    )

  return (
    <Card className="shadow-subtle border-border/60">
      <CardHeader>
        <CardTitle className="text-lg">Progresso por Eixos (Submissões Aprovadas)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium text-foreground">Titulação e Formação</span>
            <span className="text-muted-foreground font-semibold">
              {titulationPoints} / 200 pts
            </span>
          </div>
          <Progress value={Math.min((titulationPoints / 200) * 100, 100)} className="h-2" />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium text-foreground">Competência Técnica</span>
            <span className="text-muted-foreground font-semibold">
              {competencyPoints} / 300 pts
            </span>
          </div>
          <Progress
            value={Math.min((competencyPoints / 300) * 100, 100)}
            className="h-2 [&>div]:bg-secondary"
          />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium text-foreground">Atuação Externa e Impacto</span>
            <span className="text-muted-foreground font-semibold">{otherPoints} / 500 pts</span>
          </div>
          <Progress
            value={Math.min((otherPoints / 500) * 100, 100)}
            className="h-2 [&>div]:bg-accent"
          />
        </div>
      </CardContent>
    </Card>
  )
}
