import { AxesBadges } from '@/components/dashboard/AxesBadges'
import { EvolutionSimulator } from '@/components/dashboard/EvolutionSimulator'
import { HighlightsMural } from '@/components/dashboard/HighlightsMural'
import { RecentActivity } from '@/components/dashboard/RecentActivity'
import { HeroProgress } from '@/components/dashboard/HeroProgress'
import useAuthStore from '@/stores/useAuthStore'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { generateCertificate } from '@/lib/certificate'
import { useRealtime } from '@/hooks/use-realtime'
import pb from '@/lib/pocketbase/client'
import { useState, useEffect } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { WelcomeModal } from '@/components/onboarding/WelcomeModal'
import { OnboardingChecklist } from '@/components/dashboard/OnboardingChecklist'

export default function Index() {
  const { user } = useAuthStore()
  const [isDataLoading, setIsDataLoading] = useState(true)

  useEffect(() => {
    // Simulate data fetching for skeletons
    const t = setTimeout(() => setIsDataLoading(false), 800)
    return () => clearTimeout(t)
  }, [])

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

  if (isDataLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-8 pb-10">
        <div className="space-y-2">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-6 w-96" />
        </div>
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Skeleton className="h-64 w-full rounded-xl" />
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
          <div className="space-y-8">
            <Skeleton className="h-96 w-full rounded-xl" />
          </div>
        </div>
      </div>
    )
  }

  const isLevel3 = user?.level?.includes('Nível III') || user?.level?.includes('Mobilizador')

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in-up pb-10">
      <WelcomeModal />
      <OnboardingChecklist />

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            <span>{`Olá, ${user?.name?.split(' ')[0] || 'Observador'}`}</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            <span>Acompanhe sua jornada de evolução, impacto institucional e suas submissões.</span>
          </p>
        </div>
        {isLevel3 && (
          <Button
            onClick={() => {
              try {
                generateCertificate(user)
              } catch (err: any) {
                alert(err.message)
              }
            }}
            className="bg-amber-600 hover:bg-amber-700 text-white shadow-md self-start"
          >
            <Download className="w-4 h-4 mr-2" />
            <span>Baixar Certificado</span>
          </Button>
        )}
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
