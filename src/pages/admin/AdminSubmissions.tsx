import { useState, useMemo, useEffect } from 'react'
import { format } from 'date-fns'
import { useLocation, useNavigate } from 'react-router-dom'
import { ITEM_CAPS } from '@/lib/scoring'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import pb from '@/lib/pocketbase/client'
import { ptBR } from 'date-fns/locale'
import useSubmissionsStore, { type Submission } from '@/stores/useSubmissionsStore'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import {
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Clock,
  User,
  Eye,
  FileText,
  LayoutDashboard,
} from 'lucide-react'

const typeMap: Record<string, string> = {
  titulation: 'Titulação',
  competency: 'Competência',
  other: 'Outro',
}

function StatusBadge({ status }: { status: string }) {
  const config =
    status === 'Aprovado'
      ? {
          color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500',
          icon: CheckCircle2,
        }
      : status === 'Ajuste Necessário'
        ? {
            color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500',
            icon: AlertTriangle,
          }
        : {
            color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-500',
            icon: Clock,
          }

  const Icon = config.icon
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ${config.color}`}
    >
      <Icon className="w-3.5 h-3.5" />
      {status}
    </span>
  )
}

export default function AdminSubmissions() {
  const { submissions, updateSubmissionStatus } = useSubmissionsStore()
  const location = useLocation()

  const getSubmissionLimitInfo = (sub: Submission) => {
    if (sub.status !== 'Em Análise') return null

    const userApproved = submissions.filter(
      (s) => s.user_id === sub.user_id && s.status === 'Aprovado',
    )
    const act = sub.activity

    const isTitulation = sub.type === 'titulation' || act?.category === 'Titulação'
    if (isTitulation) {
      const hasApproved = userApproved.filter(
        (s) => s.type === 'titulation' || s.activity?.category === 'Titulação',
      ).length
      if (hasApproved >= 1) {
        return {
          exceeded: true,
          current: hasApproved,
          limit: 1,
          message: `Atenção: Esta submissão excede o limite permitido para esta atividade/titulação. O usuário já possui ${hasApproved} titulação(ões) aprovada(s).`,
        }
      }
    } else {
      let maxOccurrences = act ? (act.is_unique ? 1 : act.max_occurrences || 0) : 0

      if (!act) {
        if (sub.title === 'Projeto Local (Municipal)' || sub.title === 'Projeto Estadual')
          maxOccurrences = 3
        else if (sub.title === 'Projeto Nacional' || sub.title === 'Projeto Internacional')
          maxOccurrences = 2
        else maxOccurrences = ITEM_CAPS[sub.title] || 999
      }

      if (maxOccurrences > 0 && maxOccurrences !== 999) {
        let hasApproved = 0
        if (act) {
          hasApproved = userApproved.filter((s) => s.activity_id === act.id).length
        } else {
          hasApproved = userApproved.filter((s) => s.title === sub.title).length
        }

        if (hasApproved >= maxOccurrences) {
          return {
            exceeded: true,
            current: hasApproved,
            limit: maxOccurrences,
            message: `Atenção: Esta submissão excede o limite permitido para esta atividade/titulação. O usuário já possui ${hasApproved}/${maxOccurrences} submissões aprovadas para esta categoria.`,
          }
        }
      }
    }

    return null
  }
  const navigate = useNavigate()

  const [filterStatus, setFilterStatus] = useState<string>('Todos')
  const [selectedSub, setSelectedSub] = useState<Submission | null>(null)

  const [newStatus, setNewStatus] = useState<string>('')
  const [newFeedback, setNewFeedback] = useState<string>('')
  const [newNivel, setNewNivel] = useState<string>('')
  const [isUpdating, setIsUpdating] = useState(false)

  const calculatedScore = useMemo(() => {
    if (!selectedSub?.activity) return null
    const act = selectedSub.activity
    if (act.points_type === 'fixed') return act.points || 0
    if (act.points_type === 'level_based') {
      if (newNivel === 'Nível I') return act.points_level_1 || 0
      if (newNivel === 'Nível II') return act.points_level_2 || 0
      if (newNivel === 'Nível III') return act.points_level_3 || 0
    }
    // Fallback if not specified but points exist
    if (act.points !== undefined && act.points !== null) return act.points
    return null
  }, [selectedSub, newNivel])

  const filteredSubmissions = useMemo(() => {
    let filtered = submissions
    if (filterStatus !== 'Todos') {
      filtered = filtered.filter((s) => s.status === filterStatus)
    }
    return filtered.sort((a, b) => {
      if (a.status === 'Em Análise' && b.status === 'Em Análise') {
        return new Date(a.created).getTime() - new Date(b.created).getTime() // Oldest first
      }
      if (a.status === 'Em Análise') return -1
      if (b.status === 'Em Análise') return 1
      return new Date(b.created).getTime() - new Date(a.created).getTime() // Newest first for others
    })
  }, [submissions, filterStatus])

  const summary = useMemo(() => {
    let pending = 0
    let approved = 0
    let review = 0
    filteredSubmissions.forEach((s) => {
      if (s.status === 'Em Análise') pending++
      else if (s.status === 'Aprovado') approved++
      else if (s.status === 'Ajuste Necessário') review++
    })
    return { total: filteredSubmissions.length, pending, approved, review }
  }, [filteredSubmissions])

  const handleOpenReview = (sub: Submission) => {
    setSelectedSub(sub)
    setNewStatus(sub.status)
    setNewFeedback(sub.feedback || '')
    setNewNivel(sub.nivel || '')
  }

  // Handle incoming selection from Dashboard
  useEffect(() => {
    if (location.state?.selectedSubId && submissions.length > 0) {
      const sub = submissions.find((s) => s.id === location.state.selectedSubId)
      if (sub) {
        handleOpenReview(sub)
        // Clear state so it doesn't reopen on refresh
        navigate(location.pathname, { replace: true, state: {} })
      }
    }
  }, [location.state, submissions, navigate])

  const handleSave = async () => {
    if (!selectedSub) return
    if (newStatus === 'Aprovado' && calculatedScore === null) {
      toast.error('Não é possível aprovar: atividade não vinculada ou sem regras de pontuação.')
      return
    }

    setIsUpdating(true)
    try {
      // 100% Reliable Database Update
      const dataToUpdate: any = {
        status: newStatus,
        feedback: newFeedback,
        nivel: newNivel,
      }
      if (newStatus === 'Aprovado') {
        dataToUpdate.score = calculatedScore || 0
      } else {
        dataToUpdate.score = 0 // Reset score if not approved
      }

      await pb.collection('submissions').update(selectedSub.id, dataToUpdate)

      // Also update local store
      await updateSubmissionStatus(
        selectedSub.id,
        newStatus,
        newStatus === 'Aprovado' ? calculatedScore || 0 : undefined,
        newFeedback,
        newNivel,
      )

      if (newStatus === 'Aprovado') {
        toast.success('Documentação aprovada com sucesso!')
      } else {
        toast.success('Status da submissão atualizado com sucesso!')
      }
      setSelectedSub(null)
    } catch (error: any) {
      console.error('Error updating submission:', error)
      toast.error(error.message || 'Erro ao atualizar a submissão. Verifique os dados.')
    } finally {
      setIsUpdating(false)
    }
  }

  const isApproveDisabled = newStatus === 'Aprovado' && calculatedScore === null

  return (
    <div className="p-6 max-w-7xl mx-auto flex flex-col gap-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <LayoutDashboard className="w-8 h-8 text-primary" />
            Gestão de Submissões
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie e avalie as submissões enviadas pelos observadores.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Label className="whitespace-nowrap font-medium">Filtrar por Status:</Label>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[180px] bg-background">
              <SelectValue placeholder="Selecione um status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Todos">Todos</SelectItem>
              <SelectItem value="Em Análise">Em Análise</SelectItem>
              <SelectItem value="Aprovado">Aprovado</SelectItem>
              <SelectItem value="Ajuste Necessário">Ajuste Necessário</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Total</span>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </div>
          <span className="text-2xl font-bold">{summary.total}</span>
        </div>
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Em Análise</span>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <span className="text-2xl font-bold">{summary.pending}</span>
        </div>
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Aprovado</span>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </div>
          <span className="text-2xl font-bold">{summary.approved}</span>
        </div>
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Ajuste Necessário</span>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </div>
          <span className="text-2xl font-bold">{summary.review}</span>
        </div>
      </div>

      <div className="bg-card border border-border/50 rounded-xl shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Usuário</TableHead>
              <TableHead>Título da Submissão</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSubmissions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  Nenhuma submissão encontrada com o filtro selecionado.
                </TableCell>
              </TableRow>
            ) : (
              filteredSubmissions.map((sub) => (
                <TableRow key={sub.id} className="group hover:bg-muted/30 transition-colors">
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <span>{sub.fullName || sub.user || 'Usuário não identificado'}</span>
                      {sub.nickname && (
                        <span className="text-xs text-muted-foreground">{sub.nickname}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col max-w-[250px]">
                      <span className="font-semibold truncate" title={sub.title}>
                        {sub.title}
                      </span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground truncate">{sub.nivel}</span>
                        {(() => {
                          const limitInfo = getSubmissionLimitInfo(sub)
                          if (limitInfo?.exceeded) {
                            return (
                              <span
                                className="inline-flex items-center gap-1 text-[10px] font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 px-1.5 py-0.5 rounded"
                                title={limitInfo.message}
                              >
                                <AlertTriangle className="w-3 h-3" />
                                Limite Excedido
                              </span>
                            )
                          }
                          return null
                        })()}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex px-2 py-1 rounded bg-secondary text-secondary-foreground text-xs font-medium">
                      {typeMap[sub.type || 'other'] || sub.type}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {format(new Date(sub.created), "dd 'de' MMM, yyyy", { locale: ptBR })}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={sub.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => handleOpenReview(sub)}>
                      <Eye className="w-4 h-4 mr-2" /> Avaliar
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Sheet open={!!selectedSub} onOpenChange={(open) => !open && setSelectedSub(null)}>
        <SheetContent className="w-full sm:max-w-md flex flex-col gap-6 p-0">
          <SheetHeader className="p-6 border-b bg-muted/20">
            <SheetTitle>Avaliação de Submissão</SheetTitle>
            <SheetDescription>
              Revise a documentação enviada e conceda a pontuação devida.
            </SheetDescription>
          </SheetHeader>

          {selectedSub && (
            <ScrollArea className="flex-1 px-6">
              <div className="space-y-8 pb-6 pt-2">
                {(() => {
                  const limitInfo = getSubmissionLimitInfo(selectedSub)
                  if (limitInfo?.exceeded) {
                    return (
                      <Alert
                        variant="destructive"
                        className="bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800"
                      >
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Atenção: Limite Excedido</AlertTitle>
                        <AlertDescription className="text-sm mt-1">
                          {limitInfo.message}
                        </AlertDescription>
                      </Alert>
                    )
                  }
                  return null
                })()}

                <div className="bg-card p-5 rounded-lg space-y-5 text-sm border border-border shadow-sm">
                  <div>
                    <span className="block text-[11px] text-muted-foreground font-semibold uppercase mb-1">
                      Título
                    </span>
                    <p className="font-semibold text-base leading-snug">{selectedSub.title}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="block text-[11px] text-muted-foreground font-semibold uppercase mb-1">
                        Nível / Eixo
                      </span>
                      <p className="font-medium">{selectedSub.nivel}</p>
                    </div>
                    <div>
                      <span className="block text-[11px] text-muted-foreground font-semibold uppercase mb-1">
                        Data de Envio
                      </span>
                      <p className="font-medium">
                        {format(new Date(selectedSub.created), 'dd/MM/yyyy HH:mm')}
                      </p>
                    </div>
                  </div>

                  {selectedSub.description && (
                    <div>
                      <span className="block text-[11px] text-muted-foreground font-semibold uppercase mb-1">
                        Descrição
                      </span>
                      <p className="text-muted-foreground whitespace-pre-wrap">
                        {selectedSub.description}
                      </p>
                    </div>
                  )}

                  <div className="pt-1 flex flex-col gap-2">
                    {selectedSub.fileUrl ? (
                      <Button
                        className="w-full justify-start bg-slate-900 hover:bg-slate-800 text-white"
                        asChild
                      >
                        <a href={selectedSub.fileUrl} target="_blank" rel="noopener noreferrer">
                          <FileText className="w-4 h-4 mr-2" />
                          Visualizar Documento Anexo
                        </a>
                      </Button>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">
                        Nenhum arquivo anexado.
                      </p>
                    )}

                    {selectedSub.link && (
                      <Button variant="outline" className="w-full justify-start" asChild>
                        <a href={selectedSub.link} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Acessar Link Externo
                        </a>
                      </Button>
                    )}
                  </div>
                </div>

                <div className="space-y-5">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground border-b pb-2">
                    Decisão de Avaliação
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <Label htmlFor="nivel" className="text-sm">
                        Nível Validado
                      </Label>
                      <Select value={newNivel} onValueChange={setNewNivel}>
                        <SelectTrigger id="nivel" className="bg-background">
                          <SelectValue placeholder="Selecione o nível" />
                        </SelectTrigger>
                        <SelectContent>
                          {newNivel && !['Nível I', 'Nível II', 'Nível III'].includes(newNivel) && (
                            <SelectItem value={newNivel}>{newNivel}</SelectItem>
                          )}
                          <SelectItem value="Nível I">Nível I</SelectItem>
                          <SelectItem value="Nível II" disabled={(selectedSub.turma ?? 0) >= 15}>
                            Nível II
                          </SelectItem>
                          <SelectItem value="Nível III">Nível III</SelectItem>
                        </SelectContent>
                      </Select>
                      {(selectedSub.turma ?? 0) >= 15 ? (
                        <p className="text-xs text-amber-600 font-medium">
                          Turma 15 ou superior: Nível I obrigatório
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          Turma menor que 15: Sugerido Nível II
                        </p>
                      )}
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="status" className="text-sm">
                        Status da Submissão
                      </Label>
                      <Select value={newStatus} onValueChange={setNewStatus}>
                        <SelectTrigger id="status" className="bg-background">
                          <SelectValue placeholder="Selecione um status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Em Análise">Em Análise</SelectItem>
                          <SelectItem value="Aprovado">Aprovado</SelectItem>
                          <SelectItem value="Ajuste Necessário">Ajuste Necessário</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-3 animate-fade-in-up">
                    <Label className="text-sm">Pontuação Calculada</Label>
                    {calculatedScore !== null ? (
                      <div className="bg-muted p-3 rounded-md border text-lg font-semibold flex items-center">
                        {calculatedScore} pontos
                        {selectedSub.activity?.points_type === 'level_based' && (
                          <span className="text-xs font-normal text-muted-foreground ml-2">
                            (Baseado no nível)
                          </span>
                        )}
                        {selectedSub.activity?.points_type === 'fixed' && (
                          <span className="text-xs font-normal text-muted-foreground ml-2">
                            (Pontuação fixa)
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 p-3 rounded-md border border-red-200 dark:border-red-800 text-sm">
                        <AlertTriangle className="w-4 h-4 inline-block mr-1 mb-0.5" />
                        Atividade não vinculada ou sem regras de pontuação definidas.
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">
                      A pontuação é calculada automaticamente com base nas regras da atividade e no
                      nível validado.
                    </p>
                  </div>

                  <div className="space-y-3 pt-2">
                    <Label htmlFor="feedback" className="text-sm">
                      Observações / Ajustes Necessários
                    </Label>
                    <Textarea
                      id="feedback"
                      placeholder="Forneça um feedback detalhado para o observador..."
                      value={newFeedback}
                      onChange={(e) => setNewFeedback(e.target.value)}
                      className="bg-background resize-none h-24"
                    />
                  </div>
                </div>
              </div>
            </ScrollArea>
          )}

          <div className="p-6 border-t mt-auto bg-background flex flex-col gap-2">
            {isApproveDisabled && (
              <span className="text-xs text-red-500 text-center font-medium">
                Não é possível aprovar sem uma regra de pontuação.
              </span>
            )}
            <Button
              className="w-full bg-[#37823b] hover:bg-[#2e6b31] text-white transition-colors"
              size="lg"
              onClick={handleSave}
              disabled={isUpdating || isApproveDisabled}
            >
              {isUpdating ? 'Processando...' : 'Confirmar Avaliação'}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
