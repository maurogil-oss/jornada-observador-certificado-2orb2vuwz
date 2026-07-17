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
import { useEffect } from 'react'
import { Download, Loader2, Award, Mail } from 'lucide-react'
import useAuthStore from '@/stores/useAuthStore'
import {
  downloadCertificate,
  emailCertificate,
  getCertificateTemplates,
} from '@/services/certificates'
import { useToast } from '@/hooks/use-toast'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { getUserLevelIndex, normalizeString } from '@/lib/utils'

const LEVELS = ['Nível I', 'Nível II', 'Nível III']

export function CertificatesModal() {
  const { user } = useAuthStore()
  const { toast } = useToast()
  const [loadingPdf, setLoadingPdf] = useState<string | null>(null)
  const [loadingEmail, setLoadingEmail] = useState<string | null>(null)
  const [templates, setTemplates] = useState<any[]>([])

  useEffect(() => {
    getCertificateTemplates()
      .then(setTemplates)
      .catch(() => {})
  }, [])

  const userIndex = getUserLevelIndex(user)
  const handleDownload = async (level: string) => {
    setLoadingPdf(level)
    try {
      await downloadCertificate(level)
      toast({ title: 'Sucesso', description: 'Certificado gerado com sucesso.' })
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao gerar certificado.',
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
      toast({ title: 'Sucesso', description: 'Certificado enviado para o seu e-mail.' })
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao enviar certificado.',
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
            Baixe os certificados dos níveis que você já alcançou.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          {LEVELS.map((level, idx) => {
            const hasAccess = userIndex >= idx
            const hasTemplate = templates.some(
              (t) =>
                normalizeString(t.level) === normalizeString(level) &&
                !t.file.includes('placeholder_template'),
            )
            const isAvailable = hasAccess && hasTemplate

            return (
              <div
                key={level}
                className={`flex items-center justify-between p-4 border rounded-lg transition-colors ${hasAccess ? 'bg-background' : 'bg-muted opacity-60'}`}
              >
                <div>
                  <h4 className="font-semibold">{level}</h4>
                  <p className="text-sm text-muted-foreground">
                    {!hasAccess
                      ? 'Bloqueado'
                      : !hasTemplate
                        ? 'É preciso antes selecionar o Modelo'
                        : 'Disponível'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={!isAvailable || loadingPdf === level}
                          onClick={() => handleDownload(level)}
                          className="mr-2"
                        >
                          {loadingPdf === level ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Download className="w-4 h-4 mr-2" />
                          )}
                          Baixar PDF
                        </Button>
                      </div>
                    </TooltipTrigger>
                    {!hasTemplate && hasAccess && (
                      <TooltipContent>É preciso antes selecionar o Modelo</TooltipContent>
                    )}
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={!isAvailable || loadingEmail === level}
                          onClick={() => handleEmail(level)}
                        >
                          {loadingEmail === level ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Mail className="w-4 h-4 mr-2" />
                          )}
                          Enviar por E-mail
                        </Button>
                      </div>
                    </TooltipTrigger>
                    {!hasTemplate && hasAccess && (
                      <TooltipContent>É preciso antes selecionar o Modelo</TooltipContent>
                    )}
                  </Tooltip>
                </div>
              </div>
            )
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
}
