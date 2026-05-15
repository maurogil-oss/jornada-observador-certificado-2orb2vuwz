import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Info, Loader2, Link as LinkIcon, AlertCircle, HelpCircle } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useToast } from '@/hooks/use-toast'
import pb from '@/lib/pocketbase/client'
import useAuthStore from '@/stores/useAuthStore'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'

interface Props {
  isOpen: boolean
  onClose: () => void
  item: { title: string; points: number; nivel: string } | null
}

export function SubmitEvidenceDialog({ isOpen, onClose, item }: Props) {
  const { user } = useAuthStore()
  const { toast } = useToast()

  const [loading, setLoading] = useState(false)
  const [metadata, setMetadata] = useState<any>(null)
  const [fetchingMeta, setFetchingMeta] = useState(false)

  const [type, setType] = useState('titulation')
  const [link, setLink] = useState('')
  const [description, setDescription] = useState('')
  const [file, setFile] = useState<File | null>(null)

  useEffect(() => {
    if (isOpen && item) {
      setFetchingMeta(true)
      // Fetch metadata from activities_metadata collection
      pb.collection('activities_metadata')
        .getFirstListItem(`title="${item.title}"`)
        .then((record) => {
          setMetadata(record)
        })
        .catch((err) => {
          console.warn('Metadata not found for this activity')
          setMetadata(null)
        })
        .finally(() => {
          setFetchingMeta(false)
        })
    } else {
      setMetadata(null)
      setType('titulation')
      setLink('')
      setDescription('')
      setFile(null)
    }
  }, [isOpen, item])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!item || !user) return

    if (!file && !link) {
      toast({
        title: 'Evidência necessária',
        description: 'Forneça um arquivo ou um link como evidência.',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('title', item.title)
      formData.append('nivel', item.nivel)
      formData.append('status', 'Em Análise')
      formData.append('user_id', user.id)
      formData.append('type', type)
      formData.append('description', description)

      if (link) formData.append('link', link)
      if (file) formData.append('file', file)

      await pb.collection('submissions').create(formData)

      toast({
        title: 'Sucesso',
        description: 'Sua evidência foi submetida e está em análise.',
      })
      onClose()
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Ocorreu um erro ao enviar.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  // Filter out specific phrases as requested
  const cleanText = (text: string) => {
    if (!text) return text
    let cleaned = text.replace(/você pode enviar múltiplas evidências/gi, '')
    cleaned = cleaned.replace(/Detalhes da atuação:?/gi, '')
    return cleaned.trim()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b bg-muted/30">
          <DialogTitle className="text-xl font-bold leading-tight">Submeter Evidência</DialogTitle>
          <DialogDescription className="mt-1.5 text-base font-medium text-foreground">
            {item?.title}
          </DialogDescription>
        </div>

        <ScrollArea className="px-6 py-4 flex-1">
          <div className="space-y-6">
            {fetchingMeta ? (
              <div className="flex items-center justify-center p-6 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                Carregando informações da atividade...
              </div>
            ) : metadata ? (
              <Alert className="bg-primary/5 border-primary/20 text-primary-foreground">
                <Info className="h-5 w-5 text-primary" />
                <AlertTitle className="text-primary font-semibold mb-2">
                  Requisitos da Atividade
                </AlertTitle>
                <AlertDescription className="text-foreground/90 space-y-3 mt-2 text-sm leading-relaxed">
                  {metadata.definition && cleanText(metadata.definition) && (
                    <div>
                      <strong className="block text-primary/80 mb-0.5">Definição:</strong>
                      {cleanText(metadata.definition)}
                    </div>
                  )}
                  {metadata.required_evidence && cleanText(metadata.required_evidence) && (
                    <div>
                      <strong className="block text-primary/80 mb-0.5">
                        Evidência Necessária:
                      </strong>
                      {cleanText(metadata.required_evidence)}
                    </div>
                  )}
                  {metadata.max_limit && cleanText(metadata.max_limit) && (
                    <div>
                      <strong className="block text-primary/80 mb-0.5">Limite Máximo:</strong>
                      {cleanText(metadata.max_limit)}
                    </div>
                  )}
                  <div>
                    <strong className="block text-primary/80 mb-0.5">Pontuação:</strong>
                    <Badge
                      variant="secondary"
                      className="bg-primary/10 text-primary hover:bg-primary/20 font-mono"
                    >
                      {metadata.points || item?.points} pts
                    </Badge>
                  </div>
                </AlertDescription>
              </Alert>
            ) : (
              <Alert className="bg-muted border-muted">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Informação</AlertTitle>
                <AlertDescription>
                  Esta atividade vale {item?.points} pts. Preencha os campos abaixo para submeter
                  sua evidência.
                </AlertDescription>
              </Alert>
            )}

            <form id="evidence-form" onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="type" className="font-semibold">
                    Tipo de Evidência
                  </Label>
                  <Tooltip>
                    <TooltipTrigger type="button" tabIndex={-1}>
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs font-normal text-sm">
                        <strong>Titulação:</strong> Certificados, diplomas e cursos.
                        <br />
                        <strong>Competência:</strong> Ações práticas, palestras e eventos.
                        <br />
                        <strong>Outro:</strong> Atividades diversas.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger id="type" className="w-full">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="titulation">Titulação / Formação</SelectItem>
                    <SelectItem value="competency">Competência / Atuação</SelectItem>
                    <SelectItem value="other">Outro / Diversos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4 bg-muted/30 p-4 rounded-lg border border-border/50">
                <div className="space-y-2">
                  <Label htmlFor="file" className="font-semibold">
                    Arquivo (Opcional se houver link)
                  </Label>
                  <Input
                    id="file"
                    type="file"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="cursor-pointer file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                  />
                </div>

                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border/50" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-muted/30 px-2 text-muted-foreground rounded-full">
                      Ou / E
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="link" className="font-semibold">
                    Link (Opcional se houver arquivo)
                  </Label>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="link"
                      type="url"
                      placeholder="https://..."
                      className="pl-9"
                      value={link}
                      onChange={(e) => setLink(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="font-semibold">
                  Descrição / Observações (Opcional)
                </Label>
                <Textarea
                  id="description"
                  rows={3}
                  className="resize-none"
                  placeholder="Adicione detalhes adicionais que facilitem a avaliação..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </form>
          </div>
        </ScrollArea>

        <div className="px-6 py-4 border-t bg-muted/10 flex justify-end gap-3 mt-auto">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" form="evidence-form" disabled={loading} className="min-w-[150px]">
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            {loading ? 'Enviando...' : 'Enviar Evidência'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
