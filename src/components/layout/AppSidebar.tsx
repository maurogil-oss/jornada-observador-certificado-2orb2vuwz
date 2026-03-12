import { Link, useLocation } from 'react-router-dom'
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar'
import { Home, Layers, Upload, Trophy, ShieldCheck } from 'lucide-react'
import useGameStore from '@/stores/useGameStore'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export function AppSidebar() {
  const location = useLocation()
  const { levelName } = useGameStore()

  const links = [
    { name: 'Dashboard', path: '/', icon: Home },
    { name: 'Eixos de Evolução', path: '/eixos', icon: Layers },
    { name: 'Submissões', path: '/submissoes', icon: Upload },
    { name: 'Ranking', path: '/ranking', icon: Trophy },
  ]

  return (
    <Sidebar variant="sidebar" className="bg-sidebar border-r-0 text-sidebar-foreground">
      <SidebarHeader className="py-6 px-4 flex flex-row items-center gap-3">
        <ShieldCheck className="w-8 h-8 text-primary" />
        <div className="flex flex-col">
          <span className="font-bold text-lg tracking-tight leading-none text-sidebar-foreground">
            OBS 2030
          </span>
          <span className="text-xs text-sidebar-foreground/70">Jornada de Evolução</span>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarMenu>
          {links.map((link) => (
            <SidebarMenuItem key={link.path}>
              <SidebarMenuButton
                asChild
                isActive={location.pathname === link.path}
                tooltip={link.name}
              >
                <Link to={link.path}>
                  <link.icon className="w-5 h-5" />
                  <span>{link.name}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border/50">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src="https://img.usecurling.com/ppl/thumbnail?gender=male&seed=10" />
            <AvatarFallback>OC</AvatarFallback>
          </Avatar>
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-medium text-sidebar-foreground truncate">
              João Observador
            </span>
            <span className="text-xs text-accent font-semibold truncate">Nível: {levelName}</span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
