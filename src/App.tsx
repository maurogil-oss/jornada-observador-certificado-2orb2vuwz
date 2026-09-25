import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { GameProvider } from '@/stores/useGameStore'
import { AuthProvider } from '@/stores/useAuthStore'
import { SubmissionsProvider } from '@/stores/useSubmissionsStore'
import { useEffect } from 'react'
import useAuthStore from '@/stores/useAuthStore'
import { useToast } from '@/hooks/use-toast'
import { Loader2 } from 'lucide-react'
import Index from './pages/Index'
import Axes from './pages/Axes'
import Submissions from './pages/Submissions'
import Forums from './pages/Forums'
import ForumDetail from './pages/ForumDetail'
import Ranking from './pages/Ranking'
import Login from './pages/Login'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminIndicators from './pages/admin/AdminIndicators'
import AdminUsers from './pages/admin/AdminUsers'
import AdminStatistics from './pages/admin/AdminStatistics'
import AdminSubmissions from './pages/admin/AdminSubmissions'
import AdminLogs from './pages/admin/AdminLogs'
import AdminPerformance from './pages/admin/AdminPerformance'
import AdminScoreAudit from './pages/admin/AdminScoreAudit'
import AdminImportLogs from './pages/admin/AdminImportLogs'
import AdminCertificates from './pages/admin/AdminCertificates'
import AdminForums from './pages/admin/AdminForums'
import AdminRepresentations from './pages/admin/AdminRepresentations'
import Representations from './pages/Representations'
import RepresentationDetail from './pages/RepresentationDetail'
import Profile from './pages/Profile'
import Manual from './pages/Manual'
import NotFound from './pages/NotFound'
import Layout from './components/Layout'
import PublicProfile from './pages/PublicProfile'
import { ErrorBoundary } from './components/ErrorBoundary'

const ProtectedRoute = ({
  children,
  allowedRoles,
}: {
  children: React.ReactNode
  allowedRoles?: string[]
}) => {
  const { isAuthenticated, user, logout, isLoading } = useAuthStore()
  const location = useLocation()

  useEffect(() => {
    // Session Integrity Guard
    if (isAuthenticated && !isLoading) {
      if (!user || typeof user !== 'object' || !user.id) {
        console.warn('Session integrity failed. Corrupted user data.')
        logout()
      } else if (typeof user.is_active !== 'boolean') {
        // Defensively normalize session residue where is_active might be missing/undefined
        console.warn('Session user missing boolean is_active; defaulting to true.')
        user.is_active = true
      }
    }
  }, [isAuthenticated, user, logout, isLoading])

  if (isLoading) {
    return null
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (user.is_active === false) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center font-semibold text-muted-foreground bg-background text-center px-4">
        <h1 className="text-2xl font-bold text-foreground mb-2">
          <span>Conta Pendente de Validação</span>
        </h1>
        <p className="mb-6 max-w-md">
          <span>
            Sua conta está em processo de validação. Por favor, aguarde o e-mail de aprovação dos
            administradores antes de acessar.
          </span>
        </p>
        <button
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          onClick={logout}
        >
          <span>Voltar para Login</span>
        </button>
      </div>
    )
  }

  if (allowedRoles && user.role && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/'} replace />
  }

  return <>{children}</>
}

const AppRoutes = () => {
  const { isLoading } = useAuthStore()

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center font-semibold text-muted-foreground bg-background">
        <Loader2 className="h-10 w-10 animate-spin mb-4 text-primary" />
        <p>
          <span>Carregando Aplicação...</span>
        </p>
      </div>
    )
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={
          <ErrorBoundary>
            <Login />
          </ErrorBoundary>
        }
      />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/perfil/:id" element={<PublicProfile />} />

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
          path="/foruns"
          element={
            <ProtectedRoute allowedRoles={['observer', 'admin']}>
              <Forums />
            </ProtectedRoute>
          }
        />
        <Route
          path="/foruns/:id"
          element={
            <ProtectedRoute allowedRoles={['observer', 'admin']}>
              <ForumDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/representacoes"
          element={
            <ProtectedRoute allowedRoles={['observer', 'admin']}>
              <Representations />
            </ProtectedRoute>
          }
        />
        <Route
          path="/representacoes/:id"
          element={
            <ProtectedRoute allowedRoles={['observer', 'admin']}>
              <RepresentationDetail />
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
          path="/admin/performance"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminPerformance />
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
        <Route
          path="/admin/submissions"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminSubmissions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/auditoria"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminScoreAudit />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/logs"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminLogs />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/import-logs"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminImportLogs />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/certificados"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminCertificates />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/forums"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminForums />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/representacoes"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminRepresentations />
            </ProtectedRoute>
          }
        />
        <Route
          path="/guia"
          element={
            <ProtectedRoute allowedRoles={['observer', 'admin']}>
              <Manual />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

const App = () => (
  <ErrorBoundary>
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
  </ErrorBoundary>
)

export default App
