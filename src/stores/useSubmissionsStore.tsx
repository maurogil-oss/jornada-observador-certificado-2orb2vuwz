import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
} from 'react'
import pb from '@/lib/pocketbase/client'
import useAuthStore from '@/stores/useAuthStore'
import { useRealtime } from '@/hooks/use-realtime'
import { toast } from '@/hooks/use-toast'

export interface Submission {
  id: string
  date: string
  title: string
  user: string
  nivel: string
  axis?: string
  status: string
  points: number | string
}

interface SubmissionsState {
  submissions: Submission[]
  addSubmission: (sub: {
    title: string
    nivel: string
    points?: number
    type?: string
  }) => Promise<void>
  updateSubmissionStatus: (id: string, status: string, points?: number) => Promise<void>
}

const SubmissionsContext = createContext<SubmissionsState | undefined>(undefined)

export const SubmissionsProvider = ({ children }: { children: ReactNode }) => {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const { user, isAuthenticated } = useAuthStore()

  const loadSubmissions = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setSubmissions([])
      return
    }
    try {
      const filter = user.role === 'admin' ? '' : `user_id = "${user.id}"`
      const res = await pb.collection('submissions').getFullList({
        filter,
        sort: '-created',
        expand: 'user_id',
      })
      setSubmissions(
        res.map((r) => ({
          id: r.id,
          title: r.title,
          nivel: r.nivel,
          status: r.status,
          points: r.score || '-',
          date: new Date(r.created).toLocaleDateString('pt-BR'),
          user: r.expand?.user_id?.name || 'Desconhecido',
          axis: r.nivel,
          type: r.type,
        })),
      )
    } catch (err) {
      console.error('Error loading submissions:', err)
    }
  }, [user, isAuthenticated])

  useEffect(() => {
    loadSubmissions()
  }, [loadSubmissions])

  useRealtime(
    'submissions',
    (e) => {
      loadSubmissions()
      if (e.action === 'update' && e.record.user_id === user?.id) {
        toast({
          title: 'Atualização de Submissão',
          description: `Sua submissão "${e.record.title}" agora está: ${e.record.status}`,
        })
      }
    },
    isAuthenticated,
  )

  const addSubmission = async (sub: {
    title: string
    nivel: string
    points?: number
    type?: string
  }) => {
    if (!user) return
    await pb.collection('submissions').create({
      title: sub.title,
      nivel: sub.nivel,
      status: 'Em Análise',
      score: sub.points || 0,
      user_id: user.id,
      type: sub.type || 'competency',
    })
  }

  const updateSubmissionStatus = async (id: string, status: string, points?: number) => {
    await pb.collection('submissions').update(id, {
      status,
      ...(points !== undefined && { score: points }),
    })
  }

  return (
    <SubmissionsContext.Provider value={{ submissions, addSubmission, updateSubmissionStatus }}>
      {children}
    </SubmissionsContext.Provider>
  )
}

export default function useSubmissionsStore() {
  const context = useContext(SubmissionsContext)
  if (!context) {
    throw new Error('useSubmissionsStore must be used within a SubmissionsProvider')
  }
  return context
}
