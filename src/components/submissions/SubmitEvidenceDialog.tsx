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
import { UploadCloud } from 'lucide-react'
import { useState } from 'react'
import useSubmissionsStore from '@/stores/useSubmissionsStore'

interface Props {
  isOpen: boolean
  onClose: () => void
  item: { title: string; points: number; axis: string } | null
}

export function SubmitEvidenceDialog({ isOpen, onClose, item }: Props) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const { addSubmission } = useSubmissionsStore()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      if (item) {
        addSubmission({ title: item.title, axis: item.axis })
      }
      toast({
        title: 'Comprovação enviada com sucesso!',
        description: `A equipe de avaliação analisará sua submissão para "${item?.title}".`,
      })
      onClose()
    }, 1200)
  }

  if (!item) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[550px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-xl">Submeter Comprovação</DialogTitle>
            <DialogDescription className="mt-2">
              Envie documentos que comprovem sua atuação em <strong>{item.title}</strong> (
              {item.axis}). Ao ser validado, você receberá até{' '}
              <strong className="text-accent">{item.points} pts</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-6">
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
              {loading ? 'Enviando...' : 'Enviar para Análise'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
