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
  Camera,
  Loader2,
  Eye,
  History,
  TrendingUp,
  ShieldCheck,
  Database,
  BookOpen,
  Award,
} from 'lucide-react'
import useAuthStore from '@/stores/useAuthStore'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { updateUser } from '@/services/users'
import { toast } from 'sonner'
import { useRef, useState } from 'react'
import pb from '@/lib/pocketbase/client'
import logoOC from '@/assets/image-29272.png'

export function AppSidebar() {
  const location = useLocation()
  const { user, logout } = useAuthStore()

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)

  const observerNav = [
    { title: 'Dashboard', url: '/', icon: Home },
    { title: 'Guia da Jornada', url: '/guia', icon: BookOpen },
    { title: 'Meu Perfil', url: '/perfil', icon: Users },
    { title: 'Níveis de Evolução', url: '/niveis', icon: Compass },
    { title: 'Cofre de Evidências', url: '/submissoes', icon: FileCheck },
    { title: 'Ranking / Mérito', url: '/ranking', icon: Trophy },
  ]

  const adminNav = [
    { title: 'Painel de Gestão', url: '/admin', icon: LayoutDashboard },
    { title: 'Performance', url: '/admin/performance', icon: TrendingUp },
    { title: 'Gestão de Usuários', url: '/admin/users', icon: Users },
    { title: 'Validação de Docs', url: '/admin/submissions', icon: FileCheck },
    { title: 'Auditoria de Pontos', url: '/admin/auditoria', icon: ShieldCheck },
    { title: 'Indicadores', url: '/admin/indicadores', icon: BarChart },
    { title: 'Demografia', url: '/admin/estatisticas', icon: BarChart },
    { title: 'Log de Atividades', url: '/admin/logs', icon: History },
    { title: 'Logs de Importação', url: '/admin/import-logs', icon: Database },
    { title: 'Certificados', url: '/admin/certificados', icon: Award },
  ]

  const isAdminArea = location.pathname.startsWith('/admin')

  const navItems =
    user?.role === 'admin'
      ? isAdminArea
        ? [...adminNav, { title: 'Ver como Observador', url: '/', icon: Eye }]
        : [...observerNav, { title: 'Voltar para Admin', url: '/admin', icon: LayoutDashboard }]
      : observerNav

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione uma imagem válida.')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('A imagem deve ter no máximo 5MB.')
      return
    }

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('avatar', file)
      await updateUser(user.id, formData)

      await pb.collection('users').authRefresh()

      toast.success('Foto de perfil atualizada com sucesso!')
    } catch (error) {
      toast.error('Erro ao atualizar foto de perfil.')
      console.error(error)
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const getInitials = (name: string) => {
    return name.substring(0, 2).toUpperCase()
  }

  return (
    <Sidebar variant="sidebar" collapsible="icon" className="border-r border-border/50 shadow-sm">
      <SidebarHeader className="p-4 md:p-6 border-b border-border/50 bg-amber-50/50 dark:bg-amber-950/20 min-h-[5rem] flex items-center justify-center">
        <Link
          to="/"
          className="flex items-center justify-center w-full hover:opacity-80 transition-opacity"
        >
          <img
            src={logoOC}
            alt="Observador Certificado"
            className="h-16 md:h-20 lg:h-24 max-w-full group-data-[collapsible=icon]:h-8 w-auto object-contain transition-all duration-300"
          />
        </Link>
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
      <SidebarFooter className="p-4 border-t border-border/50 bg-muted/10 flex flex-col gap-4">
        {user && (
          <div className="flex items-center gap-3 px-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
            <div className="relative group/avatar flex-shrink-0">
              <Avatar className="h-10 w-10 border border-border/50">
                <AvatarImage
                  src={user.avatar ? pb.files.getUrl(user as any, user.avatar) : undefined}
                  alt={user.name}
                  className="object-cover"
                />
                <AvatarFallback className="bg-primary/10 text-primary font-medium">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="absolute inset-0 bg-black/50 text-white rounded-full opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center transition-opacity disabled:cursor-not-allowed"
                title="Alterar foto"
              >
                {isUploading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Camera className="w-4 h-4" />
                )}
              </button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
              />
            </div>
            <div className="flex flex-col overflow-hidden group-data-[collapsible=icon]:hidden">
              <span className="text-sm font-medium truncate">{user.name}</span>
              <span className="text-xs text-muted-foreground truncate">{user.email}</span>
            </div>
          </div>
        )}
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
