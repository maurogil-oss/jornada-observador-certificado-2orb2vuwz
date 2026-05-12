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
import { Search, Loader2, ShieldCheck, AlertTriangle, CheckCircle2 } from 'lucide-react'
import pb from '@/lib/pocketbase/client'
import useAuthStore from '@/stores/useAuthStore'
import { cn } from '@/lib/utils'

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
    return 'bg-teal-500/10 text-teal-700 border-teal-500/30 dark:text-teal-400'
  // Nível I / Nível 1
  if (l.match(/\b(i|1)\b/))
    return 'bg-slate-200 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'

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

function UserSubmissionsAudit({ userId, userPoints }: { userId: string; userPoints: number }) {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuthStore()
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
          sort: '-created',
        })
        if (isMounted) {
          setSubmissions(records as unknown as Submission[])
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

  const calculatedPoints = useMemo(() => {
    return submissions
      .filter((sub) => sub.status === 'Aprovado')
      .reduce((sum, sub) => sum + (sub.score || 0), 0)
  }, [submissions])

  const isMatch = calculatedPoints === userPoints

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
                  <TableCell className="text-right font-bold text-primary">
                    {sub.status === 'Aprovado' ? `+${sub.score || 0}` : '-'}
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
                        <UserSubmissionsAudit userId={user.id} userPoints={user.points || 0} />
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
