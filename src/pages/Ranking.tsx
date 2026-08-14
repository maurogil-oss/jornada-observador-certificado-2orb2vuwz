import React, { useEffect, useState, useMemo, useCallback } from 'react'
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
import { cn, getUserLevelIndex } from '@/lib/utils'
import {
  Download,
  FileSpreadsheet,
  FileType2,
  Loader2,
  Info,
  X,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Trophy,
} from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Badge } from '@/components/ui/badge'
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

function UserBreakdown({ userId, userPoints }: { userId: string; userPoints: number }) {
  const [submissions, setSubmissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { user: currentUser } = useAuthStore()
  const isAdmin = currentUser?.role === 'admin'

  const loadSubmissions = useCallback(async () => {
    const filter = isAdmin
      ? `user_id = "${userId}"`
      : `user_id = "${userId}" && status = "Aprovado"`

    try {
      const records = await pb.collection('submissions').getFullList({
        filter,
        sort: '-created',
      })
      setSubmissions(records)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [userId, isAdmin])

  useEffect(() => {
    setLoading(true)
    loadSubmissions()
  }, [loadSubmissions])

  useRealtime('submissions', () => {
    loadSubmissions()
  })

  if (loading) {
    return (
      <div className="p-8 flex flex-col justify-center items-center gap-3 text-muted-foreground animate-pulse">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <p className="text-sm">Carregando atividades...</p>
      </div>
    )
  }

  if (submissions.length === 0) {
    return (
      <div className="p-8 text-center bg-muted/20 border border-dashed rounded-xl m-4">
        <p className="text-muted-foreground font-medium">
          {isAdmin
            ? 'Nenhuma atividade encontrada para este observador.'
            : 'Nenhuma atividade aprovada encontrada para este observador.'}
        </p>
        {!isAdmin && (
          <p className="text-sm text-muted-foreground/70 mt-1">
            Apenas atividades com status "Aprovado" somam pontos no ranking.
          </p>
        )}
      </div>
    )
  }

  const totalScore = submissions
    .filter((sub) => sub.status === 'Aprovado')
    .reduce((acc, sub) => acc + (Number(sub.score) || 0), 0)

  return (
    <div className="p-4 sm:p-6 bg-card/50">
      <div className="rounded-md border overflow-hidden bg-background shadow-sm">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="whitespace-nowrap w-[120px]">Data</TableHead>
              <TableHead>Atividade</TableHead>
              <TableHead className="hidden sm:table-cell w-[150px]">Categoria</TableHead>
              {isAdmin && <TableHead className="hidden md:table-cell w-[120px]">Status</TableHead>}
              {isAdmin && <TableHead className="hidden lg:table-cell">Feedback</TableHead>}
              <TableHead className="text-right w-[100px]">Pontos</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {submissions.map((sub) => (
              <TableRow key={sub.id}>
                <TableCell className="text-sm whitespace-nowrap text-muted-foreground">
                  {new Date(sub.created).toLocaleDateString('pt-BR')}
                </TableCell>
                <TableCell className="text-sm font-medium">
                  {sub.title}
                  <span className="block sm:hidden text-xs font-normal text-muted-foreground mt-0.5">
                    {TYPE_LABELS[sub.type] || sub.type}
                  </span>
                  {isAdmin && (
                    <div className="block md:hidden mt-1 space-y-1">
                      <Badge variant="outline" className="text-[10px]">
                        {sub.status}
                      </Badge>
                      {sub.feedback && (
                        <p className="text-xs text-muted-foreground line-clamp-2">{sub.feedback}</p>
                      )}
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-sm hidden sm:table-cell text-muted-foreground">
                  {TYPE_LABELS[sub.type] || sub.type}
                </TableCell>
                {isAdmin && (
                  <TableCell className="hidden md:table-cell">
                    <Badge
                      variant={
                        sub.status === 'Aprovado'
                          ? 'default'
                          : sub.status === 'Ajuste Necessário'
                            ? 'destructive'
                            : 'secondary'
                      }
                      className="text-[10px]"
                    >
                      {sub.status}
                    </Badge>
                  </TableCell>
                )}
                {isAdmin && (
                  <TableCell
                    className="hidden lg:table-cell text-xs text-muted-foreground max-w-[200px] truncate"
                    title={sub.feedback || ''}
                  >
                    {sub.feedback || '-'}
                  </TableCell>
                )}
                <TableCell className="text-right font-bold text-primary">
                  {sub.status === 'Aprovado' ? `+${sub.score || 0}` : '-'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter className="bg-muted/30">
            <TableRow>
              <TableCell
                colSpan={2}
                className="sm:hidden font-bold text-right text-muted-foreground"
              >
                Total de Pontos Lançados
              </TableCell>
              <TableCell
                colSpan={isAdmin ? 5 : 3}
                className="hidden sm:table-cell font-bold text-right text-muted-foreground"
              >
                Total de Pontos Lançados
              </TableCell>
              <TableCell className="text-right font-bold text-muted-foreground">
                {totalScore}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell
                colSpan={2}
                className="sm:hidden font-bold text-right text-green-600 dark:text-green-500"
              >
                <div className="flex items-center justify-end gap-1">
                  Pontos Válidos
                  <Tooltip>
                    <TooltipTrigger type="button" tabIndex={-1}>
                      <HelpCircle className="h-3 w-3 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs text-xs font-normal">
                        Pontuação contabilizada para evolução de nível, respeitando os limites.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </TableCell>
              <TableCell
                colSpan={isAdmin ? 5 : 3}
                className="hidden sm:table-cell font-bold text-right text-green-600 dark:text-green-500"
              >
                <div className="flex items-center justify-end gap-1">
                  Pontos Válidos
                  <Tooltip>
                    <TooltipTrigger type="button" tabIndex={-1}>
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs text-xs font-normal">
                        Pontuação contabilizada para evolução de nível, respeitando os limites.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </TableCell>
              <TableCell className="text-right font-black text-lg text-green-600 dark:text-green-500">
                {userPoints}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell
                colSpan={2}
                className="sm:hidden font-bold text-right text-orange-600 dark:text-orange-500"
              >
                <div className="flex items-center justify-end gap-1">
                  Pontos Excedentes
                  <Tooltip>
                    <TooltipTrigger type="button" tabIndex={-1}>
                      <HelpCircle className="h-3 w-3 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs text-xs font-normal">
                        Pontuação que ultrapassou o limite máximo permitido, não somando para o
                        nível.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </TableCell>
              <TableCell
                colSpan={isAdmin ? 5 : 3}
                className="hidden sm:table-cell font-bold text-right text-orange-600 dark:text-orange-500"
              >
                <div className="flex items-center justify-end gap-1">
                  Pontos Excedentes
                  <Tooltip>
                    <TooltipTrigger type="button" tabIndex={-1}>
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs text-xs font-normal">
                        Pontuação que ultrapassou o limite máximo permitido, não somando para o
                        nível.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </TableCell>
              <TableCell className="text-right font-bold text-orange-600 dark:text-orange-500">
                {Math.max(0, totalScore - userPoints)}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>
    </div>
  )
}

export default function Ranking() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filterTurma, setFilterTurma] = useState<string>('all')
  const { user: currentUser } = useAuthStore()
  const isAdmin = currentUser?.role === 'admin'
  const { toast } = useToast()

  const [expandedUser, setExpandedUser] = useState<string | null>(null)
  const userLevelIndex = useMemo(() => getUserLevelIndex(currentUser), [currentUser])
  const [selectedLevel, setSelectedLevel] = useState<number>(0)

  useEffect(() => {
    if (userLevelIndex >= 0) setSelectedLevel(userLevelIndex)
  }, [userLevelIndex])

  const handleToggleExpand = (userId: string) => {
    setExpandedUser((prev) => (prev === userId ? null : userId))
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

  const sortedUsers = useMemo(() => {
    return [...users].sort((a, b) => {
      const pointsDiff = (b.points || 0) - (a.points || 0)
      if (pointsDiff !== 0) return pointsDiff
      const aName = (a.full_name || a.nickname || a.name || '').toLowerCase()
      const bName = (b.full_name || b.nickname || b.name || '').toLowerCase()
      return aName.localeCompare(bName)
    })
  }, [users])

  const filteredUsers = useMemo(() => {
    let result = sortedUsers.filter((u) => getUserLevelIndex(u) === selectedLevel)
    if (filterTurma !== 'all') {
      result = result.filter((u) => u.turma === Number(filterTurma))
    }
    return result
  }, [sortedUsers, filterTurma, selectedLevel])

  const myPosition = useMemo(() => {
    if (!currentUser) return null
    const currentUserInList = filteredUsers.find((u) => u.id === currentUser.id)
    if (!currentUserInList) return null
    const idx = filteredUsers.findIndex((u) => u.id === currentUser.id)
    return {
      position: idx >= 0 ? idx + 1 : null,
      user: currentUserInList,
    }
  }, [filteredUsers, currentUser])

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
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Ranking</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto px-4 mt-1">
            O princípio da Meritocracia em ação. Acompanhe os líderes da Jornada de Evolução.
          </p>
        </div>

        <div className="flex justify-center gap-2 flex-wrap">
          {[
            { index: 0, label: 'Nível I' },
            { index: 1, label: 'Nível II' },
            { index: 2, label: 'Nível III' },
          ].map((lvl) => (
            <Button
              key={lvl.index}
              variant={selectedLevel === lvl.index ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedLevel(lvl.index)}
              className={cn(
                'shadow-sm transition-all',
                selectedLevel === lvl.index
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-background border-border/60 hover:bg-muted',
              )}
            >
              {lvl.label}
            </Button>
          ))}
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

      {!isAdmin && myPosition && myPosition.position !== null && currentUser && (
        <div className="flex flex-col items-center gap-2 px-4 animate-fade-in-up">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Classificação no {['Nível I', 'Nível II', 'Nível III'][selectedLevel]}
          </span>
          <Card className="w-full max-w-md border-primary/20 bg-primary/5 shadow-md">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="flex flex-col items-center justify-center min-w-[64px]">
                <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                  Minha Posição
                </span>
                <span className="text-3xl font-black text-primary leading-tight">
                  {myPosition.position}º
                </span>
              </div>
              <div className="h-12 w-px bg-border shrink-0" />
              <Avatar className="w-12 h-12 border-2 border-primary/30 shrink-0">
                <AvatarImage
                  src={
                    myPosition.user.avatar
                      ? pb.files.getUrl(myPosition.user, myPosition.user.avatar)
                      : currentUser.avatar || undefined
                  }
                />
                <AvatarFallback className="font-bold text-muted-foreground">
                  {(
                    myPosition.user.full_name ||
                    myPosition.user.name ||
                    currentUser.full_name ||
                    currentUser.name
                  )?.charAt(0) || '?'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm truncate text-foreground">
                  {myPosition.user.full_name ||
                    myPosition.user.name ||
                    currentUser.full_name ||
                    currentUser.name}
                </p>
                <p className="text-xs text-muted-foreground font-medium">
                  {myPosition.user.points ?? currentUser.points ?? 0} pontos
                </p>
              </div>
              <Trophy className="w-6 h-6 text-primary/60 shrink-0" />
            </CardContent>
          </Card>
        </div>
      )}

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
            {top3.map((user, actualIdx) => {
              const position = actualIdx + 1 // 1, 2, 3
              // Visual arrangement order: 2nd place on left, 1st place in center, 3rd place on right
              // Using flex order: 2nd place order-1, 1st place order-2, 3rd place order-3
              const orderClass = position === 1 ? 'order-2' : position === 2 ? 'order-1' : 'order-3'
              const heightClass = position === 1 ? 'h-56' : position === 2 ? 'h-44' : 'h-36'
              const colorClass =
                position === 1
                  ? 'bg-[#F59E0B] text-amber-950'
                  : position === 2
                    ? 'bg-[#E5E7EB] text-zinc-800'
                    : 'bg-[#FDBA74] text-orange-950'

              return (
                <div
                  key={user.id}
                  className={cn(
                    'flex flex-col items-center relative animate-slide-up flex-1 max-w-[160px] cursor-pointer group',
                    orderClass,
                  )}
                  style={{ animationDelay: `${(3 - position) * 150}ms` }}
                  onClick={() => handleToggleExpand(user.id)}
                >
                  <Avatar
                    className={cn(
                      'border-4 shadow-sm mb-3 sm:mb-5 z-10 bg-background',
                      position === 1
                        ? 'w-20 h-20 sm:w-28 sm:h-28 border-[#F59E0B]'
                        : position === 2
                          ? 'w-16 h-16 sm:w-24 sm:h-24 border-[#E5E7EB]'
                          : 'w-16 h-16 sm:w-24 sm:h-24 border-[#FDBA74]/30',
                    )}
                  >
                    <AvatarImage
                      src={user.avatar ? pb.files.getUrl(user, user.avatar) : undefined}
                    />
                    <AvatarFallback className="font-bold text-lg sm:text-2xl text-muted-foreground bg-muted">
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
                    <p className="font-bold text-xs sm:text-base leading-tight truncate w-full max-w-[100px] sm:max-w-[140px] mt-0.5 text-foreground">
                      {user.full_name || user.name}
                    </p>
                    <p className="text-[10px] sm:text-sm font-semibold text-muted-foreground">
                      {user.points || 0} pts
                    </p>
                  </div>
                  <div
                    className={cn(
                      'w-full rounded-t-xl flex flex-col items-center justify-start pt-4 sm:pt-6 shadow-sm relative overflow-hidden transition-transform',
                      heightClass,
                      colorClass,
                    )}
                  >
                    <span className="text-3xl sm:text-5xl font-black relative z-10 opacity-80 group-hover:scale-110 transition-transform">
                      {position}
                    </span>
                    <div className="absolute bottom-2 text-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-[10px] bg-black/10 px-2 py-0.5 rounded-full backdrop-blur-sm font-medium">
                      {expandedUser === user.id ? (
                        <ChevronUp className="w-3 h-3" />
                      ) : (
                        <ChevronDown className="w-3 h-3" />
                      )}
                      {expandedUser === user.id ? 'Ocultar' : 'Detalhes'}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Top 3 Expanded View */}
          {expandedUser && top3.find((u) => u.id === expandedUser) && (
            <div className="animate-fade-in-down mb-8 px-2 sm:px-0">
              <div className="bg-card border border-border/60 shadow-lg rounded-xl overflow-hidden">
                <div className="p-4 border-b border-border/50 bg-muted/30 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-lg">Detalhamento de Pontuação</h3>
                    <p className="text-sm text-muted-foreground font-medium">
                      {top3.find((u) => u.id === expandedUser)?.full_name ||
                        top3.find((u) => u.id === expandedUser)?.name}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setExpandedUser(null)}
                    className="rounded-full hover:bg-muted/50"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <UserBreakdown
                  userId={expandedUser}
                  userPoints={top3.find((u) => u.id === expandedUser)?.points || 0}
                />
              </div>
            </div>
          )}

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
                      <React.Fragment key={user.id}>
                        <TableRow
                          className={cn(
                            'transition-colors cursor-pointer group',
                            expandedUser === user.id ? 'bg-muted/5' : 'hover:bg-muted/30',
                          )}
                          onClick={() => handleToggleExpand(user.id)}
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
                                className="h-8 w-8 text-muted-foreground group-hover:text-foreground transition-colors"
                              >
                                {expandedUser === user.id ? (
                                  <ChevronUp className="h-5 w-5" />
                                ) : (
                                  <ChevronDown className="h-5 w-5" />
                                )}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                        {expandedUser === user.id && (
                          <TableRow className="bg-muted/5 hover:bg-muted/5">
                            <TableCell colSpan={4} className="p-0 border-b-2 border-border/60">
                              <div className="animate-fade-in-down overflow-hidden">
                                <UserBreakdown userId={user.id} userPoints={user.points || 0} />
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-3 px-2">
            {rest.map((user, idx) => (
              <div
                key={user.id}
                className="border border-border/60 shadow-sm bg-card rounded-xl overflow-hidden transition-all duration-300"
              >
                <div
                  className={cn(
                    'p-4 flex items-center justify-between hover:bg-muted/10 transition-colors gap-3 cursor-pointer',
                    expandedUser === user.id ? 'bg-muted/10 border-b border-border/50' : '',
                  )}
                  onClick={() => handleToggleExpand(user.id)}
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
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-black text-foreground/80 text-base">
                      {user.points || 0}
                    </span>
                    {expandedUser === user.id ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </div>

                {expandedUser === user.id && (
                  <div className="bg-muted/5 animate-fade-in-down overflow-hidden">
                    <UserBreakdown userId={user.id} userPoints={user.points || 0} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
