import { useEffect, useState } from 'react'
import useAuthStore from '@/stores/useAuthStore'
import { Navigate } from 'react-router-dom'
import pb from '@/lib/pocketbase/client'
import { useRealtime } from '@/hooks/use-realtime'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import type { RecordModel } from 'pocketbase'

export default function SubmissionsAdmin() {
  const { user } = useAuthStore()
  const [submissions, setSubmissions] = useState<RecordModel[]>([])
  const [loading, setLoading] = useState(true)

  const loadSubmissions = async () => {
    try {
      const records = await pb.collection('submissions').getFullList({
        sort: '-created',
        expand: 'user_id,activity_id',
      })
      setSubmissions(records)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user?.role === 'admin') {
      loadSubmissions()
    }
  }, [user?.role])

  useRealtime('submissions', () => {
    if (user?.role === 'admin') {
      loadSubmissions()
    }
  })

  if (user?.role !== 'admin') {
    return <Navigate to="/" replace />
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Aprovado':
        return 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
      case 'Em Análise':
        return 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20'
      case 'Ajuste Necessário':
        return 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
      default:
        return 'bg-gray-500/10 text-gray-500 hover:bg-gray-500/20'
    }
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Administração de Submissões</h1>
        <p className="text-muted-foreground">Gerencie as evidências enviadas pelos observadores.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Últimas Submissões</CardTitle>
          <CardDescription>Lista completa de submissões na plataforma</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-8 text-muted-foreground">Carregando...</div>
          ) : submissions.length === 0 ? (
            <div className="flex justify-center p-8 text-muted-foreground">
              Nenhuma submissão encontrada.
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Nível</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.map((sub) => (
                    <TableRow key={sub.id}>
                      <TableCell className="font-medium">{sub.title}</TableCell>
                      <TableCell>
                        {sub.expand?.user_id?.name ||
                          sub.expand?.user_id?.full_name ||
                          'Desconhecido'}
                      </TableCell>
                      <TableCell className="capitalize">{sub.type}</TableCell>
                      <TableCell>{sub.nivel}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(sub.status)} variant="outline">
                          {sub.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {new Date(sub.created).toLocaleDateString('pt-BR')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
