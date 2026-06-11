import { useEffect, useState } from 'react'
import { RecordModel } from 'pocketbase'
import { AlertCircle, CheckCircle2, Loader2, PlayCircle } from 'lucide-react'

import pb from '@/lib/pocketbase/client'
import { getErrorMessage } from '@/lib/pocketbase/errors'
import { useToast } from '@/hooks/use-toast'

import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<RecordModel[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)
  const { toast } = useToast()

  const loadSubmissions = async () => {
    try {
      setLoading(true)
      const records = await pb.collection('submissions').getFullList({
        sort: '-created',
        expand: 'user_id,activity_id',
      })
      setSubmissions(records)
    } catch (err) {
      toast({ title: 'Erro', description: getErrorMessage(err), variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSubmissions()
  }, [])

  const handleApprove = async (id: string, currentStatus: string) => {
    if (currentStatus === 'Aprovado') return
    try {
      setProcessing(id)
      await pb.collection('submissions').update(id, { status: 'Aprovado' })
      toast({
        title: 'Sucesso',
        description: 'Submissão aprovada com sucesso.',
      })
      loadSubmissions()
    } catch (err) {
      toast({
        title: 'Falha na Aprovação',
        description: getErrorMessage(err),
        variant: 'destructive',
      })
    } finally {
      setProcessing(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Aprovado':
        return (
          <Badge className="bg-green-500 hover:bg-green-600">
            <CheckCircle2 className="w-3 h-3 mr-1" /> Aprovado
          </Badge>
        )
      case 'Em Análise':
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200">
            <PlayCircle className="w-3 h-3 mr-1" /> Em Análise
          </Badge>
        )
      case 'Ajuste Necessário':
        return (
          <Badge variant="destructive">
            <AlertCircle className="w-3 h-3 mr-1" /> Ajuste Necessário
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestão de Submissões</h1>
          <p className="text-muted-foreground mt-1">
            Analise e aprove as atividades submetidas pelos usuários.
          </p>
        </div>
        <Button onClick={loadSubmissions} variant="outline" disabled={loading}>
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
          Atualizar Lista
        </Button>
      </div>

      <Alert className="mb-6 bg-muted/50">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Validação Automática</AlertTitle>
        <AlertDescription>
          O sistema validará automaticamente regras de pontuação (limites de ocorrência, unicidade e
          exclusividade de grupo) no momento da aprovação. Qualquer violação impedirá a mudança de
          status.
        </AlertDescription>
      </Alert>

      <div className="rounded-md border bg-card overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead>Usuário</TableHead>
              <TableHead>Atividade / Título</TableHead>
              <TableHead>Nível</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && submissions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                  Carregando submissões...
                </TableCell>
              </TableRow>
            ) : submissions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                  Nenhuma submissão encontrada.
                </TableCell>
              </TableRow>
            ) : (
              submissions.map((sub) => (
                <TableRow key={sub.id}>
                  <TableCell className="font-medium">
                    {sub.expand?.user_id?.name || sub.expand?.user_id?.email || 'Desconhecido'}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <span className="font-medium text-sm">{sub.title}</span>
                      {sub.expand?.activity_id?.title && (
                        <span className="text-xs text-muted-foreground bg-muted inline-flex w-fit px-1.5 py-0.5 rounded">
                          {sub.expand.activity_id.title}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{sub.nivel}</TableCell>
                  <TableCell>{getStatusBadge(sub.status)}</TableCell>
                  <TableCell className="text-right">
                    {sub.status !== 'Aprovado' ? (
                      <Button
                        size="sm"
                        onClick={() => handleApprove(sub.id, sub.status)}
                        disabled={processing === sub.id || !sub.activity_id}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        {processing === sub.id ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                        )}
                        Aprovar
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground">Validado</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
