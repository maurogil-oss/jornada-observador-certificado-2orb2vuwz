import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, MapPin, Star, ExternalLink } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import pb from '@/lib/pocketbase/client'

interface UserSearchProps {
  users: any[]
}

export function UserSearch({ users }: UserSearchProps) {
  const [search, setSearch] = useState('')
  const [selectedUser, setSelectedUser] = useState<any | null>(null)
  const navigate = useNavigate()

  const results = useMemo(() => {
    if (!search.trim()) return []
    const lower = search.toLowerCase()
    return users
      .filter(
        (u) =>
          u.full_name?.toLowerCase().includes(lower) ||
          u.nickname?.toLowerCase().includes(lower) ||
          u.name?.toLowerCase().includes(lower),
      )
      .slice(0, 10)
  }, [users, search])

  const getAvatarUrl = (user: any) => (user.avatar ? pb.files.getUrl(user, user.avatar) : '')

  const getInitials = (name?: string) => (name ? name.substring(0, 2).toUpperCase() : 'U')

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome ou apelido..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 h-11"
        />
      </div>

      {search.trim() && results.length > 0 && (
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {results.map((user) => (
            <Card
              key={user.id}
              className="cursor-pointer hover:bg-accent transition-colors"
              onClick={() => setSelectedUser(user)}
            >
              <CardContent className="flex items-center gap-3 p-3">
                <Avatar className="h-9 w-9 shrink-0">
                  <AvatarImage src={getAvatarUrl(user)} />
                  <AvatarFallback>{getInitials(user.full_name || user.name)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium truncate">
                      {user.full_name || user.name || 'Sem nome'}
                    </span>
                    {user.nickname && (
                      <span className="text-xs text-muted-foreground">({user.nickname})</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                    <MapPin className="w-3 h-3 shrink-0" />
                    <span className="truncate">
                      {[user.city, user.state, user.country].filter(Boolean).join(', ') ||
                        'Sem localização'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {user.level && (
                    <Badge variant="outline" className="text-[10px] hidden sm:inline-flex">
                      {user.level}
                    </Badge>
                  )}
                  <div className="flex items-center gap-1 text-sm font-medium">
                    <Star className="w-3 h-3 text-yellow-500" />
                    {user.points || 0}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {search.trim() && results.length === 0 && (
        <div className="text-center text-muted-foreground py-6 border border-dashed rounded-md">
          Nenhum usuário encontrado.
        </div>
      )}

      <Dialog open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Detalhes do Usuário</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={getAvatarUrl(selectedUser)} />
                  <AvatarFallback className="text-lg">
                    {getInitials(selectedUser.full_name || selectedUser.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <h3 className="text-lg font-semibold truncate">
                    {selectedUser.full_name || selectedUser.name || 'Sem nome'}
                  </h3>
                  {selectedUser.nickname && (
                    <p className="text-sm text-muted-foreground">
                      Apelido: {selectedUser.nickname}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground truncate">{selectedUser.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">País:</span>{' '}
                  <span className="font-medium">{selectedUser.country || '-'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Estado:</span>{' '}
                  <span className="font-medium">{selectedUser.state || '-'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Cidade:</span>{' '}
                  <span className="font-medium">{selectedUser.city || '-'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Turma:</span>{' '}
                  <span className="font-medium">{selectedUser.turma || '-'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Nível:</span>{' '}
                  <span className="font-medium">{selectedUser.level || '-'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Pontos:</span>{' '}
                  <span className="font-medium">{selectedUser.points || 0}</span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => navigate('/admin/users')}>
              <ExternalLink className="w-4 h-4 mr-2" />
              Ir para Gestão de Usuários
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
