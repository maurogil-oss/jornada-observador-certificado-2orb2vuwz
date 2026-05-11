import { useEffect, useState, useMemo } from 'react'
import pb from '@/lib/pocketbase/client'
import { useRealtime } from '@/hooks/use-realtime'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { Download, FileSpreadsheet, FileType2, Loader2, Info } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import useAuthStore from '@/stores/useAuthStore'
import { exportRanking } from '@/lib/export'

const TYPE_LABELS: Record<string, string> = {
  titulation: 'Titulação',
  competency: 'Competência',
  other: 'Outros',
}

export default function Ranking() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filterTurma, setFilterTurma] = useState<string>('all')
  const { user: currentUser } = useAuthStore()
  const isAdmin = currentUser?.role === 'admin'
  const { toast } = useToast()

  const [selectedUser, setSelectedUser] = useState<any | null>(null)
  const [userSubmissions, setUserSubmissions] = useState<any[]>([])
  const [loadingDetails, setLoadingDetails] = useState(false)

  const handleUserClick = async (user: any) => {
    setSelectedUser(user)
    setLoadingDetails(true)
    try {
      const records = await pb.collection('submissions').getFullList({
        filter: `user_id = "${user.id}" && status = "Aprovado"`,
        sort: '-created',
      })
      setUserSubmissions(records)
    } catch (err) {
      console.error(err)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as atividades.',
        variant: 'destructive',
      })
    } finally {
      setLoadingDetails(false)
    }
  }

  const loadUsers = async () => {
    try {
      const records = await pb.collection('users').getFullList({
        filter: 'is_active = true && role != "admin"',
        sort: '-points',
      })
      setUsers(records)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  useRealtime('users', () => {
    loadUsers()
  })

  const uniqueTurmas = useMemo(() => {
    return Array.from({ length: 15 }, (_, i) => i + 1)
  }, [])

  const filteredUsers = useMemo(() => {
    if (filterTurma === 'all') return users
    return users.filter((u) => u.turma === Number(filterTurma))
  }, [users, filterTurma])

  const top3 = filteredUsers.slice(0, 3)
  const rest = filteredUsers.slice(3)

  const handleExport = async (format: 'excel' | 'pdf') => {
    toast({
      title: 'Gerando relatório...',
      description: 'Aguarde enquanto os dados são processados.',
    })
    try {
      await exportRanking(format)
      toast({
        title: 'Exportação Concluída',
        description:
          format === 'excel'
            ? 'O download do arquivo CSV foi iniciado com sucesso.'
            : 'A janela de impressão do PDF foi aberta.',
      })
    } catch (err: any) {
      toast({
        title: 'Erro na Exportação',
        description: err.message || 'Não foi possível gerar o relatório.',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-fade-in-up pb-10 relative">
      <div className="flex flex-col gap-6 text-center">
        <div className="flex flex-col items-center justify-center space-y-3 relative z-10">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Quadro de Honra</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto px-4 mt-1">
            O princípio da Meritocracia em ação. Acompanhe os líderes da Jornada de Evolução.
          </p>
        </div>

        {isAdmin && (
          <div className="flex flex-col sm:flex-row justify-center gap-3 items-center w-full z-20 mt-2">
            <Select value={filterTurma} onValueChange={setFilterTurma}>
              <SelectTrigger className="w-full sm:w-[200px] shadow-sm border-border/60 bg-background hover:bg-muted">
                <SelectValue placeholder="Filtrar por Turma" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Turmas</SelectItem>
                {uniqueTurmas.map((t) => (
                  <SelectItem key={t} value={t.toString()}>
                    Turma {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full sm:w-auto shadow-sm border-border/60 bg-background hover:bg-muted"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Exportar Ranking
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleExport('excel')} className="cursor-pointer">
                  <FileSpreadsheet className="w-4 h-4 mr-2 text-emerald-600" />
                  Excel / CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('pdf')} className="cursor-pointer">
                  <FileType2 className="w-4 h-4 mr-2 text-red-600" />
                  Relatório PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      {loading ? (
        <div className="text-center py-20 text-muted-foreground animate-pulse">
          Carregando Quadro de Honra...
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground bg-muted/20 rounded-xl border border-border/50">
          Nenhum dado disponível no momento para esta turma
        </div>
      ) : (
        <>
          {/* Podium */}
          <div className="flex justify-center items-end gap-2 md:gap-6 pt-10 pb-6 px-2 sm:px-4">
            {[top3[1], top3[0], top3[2]].filter(Boolean).map((user, idx) => {
              const isFirst = idx === 1
              const position = isFirst ? 1 : idx === 0 ? 2 : 3
              const heightClass = position === 1 ? 'h-56' : position === 2 ? 'h-44' : 'h-36'
              const colorClass =
                position === 1
                  ? 'bg-amber-500 text-amber-950 shadow-amber-500/20'
                  : position === 2
                    ? 'bg-zinc-300 text-zinc-800 shadow-zinc-400/20'
                    : 'bg-orange-300/90 text-orange-900 shadow-orange-500/20'

              return (
                <div
                  key={user.id}
                  className="flex flex-col items-center relative animate-slide-up flex-1 max-w-[160px] cursor-pointer group"
                  style={{ animationDelay: `${(3 - position) * 150}ms` }}
                  onClick={() => handleUserClick(user)}
                >
                  <Avatar
                    className={cn(
                      'border-4 shadow-xl mb-3 sm:mb-5 z-10 bg-background',
                      position === 1
                        ? 'w-20 h-20 sm:w-28 sm:h-28 border-amber-500'
                        : 'w-16 h-16 sm:w-24 sm:h-24 border-background',
                    )}
                  >
                    <AvatarImage
                      src={user.avatar ? pb.files.getUrl(user, user.avatar) : undefined}
                    />
                    <AvatarFallback className="font-bold text-lg sm:text-2xl text-muted-foreground">
                      {(user.full_name || user.name)?.charAt(0) || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-center mb-3 sm:mb-5 px-1 sm:px-2 flex flex-col items-center">
                    <p
                      className="text-[9px] sm:text-[10px] uppercase font-bold text-secondary line-clamp-1 w-full"
                      title={user.level || 'Nível I'}
                    >
                      {(user.level || 'Nível I').split(' - ')[0]}
                    </p>
                    <p className="font-bold text-xs sm:text-base leading-tight truncate w-full max-w-[100px] sm:max-w-[140px] mt-0.5">
                      {user.full_name || user.name}
                    </p>
                    <p className="text-[10px] sm:text-sm font-semibold text-muted-foreground">
                      {user.points || 0} pts
                    </p>
                  </div>
                  <div
                    className={cn(
                      'w-full rounded-t-xl flex flex-col items-center justify-start pt-4 sm:pt-6 shadow-lg relative overflow-hidden',
                      heightClass,
                      colorClass,
                    )}
                  >
                    <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent"></div>
                    <span className="text-3xl sm:text-4xl font-black relative z-10 opacity-80 group-hover:scale-110 transition-transform">
                      {position}
                    </span>
                    <div className="absolute bottom-2 text-primary-foreground/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-[10px] bg-black/20 px-2 py-0.5 rounded-full backdrop-blur-sm">
                      <Info className="w-3 h-3" />
                      Detalhes
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block">
            <Card className="border-border/60 shadow-elevation overflow-hidden">
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-muted/40 border-b border-border/50">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-20 text-center py-4">Posição</TableHead>
                      <TableHead>Observador Certificado</TableHead>
                      <TableHead>Nível de Certificação</TableHead>
                      <TableHead className="text-right pr-6">Pontuação Geral</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rest.map((user, idx) => (
                      <TableRow
                        key={user.id}
                        className="hover:bg-muted/30 transition-colors cursor-pointer group"
                        onClick={() => handleUserClick(user)}
                      >
                        <TableCell className="text-center py-4">
                          <span className="font-bold text-muted-foreground text-lg">
                            {idx + 4}º
                          </span>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="flex items-center gap-4">
                            <Avatar className="w-10 h-10 border-2 border-background shadow-sm shrink-0">
                              <AvatarImage
                                src={user.avatar ? pb.files.getUrl(user, user.avatar) : undefined}
                              />
                              <AvatarFallback className="font-semibold text-muted-foreground">
                                {(user.full_name || user.name)?.charAt(0) || '?'}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-bold text-base">
                              {user.full_name || user.name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-secondary/10 text-secondary border border-secondary/20">
                            {user.level || 'Nível I - Observador Certificado (Iniciante)'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right pr-6 py-4">
                          <div className="flex items-center justify-end gap-3">
                            <span className="font-black text-lg text-foreground/80">
                              {user.points || 0}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Info className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-3 px-2">
            {rest.map((user, idx) => (
              <Card
                key={user.id}
                className="p-4 flex items-center justify-between border-border/60 shadow-sm bg-card hover:bg-muted/10 transition-colors gap-3 cursor-pointer"
                onClick={() => handleUserClick(user)}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <span className="font-bold text-muted-foreground text-base w-6 text-center shrink-0">
                    {idx + 4}º
                  </span>
                  <Avatar className="w-11 h-11 border-2 border-background shadow-sm shrink-0">
                    <AvatarImage
                      src={user.avatar ? pb.files.getUrl(user, user.avatar) : undefined}
                    />
                    <AvatarFallback className="font-semibold text-muted-foreground">
                      {(user.full_name || user.name)?.charAt(0) || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col min-w-0">
                    <span className="font-bold text-sm leading-tight text-foreground truncate">
                      {user.full_name || user.name}
                    </span>
                    <span
                      className="text-[10px] font-semibold text-secondary mt-0.5 uppercase tracking-wider line-clamp-1"
                      title={user.level || 'Nível I'}
                    >
                      {user.level || 'Nível I'}
                    </span>
                  </div>
                </div>
                <div className="font-black text-foreground/80 text-base shrink-0">
                  {user.points || 0}
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      <Dialog open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
        <DialogContent className="max-w-2xl w-[95vw] sm:w-full max-h-[90vh] overflow-hidden flex flex-col p-4 sm:p-6">
          <DialogHeader className="pb-4 border-b">
            <DialogTitle className="text-xl sm:text-2xl">Detalhamento de Pontuação</DialogTitle>
            <DialogDescription className="text-base font-medium text-foreground mt-2">
              {selectedUser?.full_name || selectedUser?.name}
            </DialogDescription>
            <DialogDescription className="text-sm">
              Atividades aprovadas que compõem a pontuação do observador no ranking.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto py-4 min-h-[200px]">
            {loadingDetails ? (
              <div className="h-full flex flex-col justify-center items-center gap-3 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p>Carregando atividades...</p>
              </div>
            ) : userSubmissions.length === 0 ? (
              <div className="h-full flex flex-col justify-center items-center text-center p-8 bg-muted/20 rounded-xl border border-dashed">
                <p className="text-muted-foreground">
                  Nenhuma atividade aprovada encontrada para este usuário.
                </p>
                <p className="text-sm text-muted-foreground/70 mt-2">
                  Apenas atividades com status "Aprovado" somam pontos no ranking.
                </p>
              </div>
            ) : (
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="whitespace-nowrap">Data</TableHead>
                      <TableHead>Atividade</TableHead>
                      <TableHead className="hidden sm:table-cell">Categoria</TableHead>
                      <TableHead className="text-right">Pontos</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userSubmissions.map((sub) => (
                      <TableRow key={sub.id}>
                        <TableCell className="text-sm whitespace-nowrap">
                          {new Date(sub.created).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell className="text-sm font-medium">
                          {sub.title}
                          <span className="block sm:hidden text-xs font-normal text-muted-foreground mt-0.5">
                            {TYPE_LABELS[sub.type] || sub.type}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm hidden sm:table-cell">
                          {TYPE_LABELS[sub.type] || sub.type}
                        </TableCell>
                        <TableCell className="text-right font-bold text-primary">
                          +{sub.score || 0}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  <TableFooter>
                    <TableRow>
                      <TableCell colSpan={2} className="sm:hidden font-bold">
                        Total
                      </TableCell>
                      <TableCell colSpan={3} className="hidden sm:table-cell font-bold">
                        Total
                      </TableCell>
                      <TableCell className="text-right font-black text-lg text-primary">
                        {userSubmissions.reduce((acc, sub) => acc + (sub.score || 0), 0)}
                      </TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
