import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Loader2,
  ArrowLeft,
  MessageCircle,
  FolderOpen,
  FileEdit,
  Link as LinkIcon,
  Ban,
} from 'lucide-react'
import { toast } from 'sonner'
import { getForum, type Forum } from '@/services/forums'
import { ForumHeader } from '@/components/forums/ForumHeader'
import { ForumDiscussion } from '@/components/forums/ForumDiscussion'
import { ForumLibrary } from '@/components/forums/ForumLibrary'
import { ForumDrafts } from '@/components/forums/ForumDrafts'
import { ForumRelated } from '@/components/forums/ForumRelated'
import { useRealtime } from '@/hooks/use-realtime'
import useAuthStore from '@/stores/useAuthStore'

export default function ForumDetail() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuthStore()
  const [forum, setForum] = useState<Forum | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    getForum(id)
      .then(setForum)
      .catch(() => toast.error('Erro ao carregar fórum'))
      .finally(() => setLoading(false))
  }, [id])

  useRealtime('forums', (e) => {
    if (e.record.id === id) {
      if (e.action === 'update') {
        setForum(e.record as unknown as Forum)
      } else if (e.action === 'delete') {
        setForum(null)
      }
    }
  })

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!forum) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Fórum não encontrado.</p>
        <Link to="/foruns" className="text-primary hover:underline mt-2 inline-block">
          Voltar para Fóruns
        </Link>
      </div>
    )
  }

  const isAdmin = user?.role === 'admin'
  const isPrivileged = isAdmin || user?.id === forum.relator_id

  if (!forum.is_active && !isAdmin) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center animate-fade-in-up">
        <Ban className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
        <h1 className="text-2xl font-bold text-foreground mb-2">Fórum Indisponível</h1>
        <p className="text-muted-foreground mb-6">
          Este fórum foi desativado e não está mais disponível para acesso.
        </p>
        <Link to="/foruns" className="inline-flex items-center gap-1 text-primary hover:underline">
          <ArrowLeft className="w-4 h-4" /> Voltar para Fóruns Ativos
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in-up">
      <Link
        to="/foruns"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="w-4 h-4" /> Voltar para Fóruns
      </Link>
      <ForumHeader forum={forum} />
      <Tabs defaultValue="discussion">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="discussion">
            <MessageCircle className="w-4 h-4 mr-2" /> Discussão
          </TabsTrigger>
          <TabsTrigger value="library">
            <FolderOpen className="w-4 h-4 mr-2" /> Biblioteca
          </TabsTrigger>
          <TabsTrigger value="drafts">
            <FileEdit className="w-4 h-4 mr-2" /> Documentos
          </TabsTrigger>
          <TabsTrigger value="related">
            <LinkIcon className="w-4 h-4 mr-2" /> Relacionados
          </TabsTrigger>
        </TabsList>
        <TabsContent value="discussion" className="mt-6">
          <ForumDiscussion forumId={forum.id} />
        </TabsContent>
        <TabsContent value="library" className="mt-6">
          <ForumLibrary forumId={forum.id} isPrivileged={isPrivileged} />
        </TabsContent>
        <TabsContent value="drafts" className="mt-6">
          <ForumDrafts forumId={forum.id} isPrivileged={isPrivileged} />
        </TabsContent>
        <TabsContent value="related" className="mt-6">
          <ForumRelated forumId={forum.id} isPrivileged={isPrivileged} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
