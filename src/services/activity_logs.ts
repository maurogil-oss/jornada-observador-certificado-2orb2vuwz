import pb from '@/lib/pocketbase/client'

export interface ActivityLog {
  id: string
  actor_id: string
  action: string
  entity_type: string
  entity_id: string
  description: string
  created: string
  updated: string
  expand?: {
    actor_id?: {
      name: string
      email: string
    }
  }
}

export const getActivityLogs = () =>
  pb.collection('activity_logs').getFullList<ActivityLog>({
    sort: '-created',
    expand: 'actor_id',
  })
