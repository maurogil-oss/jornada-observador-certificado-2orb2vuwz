import { useState, useEffect, useMemo } from 'react'
import { Search, Edit, Shield, User as UserIcon, Trash2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { getUsers, updateUser, deleteUser } from '@/services/users'
import { useRealtime } from '@/hooks/use-realtime'
import { getErrorMessage } from '@/lib/pocketbase/errors'
import pb from '@/lib/pocketbase/client'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  const [editingUser, setEditingUser] = useState<any | null>(null)
  const [editRole, setEditRole] = useState('observer')
  const [editPoints, setEditPoints] = useState(0)
  const [editLevel, setEditLevel] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const [userToDelete, setUserToDelete] = useState<any | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const loadUsers = async () => {
    try {
      const data = await getUsers()
      setUsers(data)
    } catch (error) {
      toast({
        title: 'Erro ao carregar usuários',
        description: getErrorMessage(error),
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  useRealtime('users', () => {
    loadUsers()
  })

  const filteredUsers = useMemo(() => {
    if (!search) return users
    const lowerSearch = search.toLowerCase()
    return users.filter(
      (u) =>
        u.name?.toLowerCase().includes(lowerSearch) ||
        u.full_name?.toLowerCase().includes(lowerSearch) ||
        u.email?.toLowerCase().includes(lowerSearch),
    )
  }, [users, search])

  const handleEditClick = (user: any) => {
    setEditingUser(user)
    setEditRole(user.role || 'observer')
    setEditPoints(user.points || 0)
    setEditLevel(user.level || '')
  }

  const handleSave = async () => {
    if (!editingUser) return
    setIsSaving(true)
    try {
      await updateUser(editingUser.id, {
        role: editRole,
        points: editPoints,
        level: editLevel,
      })
      toast({
        title: 'Usuário atualizado com sucesso!',
      })
      setEditingUser(null)
    } catch (error) {
      toast({
        title: 'Erro ao atualizar usuário',
        description: getErrorMessage(error),
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleToggleActive = async (user: any, isActive: boolean) => {
    try {
      await updateUser(user.id, { is_active: isActive })
      toast({
        title: isActive ? 'Usuário aprovado/ativado' : 'Usuário inativado',
        description: isActive
          ? 'O usuário agora tem acesso ao sistema e foi notificado.'
          : 'O usuário foi bloqueado de acessar o sistema.',
      })
    } catch (error) {
      toast({
        title: 'Erro ao alterar status do usuário',
        description: getErrorMessage(error),
        variant: 'destructive',
      })
    }
  }

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return
    setIsDeleting(true)
    try {
      await deleteUser(userToDelete.id)
      toast({
        title: 'Usuário eliminado',
        description: 'A conta do observador foi permanentemente removida.',
      })
      setUserToDelete(null)
    } catch (error) {
      toast({
        title: 'Erro ao eliminar usuário',
        description: getErrorMessage(error),
        variant: 'destructive',
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      return name.substring(0, 2).toUpperCase()
    }
    if (email) {
      return email.substring(0, 2).toUpperCase()
    }
    return 'U'
  }

  const getAvatarUrl = (user: any) => {
    if (!user.avatar) return ''
    return pb.files.getURL(user, user.avatar)
  }

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestão de Usuários</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie permissões, pontos, níveis e status dos participantes da jornada.
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2 bg-card border rounded-md px-3 py-2 shadow-sm max-w-sm">
        <Search className="w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Buscar por nome ou email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-auto"
        />
      </div>

      <div className="border rounded-md bg-card overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Usuário</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Data de Cadastro</TableHead>
              <TableHead>Nível Atual</TableHead>
              <TableHead className="text-right">Pontos</TableHead>
              <TableHead>Função</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <div className="flex justify-center items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                    <span>Carregando usuários...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  Nenhum usuário encontrado.
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow
                  key={user.id}
                  className={cn(user.is_active === false && 'opacity-60 bg-muted/30')}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={getAvatarUrl(user)} />
                        <AvatarFallback>
                          {getInitials(user.full_name || user.name, user.email)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {user.full_name || user.name || 'Sem nome'}
                        </span>
                        <span className="text-xs text-muted-foreground">{user.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={user.is_active !== false}
                        onCheckedChange={(checked) => handleToggleActive(user, checked)}
                        title={
                          user.is_active !== false ? 'Inativar Usuário' : 'Aprovar/Ativar Usuário'
                        }
                      />
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {user.is_active !== false ? 'Ativo' : 'Pendente'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {user.created ? format(new Date(user.created), 'dd/MM/yyyy HH:mm') : '-'}
                  </TableCell>
                  <TableCell>
                    <div className="max-w-[150px] truncate" title={user.level || 'Não definido'}>
                      {user.level || (
                        <span className="text-muted-foreground italic">Não definido</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium">{user.points || 0}</TableCell>
                  <TableCell>
                    {user.role === 'admin' ? (
                      <Badge variant="default" className="bg-blue-600 hover:bg-blue-700">
                        <Shield className="w-3 h-3 mr-1" />
                        Admin
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <UserIcon className="w-3 h-3 mr-1" />
                        Observer
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditClick(user)}
                        title="Editar Usuário"
                      >
                        <Edit className="w-4 h-4 text-muted-foreground" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-600 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/30"
                        onClick={() => setUserToDelete(user)}
                        title="Eliminar Usuário"
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

      <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
          </DialogHeader>
          {editingUser && (
            <div className="grid gap-4 py-4">
              <div className="flex items-center gap-3 mb-2">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={getAvatarUrl(editingUser)} />
                  <AvatarFallback>
                    {getInitials(editingUser.name, editingUser.email)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="font-semibold">{editingUser.name || 'Sem nome'}</span>
                  <span className="text-sm text-muted-foreground">{editingUser.email}</span>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="role">Função</Label>
                <Select value={editRole} onValueChange={setEditRole}>
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Selecione a função" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="observer">Observer (Padrão)</SelectItem>
                    <SelectItem value="admin">Administrator</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="points">Pontos</Label>
                <Input
                  id="points"
                  type="number"
                  value={editPoints}
                  onChange={(e) => setEditPoints(Number(e.target.value))}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="level">Nível Atual</Label>
                <Input
                  id="level"
                  value={editLevel}
                  onChange={(e) => setEditLevel(e.target.value)}
                  placeholder="Ex: Nível I - Observador Certificado"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingUser(null)} disabled={isSaving}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza que deseja eliminar este observador?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O usuário{' '}
              <strong>{userToDelete?.name || userToDelete?.email}</strong> e todos os seus dados
              serão permanentemente apagados dos nossos servidores.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleDeleteConfirm()
              }}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600 text-white"
            >
              {isDeleting ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
