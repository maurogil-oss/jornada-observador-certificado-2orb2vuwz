import { SidebarTrigger } from '@/components/ui/sidebar'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import useAuthStore from '@/stores/useAuthStore'
import useGameStore from '@/stores/useGameStore'
import { Badge } from '@/components/ui/badge'
import { Logo } from '@/components/shared/Logo'

export function TopHeader() {
  const { user } = useAuthStore()
  const { eixosProgress } = useGameStore()

  const highestAxisLevel = eixosProgress.some((e) => e.level === 'Mobilizador')
    ? 'Mobilizador'
    : eixosProgress.some((e) => e.level === 'Pleno')
      ? 'Pleno'
      : null

  return (
    <header className="h-16 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-between px-4 md:px-6 sticky top-0 z-30 shadow-sm">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground transition-colors min-h-[44px] min-w-[44px]" />
        <div className="hidden md:flex items-center gap-3">
          <Logo className="w-10 h-10" />
          <div className="flex flex-col">
            <h2 className="text-sm font-black text-foreground tracking-tight leading-none uppercase">
              Observador Certificado
            </h2>
            <span className="text-[10px] font-bold tracking-widest text-amber-600 dark:text-amber-500 uppercase mt-0.5">
              Jornada de Evolução
            </span>
          </div>
        </div>
      </div>

      {user && (
        <div className="flex items-center gap-3 sm:gap-5">
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={`hidden sm:inline-flex border-opacity-50 font-semibold ${
                user.role === 'admin'
                  ? 'bg-amber-500/10 text-amber-700 border-amber-500/30 dark:text-amber-400'
                  : 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30 dark:text-emerald-400'
              }`}
            >
              {user.role === 'admin' ? 'Administrador' : 'Observador'}
            </Badge>

            {user.role !== 'admin' && highestAxisLevel && (
              <Badge
                className={`hidden sm:inline-flex font-bold shadow-sm ${
                  highestAxisLevel === 'Mobilizador'
                    ? 'bg-amber-500 text-amber-950 hover:bg-amber-600'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                {highestAxisLevel}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-3 pl-2 sm:pl-5 sm:border-l border-border/50">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold leading-none text-foreground">{user.name}</p>
              <p className="text-xs text-muted-foreground mt-1 truncate max-w-[150px]">
                {user.email}
              </p>
            </div>
            <Avatar className="h-9 w-9 border-2 border-primary/20 shadow-sm">
              <AvatarImage src={`https://img.usecurling.com/ppl/thumbnail?seed=${user.email}`} />
              <AvatarFallback className="bg-primary/10 text-primary font-bold">
                {user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      )}
    </header>
  )
}
