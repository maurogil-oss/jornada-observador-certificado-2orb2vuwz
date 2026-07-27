import { useState, useEffect } from 'react'
import { Loader2, MessageSquare } from 'lucide-react'
import { toast } from 'sonner'
import { getActiveForums, type Forum } from '@/services/forums'
import { getForumMessageCounts } from '@/services/forumMessages'
import { useRealtime } from '@/hooks/use-realtime'
import { ForumCard } from '@/components/forums/ForumCard'

export default function Forums() {
  const [forums, setForums] = useState<Forum[]>([])
  const [messageCounts, setMessageCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    try {
      const [data, counts] = await Promise.all([getActiveForums(), getForumMessageCounts()])
      setForums(data)
      setMessageCounts(counts)
    } catch {
      toast.error('Erro ao carregar fóruns')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('forums', () => {
    loadData()
  })

  useRealtime('forum_messages', (e) => {
    if (e.action === 'create') {
      const fid = e.record.forum_id as string
      if (fid) {
        setMessageCounts((prev) => ({ ...prev, [fid]: (prev[fid] || 0) + 1 }))
      }
    } else if (e.action === 'delete') {
      const fid = e.record.forum_id as string
      if (fid) {
        setMessageCounts((prev) => ({ ...prev, [fid]: Math.max((prev[fid] || 0) - 1, 0) }))
      }
    }
  })

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          <span>Fóruns Técnicos</span>
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
          <span>Participe das discussões técnicas e colabore na construção de documentos.</span>
        </p>
      </div>
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : forums.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-40" />
          <p>Nenhum fórum ativo no momento.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {forums.map((forum) => (
            <ForumCard key={forum.id} forum={forum} messageCount={messageCounts[forum.id] || 0} />
          ))}
        </div>
      )}
    </div>
  )
}
