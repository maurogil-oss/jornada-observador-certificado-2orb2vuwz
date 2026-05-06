import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import pb from '@/lib/pocketbase/client'
import { BadgeCheck, Trophy, ArrowLeft, Loader2, AlertCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'

export default function PublicProfile() {
  const { id } = useParams()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (!id) return
        const record = await pb.collection('users').getOne(id)
        setUser(record)
      } catch (err) {
        console.error(err)
        setError(true)
      } finally {
        setLoading(false)
      }
    }
    fetchUser()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/20 flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground font-medium">Carregando perfil validado...</p>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-muted/20 flex flex-col items-center justify-center p-4 text-center animate-fade-in">
        <AlertCircle className="w-12 h-12 text-destructive mb-4" />
        <h1 className="text-2xl font-bold mb-2">Perfil não encontrado</h1>
        <p className="text-muted-foreground max-w-md mb-6">
          O perfil que você está tentando acessar não existe ou não está disponível publicamente.
        </p>
        <Button asChild>
          <Link to="/">Ir para o Início</Link>
        </Button>
      </div>
    )
  }

  const avatarUrl = user.avatar ? pb.files.getURL(user, user.avatar, { thumb: '256x256' }) : ''
  const name = user.full_name || user.name || 'Observador'
  const initials = name.substring(0, 2).toUpperCase()

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-background py-12 px-4 sm:px-6 animate-fade-in">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <Button variant="ghost" asChild className="text-muted-foreground hover:text-foreground">
            <Link to="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para a Plataforma
            </Link>
          </Button>
        </div>

        <Card className="overflow-hidden border-border/60 shadow-lg">
          <div className="h-40 bg-gradient-to-r from-blue-700 to-indigo-900 relative">
            <div className="absolute inset-0 bg-[url('https://img.usecurling.com/p/800/200?q=abstract%20texture&color=blue')] opacity-20 bg-cover bg-center"></div>
          </div>
          <CardContent className="pt-0 relative px-6 sm:px-12 pb-12">
            <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-end -mt-20 mb-10 relative z-10">
              <Avatar className="w-36 h-36 border-4 border-background shadow-md">
                <AvatarImage src={avatarUrl} alt={name} className="object-cover" />
                <AvatarFallback className="text-4xl font-bold bg-primary text-primary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="text-center sm:text-left flex-1 pb-2">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 justify-center sm:justify-start">
                  <h1 className="text-3xl font-bold text-foreground">{name}</h1>
                  <BadgeCheck
                    className="w-7 h-7 text-blue-500 shrink-0 drop-shadow-sm"
                    title="Perfil Verificado Oficialmente"
                  />
                </div>
                {user.nickname && (
                  <p className="text-lg text-muted-foreground mt-1">{user.nickname}</p>
                )}
                {(user.city || user.state) && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {[user.city, user.state].filter(Boolean).join(' - ')}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-slate-900/50 rounded-xl p-6 border border-border/50 shadow-sm flex flex-col items-center sm:items-start text-center sm:text-left hover:shadow-md transition-shadow">
                <div className="flex items-center justify-center w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 mb-4">
                  <Trophy className="w-7 h-7" />
                </div>
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">
                  Nível de Certificação
                </p>
                <p className="text-2xl font-black text-foreground text-balance leading-tight">
                  {user.level || 'Não avaliado'}
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900/50 rounded-xl p-6 border border-border/50 shadow-sm flex flex-col items-center sm:items-start text-center sm:text-left hover:shadow-md transition-shadow">
                <div className="flex items-center justify-center w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 mb-4">
                  <BadgeCheck className="w-7 h-7" />
                </div>
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">
                  Pontos de Impacto
                </p>
                <p className="text-2xl font-black text-foreground">{user.points || 0} pts</p>
              </div>
            </div>

            <div className="mt-10 pt-8 border-t border-border/40 text-center">
              <div className="inline-flex items-center justify-center p-2 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 rounded-full mb-3">
                <BadgeCheck className="w-5 h-5" />
              </div>
              <p className="text-sm text-muted-foreground max-w-xl mx-auto">
                Este é um perfil público oficial validado pela plataforma{' '}
                <strong>Jornada Observador Certificado</strong> do ONSV. As conquistas e níveis
                exibidos aqui são autênticos e atestados.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
