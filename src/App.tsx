import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { GameProvider } from '@/stores/useGameStore'
import Index from './pages/Index'
import Axes from './pages/Axes'
import Submissions from './pages/Submissions'
import Ranking from './pages/Ranking'
import NotFound from './pages/NotFound'
import Layout from './components/Layout'

const App = () => (
  <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
    <GameProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Index />} />
            <Route path="/eixos" element={<Axes />} />
            <Route path="/submissoes" element={<Submissions />} />
            <Route path="/ranking" element={<Ranking />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </GameProvider>
  </BrowserRouter>
)

export default App
