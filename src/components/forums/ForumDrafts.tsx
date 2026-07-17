import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { FileText, Upload, Trash2, CheckCircle, Loader2, FileEdit } from 'lucide-react'
import { toast } from 'sonner'
import pb from '@/lib/pocketbase/client'
import { useRealtime } from '@/hooks/use-realtime'
import {
  getForumDrafts,
  createForumDraft,
  updateForumDraft,
  deleteForumDraft,
  type ForumDraft,
} from '@/services/forumDrafts'

export function ForumDrafts({ forumId, isPrivileged }: { forumId: string; isPrivileged: boolean }) {
  const [drafts, setDrafts] = useState<ForumDraft[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [isOfficial, setIsOfficial] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const load = async () => {
    try {
      setDrafts(await getForumDrafts(forumId))
    } catch {
      toast.error('Erro ao carregar documentos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [forumId])
  useRealtime('forum_drafts', (e) => {
    if (e.record.forum_id === forumId) load()
  })

  const handleSubmit = async () => {
    if (!file) {
      toast.error('Selecione um arquivo')
      return
    }
    setSubmitting(true)
    try {
      const fd = new FormData()
      fd.append('forum_id', forumId)
      fd.append('title', title)
      fd.append('is_official', String(isOfficial))
      fd.append('file', file)
      if (isOfficial) {
        for (const d of drafts) {
          if (d.is_official) await updateForumDraft(d.id, { is_official: false })
        }
      }
      await createForumDraft(fd)
      setTitle('')
      setFile(null)
      setIsOfficial(false)
      setShowForm(false)
      if (fileRef.current) fileRef.current.value = ''
      toast.success('Documento adicionado!')
    } catch {
      toast.error('Erro ao enviar documento')
    } finally {
      setSubmitting(false)
    }
  }

  const markOfficial = async (id: string) => {
    try {
      for (const d of drafts) {
        if (d.is_official && d.id !== id) await updateForumDraft(d.id, { is_official: false })
      }
      await updateForumDraft(id, { is_official: true })
      toast.success('Marcado como versão oficial!')
    } catch {
      toast.error('Erro ao atualizar')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteForumDraft(id)
    } catch {
      toast.error('Erro ao excluir')
    }
  }

  const official = drafts.find((d) => d.is_official)
  const inProgress = drafts.filter((d) => !d.is_official)

  return (
    <div className="space-y-6">
      {isPrivileged && (
        <Button variant="outline" size="sm" onClick={() => setShowForm(!showForm)}>
          <Upload className="w-4 h-4 mr-2" /> Adicionar Documento
        </Button>
      )}
      {showForm && (
        <Card>
          <CardContent className="p-4 space-y-3">
            <Input
              placeholder="Título do documento"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <input
              ref={fileRef}
              type="file"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            <div className="flex items-center gap-4 flex-wrap">
              <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
                <FileText className="w-4 h-4 mr-2" /> {file ? file.name : 'Selecionar arquivo'}
              </Button>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={isOfficial}
                  onChange={(e) => setIsOfficial(e.target.checked)}
                  className="rounded"
                />
                Versão Oficial
              </label>
              <Button size="sm" onClick={handleSubmit} disabled={submitting}>
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enviar'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {official && (
            <div>
              <h3 className="text-sm font-semibold mb-2 flex items-center gap-2 text-emerald-600">
                <CheckCircle className="w-4 h-4" /> Versão Oficial
              </h3>
              <Card className="border-emerald-200 bg-emerald-50/50">
                <CardContent className="p-3 flex items-center justify-between gap-2">
                  <a
                    href={pb.files.getUrl(official, official.file)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm font-medium hover:text-primary"
                  >
                    <FileText className="w-4 h-4" /> {official.title || 'Documento Oficial'}
                  </a>
                  {isPrivileged && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      onClick={() => handleDelete(official.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
          <div>
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-2 text-muted-foreground">
              <FileEdit className="w-4 h-4" /> Documentos em Construção
            </h3>
            {inProgress.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                Nenhum documento em construção.
              </p>
            ) : (
              <div className="space-y-2">
                {inProgress.map((d) => (
                  <Card key={d.id}>
                    <CardContent className="p-3 flex items-center justify-between gap-2">
                      <a
                        href={pb.files.getUrl(d, d.file)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm hover:text-primary"
                      >
                        <FileText className="w-4 h-4" /> {d.title || 'Documento'}
                      </a>
                      {isPrivileged && (
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs"
                            onClick={() => markOfficial(d.id)}
                          >
                            Marcar como Oficial
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive"
                            onClick={() => handleDelete(d.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
