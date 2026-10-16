import { useState } from 'react'
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
  CheckCircle2,
  Clock,
  AlertTriangle,
  Eye,
  FileText,
  UploadCloud,
  XCircle,
  Loader2,
} from 'lucide-react'
import useSubmissionsStore, { Submission } from '@/stores/useSubmissionsStore'
import useAuthStore from '@/stores/useAuthStore'
import { toast } from '@/hooks/use-toast'

export function SubmissionsHistory() {
  const { submissions, updateSubmissionStatus, editSubmission } = useSubmissionsStore()
  const { user: authUser } = useAuthStore()
  const [viewingSub, setViewingSub] = useState<Submission | null>(null)
  const [complementModalSub, setComplementModalSub] = useState<Submission | null>(null)
  const [complementFile, setComplementFile] = useState<File | null>(null)
  const [isSubmittingAction, setIsSubmittingAction] = useState(false)

  const uniqueUsers = Array.from(new Set(submissions.map((s) => s.userId).filter(Boolean)))
  const isSingleUser = uniqueUsers.length === 1
  const isObserver = authUser?.role !== 'admin'

  let showSummary = false
  let validPoints = 0

  if (isObserver) {
    showSummary = true
    validPoints = authUser?.points || 0
  } else if (isSingleUser) {
    showSummary = true
    validPoints = submissions.find((s) => s.userId === uniqueUsers[0])?.userPoints || 0
  }

  const approvedPointsSum = submissions
    .filter((s) => s.status === 'Aprovado' && (isSingleUser ? s.userId === uniqueUsers[0] : true))
    .reduce((sum, s) => {
      const pts = typeof s.points === 'number' ? s.points : Number(s.points) || 0
      return sum + pts
    }, 0)

  const excessPoints = Math.max(0, approvedPointsSum - validPoints)

  const openView = (sub: Submission) => {
    setViewingSub(sub)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Aprovado':
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-500 dark:hover:bg-green-900/50 border-0 font-medium px-2.5 py-0.5">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> <span>Aprovado</span>
          </Badge>
        )
      case 'Em Análise':
        return (
          <Badge
            variant="secondary"
            className="bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-500 dark:hover:bg-blue-900/50 border-0 font-medium px-2.5 py-0.5"
          >
            <Clock className="w-3.5 h-3.5 mr-1.5" /> <span>Em Análise</span>
          </Badge>
        )
      case 'Ajuste Necessário':
      case 'Aguardando Complemento':
        return (
          <Badge
            variant="destructive"
            className="bg-amber-100 text-amber-900 hover:bg-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:hover:bg-amber-900/60 border-amber-300 font-medium px-2.5 py-0.5"
          >
            <AlertTriangle className="w-3.5 h-3.5 mr-1.5 text-amber-600 dark:text-amber-400" />{' '}
            <span>
              {status === 'Aguardando Complemento' ? 'Aguardando Complemento' : 'Ajuste Necessário'}
            </span>
          </Badge>
        )
      case 'Renunciada':
        return (
          <Badge
            variant="outline"
            className="bg-muted text-muted-foreground border-muted-foreground/30 font-medium px-2.5 py-0.5"
          >
            <XCircle className="w-3.5 h-3.5 mr-1.5" /> <span>Renunciada</span>
          </Badge>
        )
      default:
        return (
          <Badge>
            <span>{status}</span>
          </Badge>
        )
    }
  }

  const handleRenounce = async (sub: Submission) => {
    const confirm = window.confirm(
      `Deseja realmente RENUNCIAR à submissão "${sub.title}"? Ela será encerrada sem atribuição de pontos.`,
    )
    if (!confirm) return

    setIsSubmittingAction(true)
    try {
      await updateSubmissionStatus(
        sub.id,
        'Renunciada',
        0,
        'Submissão renunciada pelo próprio observador.',
      )
      toast({
        title: 'Submissão Renunciada',
        description: 'A submissão foi encerrada sem pontuação conforme solicitado.',
      })
    } catch (err: any) {
      toast({
        title: 'Erro ao renunciar',
        description: err.message || 'Não foi possível registrar a renúncia.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmittingAction(false)
    }
  }

  const handleComplementSubmit = async () => {
    if (!complementModalSub || !complementFile) {
      toast({
        title: 'Arquivo obrigatório',
        description: 'Selecione o documento comprobatório para complementar a submissão.',
        variant: 'destructive',
      })
      return
    }

    setIsSubmittingAction(true)
    try {
      await editSubmission(complementModalSub.id, {
        file: complementFile,
      })
      // Coloca status em reanálise para o hook reprocessar automaticamente
      await updateSubmissionStatus(complementModalSub.id, 'Em Análise')
      toast({
        title: 'Complemento Enviado!',
        description: 'O novo documento foi submetido e está passando por reanálise automática.',
      })
      setComplementModalSub(null)
      setComplementFile(null)
    } catch (err: any) {
      toast({
        title: 'Erro ao enviar complemento',
        description: err.message || 'Falha no envio do novo arquivo.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmittingAction(false)
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
                    <span>Nenhuma submissão encontrada.</span>
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
                        <span>Tipo: </span>
                        <span>
                          {sub.type === 'titulation'
                            ? 'Titulação'
                            : sub.type === 'competency'
                              ? 'Competência'
                              : 'Outros'}
                        </span>
                      </div>
                      {(sub.divergence_reason || sub.feedback) && (
                        <div
                          className="text-xs text-amber-800 dark:text-amber-400 mt-1 max-w-[280px] line-clamp-2 bg-amber-50 dark:bg-amber-950/30 p-1 rounded border border-amber-200 dark:border-amber-900/40"
                          title={sub.divergence_reason || sub.feedback}
                        >
                          <span className="font-semibold text-amber-900 dark:text-amber-200">
                            Motivo:{' '}
                          </span>
                          <span>{sub.divergence_reason || sub.feedback}</span>
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
                        <span>{`+${sub.points}`}</span>
                      ) : (
                        <span className="text-muted-foreground/50">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex items-center justify-end gap-1.5">
                        {(sub.status === 'Aguardando Complemento' ||
                          sub.status === 'Ajuste Necessário') && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs border-amber-400 text-amber-800 hover:bg-amber-50 dark:text-amber-300 dark:border-amber-700 dark:hover:bg-amber-950"
                              onClick={() => {
                                setComplementModalSub(sub)
                                setComplementFile(null)
                              }}
                              disabled={isSubmittingAction}
                              title="Enviar novo documento para reanálise"
                            >
                              <UploadCloud className="h-3.5 w-3.5 mr-1" />
                              Complementar
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                              onClick={() => handleRenounce(sub)}
                              disabled={isSubmittingAction}
                              title="Encerrar submissão sem pontos"
                            >
                              <XCircle className="h-3.5 w-3.5 mr-1" />
                              Renunciar
                            </Button>
                          </>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/50"
                          onClick={() => openView(sub)}
                          title="Visualizar"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
        {showSummary && (
          <div className="bg-muted/10 border-t border-border/50 p-6 flex flex-col items-end gap-2 text-sm">
            <div className="flex flex-col gap-2 w-full sm:w-72 bg-card p-4 rounded-md border shadow-sm">
              <div className="flex justify-between items-center w-full">
                <span className="text-muted-foreground font-medium">
                  Total de Pontos Aprovados:
                </span>
                <span className="font-bold text-foreground">{approvedPointsSum}</span>
              </div>
              <div className="flex justify-between items-center w-full">
                <span className="text-muted-foreground font-medium">Pontos Válidos:</span>
                <span className="font-bold text-green-600 dark:text-green-500">{validPoints}</span>
              </div>
              <div className="flex justify-between items-center w-full border-t pt-2 mt-1">
                <span className="text-muted-foreground font-medium">Pontos Excedentes:</span>
                <span className="font-bold text-orange-600 dark:text-orange-500">
                  {excessPoints}
                </span>
              </div>
            </div>
          </div>
        )}
      </Card>

      <Dialog
        key={viewingSub?.id || 'dialog-empty'}
        open={!!viewingSub}
        onOpenChange={(open) => !open && setViewingSub(null)}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Visualizar Submissão</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto px-1">
            <div className="space-y-2">
              <Label htmlFor="view-title">
                <span>Título</span>
              </Label>
              <Input
                id="view-title"
                value={viewingSub?.title || ''}
                readOnly
                disabled
                className="opacity-100 bg-muted/50 text-muted-foreground cursor-not-allowed"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="view-type">
                  <span>Tipo</span>
                </Label>
                <Select value={viewingSub?.type || 'competency'} disabled>
                  <SelectTrigger
                    id="view-type"
                    className="opacity-100 bg-muted/50 text-muted-foreground cursor-not-allowed"
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
                <Label htmlFor="view-score">
                  <span>Pontuação</span>
                </Label>
                <Input
                  id="view-score"
                  value={viewingSub?.points !== '-' ? String(viewingSub?.points) : 'Pendente'}
                  readOnly
                  disabled
                  className="opacity-100 bg-muted/50 text-muted-foreground cursor-not-allowed"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="view-nivel">
                <span>Nível Referência</span>
              </Label>
              <Input
                id="view-nivel"
                value={viewingSub?.nivel || ''}
                readOnly
                disabled
                className="opacity-100 bg-muted/50 text-muted-foreground cursor-not-allowed"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="view-desc">
                <span>Descrição</span>
              </Label>
              <Textarea
                id="view-desc"
                value={viewingSub?.description || ''}
                readOnly
                disabled
                className="resize-none h-20 opacity-100 bg-muted/50 text-muted-foreground cursor-not-allowed"
              />
            </div>
            {viewingSub?.link && (
              <div className="space-y-2">
                <Label htmlFor="view-link">
                  <span>Link Externo</span>
                </Label>
                <Input
                  id="view-link"
                  value={viewingSub.link}
                  readOnly
                  disabled
                  className="opacity-100 bg-muted/50 text-muted-foreground cursor-not-allowed"
                />
              </div>
            )}
            {viewingSub?.fileUrl && (
              <div className="space-y-2 pt-2 border-t flex flex-col gap-2">
                <Label>
                  <span>Arquivo de Evidência</span>
                </Label>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href={viewingSub.fileUrl} target="_blank" rel="noopener noreferrer">
                    <FileText className="w-4 h-4 mr-2" />
                    <span>Visualizar Documento Anexo</span>
                  </a>
                </Button>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setViewingSub(null)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Complementação de Evidência */}
      <Dialog
        open={!!complementModalSub}
        onOpenChange={(open) => {
          if (!open) {
            setComplementModalSub(null)
            setComplementFile(null)
          }
        }}
      >
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UploadCloud className="h-5 w-5 text-amber-600" />
              Complementar Submissão
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="bg-amber-50 dark:bg-amber-950/30 p-3 rounded-lg border border-amber-200 dark:border-amber-900/50 text-xs sm:text-sm">
              <span className="font-semibold text-amber-900 dark:text-amber-200 block mb-1">
                Motivo da Divergência:
              </span>
              <p className="text-muted-foreground">
                {complementModalSub?.divergence_reason ||
                  complementModalSub?.feedback ||
                  'Documento inconsistente ou ilegível.'}
              </p>
            </div>

            <div className="space-y-2">
              <Label className="font-semibold text-sm">Atividade:</Label>
              <p className="text-sm text-foreground bg-muted/40 p-2 rounded">
                {complementModalSub?.title}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="complement-file" className="font-semibold text-sm">
                Novo Arquivo Comprobatório (Legível e Completo) *
              </Label>
              <Input
                id="complement-file"
                type="file"
                onChange={(e) => setComplementFile(e.target.files?.[0] || null)}
                className="cursor-pointer file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
              />
              <p className="text-xs text-muted-foreground">
                Formatos aceitos: PDF, PNG, JPG, JPEG, DOCX. O envio passará imediatamente por nova
                análise automática.
              </p>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setComplementModalSub(null)
                setComplementFile(null)
              }}
              disabled={isSubmittingAction}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleComplementSubmit}
              disabled={isSubmittingAction || !complementFile}
            >
              {isSubmittingAction ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                'Enviar para Reanálise'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
