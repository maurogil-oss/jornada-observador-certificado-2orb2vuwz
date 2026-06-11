import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Download, Loader2 } from 'lucide-react'
import useAuthStore from '@/stores/useAuthStore'
import { downloadCertificate, getCertificateTemplates } from '@/services/certificates'
import { useToast } from '@/hooks/use-toast'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

const LEVELS = ['Nível I', 'Nível II', 'Nível III']

const getUserLevelIndex = (lvl?: string) => {
  if (lvl?.includes('Nível III') || lvl?.includes('Mobilizador')) return 2
  if (lvl?.includes('Nível II') || lvl?.includes('Multiplicador')) return 1
  if (lvl?.includes('Nível I') || lvl?.includes('Local')) return 0
  return -1
}

export function DownloadCertificateButton() {
  const { user } = useAuthStore()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [templates, setTemplates] = useState<any[]>([])

  useEffect(() => {
    getCertificateTemplates()
      .then(setTemplates)
      .catch(() => {})
  }, [])

  const userIndex = getUserLevelIndex(user?.level)
  const effectiveUserIndex = user?.turma === 15 ? Math.max(userIndex, 0) : userIndex

  if (effectiveUserIndex < 0) return null

  const targetLevel = LEVELS[effectiveUserIndex]
  const hasTemplate = templates.some((t) => t.level === targetLevel)

  const handleDownload = async () => {
    if (!hasTemplate) return
    setLoading(true)
    try {
      await downloadCertificate(targetLevel)
      toast({ title: 'Sucesso', description: 'Certificado baixado com sucesso.' })
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao gerar certificado.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div>
          <Button
            className="bg-green-600 hover:bg-green-700 text-white shadow-md self-start"
            onClick={handleDownload}
            disabled={!hasTemplate || loading}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            Baixar Certificado
          </Button>
        </div>
      </TooltipTrigger>
      {!hasTemplate && (
        <TooltipContent>
          O certificado para o seu nível ({targetLevel}) ainda está sendo preparado pela
          administração.
        </TooltipContent>
      )}
    </Tooltip>
  )
}
