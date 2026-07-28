import { useState, useEffect, useRef, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Send, Paperclip, Loader2, MessageCircle, Check } from 'lucide-react'
import { toast } from 'sonner'
import useAuthStore from '@/stores/useAuthStore'
import { useRealtime } from '@/hooks/use-realtime'
import { useForumDraft } from '@/hooks/use-forum-draft'
import { getForumMessages, createForumMessage, type ForumMessage } from '@/services/forumMessages'
import { ForumMessageItem } from './ForumMessageItem'

export function ForumDiscussion({ forumId }: { forumId: string }) {
  const { user } = useAuthStore()
  const [messages, setMessages] = useState<ForumMessage[]>([])
  const [loading, setLoading] = useState(true)
  const draftKey = `forumDraft_${forumId}_${user?.id ?? 'anon'}`
  const { content, updateContent, clearDraft, showSaved } = useForumDraft(draftKey)
  const [files, setFiles] = useState<File[]>([])
  const [submitting, setSubmitting] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const loadMessages = async () => {
    try {
      const data = await getForumMessages(forumId)
      setMessages(data)
    } catch {
      toast.error('Erro ao carregar mensagens')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMessages()
  }, [forumId])
  useRealtime('forum_messages', (e) => {
    if (e.record.forum_id === forumId) loadMessages()
  })

  const tree = useMemo(() => {
    const map = new Map<string, ForumMessage[]>()
    for (const msg of messages) {
      const key = msg.parent_id || 'root'
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(msg)
    }
    return map
  }, [messages])

  const handleSubmit = async () => {
    if (!content.trim() && files.length === 0) return
    setSubmitting(true)
    try {
      const fd = new FormData()
      fd.append('forum_id', forumId)
      fd.append('user_id', user!.id)
      fd.append('content', content)
      files.forEach((f) => fd.append('attachments', f))
      await createForumMessage(fd)
      clearDraft()
      setFiles([])
      if (fileRef.current) fileRef.current.value = ''
    } catch {
      toast.error('Erro ao enviar mensagem')
    } finally {
      setSubmitting(false)
    }
  }

  const rootMessages = tree.get('root') || []

  return (
    <div className="space-y-6">
      <div className="bg-muted/30 rounded-lg p-4 space-y-3 border">
        <Textarea
          value={content}
          onChange={(e) => updateContent(e.target.value)}
          placeholder="Participe da discussão..."
          className="bg-background min-h-[80px]"
        />
        {showSaved && (
          <p className="flex items-center gap-1 text-xs text-muted-foreground animate-fade-in">
            <Check className="w-3 h-3" /> Rascunho salvo
          </p>
        )}
        <div className="flex items-center gap-2">
          <input
            ref={fileRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => setFiles(Array.from(e.target.files || []))}
          />
          <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
            <Paperclip className="w-4 h-4 mr-2" />{' '}
            {files.length > 0 ? `${files.length} arquivo(s)` : 'Anexar'}
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={submitting || (!content.trim() && files.length === 0)}
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" /> Enviar
              </>
            )}
          </Button>
        </div>
      </div>
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : rootMessages.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <MessageCircle className="w-10 h-10 mx-auto mb-2 opacity-40" />
          <p>Nenhuma mensagem ainda. Seja o primeiro a participar!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {rootMessages.map((msg) => (
            <ForumMessageItem
              key={msg.id}
              message={msg}
              tree={tree}
              currentUserId={user!.id}
              forumId={forumId}
              depth={0}
            />
          ))}
        </div>
      )}
    </div>
  )
}
