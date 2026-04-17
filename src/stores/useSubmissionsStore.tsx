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
  fileUrl?: string
}

interface SubmissionsState {
  submissions: Submission[]
  addSubmission: (sub: {
    title: string
    nivel: string
    points?: number
    type?: string
    file?: File
    link?: string
    description?: string
  }) => Promise<void>
  updateSubmissionStatus: (id: string, status: string, points?: number) => Promise<void>
  editSubmission: (id: string, data: { title?: string; file?: File }) => Promise<void>
  deleteSubmission: (id: string) => Promise<void>
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
          fileUrl: r.file
            ? `${pb.baseURL}/api/files/${r.collectionId}/${r.id}/${r.file}`
            : undefined,
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
    file?: File
    link?: string
    description?: string
  }) => {
    if (!user) return
    const formData = new FormData()
    formData.append('title', sub.title)
    formData.append('nivel', sub.nivel)
    formData.append('status', 'Em Análise')
    formData.append('score', String(sub.points || 0))
    formData.append('user_id', user.id)
    formData.append('type', sub.type || 'competency')
    if (sub.file) formData.append('file', sub.file)
    if (sub.link) formData.append('link', sub.link)
    if (sub.description) formData.append('description', sub.description)

    await pb.collection('submissions').create(formData)
  }

  const updateSubmissionStatus = async (id: string, status: string, points?: number) => {
    await pb.collection('submissions').update(id, {
      status,
      ...(points !== undefined && { score: points }),
    })
  }

  const editSubmission = async (id: string, data: { title?: string; file?: File }) => {
    const formData = new FormData()
    if (data.title) formData.append('title', data.title)
    if (data.file) formData.append('file', data.file)
    await pb.collection('submissions').update(id, formData)
  }

  const deleteSubmission = async (id: string) => {
    await pb.collection('submissions').delete(id)
  }

  return (
    <SubmissionsContext.Provider
      value={{
        submissions,
        addSubmission,
        updateSubmissionStatus,
        editSubmission,
        deleteSubmission,
      }}
    >
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
