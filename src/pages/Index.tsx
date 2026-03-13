import { HeroProgress } from '@/components/dashboard/HeroProgress'
import { AxesBadges } from '@/components/dashboard/AxesBadges'
import { EvolutionSimulator } from '@/components/dashboard/EvolutionSimulator'
import { HighlightsMural } from '@/components/dashboard/HighlightsMural'
import { NewsFeed } from '@/components/dashboard/NewsFeed'
import { RecentActivity } from '@/components/dashboard/RecentActivity'

export default function Index() {
  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in-up pb-10">
      <HeroProgress />

      <HighlightsMural />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <EvolutionSimulator />
          <AxesBadges />
        </div>
        <div className="space-y-8">
          <NewsFeed />
          <RecentActivity />
        </div>
      </div>
    </div>
  )
}
