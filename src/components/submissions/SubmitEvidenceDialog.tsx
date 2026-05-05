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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/hooks/use-toast'
import { UploadCloud, AlertCircle } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import useSubmissionsStore from '@/stores/useSubmissionsStore'

interface Props {
  isOpen: boolean
  onClose: () => void
  item: { title: string; points: number; nivel: string } | null
}

export function SubmitEvidenceDialog({ isOpen, onClose, item }: Props) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState('')
  const [type, setType] = useState('competency')
  const [file, setFile] = useState<File | null>(null)
  const [link, setLink] = useState('')
  const [desc, setDesc] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { addSubmission } = useSubmissionsStore()

  const handleFileSelect = (selectedFile: File) => {
    const MAX_FILE_SIZE = 20 * 1024 * 1024 // 20MB
    const ACCEPTED_TYPES = ['application/pdf', 'image/jpeg', 'image/png']

    if (!ACCEPTED_TYPES.includes(selectedFile.type)) {
      toast({
        title: 'Formato inválido',
        description: 'Formatos aceitos: PDF, JPG ou PNG.',
        variant: 'destructive',
      })
      return
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      toast({
        title: 'Arquivo muito grande',
        description: 'O tamanho máximo permitido é 20MB.',
        variant: 'destructive',
      })
      return
    }

    setFile(selectedFile)
  }

  useEffect(() => {
    if (isOpen && item) {
      setFile(null)
      setLink('')
      setDesc('')
      setUploadProgress(0)
      setTitle(item.title)

      const isTitulation =
        item.title.toLowerCase().includes('graduação') ||
        item.title.toLowerCase().includes('mestrado') ||
        item.title.toLowerCase().includes('doutorado') ||
        item.title.toLowerCase().includes('pós')

      setType(isTitulation ? 'titulation' : 'competency')
    }
  }, [isOpen, item])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!file && !link) {
      toast({
        title: 'Arquivo ou Link obrigatório',
        description: 'Por favor, forneça um arquivo ou um link de evidência.',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    setUploadProgress(0)

    let fakeProgressInterval: ReturnType<typeof setInterval> | null = null
    if (file) {
      let currentProgress = 0
      fakeProgressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) return prev
          currentProgress = prev + (90 - prev) * 0.15
          return Math.round(currentProgress)
        })
      }, 500)
    }

    try {
      if (item) {
        await addSubmission(
          {
            title: title || item.title,
            nivel: item.nivel,
            points: item.points,
            type: type,
            file: file || undefined,
            link: link || undefined,
            description: desc || undefined,
          },
          (progress) => {
            if (fakeProgressInterval) clearInterval(fakeProgressInterval)
            setUploadProgress(progress)
          },
        )
      }

      if (fakeProgressInterval) clearInterval(fakeProgressInterval)
      setUploadProgress(100)
      toast({
        title: 'Evidência enviada com sucesso!',
        description: `A equipe de avaliação analisará sua submissão para "${item?.title}".`,
      })

      setTimeout(() => {
        onClose()
        setLoading(false)
      }, 500)
    } catch (err) {
      if (fakeProgressInterval) clearInterval(fakeProgressInterval)
      setUploadProgress(0)
      setLoading(false)
      toast({
        title: 'Erro ao realizar o upload',
        description:
          'Erro ao realizar o upload. Por favor, tente novamente. Caso o problema persista, entre em contato com um administrador.',
        variant: 'destructive',
      })
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
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-xl">Submeter Evidências</DialogTitle>
            <DialogDescription className="mt-2">
              Envie documentos que evidenciem sua atuação referenciando{' '}
              <strong>{item.title}</strong> (Certificação: {levelFullName}). Ao ser validado, você
              receberá até <strong className="text-accent">{item.points} pts</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 rounded-md p-3 mt-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-500 shrink-0 mt-0.5" />
            <p className="text-sm text-blue-800 dark:text-blue-400">
              <strong>Informação:</strong> Você pode enviar múltiplas evidências. Certifique-se de
              nomear claramente e enviar documentos legíveis para facilitar a validação pela equipe.
            </p>
          </div>

          <div className="grid gap-6 py-6 pt-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="title">Título da Atividade</Label>
                <span className="text-[10px] uppercase tracking-wider bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-semibold">
                  Definido pelo Sistema
                </span>
              </div>
              <Input
                id="title"
                value={title}
                readOnly
                disabled
                className="bg-muted/50 text-muted-foreground cursor-not-allowed opacity-100"
                required
              />
              <p className="text-xs text-muted-foreground">
                Este campo é fixo de acordo com as regras de pontuação.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="type">Tipo de Evidência</Label>
                <span className="text-[10px] uppercase tracking-wider bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-semibold">
                  Definido pelo Sistema
                </span>
              </div>
              <Select value={type} onValueChange={setType} disabled>
                <SelectTrigger
                  id="type"
                  className="bg-muted/50 text-muted-foreground cursor-not-allowed opacity-100"
                >
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="titulation">Titulação</SelectItem>
                  <SelectItem value="competency">Competência</SelectItem>
                  <SelectItem value="other">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="link">Link Externo</Label>
              <Input
                id="link"
                placeholder="Ex: https://meu-artigo-publicado.com"
                value={link}
                onChange={(e) => setLink(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label className="block text-sm font-medium mb-2">
                Arquivo de Evidência (ou Link)
              </Label>
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
                    const droppedFile = e.dataTransfer.files[0]
                    handleFileSelect(droppedFile)
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
                    <p className="text-xs text-muted-foreground/80">
                      Formatos aceitos: PDF, JPG ou PNG
                    </p>
                  )}
                </div>
                <Input
                  ref={fileInputRef}
                  id="file"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      const selectedFile = e.target.files[0]
                      handleFileSelect(selectedFile)
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
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
              />
            </div>
          </div>
          {loading && uploadProgress > 0 && (
            <div className="py-2 space-y-2 animate-fade-in-up">
              <div className="flex justify-between text-sm text-muted-foreground font-medium">
                <span>Fazendo upload do arquivo...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="w-full h-2" />
            </div>
          )}
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
