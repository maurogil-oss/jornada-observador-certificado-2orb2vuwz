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
import { CheckCircle, Clock, AlertCircle, Eye, FileText } from 'lucide-react'
import useSubmissionsStore, { Submission } from '@/stores/useSubmissionsStore'

export function SubmissionsHistory() {
  const { submissions } = useSubmissionsStore()
  const [viewingSub, setViewingSub] = useState<Submission | null>(null)

  const openView = (sub: Submission) => {
    setViewingSub(sub)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Aprovado':
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-500 dark:hover:bg-green-900/50 border-0 font-medium px-2.5 py-0.5">
            <CheckCircle className="w-3.5 h-3.5 mr-1.5" /> Aprovado
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
                      <div className="flex items-center justify-end gap-2">
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
      </Card>

      <Dialog open={!!viewingSub} onOpenChange={(open) => !open && setViewingSub(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Visualizar Submissão</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto px-1">
            <div className="space-y-2">
              <Label htmlFor="view-title">Título</Label>
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
                <Label htmlFor="view-type">Tipo</Label>
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
                <Label htmlFor="view-score">Pontuação</Label>
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
              <Label htmlFor="view-nivel">Nível Referência</Label>
              <Input
                id="view-nivel"
                value={viewingSub?.nivel || ''}
                readOnly
                disabled
                className="opacity-100 bg-muted/50 text-muted-foreground cursor-not-allowed"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="view-desc">Descrição</Label>
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
                <Label htmlFor="view-link">Link Externo</Label>
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
                <Label>Arquivo de Evidência</Label>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href={viewingSub.fileUrl} target="_blank" rel="noopener noreferrer">
                    <FileText className="w-4 h-4 mr-2" />
                    Visualizar Documento Anexo
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
    </>
  )
}
