import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import useAuthStore from '@/stores/useAuthStore'
import { updateUser } from '@/services/users'
import pb from '@/lib/pocketbase/client'
import { Rocket, Target, TrendingUp, HelpCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export function WelcomeModal() {
  const { user } = useAuthStore()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user && !user.onboarding_completed && user.role !== 'admin') {
      setOpen(true)
    }
  }, [user])

  const handleNext = () => setStep((s) => s + 1)
  const handlePrev = () => setStep((s) => s - 1)

  const handleFinish = async () => {
    if (!user) return

    setLoading(true)
    try {
      await updateUser(user.id, { onboarding_completed: true })
      await pb.collection('users').authRefresh()
      setOpen(false)
    } catch (err) {
      console.error('Failed to update onboarding status', err)
      toast({
        title: 'Erro ao concluir',
        description: 'Ocorreu um problema ao salvar seu progresso. Tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  if (!user || user.role === 'admin') return null

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="sm:max-w-[500px] [&>button]:hidden"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">
            {step === 1 && 'Bem-vindo à Jornada!'}
            {step === 2 && 'Como Pontuar'}
            {step === 3 && 'Evolução de Níveis'}
            {step === 4 && 'Precisa de Ajuda?'}
          </DialogTitle>
          <DialogDescription className="text-center">
            {step === 1 && 'Sua trilha de desenvolvimento começa aqui.'}
            {step === 2 && 'Entenda o registro de atividades.'}
            {step === 3 && 'Avance em sua certificação.'}
            {step === 4 && 'Consulte o manual a qualquer momento.'}
          </DialogDescription>
        </DialogHeader>

        <div className="py-6 flex flex-col items-center justify-center text-center min-h-[200px]">
          {step === 1 && (
            <div className="space-y-4 animate-fade-in-up">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Rocket className="w-8 h-8 text-primary" />
              </div>
              <p className="text-muted-foreground px-4">
                A <strong>Jornada do Observador Certificado</strong> foi criada para considerar seu
                impacto e engajamento. Aqui você registrará suas ações em prol da segurança viária e
                avançará de nível.
              </p>
            </div>
          )}
          {step === 2 && (
            <div className="space-y-4 animate-fade-in-up">
              <div className="mx-auto w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-4">
                <Target className="w-8 h-8 text-blue-500" />
              </div>
              <p className="text-muted-foreground px-4">
                Envie evidências de suas atividades no "Cofre de Evidências". Elas podem ser de{' '}
                <strong>Titulação</strong> (cursos, especializações) ou <strong>Competência</strong>{' '}
                (ações, palestras, eventos).
              </p>
            </div>
          )}
          {step === 3 && (
            <div className="space-y-4 animate-fade-in-up">
              <div className="mx-auto w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mb-4">
                <TrendingUp className="w-8 h-8 text-amber-500" />
              </div>
              <p className="text-muted-foreground px-4">
                Com base nos seus pontos aprovados, você evolui do <strong>Nível I</strong> para o{' '}
                <strong>Nível II (Pleno)</strong> e <strong>Nível III (Mobilizador)</strong>. Seu
                reconhecimento será refletido em seu certificado!
              </p>
            </div>
          )}
          {step === 4 && (
            <div className="space-y-4 animate-fade-in-up">
              <div className="mx-auto w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4">
                <HelpCircle className="w-8 h-8 text-emerald-500" />
              </div>
              <p className="text-muted-foreground px-4">
                No menu lateral, você encontrará o <strong>Guia da Jornada</strong>. Lá estão todas
                as regras de pontuação, limites e detalhes de cada eixo para você consultar quando
                precisar.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="flex items-center justify-between w-full flex-row sm:justify-between">
          <div className="flex gap-1">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all ${
                  step === i ? 'w-6 bg-primary' : 'w-2 bg-muted-foreground/30'
                }`}
              />
            ))}
          </div>
          <div className="flex gap-2">
            {step > 1 && (
              <Button variant="outline" onClick={handlePrev} disabled={loading}>
                Voltar
              </Button>
            )}
            {step < 4 ? (
              <Button onClick={handleNext}>Próximo</Button>
            ) : (
              <Button onClick={handleFinish} disabled={loading}>
                {loading ? 'Salvando...' : 'Começar'}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
