import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Upload, Trash2, FileText, Loader2, FolderOpen } from 'lucide-react'
import { toast } from 'sonner'
import pb from '@/lib/pocketbase/client'
import { useRealtime } from '@/hooks/use-realtime'
import {
  getForumLibrary,
  createForumLibraryItem,
  deleteForumLibraryItem,
  type ForumLibraryItem,
} from '@/services/forumLibrary'

const CATEGORY_COLORS: Record<string, string> = {
  'Documento Técnico': 'text-blue-600',
  'Nota Técnica': 'text-amber-600',
  'Guia Prático': 'text-emerald-600',
}

const CATEGORIES = ['Documento Técnico', 'Nota Técnica', 'Guia Prático']

export function ForumLibrary({
  forumId,
  isPrivileged,
}: {
  forumId: string
  isPrivileged: boolean
}) {
  const [items, setItems] = useState<ForumLibraryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [file, setFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const load = async () => {
    try {
      setItems(await getForumLibrary(forumId))
    } catch {
      toast.error('Erro ao carregar biblioteca')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [forumId])
  useRealtime('forum_library', (e) => {
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
      fd.append('category', category)
      fd.append('file', file)
      await createForumLibraryItem(fd)
      setTitle('')
      setFile(null)
      setShowForm(false)
      if (fileRef.current) fileRef.current.value = ''
      toast.success('Documento adicionado!')
    } catch {
      toast.error('Erro ao enviar documento')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteForumLibraryItem(id)
    } catch {
      toast.error('Erro ao excluir')
    }
  }

  const grouped = CATEGORIES.map((cat) => ({
    cat,
    items: items.filter((i) => i.category === cat),
  })).filter((g) => g.items.length > 0)

  return (
    <div className="space-y-6">
      {isPrivileged && (
        <div>
          <Button variant="outline" size="sm" onClick={() => setShowForm(!showForm)}>
            <Upload className="w-4 h-4 mr-2" /> Adicionar Documento
          </Button>
          {showForm && (
            <Card className="mt-3">
              <CardContent className="p-4 space-y-3">
                <Input
                  placeholder="Título do documento"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <input
                  ref={fileRef}
                  type="file"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
                    <FileText className="w-4 h-4 mr-2" /> {file ? file.name : 'Selecionar arquivo'}
                  </Button>
                  <Button size="sm" onClick={handleSubmit} disabled={submitting}>
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enviar'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : grouped.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <FolderOpen className="w-10 h-10 mx-auto mb-2 opacity-40" />
          <p>Nenhum documento na biblioteca ainda.</p>
        </div>
      ) : (
        grouped.map(({ cat, items: catItems }) => (
          <div key={cat}>
            <h3 className="text-sm font-semibold mb-2 text-muted-foreground">{cat}</h3>
            <div className="space-y-2">
              {catItems.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-3 flex items-center justify-between gap-2">
                    <a
                      href={pb.files.getUrl(item, item.file)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm hover:text-primary min-w-0"
                    >
                      <FileText className="w-4 h-4 flex-shrink-0" />
                      {item.code && (
                        <span
                          className={`font-mono text-xs font-bold flex-shrink-0 ${CATEGORY_COLORS[item.category] || 'text-muted-foreground'}`}
                        >
                          [{item.code}]
                        </span>
                      )}
                      <span className="truncate">{item.title || 'Documento'}</span>
                    </a>
                    {isPrivileged && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
