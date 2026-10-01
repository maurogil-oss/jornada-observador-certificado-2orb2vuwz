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
  created: string
  title: string
  user: string
  userId: string
  fullName?: string
  nickname?: string
  nivel: string
  axis?: string
  status: string
  points: number | string
  fileUrl?: string
  link?: string
  description?: string
  type?: string
  feedback?: string
  turma?: number
  userPoints?: number
  score?: number
  activity?: {
    id?: string
    axis?: string
    group_id?: string
    is_unique?: boolean
    max_occurrences?: number
    points_type?: string
    points?: number
    points_level_1?: number
    points_level_2?: number
    points_level_3?: number
  }
}

interface SubmissionsState {
  submissions: Submission[]
  addSubmission: (
    sub: {
      title: string
      nivel: string
      points?: number
      type?: string
      file?: File
      link?: string
      description?: string
      activity_id?: string
    },
    onProgress?: (progress: number) => void,
  ) => Promise<void>
  updateSubmissionStatus: (
    id: string,
    status: string,
    points?: number,
    feedback?: string,
    nivel?: string,
  ) => Promise<void>
  editSubmission: (
    id: string,
    data: {
      title?: string
      type?: string
      link?: string
      file?: File
      description?: string
      nivel?: string
    },
  ) => Promise<void>
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
        expand: 'user_id,activity_id',
      })
      setSubmissions(
        res.map((r) => ({
          id: r.id,
          title: r.title,
          nivel: r.nivel,
          status: r.status,
          points: r.score || '-',
          date: new Date(r.created).toLocaleDateString('pt-BR'),
          created: r.created,
          user: r.expand?.user_id?.name || 'Usuário não identificado',
          userId: r.expand?.user_id?.id || '',
          fullName: r.expand?.user_id?.full_name,
          nickname: r.expand?.user_id?.nickname,
          turma: r.expand?.user_id?.turma,
          axis: r.nivel,
          type: r.type,
          description: r.description,
          link: r.link,
          feedback: r.feedback,
          userPoints: r.expand?.user_id?.points || 0,
          score: r.score || 0,
          fileUrl: r.file
            ? `${pb.baseURL}/api/files/${r.collectionId}/${r.id}/${r.file}`
            : undefined,
          activity: r.expand?.activity_id
            ? {
                id: r.expand.activity_id.id,
                axis: r.expand.activity_id.axis,
                group_id: r.expand.activity_id.group_id,
                is_unique: r.expand.activity_id.is_unique,
                max_occurrences: r.expand.activity_id.max_occurrences,
                points_type: r.expand.activity_id.points_type,
                points: r.expand.activity_id.points,
                points_level_1: r.expand.activity_id.points_level_1,
                points_level_2: r.expand.activity_id.points_level_2,
                points_level_3: r.expand.activity_id.points_level_3,
              }
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

  const addSubmission = async (
    sub: {
      title: string
      nivel: string
      points?: number
      type?: string
      file?: File
      link?: string
      description?: string
      activity_id?: string
    },
    onProgress?: (progress: number) => void,
  ) => {
    if (!user) return

    let resolvedActivityId = sub.activity_id
    if (!resolvedActivityId && sub.title) {
      try {
        const trimmedTitle = sub.title.trim()
        const meta = await pb
          .collection('activities_metadata')
          .getFirstListItem(`title = "${trimmedTitle}"`)
        if (meta) {
          resolvedActivityId = meta.id
        }
      } catch (_) {
        // If exact match not found or fails, backend hook will also resolve
      }
    }

    const formData = new FormData()
    formData.append('title', sub.title)
    formData.append('nivel', sub.nivel)
    formData.append('status', 'Em Análise')
    formData.append('score', String(sub.points || 0))
    formData.append('user_id', user.id)
    formData.append('type', sub.type || 'competency')
    if (resolvedActivityId) formData.append('activity_id', resolvedActivityId)
    if (sub.file) formData.append('file', sub.file)
    if (sub.link) formData.append('link', sub.link)
    if (sub.description) formData.append('description', sub.description)

    await pb.collection('submissions').create(formData, {
      onUploadProgress: (e: any) => {
        if (onProgress && e.total) {
          onProgress(Math.round((e.loaded / e.total) * 100))
        }
      },
    })
  }

  const updateSubmissionStatus = async (
    id: string,
    status: string,
    points?: number,
    feedback?: string,
    nivel?: string,
  ) => {
    await pb.collection('submissions').update(id, {
      status,
      ...(points !== undefined && { score: points }),
      ...(feedback !== undefined && { feedback }),
      ...(nivel !== undefined && { nivel }),
    })
  }

  const editSubmission = async (
    id: string,
    data: {
      title?: string
      type?: string
      link?: string
      file?: File
      description?: string
      nivel?: string
    },
  ) => {
    const formData = new FormData()
    if (data.title !== undefined) formData.append('title', data.title)
    if (data.type !== undefined) formData.append('type', data.type)
    if (data.link !== undefined) formData.append('link', data.link)
    if (data.description !== undefined) formData.append('description', data.description)
    if (data.nivel !== undefined) formData.append('nivel', data.nivel)
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
