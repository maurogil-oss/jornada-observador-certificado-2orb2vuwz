import { useEffect } from 'react'
import { AxesBadges } from '@/components/dashboard/AxesBadges'
import { EvolutionSimulator } from '@/components/dashboard/EvolutionSimulator'
import { HighlightsMural } from '@/components/dashboard/HighlightsMural'
import { RecentActivity } from '@/components/dashboard/RecentActivity'
import { HeroProgress } from '@/components/dashboard/HeroProgress'
import useAuthStore from '@/stores/useAuthStore'
import { useRealtime } from '@/hooks/use-realtime'
import pb from '@/lib/pocketbase/client'

export default function Index() {
  const { user } = useAuthStore()

  useRealtime(
    'users',
    async (e) => {
      if (e.record.id === user?.id && e.action === 'update') {
        if (pb.authStore.model) {
          pb.authStore.save(e.record, pb.authStore.token)
        }
      }
    },
    !!user?.id,
  )

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in-up pb-10">
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
          Olá, {user?.name?.split(' ')[0] || 'Observador'}
        </h1>
        <p className="text-muted-foreground text-lg">
          Acompanhe sua jornada de evolução, impacto institucional e suas submissões.
        </p>
      </div>

      <HeroProgress />
      <HighlightsMural />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <AxesBadges />
          <EvolutionSimulator />
        </div>
        <div className="space-y-8">
          <RecentActivity />
        </div>
      </div>
    </div>
  )
}
