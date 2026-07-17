import { useState, useEffect, useMemo } from 'react'
import { Plus, Edit, Trash2, MessageSquare } from 'lucide-react'
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
import { ForumFormDialog } from '@/components/admin/ForumFormDialog'
import { getForums, deleteForum, type Forum } from '@/services/forums'
import { getUsers } from '@/services/users'
import { useRealtime } from '@/hooks/use-realtime'
import { useToast } from '@/hooks/use-toast'
import { getErrorMessage } from '@/lib/pocketbase/errors'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const getStatusVariant = (status: string) => {
  if (status === 'Aberto') return 'bg-green-500/10 text-green-700 border-green-500/30'
  if (status === 'Em Consolidação') return 'bg-amber-500/10 text-amber-700 border-amber-500/30'
  return 'bg-slate-500/10 text-slate-600 border-slate-500/30'
}

export default function AdminForums() {
  const [forums, setForums] = useState<Forum[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingForum, setEditingForum] = useState<Forum | null>(null)
  const [forumToDelete, setForumToDelete] = useState<Forum | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()

  const loadData = async () => {
    try {
      const [forumData, userData] = await Promise.all([getForums(), getUsers()])
      setForums(forumData)
      setUsers(userData)
    } catch (error) {
      toast({
        title: 'Erro ao carregar dados',
        description: getErrorMessage(error),
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('forums', () => {
    loadData()
  })

  const usersById = useMemo(() => {
    const map: Record<string, any> = {}
    users.forEach((u) => {
      map[u.id] = u
    })
    return map
  }, [users])

  const handleCreate = () => {
    setEditingForum(null)
    setDialogOpen(true)
  }

  const handleEdit = (forum: Forum) => {
    setEditingForum(forum)
    setDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!forumToDelete) return
    setIsDeleting(true)
    try {
      await deleteForum(forumToDelete.id)
      toast({ title: 'Fórum excluído com sucesso!' })
      setForumToDelete(null)
    } catch (error) {
      toast({
        title: 'Erro ao excluir fórum',
        description: getErrorMessage(error),
        variant: 'destructive',
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fóruns Técnicos</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie os fóruns técnicos disponíveis para os observadores.
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" /> Novo Fórum
        </Button>
      </div>

      <div className="border rounded-md bg-card overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-[140px]">Código</TableHead>
              <TableHead>Tema</TableHead>
              <TableHead>Relator</TableHead>
              <TableHead className="w-[130px]">Abertura</TableHead>
              <TableHead className="w-[130px]">Fechamento</TableHead>
              <TableHead className="w-[140px]">Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <div className="flex justify-center items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    <span>Carregando...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : forums.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  Nenhum fórum cadastrado.
                </TableCell>
              </TableRow>
            ) : (
              forums.map((forum) => (
                <TableRow key={forum.id}>
                  <TableCell className="font-mono text-sm">{forum.code}</TableCell>
                  <TableCell className="font-medium">{forum.title}</TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {forum.expand?.relator_id?.name || usersById[forum.relator_id]?.name || '-'}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {forum.opening_date
                      ? format(new Date(forum.opening_date), 'dd/MM/yyyy', { locale: ptBR })
                      : '-'}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {forum.closing_date
                      ? format(new Date(forum.closing_date), 'dd/MM/yyyy', { locale: ptBR })
                      : '-'}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`text-xs ${getStatusVariant(forum.status)}`}
                    >
                      {forum.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(forum)}
                        title="Editar"
                      >
                        <Edit className="w-4 h-4 text-muted-foreground" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-600 hover:text-red-700 hover:bg-red-100"
                        onClick={() => setForumToDelete(forum)}
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <ForumFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editingForum={editingForum}
        users={users}
        onSuccess={loadData}
      />

      <AlertDialog open={!!forumToDelete} onOpenChange={(open) => !open && setForumToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir fórum?</AlertDialogTitle>
            <AlertDialogDescription>
              O fórum <strong>{forumToDelete?.title}</strong> será permanentemente removido. Esta
              ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleDelete()
              }}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
