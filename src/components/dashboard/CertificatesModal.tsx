import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Download, Mail, Loader2, Award } from 'lucide-react'
import useAuthStore from '@/stores/useAuthStore'
import { downloadCertificate, emailCertificate } from '@/services/certificates'
import { useToast } from '@/hooks/use-toast'

const LEVELS = ['Nível I', 'Nível II', 'Nível III']

const getUserLevelIndex = (lvl?: string) => {
  if (lvl?.includes('Nível III') || lvl?.includes('Mobilizador')) return 2
  if (lvl?.includes('Nível II') || lvl?.includes('Multiplicador')) return 1
  if (lvl?.includes('Nível I') || lvl?.includes('Local')) return 0
  return -1
}

export function CertificatesModal() {
  const { user } = useAuthStore()
  const { toast } = useToast()
  const [loadingPdf, setLoadingPdf] = useState<string | null>(null)
  const [loadingEmail, setLoadingEmail] = useState<string | null>(null)

  const userIndex = getUserLevelIndex(user?.level)

  const handleDownload = async (level: string) => {
    setLoadingPdf(level)
    try {
      await downloadCertificate(level)
      toast({ title: 'Sucesso', description: 'Certificado baixado com sucesso.' })
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao gerar PDF do certificado.',
        variant: 'destructive',
      })
    } finally {
      setLoadingPdf(null)
    }
  }

  const handleEmail = async (level: string) => {
    setLoadingEmail(level)
    try {
      await emailCertificate(level)
      toast({ title: 'Sucesso', description: 'Certificado enviado com sucesso para seu e-mail.' })
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao enviar certificado por e-mail.',
        variant: 'destructive',
      })
    } finally {
      setLoadingEmail(null)
    }
  }

  if (userIndex < 0) return null

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-amber-600 hover:bg-amber-700 text-white shadow-md self-start">
          <Award className="w-4 h-4 mr-2" />
          <span>Meus Certificados</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Meus Certificados</DialogTitle>
          <DialogDescription>
            Baixe ou envie por e-mail os certificados dos níveis que você já alcançou.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          {LEVELS.map((level, idx) => {
            const hasAccess = userIndex >= idx
            return (
              <div
                key={level}
                className={`flex items-center justify-between p-4 border rounded-lg transition-colors ${hasAccess ? 'bg-background' : 'bg-muted opacity-60'}`}
              >
                <div>
                  <h4 className="font-semibold">{level}</h4>
                  <p className="text-sm text-muted-foreground">
                    {hasAccess ? 'Disponível' : 'Bloqueado'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!hasAccess || loadingEmail === level || loadingPdf === level}
                    onClick={() => handleDownload(level)}
                    title="Baixar PDF"
                  >
                    {loadingPdf === level ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!hasAccess || loadingEmail === level || loadingPdf === level}
                    onClick={() => handleEmail(level)}
                    title="Enviar por E-mail"
                  >
                    {loadingEmail === level ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Mail className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
}
