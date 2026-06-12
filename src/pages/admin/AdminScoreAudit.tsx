import { useEffect, useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import {
  Search,
  Loader2,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Info,
  RefreshCw,
} from 'lucide-react'
import pb from '@/lib/pocketbase/client'
import useAuthStore from '@/stores/useAuthStore'
import { cn } from '@/lib/utils'
import { calculateUserPoints } from '@/lib/scoring'

interface User {
  id: string
  name: string
  full_name: string
  nickname: string
  points: number
  level?: string
}

const getLevelStyle = (level?: string) => {
  if (!level) return 'bg-muted/50 text-muted-foreground border-border'
  const l = level.toLowerCase()

  // Nível III / Nível 3
  if (l.match(/\b(iii|3)\b/))
    return 'bg-amber-500/10 text-amber-700 border-amber-500/30 dark:text-amber-400'
  // Nível II / Nível 2
  if (l.match(/\b(ii|2)\b/))
    return 'bg-blue-500/10 text-blue-700 border-blue-500/30 dark:text-blue-400'
  // Nível I / Nível 1
  if (l.match(/\b(i|1)\b/))
    return 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30 dark:text-emerald-400'

  if (l.includes('bronze')) return 'bg-[#CD7F32]/10 text-[#CD7F32] border-[#CD7F32]/30'
  if (l.includes('prata'))
    return 'bg-slate-200 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
  if (l.includes('ouro'))
    return 'bg-yellow-500/10 text-yellow-700 border-yellow-500/30 dark:text-yellow-400'
  if (l.includes('diamante'))
    return 'bg-cyan-500/10 text-cyan-700 border-cyan-500/30 dark:text-cyan-400'
  if (l.includes('rubi'))
    return 'bg-rose-500/10 text-rose-700 border-rose-500/30 dark:text-rose-400'

  return 'bg-primary/10 text-primary border-primary/30'
}

interface Submission {
  id: string
  title: string
  type: string
  created: string
  score: number
  status: string
  feedback?: string
}

const formatType = (type: string) => {
  const map: Record<string, string> = {
    titulation: 'Titulação',
    competency: 'Competência',
    other: 'Outros',
  }
  return map[type] || type
}

function EvolutionLevelsLegend() {
  return (
    <div className="space-y-6 mb-8 mt-8">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Níveis de Evolução
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          Acompanhe sua jornada e descubra os requisitos para alcançar novos níveis de certificação
          na plataforma.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Nível I */}
        <div className="flex flex-col p-6 rounded-xl border border-emerald-300 bg-emerald-50/50 dark:bg-emerald-950/20 dark:border-emerald-900/50 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-xl font-bold text-emerald-600 dark:text-emerald-500">Nível I</h3>
            <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white border-0 font-medium px-2.5 py-0.5 rounded-full flex items-center gap-1.5 shadow-none">
              <CheckCircle2 className="w-3.5 h-3.5" /> Concluído
            </Badge>
          </div>
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-6">
            Observador Certificado
          </p>

          <div className="mt-auto p-4 rounded-lg bg-emerald-100/60 dark:bg-emerald-900/40 border border-emerald-200/60 dark:border-emerald-800/50 flex gap-3">
            <Info className="w-5 h-5 text-emerald-600 dark:text-emerald-500 shrink-0 mt-0.5" />
            <div className="flex flex-col">
              <span className="font-bold text-emerald-800 dark:text-emerald-300 text-lg leading-tight mb-1">
                0 - 499
              </span>
              <span className="text-sm font-medium text-emerald-800 dark:text-emerald-300/90 leading-snug">
                Pontuação obrigatória em 1 Eixo
              </span>
            </div>
          </div>
        </div>

        {/* Nível II */}
        <div className="flex flex-col p-6 rounded-xl border border-blue-300 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-900/50 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-xl font-bold text-blue-600 dark:text-blue-500">Nível II</h3>
            <Badge className="bg-blue-500 hover:bg-blue-600 text-white border-0 font-medium px-2.5 py-0.5 rounded-full flex items-center gap-1.5 shadow-none">
              <CheckCircle2 className="w-3.5 h-3.5" /> Concluído
            </Badge>
          </div>
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-6">
            Observador Certificado Pleno
          </p>

          <div className="mt-auto flex flex-col pt-2">
            <span className="font-bold text-slate-700 dark:text-slate-300 text-lg mb-1">
              500 - 999
            </span>
            <span className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Pontuação obrigatória em 2 Eixos
            </span>
          </div>
        </div>

        {/* Nível III */}
        <div className="flex flex-col p-6 rounded-xl border border-amber-300 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-900/50 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-xl font-bold text-amber-600 dark:text-amber-500">Nível III</h3>
            <Badge className="bg-amber-500 hover:bg-amber-600 text-white border-0 font-medium px-2.5 py-0.5 rounded-full flex items-center gap-1.5 shadow-none">
              <CheckCircle2 className="w-3.5 h-3.5" /> Concluído
            </Badge>
          </div>
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-6">
            Observador Certificado Mobilizador
          </p>

          <div className="mt-auto flex flex-col pt-2">
            <span className="font-bold text-slate-700 dark:text-slate-300 text-lg mb-1">
              1000 - acima de 1000
            </span>
            <span className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Pontuação obrigatória em 3 Eixos
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function UserSubmissionsAudit({
  userId,
  userPoints,
  userLevel,
}: {
  userId: string
  userPoints: number
  userLevel?: string
}) {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const { user } = useAuthStore()
  const { toast } = useToast()
  const isAdmin = user?.role === 'admin'

  useEffect(() => {
    let isMounted = true
    const fetchSubmissions = async () => {
      setLoading(true)
      try {
        const filter = isAdmin
          ? `user_id = "${userId}"`
          : `user_id = "${userId}" && status = "Aprovado"`
        const records = await pb.collection('submissions').getFullList({
          filter,
          sort: 'created',
          expand: 'activity_id',
        })
        if (isMounted) {
          // Re-sort desc to display latest first in table, while calculateUserPoints sorts asc internally
          const descRecords = [...records].reverse()
          setSubmissions(descRecords as unknown as Submission[])
        }
      } catch (error) {
        console.error('Error fetching submissions:', error)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchSubmissions()

    return () => {
      isMounted = false
    }
  }, [userId, isAdmin])

  const { calculatedPoints, calculatedEixos, ignoredSubmissionIds } = useMemo(() => {
    const {
      totalPoints,
      eixo1Points,
      eixo2Points,
      eixo3Points,
      ignoredSubmissionIds: ignoredIds,
    } = calculateUserPoints(submissions, userLevel)
    return {
      calculatedPoints: totalPoints,
      calculatedEixos: { eixo1: eixo1Points, eixo2: eixo2Points, eixo3: eixo3Points },
      ignoredSubmissionIds: ignoredIds,
    }
  }, [submissions, userLevel])

  const isMatch = calculatedPoints === userPoints

  const handleSyncScore = async () => {
    if (!isAdmin) return
    setSyncing(true)
    try {
      const activeEixos = [
        calculatedEixos.eixo1 > 0,
        calculatedEixos.eixo2 > 0,
        calculatedEixos.eixo3 > 0,
      ].filter(Boolean).length
      let newLevel = 'Nível I'
      if (calculatedPoints >= 1000 && activeEixos >= 3) {
        newLevel = 'Nível III'
      } else if (calculatedPoints >= 500 && activeEixos >= 2) {
        newLevel = 'Nível II'
      }

      await pb.send('/backend/v1/audit/sync-user-score', {
        method: 'POST',
        body: JSON.stringify({
          user_id: userId,
          calculated_points: calculatedPoints,
          calculated_level: newLevel,
        }),
      })

      toast({
        title: 'Pontuação sincronizada',
        description: `A pontuação do usuário foi atualizada para ${calculatedPoints} pts.`,
      })

      setTimeout(() => window.location.reload(), 1500)
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao sincronizar',
        description: error.message || 'Ocorreu um erro ao atualizar a pontuação.',
      })
    } finally {
      setSyncing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6 text-muted-foreground bg-muted/20 rounded-md mt-2">
        <Loader2 className="h-5 w-5 animate-spin mr-3 text-primary" />
        <span className="text-sm font-medium">Carregando detalhes...</span>
      </div>
    )
  }

  return (
    <div className="space-y-4 pt-2">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-muted/30 p-4 rounded-lg border border-border/50">
        <div className="flex items-center gap-4 text-sm">
          <div className="flex flex-col">
            <span className="text-muted-foreground">Soma das Submissões</span>
            <span className="font-bold text-lg">{calculatedPoints} pts</span>
          </div>
          <div className="h-10 w-px bg-border hidden sm:block"></div>
          <div className="flex flex-col">
            <span className="text-muted-foreground">Total do Usuário</span>
            <span className="font-bold text-lg">{userPoints} pts</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge
            variant={isMatch ? 'default' : 'destructive'}
            className="flex items-center gap-1.5 px-3 py-1"
          >
            {isMatch ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Pontuação Sincronizada
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4" />
                Divergência Encontrada
              </>
            )}
          </Badge>

          {!isMatch && isAdmin && (
            <Button size="sm" variant="outline" onClick={handleSyncScore} disabled={syncing}>
              {syncing ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Sincronizar
            </Button>
          )}
        </div>
      </div>

      {submissions.length === 0 ? (
        <div className="text-center p-8 bg-muted/10 rounded-lg border border-dashed text-muted-foreground">
          <p>
            {isAdmin
              ? 'Nenhuma submissão encontrada para este usuário.'
              : 'Nenhuma pontuação aprovada encontrada para este usuário.'}
          </p>
        </div>
      ) : (
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Tipo</TableHead>
                {isAdmin && <TableHead>Status</TableHead>}
                {isAdmin && <TableHead>Feedback</TableHead>}
                <TableHead className="text-right">Pontos</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions.map((sub) => (
                <TableRow key={sub.id}>
                  <TableCell className="whitespace-nowrap">
                    {new Date(sub.created).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell className="font-medium">{sub.title}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-normal">
                      {formatType(sub.type)}
                    </Badge>
                  </TableCell>
                  {isAdmin && (
                    <TableCell>
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
                      className="text-xs text-muted-foreground max-w-[150px] truncate"
                      title={sub.feedback || ''}
                    >
                      {sub.feedback || '-'}
                    </TableCell>
                  )}
                  <TableCell className="text-right font-bold">
                    {sub.status === 'Aprovado' ? (
                      ignoredSubmissionIds.has(sub.id) ? (
                        <span
                          className="text-muted-foreground line-through opacity-60"
                          title="Pontuação não contabilizada (regra de limite ou hierarquia atingida)"
                        >
                          +{sub.score || 0}
                        </span>
                      ) : (
                        <span className="text-primary">+{sub.score || 0}</span>
                      )
                    ) : (
                      '-'
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}

export default function AdminScoreAudit() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const records = await pb.collection('users').getFullList({
          sort: '-points,full_name,name',
        })
        setUsers(records as unknown as User[])
      } catch (error) {
        console.error('Error fetching users:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchUsers()
  }, [])

  const filteredUsers = useMemo(() => {
    const term = searchTerm.toLowerCase()
    return users.filter((u) => {
      const nameMatch = (u.full_name || u.name || '').toLowerCase().includes(term)
      const nickMatch = (u.nickname || '').toLowerCase().includes(term)
      return nameMatch || nickMatch
    })
  }, [users, searchTerm])

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-5xl space-y-6 animate-fade-in">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <ShieldCheck className="h-8 w-8 text-primary" />
          Auditoria de Pontuação
        </h1>
        <p className="text-muted-foreground text-lg">
          Verifique o detalhamento dos pontos dos usuários gerados por submissões aprovadas.
        </p>
      </div>

      <EvolutionLevelsLegend />

      <Card>
        <CardHeader>
          <CardTitle>Pesquisar Usuário</CardTitle>
          <CardDescription>
            Busque pelo nome completo ou nome de guerra para auditar a composição dos pontos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Digite o nome ou nome de guerra..."
              className="pl-9 bg-muted/30"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center p-12 text-muted-foreground space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p>Carregando usuários...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredUsers.length === 0 ? (
                <div className="text-center p-8 bg-muted/10 rounded-lg text-muted-foreground">
                  <p>Nenhum usuário encontrado para "{searchTerm}".</p>
                </div>
              ) : (
                <Accordion type="single" collapsible className="w-full space-y-2">
                  {filteredUsers.map((user) => (
                    <AccordionItem
                      key={user.id}
                      value={user.id}
                      className="border rounded-lg px-4 bg-card shadow-sm data-[state=open]:border-primary/30 data-[state=open]:shadow-md transition-all"
                    >
                      <AccordionTrigger className="hover:no-underline py-4">
                        <div className="flex flex-1 items-center justify-between pr-4">
                          <div className="flex flex-col items-start gap-1">
                            <span className="font-semibold text-base text-left">
                              {user.full_name || user.name || 'Sem nome'}
                            </span>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                              {user.nickname && (
                                <Badge variant="secondary" className="font-medium text-xs">
                                  {user.nickname}
                                </Badge>
                              )}
                              <Badge
                                variant="outline"
                                className={cn(
                                  'font-medium text-[10px] uppercase tracking-wider',
                                  getLevelStyle(user.level),
                                )}
                              >
                                {user.level || 'Sem Nível'}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground hidden sm:inline-block">
                              Pontos Atuais:
                            </span>
                            <Badge variant="default" className="text-sm px-2">
                              {user.points || 0} pts
                            </Badge>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pb-4">
                        <UserSubmissionsAudit
                          userId={user.id}
                          userPoints={user.points || 0}
                          userLevel={user.level}
                        />
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
