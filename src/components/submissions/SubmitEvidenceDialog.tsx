import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { UploadCloud, AlertCircle } from 'lucide-react'
import { useState } from 'react'
import useSubmissionsStore from '@/stores/useSubmissionsStore'

interface Props {
  isOpen: boolean
  onClose: () => void
  item: { title: string; points: number; nivel: string } | null
}

export function SubmitEvidenceDialog({ isOpen, onClose, item }: Props) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const { addSubmission } = useSubmissionsStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (item) {
        const isTitulation =
          item.title.toLowerCase().includes('graduação') ||
          item.title.toLowerCase().includes('mestrado') ||
          item.title.toLowerCase().includes('doutorado')

        await addSubmission({
          title: item.title,
          nivel: item.nivel,
          points: item.points,
          type: isTitulation ? 'titulation' : 'competency',
        })
      }
      toast({
        title: 'Evidência enviada com sucesso!',
        description: `A equipe de avaliação analisará sua submissão para "${item?.title}".`,
      })
      onClose()
    } catch (err) {
      toast({
        title: 'Erro ao enviar',
        description: 'Tente novamente mais tarde.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  if (!item) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[550px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-xl">Submeter Evidências</DialogTitle>
            <DialogDescription className="mt-2">
              Envie documentos que evidenciem sua atuação em <strong>{item.title}</strong> (Eixo de
              Referência: {item.nivel}). Ao ser validado, você receberá até{' '}
              <strong className="text-accent">{item.points} pts</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-md p-3 mt-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800 dark:text-amber-400">
              <strong>Informação:</strong> A pontuação não é cumulativa. O envio da maior titulação
              substitui automaticamente as pontuações anteriores.
            </p>
          </div>

          <div className="grid gap-6 py-6 pt-4">
            <div className="space-y-2">
              <Label htmlFor="link">Link Externo (Opcional)</Label>
              <Input id="link" placeholder="Ex: https://meu-artigo-publicado.com" />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="file"
                className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed rounded-lg cursor-pointer bg-muted/20 hover:bg-muted/40 transition-all border-muted-foreground/30 hover:border-primary/50 group"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <UploadCloud className="w-10 h-10 mb-3 text-muted-foreground group-hover:text-primary transition-colors" />
                  <p className="mb-2 text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">Clique para anexar</span> ou
                    arraste e solte
                  </p>
                  <p className="text-xs text-muted-foreground/80">PDF, PNG, JPG (Max. 10MB)</p>
                </div>
                <Input id="file" type="file" className="hidden" accept=".pdf,.png,.jpg" />
              </Label>
            </div>
            <div className="space-y-2">
              <Label htmlFor="desc">Detalhes da Atuação</Label>
              <Textarea
                id="desc"
                placeholder="Descreva brevemente o impacto gerado por esta atividade..."
                className="resize-none h-24"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Enviando...' : 'Submeter Evidências'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
