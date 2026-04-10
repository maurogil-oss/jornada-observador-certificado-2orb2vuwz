import { Card, CardContent } from '@/components/ui/card'
import { Trophy, FileText, Star } from 'lucide-react'
import useAuthStore from '@/stores/useAuthStore'
import useSubmissionsStore from '@/stores/useSubmissionsStore'

export function HighlightsMural() {
  const { user } = useAuthStore()
  const { submissions } = useSubmissionsStore()

  const totalPoints = user?.points || 0
  const level = user?.level || 'Nível I - Observador Certificado (Iniciante)'
  const totalSubmissions = submissions.length
  const approvedSubmissions = submissions.filter((s) => s.status === 'Aprovado').length

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <Card className="shadow-sm border-border/60">
        <CardContent className="p-6 flex items-center gap-4">
          <div className="p-3 bg-primary/10 text-primary rounded-full shrink-0">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Pontuação Total</p>
            <p className="text-2xl font-bold">{totalPoints} pts</p>
          </div>
        </CardContent>
      </Card>
      <Card className="shadow-sm border-border/60">
        <CardContent className="p-6 flex items-center gap-4">
          <div className="p-3 bg-secondary/10 text-secondary rounded-full shrink-0">
            <Star className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Nível Atual</p>
            <p className="text-base sm:text-lg font-bold leading-tight line-clamp-2">{level}</p>
          </div>
        </CardContent>
      </Card>
      <Card className="shadow-sm border-border/60">
        <CardContent className="p-6 flex items-center gap-4">
          <div className="p-3 bg-accent/10 text-accent rounded-full shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Submissões Aprovadas</p>
            <p className="text-2xl font-bold">
              {approvedSubmissions} / {totalSubmissions}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
