import { useEffect, useState } from 'react'
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
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { Download, FileSpreadsheet, FileType2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import useAuthStore from '@/stores/useAuthStore'
import { exportRanking } from '@/lib/export'

export default function Ranking() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filterTurma, setFilterTurma] = useState<string>('all')
  const { user: currentUser } = useAuthStore()
  const isAdmin = currentUser?.role === 'admin'
  const { toast } = useToast()

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
    const turmas = users.map((u) => u.turma).filter((t) => typeof t === 'number' && !isNaN(t))
    return Array.from(new Set(turmas)).sort((a, b) => a - b)
  }, [users])

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
      <div className="text-center space-y-3 relative flex flex-col md:flex-row md:justify-center items-center">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Quadro de Honra</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto px-4 mt-3">
            O princípio da Meritocracia em ação. Acompanhe os líderes da Jornada de Evolução.
          </p>
        </div>

        {isAdmin && (
          <div className="md:absolute right-0 top-0 mt-4 md:mt-0 z-20 flex flex-col sm:flex-row gap-3">
            <Select value={filterTurma} onValueChange={setFilterTurma}>
              <SelectTrigger className="w-full sm:w-[180px] shadow-sm border-border/60 bg-background hover:bg-muted">
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
                  className="shadow-sm border-border/60 bg-background hover:bg-muted"
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
                  className="flex flex-col items-center relative animate-slide-up flex-1 max-w-[160px]"
                  style={{ animationDelay: `${(3 - position) * 150}ms` }}
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
                      {user.name?.charAt(0) || '?'}
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
                      {user.name}
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
                    <span className="text-3xl sm:text-4xl font-black relative z-10 opacity-80">
                      {position}
                    </span>
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
                      <TableRow key={user.id} className="hover:bg-muted/30 transition-colors">
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
                                {user.name?.charAt(0) || '?'}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-bold text-base">{user.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-secondary/10 text-secondary border border-secondary/20">
                            {user.level || 'Nível I - Observador Certificado (Iniciante)'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right pr-6 font-black text-lg text-foreground/80 py-4">
                          {user.points || 0}
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
                className="p-4 flex items-center justify-between border-border/60 shadow-sm bg-card hover:bg-muted/10 transition-colors gap-3"
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
                      {user.name?.charAt(0) || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col min-w-0">
                    <span className="font-bold text-sm leading-tight text-foreground truncate">
                      {user.name}
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
    </div>
  )
}
