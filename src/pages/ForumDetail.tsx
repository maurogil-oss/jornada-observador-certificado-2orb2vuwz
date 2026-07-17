import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, ArrowLeft, MessageCircle, FolderOpen, FileEdit } from 'lucide-react'
import { toast } from 'sonner'
import { getForum, type Forum } from '@/services/forums'
import { ForumHeader } from '@/components/forums/ForumHeader'
import { ForumDiscussion } from '@/components/forums/ForumDiscussion'
import { ForumLibrary } from '@/components/forums/ForumLibrary'
import { ForumDrafts } from '@/components/forums/ForumDrafts'
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

  const isPrivileged = user?.role === 'admin' || user?.id === forum.relator_id

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
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="discussion">
            <MessageCircle className="w-4 h-4 mr-2" /> Discussão
          </TabsTrigger>
          <TabsTrigger value="library">
            <FolderOpen className="w-4 h-4 mr-2" /> Biblioteca
          </TabsTrigger>
          <TabsTrigger value="drafts">
            <FileEdit className="w-4 h-4 mr-2" /> Documentos
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
      </Tabs>
    </div>
  )
}
