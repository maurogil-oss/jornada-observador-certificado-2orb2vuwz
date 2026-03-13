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
import NotFound from './pages/NotFound'
import Layout from './components/Layout'

const ProtectedRoute = ({
  children,
  allowedRoles,
}: {
  children: React.ReactNode
  allowedRoles?: string[]
}) => {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
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
            <ProtectedRoute allowedRoles={['observer']}>
              <Index />
            </ProtectedRoute>
          }
        />
        <Route
          path="/niveis"
          element={
            <ProtectedRoute allowedRoles={['observer']}>
              <Axes />
            </ProtectedRoute>
          }
        />
        <Route
          path="/submissoes"
          element={
            <ProtectedRoute allowedRoles={['observer']}>
              <Submissions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ranking"
          element={
            <ProtectedRoute allowedRoles={['observer']}>
              <Ranking />
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
