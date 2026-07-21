import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Check, X, Link as LinkIcon, Plus } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import {
  getForumRelations,
  updateForumRelation,
  deleteForumRelation,
  createForumRelation,
  type ForumRelation,
  getForums,
  type Forum,
} from '@/services/forums'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function ForumRelated({
  forumId,
  isPrivileged,
}: {
  forumId: string
  isPrivileged: boolean
}) {
  const [relations, setRelations] = useState<ForumRelation[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [allForums, setAllForums] = useState<Forum[]>([])
  const [selectedForumToLink, setSelectedForumToLink] = useState('')
  const { toast } = useToast()

  const loadData = async () => {
    try {
      const rels = await getForumRelations(forumId)
      setRelations(rels)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [forumId])

  const handleApprove = async (id: string) => {
    try {
      await updateForumRelation(id, { status: 'Approved' })
      toast({ title: 'Link aprovado com sucesso!' })
      loadData()
    } catch (e) {
      toast({ title: 'Erro ao aprovar', variant: 'destructive' })
    }
  }

  const handleReject = async (id: string) => {
    try {
      await deleteForumRelation(id)
      toast({ title: 'Link rejeitado e removido.' })
      loadData()
    } catch (e) {
      toast({ title: 'Erro ao rejeitar', variant: 'destructive' })
    }
  }

  const handleOpenDialog = async () => {
    try {
      const forums = await getForums()
      setAllForums(forums.filter((f) => f.id !== forumId))
      setDialogOpen(true)
    } catch (e) {
      toast({ title: 'Erro ao carregar fóruns', variant: 'destructive' })
    }
  }

  const handleCreateLink = async () => {
    if (!selectedForumToLink) return
    try {
      await createForumRelation({
        source_forum_id: forumId,
        target_forum_id: selectedForumToLink,
        status: isPrivileged ? 'Approved' : 'Pending',
      })
      toast({ title: 'Link criado com sucesso!' })
      setDialogOpen(false)
      setSelectedForumToLink('')
      loadData()
    } catch (e: any) {
      if (e.status === 400) {
        toast({ title: 'Este link já existe.', variant: 'destructive' })
      } else {
        toast({ title: 'Erro ao criar link.', variant: 'destructive' })
      }
    }
  }

  const approved = relations.filter((r) => r.status === 'Approved')
  const pending = relations.filter((r) => r.status === 'Pending')

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <LinkIcon className="w-5 h-5 text-muted-foreground" />
          Discussões Relacionadas
        </h3>
        <Button variant="outline" size="sm" onClick={handleOpenDialog}>
          <Plus className="w-4 h-4 mr-2" /> Sugerir Link
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Carregando...</p>
      ) : (
        <div className="space-y-4">
          {approved.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma discussão relacionada aprovada.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {approved.map((r) => {
                const isSource = r.source_forum_id === forumId
                const relatedForum = isSource
                  ? r.expand?.target_forum_id
                  : r.expand?.source_forum_id
                if (!relatedForum) return null
                return (
                  <Link
                    key={r.id}
                    to={`/foruns/${relatedForum.id}`}
                    className="block border rounded-md p-3 hover:bg-muted/50 transition-colors"
                  >
                    <p className="text-xs font-mono text-primary mb-1">{relatedForum.code}</p>
                    <p className="text-sm font-medium line-clamp-2">{relatedForum.title}</p>
                  </Link>
                )
              })}
            </div>
          )}

          {isPrivileged && pending.length > 0 && (
            <div className="mt-8 border-t pt-6">
              <h4 className="text-sm font-semibold mb-3 text-amber-600 flex items-center gap-2">
                Links Pendentes de Aprovação
                <Badge
                  variant="secondary"
                  className="bg-amber-100 text-amber-700 hover:bg-amber-100"
                >
                  {pending.length}
                </Badge>
              </h4>
              <div className="space-y-2">
                {pending.map((r) => {
                  const isSource = r.source_forum_id === forumId
                  const relatedForum = isSource
                    ? r.expand?.target_forum_id
                    : r.expand?.source_forum_id
                  if (!relatedForum) return null
                  return (
                    <div
                      key={r.id}
                      className="flex items-center justify-between border rounded-md p-3 bg-amber-50/30"
                    >
                      <div>
                        <p className="text-xs font-mono text-muted-foreground">
                          {relatedForum.code}
                        </p>
                        <p className="text-sm">{relatedForum.title}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-emerald-600 hover:bg-emerald-100"
                          onClick={() => handleApprove(r.id)}
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-red-600 hover:bg-red-100"
                          onClick={() => handleReject(r.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Vincular Fórum Relacionado</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Select value={selectedForumToLink} onValueChange={setSelectedForumToLink}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um fórum..." />
              </SelectTrigger>
              <SelectContent>
                {allForums.map((f) => (
                  <SelectItem key={f.id} value={f.id}>
                    <span className="font-mono text-xs mr-2 text-muted-foreground">{f.code}</span>
                    {f.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-2">
              {isPrivileged
                ? 'O link será aprovado imediatamente.'
                : 'O link ficará pendente até ser aprovado pelo relator ou admin.'}
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateLink} disabled={!selectedForumToLink}>
              Vincular
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
