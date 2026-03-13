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
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react'
import useSubmissionsStore from '@/stores/useSubmissionsStore'

export function SubmissionsHistory() {
  const { submissions } = useSubmissionsStore()
  const mySubmissions = submissions.filter((s) => s.user === 'Você')

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Aprovado':
        return (
          <Badge className="bg-primary hover:bg-primary/90 font-medium px-2.5 py-0.5">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Aprovado
          </Badge>
        )
      case 'Em Análise':
        return (
          <Badge
            variant="secondary"
            className="bg-yellow-500/15 text-yellow-700 hover:bg-yellow-500/25 font-medium px-2.5 py-0.5"
          >
            <Clock className="w-3.5 h-3.5 mr-1.5" /> Em Análise
          </Badge>
        )
      case 'Ajuste Necessário':
        return (
          <Badge variant="destructive" className="font-medium px-2.5 py-0.5">
            <AlertCircle className="w-3.5 h-3.5 mr-1.5" /> Ajuste Necessário
          </Badge>
        )
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <Card className="shadow-subtle border-border/60">
      <CardHeader className="bg-muted/30 border-b border-border/50">
        <CardTitle>Histórico de Submissões</CardTitle>
        <CardDescription>
          Todas as evidências enviadas e seus respectivos status na curadoria.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader className="bg-muted/10">
            <TableRow>
              <TableHead className="pl-6">Data</TableHead>
              <TableHead>Identificador</TableHead>
              <TableHead>Título da Evidência</TableHead>
              <TableHead>Eixo Referência</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right pr-6">Pontos Obtidos</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mySubmissions.map((sub) => (
              <TableRow key={sub.id} className="hover:bg-muted/30 transition-colors">
                <TableCell className="font-medium text-muted-foreground pl-6">{sub.date}</TableCell>
                <TableCell className="font-mono text-xs">{sub.id}</TableCell>
                <TableCell className="font-semibold">{sub.title}</TableCell>
                <TableCell>
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    {sub.axis}
                  </span>
                </TableCell>
                <TableCell>{getStatusBadge(sub.status)}</TableCell>
                <TableCell className="text-right pr-6 font-bold text-lg text-accent">
                  {sub.points !== '-' ? (
                    `+${sub.points}`
                  ) : (
                    <span className="text-muted-foreground/50">-</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
