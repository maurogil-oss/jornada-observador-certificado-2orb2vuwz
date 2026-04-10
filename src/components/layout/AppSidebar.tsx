import { Link, useLocation } from 'react-router-dom'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from '@/components/ui/sidebar'
import {
  Home,
  Compass,
  FileCheck,
  Trophy,
  LogOut,
  LayoutDashboard,
  BarChart,
  Users,
} from 'lucide-react'
import useAuthStore from '@/stores/useAuthStore'
import { Button } from '@/components/ui/button'

export function AppSidebar() {
  const location = useLocation()
  const { user, logout } = useAuthStore()

  const observerNav = [
    { title: 'Dashboard', url: '/', icon: Home },
    { title: 'Níveis de Evolução', url: '/niveis', icon: Compass },
    { title: 'Cofre de Evidências', url: '/submissoes', icon: FileCheck },
    { title: 'Ranking / Mérito', url: '/ranking', icon: Trophy },
  ]

  const adminNav = [
    { title: 'Painel de Gestão', url: '/admin', icon: LayoutDashboard },
    { title: 'Gestão de Usuários', url: '/admin/users', icon: Users },
    { title: 'Indicadores', url: '/admin/indicadores', icon: BarChart },
  ]

  const navItems = user?.role === 'admin' ? adminNav : observerNav

  return (
    <Sidebar variant="sidebar" collapsible="icon" className="border-r border-border/50 shadow-sm">
      <SidebarHeader className="p-4 border-b border-border/50 bg-amber-50/50 dark:bg-amber-950/20">
        <div className="flex items-center px-2">
          <div className="flex flex-col group-data-[collapsible=icon]:hidden whitespace-nowrap overflow-hidden">
            <span className="font-black text-sm tracking-tight text-foreground leading-none">
              OBSERVADOR
            </span>
            <span className="font-bold text-[10px] tracking-[0.2em] text-amber-600 dark:text-amber-500 leading-tight mt-0.5">
              CERTIFICADO
            </span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="bg-muted/5">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2 px-2 mt-2">
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.url}
                    tooltip={item.title}
                    className="font-medium h-11"
                  >
                    <Link to={item.url}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-border/50 bg-muted/10">
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-destructive/10 hover:text-destructive group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center transition-colors h-11"
          onClick={logout}
          title="Sair da Plataforma"
        >
          <LogOut className="w-5 h-5 mr-2 group-data-[collapsible=icon]:mr-0" />
          <span className="group-data-[collapsible=icon]:hidden">Encerrar Sessão</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  )
}
