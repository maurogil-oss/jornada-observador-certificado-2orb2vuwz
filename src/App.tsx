import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { GameProvider } from '@/stores/useGameStore'
import { AuthProvider } from '@/stores/useAuthStore'
import { SubmissionsProvider } from '@/stores/useSubmissionsStore'
import useAuthStore from '@/stores/useAuthStore'
import Index from './pages/Index'
import Axes from './pages/Axes'
import Submissions from './pages/Submissions'
import Ranking from './pages/Ranking'
import Login from './pages/Login'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminIndicators from './pages/admin/AdminIndicators'
import AdminUsers from './pages/admin/AdminUsers'
import AdminStatistics from './pages/admin/AdminStatistics'
import Profile from './pages/Profile'
import NotFound from './pages/NotFound'
import Layout from './components/Layout'

const ProtectedRoute = ({
  children,
  allowedRoles,
}: {
  children: React.ReactNode
  allowedRoles?: string[]
}) => {
  const { isAuthenticated, user, isLoading, logout } = useAuthStore()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center font-semibold text-muted-foreground animate-pulse">
        Carregando Sessão...
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (user && user.is_active === false) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center font-semibold text-muted-foreground bg-background text-center px-4">
        <h1 className="text-2xl font-bold text-foreground mb-2">Conta Pendente/Suspensa</h1>
        <p className="mb-6 max-w-md">
          Sua conta está aguardando aprovação do administrador ou foi suspensa. Por favor, aguarde
          ou entre em contato com o suporte.
        </p>
        <button
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          onClick={logout}
        >
          Voltar para Login
        </button>
      </div>
    )
  }

  if (allowedRoles && user?.role && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/'} replace />
  }

  return <>{children}</>
}

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route
          path="/"
          element={
            <ProtectedRoute allowedRoles={['observer', 'admin']}>
              <Index />
            </ProtectedRoute>
          }
        />
        <Route
          path="/niveis"
          element={
            <ProtectedRoute allowedRoles={['observer', 'admin']}>
              <Axes />
            </ProtectedRoute>
          }
        />
        <Route
          path="/submissoes"
          element={
            <ProtectedRoute allowedRoles={['observer', 'admin']}>
              <Submissions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ranking"
          element={
            <ProtectedRoute allowedRoles={['observer', 'admin']}>
              <Ranking />
            </ProtectedRoute>
          }
        />
        <Route
          path="/perfil"
          element={
            <ProtectedRoute allowedRoles={['observer', 'admin']}>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminUsers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/indicadores"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminIndicators />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/estatisticas"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminStatistics />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

const App = () => (
  <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
    <AuthProvider>
      <GameProvider>
        <SubmissionsProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <AppRoutes />
          </TooltipProvider>
        </SubmissionsProvider>
      </GameProvider>
    </AuthProvider>
  </BrowserRouter>
)

export default App
