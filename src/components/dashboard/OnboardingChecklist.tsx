import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, Circle } from 'lucide-react'
import useAuthStore from '@/stores/useAuthStore'
import pb from '@/lib/pocketbase/client'
import { Progress } from '@/components/ui/progress'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export function OnboardingChecklist() {
  const { user } = useAuthStore()
  const [hasSubmission, setHasSubmission] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    pb.collection('submissions')
      .getFirstListItem(`user_id="${user.id}"`)
      .then(() => setHasSubmission(true))
      .catch(() => setHasSubmission(false))
      .finally(() => setLoading(false))
  }, [user])

  if (!user || loading || user.role === 'admin') return null

  const isProfileComplete = !!(user.full_name && user.cpf_document && user.city)
  const hasReadManual = localStorage.getItem(`manual_read_${user.id}`) === 'true'

  const total = 3
  const completed = [isProfileComplete, hasReadManual, hasSubmission].filter(Boolean).length
  const progress = Math.round((completed / total) * 100)

  if (completed === total) return null

  return (
    <Card className="mb-8 border-primary/20 bg-primary/5 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Complete sua Configuração Inicial</span>
          <span className="text-sm font-normal text-muted-foreground">{progress}%</span>
        </CardTitle>
        <Progress value={progress} className="h-2" />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            {isProfileComplete ? (
              <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
            ) : (
              <Circle className="w-5 h-5 text-muted-foreground shrink-0" />
            )}
            <div className="flex-1">
              <p className="text-sm font-medium">Completar Perfil</p>
              {!isProfileComplete && (
                <Button variant="link" className="h-auto p-0 text-xs" asChild>
                  <Link to="/perfil">Preencher dados</Link>
                </Button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {hasReadManual ? (
              <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
            ) : (
              <Circle className="w-5 h-5 text-muted-foreground shrink-0" />
            )}
            <div className="flex-1">
              <p className="text-sm font-medium">Conhecer as Regras</p>
              {!hasReadManual && (
                <Button variant="link" className="h-auto p-0 text-xs" asChild>
                  <Link to="/guia">Ler Guia da Jornada</Link>
                </Button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {hasSubmission ? (
              <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
            ) : (
              <Circle className="w-5 h-5 text-muted-foreground shrink-0" />
            )}
            <div className="flex-1">
              <p className="text-sm font-medium">Primeira Submissão</p>
              {!hasSubmission && (
                <Button variant="link" className="h-auto p-0 text-xs" asChild>
                  <Link to="/submissoes">Enviar evidência</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
