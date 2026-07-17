import { useState, useRef } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Reply, Trash2, Send, Paperclip, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import pb from '@/lib/pocketbase/client'
import { createForumMessage, deleteForumMessage, type ForumMessage } from '@/services/forumMessages'
import { cn } from '@/lib/utils'

interface Props {
  message: ForumMessage
  tree: Map<string, ForumMessage[]>
  currentUserId: string
  forumId: string
  depth: number
}

export function ForumMessageItem({ message, tree, currentUserId, forumId, depth }: Props) {
  const [isReplying, setIsReplying] = useState(false)
  const [replyContent, setReplyContent] = useState('')
  const [replyFiles, setReplyFiles] = useState<File[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const user = message.expand?.user_id
  const userName = user?.name || user?.email?.split('@')[0] || 'Usuário'
  const avatarUrl = user?.avatar ? pb.files.getUrl(user, user.avatar) : ''
  const children = tree.get(message.id) || []
  const isAuthor = currentUserId === message.user_id

  const formatDate = (d: string) => {
    try {
      return new Date(d).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return ''
    }
  }

  const handleReply = async () => {
    if (!replyContent.trim() && replyFiles.length === 0) return
    setSubmitting(true)
    try {
      const fd = new FormData()
      fd.append('forum_id', forumId)
      fd.append('user_id', currentUserId)
      fd.append('parent_id', message.id)
      fd.append('content', replyContent)
      replyFiles.forEach((f) => fd.append('attachments', f))
      await createForumMessage(fd)
      setReplyContent('')
      setReplyFiles([])
      setIsReplying(false)
      if (fileRef.current) fileRef.current.value = ''
    } catch {
      toast.error('Erro ao enviar resposta')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await deleteForumMessage(message.id)
    } catch {
      toast.error('Erro ao excluir mensagem')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div
      className={cn('flex flex-col gap-2', depth > 0 && 'ml-6 border-l-2 border-border/40 pl-4')}
    >
      <div className="flex items-start gap-3">
        <Avatar className="h-8 w-8 flex-shrink-0">
          {avatarUrl && <AvatarImage src={avatarUrl} alt={userName} />}
          <AvatarFallback className="text-xs">
            {userName.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium">{userName}</span>
            <span className="text-xs text-muted-foreground">{formatDate(message.created)}</span>
          </div>
          <p className="text-sm mt-1 whitespace-pre-wrap break-words">{message.content}</p>
          {message.attachments?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {message.attachments.map((fn, i) => (
                <a
                  key={i}
                  href={pb.files.getUrl(message, fn)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-primary hover:underline bg-primary/5 px-2 py-1 rounded"
                >
                  <Paperclip className="w-3 h-3" /> Anexo {i + 1}
                </a>
              ))}
            </div>
          )}
          <div className="flex items-center gap-2 mt-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={() => setIsReplying(!isReplying)}
            >
              <Reply className="w-3 h-3 mr-1" /> Responder
            </Button>
            {isAuthor && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-destructive hover:text-destructive"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <>
                    <Trash2 className="w-3 h-3 mr-1" /> Excluir
                  </>
                )}
              </Button>
            )}
          </div>
          {isReplying && (
            <div className="mt-3 space-y-2">
              <Textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Escreva sua resposta..."
                className="text-sm min-h-[60px]"
              />
              <div className="flex items-center gap-2">
                <input
                  ref={fileRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(e) => setReplyFiles(Array.from(e.target.files || []))}
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => fileRef.current?.click()}
                >
                  <Paperclip className="w-3 h-3 mr-1" />{' '}
                  {replyFiles.length > 0 ? `${replyFiles.length} arquivo(s)` : 'Anexar'}
                </Button>
                <Button size="sm" className="text-xs" onClick={handleReply} disabled={submitting}>
                  {submitting ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-3 h-3 mr-1" /> Enviar
                    </>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs"
                  onClick={() => {
                    setIsReplying(false)
                    setReplyContent('')
                    setReplyFiles([])
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      {children.map((child) => (
        <ForumMessageItem
          key={child.id}
          message={child}
          tree={tree}
          currentUserId={currentUserId}
          forumId={forumId}
          depth={depth + 1}
        />
      ))}
    </div>
  )
}
