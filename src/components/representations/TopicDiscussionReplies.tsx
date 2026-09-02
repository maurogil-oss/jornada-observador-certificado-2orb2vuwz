import { useState, useEffect } from 'react'
import {
  MessageSquare,
  Send,
  Trash2,
  Loader2,
  CornerDownRight,
  Shield,
  UserCheck,
  Clock,
  Sparkles,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import pb from '@/lib/pocketbase/client'
import useAuthStore from '@/stores/useAuthStore'
import {
  getTopicReplies,
  createTopicReply,
  deleteTopicReply,
  type RepresentationTopicReply,
} from '@/services/representations'

interface TopicDiscussionRepliesProps {
  topicId: string
  topicTitle: string
}

export function TopicDiscussionReplies({ topicId, topicTitle }: TopicDiscussionRepliesProps) {
  const { user } = useAuthStore()
  const [replies, setReplies] = useState<RepresentationTopicReply[]>([])
  const [loading, setLoading] = useState(true)
  const [newReply, setNewReply] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [replyToDelete, setReplyToDelete] = useState<RepresentationTopicReply | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [isOpen, setIsOpen] = useState(true)

  const loadReplies = async () => {
    try {
      setLoading(true)
      const data = await getTopicReplies(topicId)
      setReplies(data)
    } catch (err) {
      console.error('Erro ao carregar respostas do tópico:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (topicId) {
      loadReplies()
    }
  }, [topicId])

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newReply.trim() || !user?.id) return

    setSubmitting(true)
    try {
      const created = await createTopicReply({
        topic_id: topicId,
        user_id: user.id,
        content: newReply.trim(),
      })
      setNewReply('')
      // Update replies list locally or reload
      setReplies((prev) => [...prev, created])
      toast.success('Resposta publicada com sucesso!')
    } catch (err) {
      console.error('Erro ao enviar resposta:', err)
      toast.error('Erro ao publicar resposta. Tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteReply = async () => {
    if (!replyToDelete) return
    setDeleting(true)
    try {
      await deleteTopicReply(replyToDelete.id)
      setReplies((prev) => prev.filter((r) => r.id !== replyToDelete.id))
      toast.success('Resposta excluída.')
      setReplyToDelete(null)
    } catch (err) {
      console.error('Erro ao excluir resposta:', err)
      toast.error('Erro ao excluir resposta.')
    } finally {
      setDeleting(false)
    }
  }

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return dateStr
    }
  }

  return (
    <div className="mt-4 pt-3 border-t border-border/60 space-y-3">
      {/* Thread Header / Toggle */}
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 text-xs font-bold text-foreground hover:text-primary transition-colors cursor-pointer"
        >
          <MessageSquare className="w-4 h-4 text-primary" />
          <span>Respostas e Discussão do Tema</span>
          <Badge
            variant="secondary"
            className="text-[10px] px-1.5 py-0 h-4 font-semibold bg-primary/10 text-primary border-primary/20"
          >
            {replies.length}
          </Badge>
        </button>

        <span className="text-[11px] text-muted-foreground hidden sm:inline">
          Espaço de debate entre representantes e equipe ONSV
        </span>
      </div>

      {isOpen && (
        <div className="space-y-3 pl-1 sm:pl-2">
          {/* List of existing replies */}
          {loading ? (
            <div className="flex items-center justify-center py-4 text-xs text-muted-foreground gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <span>Carregando respostas...</span>
            </div>
          ) : replies.length === 0 ? (
            <div className="p-4 bg-muted/20 rounded-lg border border-dashed border-border text-center space-y-1">
              <p className="text-xs font-medium text-muted-foreground">
                Nenhuma resposta registrada para este assunto ainda.
              </p>
              <p className="text-[11px] text-muted-foreground/80">
                Seja o primeiro a compartilhar considerações ou informações sobre este tema.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {replies.map((reply) => {
                const author = reply.expand?.user_id
                const authorName =
                  author?.name || author?.full_name || author?.email?.split('@')[0] || 'Usuário'
                const authorRole = author?.role
                const isONSVAdmin = authorRole === 'admin'
                const avatarUrl = author?.avatar ? pb.files.getUrl(author, author.avatar) : ''
                const isCurrentUser = user?.id === reply.user_id
                const canDelete = isCurrentUser || user?.role === 'admin'

                return (
                  <div
                    key={reply.id}
                    className={`p-3 rounded-lg border transition-all text-xs space-y-1.5 ${
                      isONSVAdmin
                        ? 'bg-primary/5 border-primary/30 shadow-2xs'
                        : 'bg-background hover:bg-muted/30 border-border/80'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6 shrink-0 ring-1 ring-border">
                          {avatarUrl && <AvatarImage src={avatarUrl} alt={authorName} />}
                          <AvatarFallback className="text-[10px] font-bold bg-muted text-foreground">
                            {authorName.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-semibold text-foreground">{authorName}</span>

                          {isONSVAdmin && (
                            <Badge className="bg-primary hover:bg-primary text-primary-foreground text-[9px] px-1.5 py-0 h-4 gap-1 font-bold">
                              <Shield className="w-2.5 h-2.5" />
                              ONSV
                            </Badge>
                          )}

                          {authorRole === 'mentor' && (
                            <Badge
                              variant="secondary"
                              className="text-[9px] px-1.5 py-0 h-4 font-semibold"
                            >
                              Mentor
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(reply.created)}
                        </span>

                        {canDelete && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            onClick={() => setReplyToDelete(reply)}
                            title="Excluir resposta"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="pl-8 text-foreground leading-relaxed whitespace-pre-wrap break-words text-xs">
                      {reply.content}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* New reply form */}
          <form
            onSubmit={handleSendReply}
            className="p-3 bg-muted/30 rounded-lg border border-border/80 space-y-2.5"
          >
            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <CornerDownRight className="w-3.5 h-3.5 text-primary" />
              <span>Escrever Resposta ao Tema</span>
            </div>

            <Textarea
              value={newReply}
              onChange={(e) => setNewReply(e.target.value)}
              placeholder="Escreva suas considerações, encaminhamentos ou manifestações sobre este tema em discussão..."
              rows={2}
              className="text-xs bg-background resize-y min-h-[64px]"
            />

            <div className="flex items-center justify-between gap-2 pt-1">
              <span className="text-[11px] text-muted-foreground">
                {user?.name ? (
                  <>
                    Respondendo como{' '}
                    <strong className="text-foreground font-medium">{user.name}</strong>
                    {user.role === 'admin' ? ' (ONSV)' : ''}
                  </>
                ) : (
                  'Identificado com sua conta'
                )}
              </span>

              <Button
                type="submit"
                size="sm"
                disabled={submitting || !newReply.trim()}
                className="gap-1.5 h-8 text-xs font-semibold"
              >
                {submitting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span>{submitting ? 'Publicando...' : 'Publicar Resposta'}</span>
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirmation Alert */}
      <AlertDialog
        open={!!replyToDelete}
        onOpenChange={(open) => {
          if (!open) setReplyToDelete(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Resposta</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta resposta da discussão? Esta ação não pode ser
              desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteReply}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
