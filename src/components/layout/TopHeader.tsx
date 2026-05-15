import { SidebarTrigger } from '@/components/ui/sidebar'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import useAuthStore from '@/stores/useAuthStore'
import useGameStore from '@/stores/useGameStore'
import { Badge } from '@/components/ui/badge'
import pb from '@/lib/pocketbase/client'
import logoOC from '@/assets/image-29272.png'
import { Link } from 'react-router-dom'

export function TopHeader() {
  const { user } = useAuthStore()
  const { level } = useGameStore()

  const levelName =
    level === 3
      ? 'Nível III - Observador Certificado Mobilizador'
      : level === 2
        ? 'Nível II - Observador Certificado Pleno'
        : 'Nível I - Observador Certificado'

  const shortLevelName = levelName.split(' - ')[0]
  const badgeColor =
    level === 3
      ? 'bg-amber-500 text-amber-950 hover:bg-amber-600'
      : level === 2
        ? 'bg-blue-500 text-white hover:bg-blue-600'
        : 'bg-emerald-500 text-white hover:bg-emerald-600'

  return (
    <header className="h-auto min-h-[4.5rem] md:h-20 py-2 md:py-0 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-between px-4 md:px-6 sticky top-0 z-30 shadow-sm">
      <div className="flex items-center gap-2 sm:gap-4 shrink-0 mr-4">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground transition-colors min-h-[44px] min-w-[44px] shrink-0" />
        <Link to="/" className="md:hidden flex items-center hover:opacity-80 transition-opacity">
          <img
            src={logoOC}
            alt="Observador Certificado"
            className="h-10 sm:h-12 w-auto max-w-[150px] sm:max-w-[200px] object-contain"
          />
        </Link>
      </div>

      {user && (
        <div className="flex items-center gap-3 sm:gap-5 shrink-0">
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={`hidden md:inline-flex border-opacity-50 font-semibold ${
                user.role === 'admin'
                  ? 'bg-amber-500/10 text-amber-700 border-amber-500/30 dark:text-amber-400'
                  : 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30 dark:text-emerald-400'
              }`}
            >
              <span>{user.role === 'admin' ? 'Administrador' : 'Observador'}</span>
            </Badge>

            {user.role !== 'admin' && (
              <Badge
                className={`hidden sm:inline-flex font-bold shadow-sm text-xs truncate max-w-[120px] md:max-w-[200px] lg:max-w-none ${badgeColor}`}
                title={levelName}
              >
                <span>{shortLevelName}</span>
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
              <AvatarImage
                src={user.avatar ? pb.files.getUrl(user as any, user.avatar) : undefined}
              />
              <AvatarFallback className="bg-primary/10 text-primary font-bold">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      )}
    </header>
  )
}
