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
import { PilarIndicator } from '@/components/forums/PilarIndicator'
import { getForums, deleteForum, type Forum } from '@/services/forums'
import { getUsers } from '@/services/users'
import { useRealtime } from '@/hooks/use-realtime'
import { useToast } from '@/hooks/use-toast'
import { getErrorMessage } from '@/lib/pocketbase/errors'

const formatDateBR = (d: string) => {
  if (!d) return '-'
  const datePart = d.substring(0, 10)
  if (!datePart) return '-'
  const [year, month, day] = datePart.split('-')
  if (!year || !month || !day) return '-'
  return `${day}/${month}/${year}`
}

const getStatusVariant = (status: string) => {
  if (status === 'Abertura') return 'bg-blue-500/10 text-blue-700 border-blue-500/30'
  if (status === 'Discussões') return 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30'
  if (status === 'Consolidação') return 'bg-amber-500/10 text-amber-700 border-amber-500/30'
  if (status === 'Aprovação') return 'bg-purple-500/10 text-purple-700 border-purple-500/30'
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
              <TableHead>Pergunta</TableHead>
              <TableHead>Pilar</TableHead>
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
                    <PilarIndicator pilar={forum.pilar_pnatrans || 'Não Definido'} />
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {forum.expand?.relator_id?.name || usersById[forum.relator_id]?.name || '-'}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDateBR(forum.opening_date)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDateBR(forum.closing_date)}
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
