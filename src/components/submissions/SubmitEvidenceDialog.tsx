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
import { useState, useRef } from 'react'
import useSubmissionsStore from '@/stores/useSubmissionsStore'

interface Props {
  isOpen: boolean
  onClose: () => void
  item: { title: string; points: number; nivel: string } | null
}

export function SubmitEvidenceDialog({ isOpen, onClose, item }: Props) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
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
          file: file || undefined,
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

  const getLevelFullName = (nivel: string) => {
    const n = nivel.toUpperCase()
    if (n.includes('3') || n.includes('III'))
      return 'Nível III - Observador Certificado Mobilizador'
    if (n.includes('2') || n.includes('II')) return 'Nível II - Observador Certificado Pleno'
    if (n.includes('1') || n.includes('I')) return 'Nível I - Observador Certificado'
    return nivel
  }

  const levelFullName = getLevelFullName(item.nivel)

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[550px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-xl">Submeter Evidências</DialogTitle>
            <DialogDescription className="mt-2">
              Envie documentos que evidenciem sua atuação em <strong>{item.title}</strong>{' '}
              (Certificação: {levelFullName}). Ao ser validado, você receberá até{' '}
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
              <Label className="block text-sm font-medium mb-2">Arquivo de Evidência</Label>
              <div
                onDragOver={(e) => {
                  e.preventDefault()
                  setIsDragging(true)
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault()
                  setIsDragging(false)
                  if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                    setFile(e.dataTransfer.files[0])
                  }
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`flex flex-col items-center justify-center w-full h-36 border-2 border-dashed rounded-lg cursor-pointer transition-all ${isDragging ? 'border-primary bg-primary/10' : 'bg-muted/20 hover:bg-muted/40 border-muted-foreground/30 hover:border-primary/50'} group`}
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <UploadCloud
                    className={`w-10 h-10 mb-3 transition-colors ${isDragging ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'}`}
                  />
                  <p className="mb-2 text-sm text-muted-foreground text-center px-4">
                    {file ? (
                      <span className="font-semibold text-foreground">{file.name}</span>
                    ) : (
                      <>
                        <span className="font-semibold text-foreground">Clique para anexar</span> ou
                        arraste e solte
                      </>
                    )}
                  </p>
                  {!file && (
                    <p className="text-xs text-muted-foreground/80">PDF, PNG, JPG (Max. 10MB)</p>
                  )}
                </div>
                <Input
                  ref={fileInputRef}
                  id="file"
                  type="file"
                  className="hidden"
                  accept=".pdf,.png,.jpg"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      setFile(e.target.files[0])
                    }
                  }}
                />
              </div>
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
