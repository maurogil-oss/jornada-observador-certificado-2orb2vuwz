import { useState, useRef } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { CheckCircle2, Clock, AlertCircle, Edit2, Trash2, UploadCloud } from 'lucide-react'
import useSubmissionsStore, { Submission } from '@/stores/useSubmissionsStore'
import { useToast } from '@/hooks/use-toast'
import { extractFieldErrors } from '@/lib/pocketbase/errors'

export function SubmissionsHistory() {
  const { submissions, editSubmission, deleteSubmission } = useSubmissionsStore()
  const { toast } = useToast()

  const [editingSub, setEditingSub] = useState<Submission | null>(null)
  const [deletingSub, setDeletingSub] = useState<Submission | null>(null)

  const [editTitle, setEditTitle] = useState('')
  const [editType, setEditType] = useState('competency')
  const [editLink, setEditLink] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [editNivel, setEditNivel] = useState('')
  const [editFile, setEditFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const fileInputRef = useRef<HTMLInputElement>(null)

  const openEdit = (sub: Submission) => {
    setEditingSub(sub)
    setEditTitle(sub.title)
    setEditType(sub.type || 'competency')
    setEditLink(sub.link || '')
    setEditDesc(sub.description || '')
    setEditNivel(sub.nivel || '')
    setEditFile(null)
    setFieldErrors({})
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingSub) return
    setIsSubmitting(true)
    setFieldErrors({})
    try {
      await editSubmission(editingSub.id, {
        title: editTitle !== editingSub.title ? editTitle : undefined,
        type: editType !== editingSub.type ? editType : undefined,
        link: editLink !== editingSub.link ? editLink : undefined,
        description: editDesc !== editingSub.description ? editDesc : undefined,
        nivel: editNivel !== editingSub.nivel ? editNivel : undefined,
        file: editFile || undefined,
      })
      toast({ title: 'Submissão atualizada com sucesso!' })
      setEditingSub(null)
    } catch (error) {
      const errs = extractFieldErrors(error)
      if (Object.keys(errs).length > 0) {
        setFieldErrors(errs)
        toast({
          title: 'Erro de validação',
          description: 'Verifique os campos preenchidos',
          variant: 'destructive',
        })
      } else {
        toast({ title: 'Erro ao atualizar', variant: 'destructive' })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deletingSub) return
    setIsSubmitting(true)
    try {
      await deleteSubmission(deletingSub.id)
      toast({ title: 'Submissão excluída.' })
      setDeletingSub(null)
    } catch (error) {
      toast({ title: 'Erro ao excluir', variant: 'destructive' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Aprovado':
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-500 dark:hover:bg-green-900/50 border-0 font-medium px-2.5 py-0.5">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Aprovado
          </Badge>
        )
      case 'Em Análise':
        return (
          <Badge
            variant="secondary"
            className="bg-amber-100 text-amber-800 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-500 dark:hover:bg-amber-900/50 border-0 font-medium px-2.5 py-0.5"
          >
            <Clock className="w-3.5 h-3.5 mr-1.5" /> Em Análise
          </Badge>
        )
      case 'Ajuste Necessário':
        return (
          <Badge
            variant="destructive"
            className="bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-500 dark:hover:bg-red-900/50 border-0 font-medium px-2.5 py-0.5"
          >
            <AlertCircle className="w-3.5 h-3.5 mr-1.5" /> Ajuste Necessário
          </Badge>
        )
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <>
      <Card className="shadow-subtle border-border/60">
        <CardHeader className="bg-muted/30 border-b border-border/50">
          <CardTitle>Meu Histórico de Submissões</CardTitle>
          <CardDescription>
            Acompanhe suas evidências submetidas e seus respectivos status na curadoria.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/10">
              <TableRow>
                <TableHead className="pl-6">Data</TableHead>
                <TableHead>Colaborador</TableHead>
                <TableHead>Título da Evidência</TableHead>
                <TableHead>Nível Referência</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Pontos</TableHead>
                <TableHead className="text-right pr-6">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    Nenhuma submissão encontrada.
                  </TableCell>
                </TableRow>
              ) : (
                submissions.map((sub) => (
                  <TableRow key={sub.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-medium text-muted-foreground pl-6">
                      {sub.date}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {sub.fullName || sub.user || 'Usuário não identificado'}
                        </span>
                        {sub.nickname && (
                          <span className="text-xs text-muted-foreground">{sub.nickname}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold max-w-[250px] truncate" title={sub.title}>
                        {sub.title}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        Tipo:{' '}
                        {sub.type === 'titulation'
                          ? 'Titulação'
                          : sub.type === 'competency'
                            ? 'Competência'
                            : 'Outros'}
                      </div>
                      {sub.feedback && (
                        <div
                          className="text-xs text-muted-foreground mt-1 max-w-[250px] line-clamp-2"
                          title={sub.feedback}
                        >
                          <span className="font-medium text-foreground">Feedback:</span>{' '}
                          {sub.feedback}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        {sub.axis}
                      </span>
                    </TableCell>
                    <TableCell>{getStatusBadge(sub.status)}</TableCell>
                    <TableCell className="text-right font-bold text-accent">
                      {sub.points !== '-' ? (
                        `+${sub.points}`
                      ) : (
                        <span className="text-muted-foreground/50">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      {sub.status !== 'Aprovado' && (
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/50"
                            onClick={() => openEdit(sub)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/50"
                            onClick={() => setDeletingSub(sub)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!editingSub} onOpenChange={(open) => !open && setEditingSub(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handleEditSubmit}>
            <DialogHeader>
              <DialogTitle>Editar Submissão</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto px-1">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Título</Label>
                <Input
                  id="edit-title"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  required
                  className={fieldErrors.title ? 'border-red-500' : ''}
                />
                {fieldErrors.title && <p className="text-xs text-red-500">{fieldErrors.title}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-type">Tipo</Label>
                <Select value={editType} onValueChange={setEditType}>
                  <SelectTrigger
                    id="edit-type"
                    className={fieldErrors.type ? 'border-red-500' : ''}
                  >
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="titulation">Titulação</SelectItem>
                    <SelectItem value="competency">Competência</SelectItem>
                    <SelectItem value="other">Outros</SelectItem>
                  </SelectContent>
                </Select>
                {fieldErrors.type && <p className="text-xs text-red-500">{fieldErrors.type}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-nivel">Nível Referência</Label>
                <Input
                  id="edit-nivel"
                  value={editNivel}
                  onChange={(e) => setEditNivel(e.target.value)}
                  placeholder="Ex: Nível I"
                  className={fieldErrors.nivel ? 'border-red-500' : ''}
                />
                {fieldErrors.nivel && <p className="text-xs text-red-500">{fieldErrors.nivel}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-desc">Descrição</Label>
                <Textarea
                  id="edit-desc"
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  placeholder="Detalhes da atividade..."
                  className={`resize-none h-20 ${fieldErrors.description ? 'border-red-500' : ''}`}
                />
                {fieldErrors.description && (
                  <p className="text-xs text-red-500">{fieldErrors.description}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-link">Link Externo</Label>
                <Input
                  id="edit-link"
                  value={editLink}
                  onChange={(e) => setEditLink(e.target.value)}
                  placeholder="https://..."
                  className={fieldErrors.link ? 'border-red-500' : ''}
                />
                {fieldErrors.link && <p className="text-xs text-red-500">{fieldErrors.link}</p>}
              </div>
              <div className="space-y-2">
                <Label>Substituir Arquivo de Evidência</Label>
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
                      setEditFile(e.dataTransfer.files[0])
                    }
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-all ${isDragging ? 'border-primary bg-primary/10' : 'bg-muted/20 hover:bg-muted/40 border-muted-foreground/30'} group`}
                >
                  <div className="flex flex-col items-center justify-center pt-4 pb-4">
                    <UploadCloud className="w-8 h-8 mb-2 text-muted-foreground group-hover:text-primary transition-colors" />
                    <p className="text-sm text-center px-4">
                      {editFile ? (
                        <span className="font-semibold">{editFile.name}</span>
                      ) : (
                        'Arraste ou clique para novo arquivo'
                      )}
                    </p>
                  </div>
                  <Input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept=".pdf,.png,.jpg"
                    onChange={(e) => {
                      if (e.target.files?.length) setEditFile(e.target.files[0])
                    }}
                  />
                </div>
                {fieldErrors.file && <p className="text-xs text-red-500">{fieldErrors.file}</p>}
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingSub(null)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting || !editTitle}>
                {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletingSub} onOpenChange={(open) => !open && setDeletingSub(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Submissão?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir "{deletingSub?.title}"? Esta ação não pode ser
              desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleDeleteConfirm()
              }}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Excluindo...' : 'Sim, excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
