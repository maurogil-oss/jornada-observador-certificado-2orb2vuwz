import { useState, useMemo } from 'react'
import { format } from 'date-fns'
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
  CheckCircle,
  AlertCircle,
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
          icon: CheckCircle,
        }
      : status === 'Ajuste Necessário'
        ? {
            color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500',
            icon: AlertCircle,
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
  const [filterStatus, setFilterStatus] = useState<string>('Todos')
  const [selectedSub, setSelectedSub] = useState<Submission | null>(null)

  const [newStatus, setNewStatus] = useState<string>('')
  const [newScore, setNewScore] = useState<string>('')
  const [newFeedback, setNewFeedback] = useState<string>('')
  const [newNivel, setNewNivel] = useState<string>('')
  const [isUpdating, setIsUpdating] = useState(false)

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

  const handleOpenReview = (sub: Submission) => {
    setSelectedSub(sub)
    setNewStatus(sub.status)
    setNewScore(sub.points !== '-' ? String(sub.points) : '0')
    setNewFeedback(sub.feedback || '')
    setNewNivel(sub.nivel || '')
  }

  const handleSave = async () => {
    if (!selectedSub) return
    if (newStatus === 'Aprovado' && (!newScore || isNaN(Number(newScore)))) {
      toast.error('Insira uma pontuação válida para aprovar a submissão.')
      return
    }

    setIsUpdating(true)
    try {
      await updateSubmissionStatus(
        selectedSub.id,
        newStatus,
        newStatus === 'Aprovado' ? Number(newScore) : undefined,
        newFeedback,
        newNivel,
      )
      if (newStatus === 'Aprovado') {
        toast.success('Documentação aprovada com sucesso!')
      } else {
        toast.success('Status da submissão atualizado com sucesso!')
      }
      setSelectedSub(null)
    } catch (error) {
      toast.error('Erro ao atualizar a submissão.')
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto flex flex-col gap-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <LayoutDashboard className="w-8 h-8 text-primary" />
            Validação de Documentos
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
                      <span>{sub.user}</span>
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
                      <span className="text-xs text-muted-foreground truncate">{sub.nivel}</span>
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
              <div className="space-y-6 pb-6">
                <div className="space-y-3">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <User className="w-4 h-4" /> Dados do Observador
                  </h4>
                  <div className="bg-muted/40 p-4 rounded-lg space-y-2 text-sm border border-border/50">
                    <div className="grid grid-cols-[100px_1fr] gap-2">
                      <span className="text-muted-foreground font-medium">Nome:</span>
                      <span className="font-semibold">{selectedSub.user}</span>

                      {selectedSub.fullName && (
                        <>
                          <span className="text-muted-foreground font-medium">Completo:</span>
                          <span>{selectedSub.fullName}</span>
                        </>
                      )}

                      {selectedSub.nickname && (
                        <>
                          <span className="text-muted-foreground font-medium">Apelido:</span>
                          <span>{selectedSub.nickname}</span>
                        </>
                      )}

                      {selectedSub.turma !== undefined && (
                        <>
                          <span className="text-muted-foreground font-medium">Turma:</span>
                          <span>{selectedSub.turma}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <FileText className="w-4 h-4" /> Detalhes do Envio
                  </h4>
                  <div className="bg-card p-4 rounded-lg space-y-4 text-sm border border-border shadow-sm">
                    <div>
                      <span className="block text-xs text-muted-foreground font-medium mb-1">
                        Título
                      </span>
                      <p className="font-semibold text-base">{selectedSub.title}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="block text-xs text-muted-foreground font-medium mb-1">
                          Nível / Eixo
                        </span>
                        <p className="font-medium">{selectedSub.nivel}</p>
                      </div>
                      <div>
                        <span className="block text-xs text-muted-foreground font-medium mb-1">
                          Data de Envio
                        </span>
                        <p className="font-medium">
                          {format(new Date(selectedSub.created), 'dd/MM/yyyy HH:mm')}
                        </p>
                      </div>
                    </div>

                    {selectedSub.description && (
                      <div>
                        <span className="block text-xs text-muted-foreground font-medium mb-1">
                          Descrição
                        </span>
                        <p className="text-muted-foreground whitespace-pre-wrap">
                          {selectedSub.description}
                        </p>
                      </div>
                    )}

                    <div className="pt-2 border-t flex flex-col gap-2">
                      {selectedSub.fileUrl ? (
                        <Button variant="secondary" className="w-full justify-start" asChild>
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
                </div>

                <div className="space-y-4 pt-4 border-t border-border">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                    Decisão de Avaliação
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <Label htmlFor="nivel">Nível Validado</Label>
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
                      <Label htmlFor="status">Status da Submissão</Label>
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

                  {newStatus === 'Aprovado' && (
                    <div className="space-y-3 animate-fade-in-up">
                      <Label htmlFor="score">Pontos Concedidos</Label>
                      <Input
                        id="score"
                        type="number"
                        min="0"
                        placeholder="Ex: 50"
                        value={newScore}
                        onChange={(e) => setNewScore(e.target.value)}
                        className="bg-background"
                      />
                      <p className="text-xs text-muted-foreground">
                        Informe a pontuação exata de acordo com a regra de negócio para este
                        documento.
                      </p>
                    </div>
                  )}

                  <div className="space-y-3 pt-2">
                    <Label htmlFor="feedback">Observações / Ajustes Necessários</Label>
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

          <div className="p-6 border-t bg-muted/20 mt-auto">
            <Button className="w-full" size="lg" onClick={handleSave} disabled={isUpdating}>
              {isUpdating ? 'Processando...' : 'Confirmar Avaliação'}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
