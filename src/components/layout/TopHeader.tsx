import useGameStore from '@/stores/useGameStore'
import { Bell, Trophy } from 'lucide-react'
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

export function TopHeader() {
  const { points } = useGameStore()
  const { isMobile } = useSidebar()

  return (
    <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b bg-background/80 backdrop-blur-md px-4 md:px-6">
      <div className="flex items-center gap-2">
        {isMobile && <SidebarTrigger />}
        <h2 className="text-lg font-semibold tracking-tight hidden sm:block">Portal Estratégico</h2>
      </div>

      <div className="flex items-center gap-4">
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-2 bg-accent/10 px-4 py-1.5 rounded-full border border-accent/20 cursor-default transition-transform hover:scale-105">
              <Trophy className="w-4 h-4 text-accent" />
              <span className="text-sm font-bold text-accent-foreground">{points} pts</span>
            </div>
          </TooltipTrigger>
          <TooltipContent>Pontuação Total Acumulada</TooltipContent>
        </Tooltip>

        <button className="relative p-2 rounded-full hover:bg-secondary/10 transition-colors text-muted-foreground hover:text-foreground">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-primary border-2 border-background rounded-full animate-pulse"></span>
        </button>
      </div>
    </header>
  )
}
