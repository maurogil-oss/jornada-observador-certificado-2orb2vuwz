import { AxesBadges } from '@/components/dashboard/AxesBadges'
import { EvolutionSimulator } from '@/components/dashboard/EvolutionSimulator'
import { HighlightsMural } from '@/components/dashboard/HighlightsMural'
import { NewsFeed } from '@/components/dashboard/NewsFeed'
import useAuthStore from '@/stores/useAuthStore'

export default function Index() {
  const { user } = useAuthStore()

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in-up pb-10">
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
          Olá, {user?.name.split(' ')[0] || 'Observador'}
        </h1>
        <p className="text-muted-foreground text-lg">
          Acompanhe sua jornada de evolução, impacto institucional e as novidades da rede.
        </p>
      </div>

      <HighlightsMural />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <AxesBadges />
          <EvolutionSimulator />
        </div>
        <div className="space-y-8">
          <NewsFeed />
        </div>
      </div>
    </div>
  )
}
