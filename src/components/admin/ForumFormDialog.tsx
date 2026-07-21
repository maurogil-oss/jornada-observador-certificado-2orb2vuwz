import { useState, useEffect, useMemo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Check, ChevronsUpDown, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  type Forum,
  getNextForumCode,
  createForum,
  updateForum,
  getForumTags,
  createForumTag,
  type ForumTag,
  getForums,
  createForumRelation,
} from '@/services/forums'
import { getErrorMessage } from '@/lib/pocketbase/errors'
import { toast } from 'sonner'

interface ForumFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingForum: Forum | null
  users: any[]
  onSuccess: () => void
}

const STATUS_OPTIONS = [
  'Abertura',
  'Discussões',
  'Consolidação',
  'Aprovação',
  'Publicação',
] as const

const PILAR_OPTIONS = [
  'Pilar 1: Gestão da Segurança no Trânsito',
  'Pilar 2: Vias Seguras',
  'Pilar 3: Segurança Veicular',
  'Pilar 4: Educação para o Trânsito',
  'Pilar 5: Atendimento às Vítimas',
  'Pilar 6: Normatização e Fiscalização',
  'Não Definido',
] as const

export function ForumFormDialog({
  open,
  onOpenChange,
  editingForum,
  users,
  onSuccess,
}: ForumFormDialogProps) {
  const [code, setCode] = useState('')
  const [title, setTitle] = useState('')
  const [pilar, setPilar] = useState<string>('Não Definido')
  const [objective, setObjective] = useState('')
  const [relatorId, setRelatorId] = useState('')
  const [openingDate, setOpeningDate] = useState('')
  const [closingDate, setClosingDate] = useState('')
  const [status, setStatus] = useState<string>('Abertura')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [comboboxOpen, setComboboxOpen] = useState(false)

  const [availableTags, setAvailableTags] = useState<ForumTag[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [newTagInput, setNewTagInput] = useState('')

  const [availableForums, setAvailableForums] = useState<Forum[]>([])
  const [selectedRelatedForums, setSelectedRelatedForums] = useState<string[]>([])

  useEffect(() => {
    if (open) {
      getForumTags()
        .then(setAvailableTags)
        .catch(() => {})
      getForums()
        .then(setAvailableForums)
        .catch(() => {})

      if (editingForum) {
        setCode(editingForum.code)
        setTitle(editingForum.title)
        setPilar(editingForum.pilar_pnatrans || 'Não Definido')
        setObjective(editingForum.objective || '')
        setRelatorId(editingForum.relator_id)
        setOpeningDate(editingForum.opening_date ? editingForum.opening_date.substring(0, 10) : '')
        setClosingDate(editingForum.closing_date ? editingForum.closing_date.substring(0, 10) : '')
        setStatus(editingForum.status || 'Abertura')
        setSelectedTags(editingForum.theme_tags || [])
        setSelectedRelatedForums([]) // Links são listados e gerenciados via aba detalhes
      } else {
        setCode('')
        setTitle('')
        setPilar('Não Definido')
        setObjective('')
        setRelatorId('')
        setOpeningDate('')
        setClosingDate('')
        setStatus('Abertura')
        setSelectedTags([])
        setSelectedRelatedForums([])
        getNextForumCode()
          .then(setCode)
          .catch(() => setCode(''))
      }
      setErrors({})
    }
  }, [open, editingForum])

  const selectedRelator = useMemo(() => users.find((u) => u.id === relatorId), [users, relatorId])

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!title.trim()) errs.title = 'A pergunta é obrigatória.'
    if (!pilar || pilar === 'Não Definido') errs.pilar_pnatrans = 'O pilar é obrigatório.'
    if (!objective.trim()) errs.objective = 'O objetivo é obrigatório.'
    if (!relatorId) errs.relator_id = 'O relator é obrigatório.'
    if (!openingDate) errs.opening_date = 'A data de abertura é obrigatória.'
    if (closingDate && openingDate && closingDate < openingDate) {
      errs.closing_date = 'A data de fechamento deve ser posterior à de abertura.'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleAddTag = async () => {
    const val = newTagInput.trim()
    if (!val) return
    const existing = availableTags.find((t) => t.name.toLowerCase() === val.toLowerCase())
    if (existing) {
      if (!selectedTags.includes(existing.id)) setSelectedTags([...selectedTags, existing.id])
    } else {
      try {
        const newTag = await createForumTag(val)
        setAvailableTags((prev) => [...prev, newTag])
        setSelectedTags((prev) => [...prev, newTag.id])
      } catch (error) {
        toast.error('Erro ao criar tema.')
      }
    }
    setNewTagInput('')
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setIsSaving(true)
    try {
      const data: Record<string, any> = {
        code,
        title: title.trim(),
        pilar_pnatrans: pilar,
        theme_tags: selectedTags,
        objective: objective.trim(),
        relator_id: relatorId,
        opening_date: openingDate || null,
        closing_date: closingDate || null,
        status,
      }

      let savedForumId = editingForum?.id
      if (editingForum) {
        await updateForum(editingForum.id, data as any)
        toast.success('Fórum atualizado com sucesso!')
      } else {
        const created = await createForum(data as any)
        savedForumId = created.id
        toast.success('Fórum criado com sucesso!')
      }

      for (const relForumId of selectedRelatedForums) {
        try {
          await createForumRelation({
            source_forum_id: savedForumId!,
            target_forum_id: relForumId,
            status: 'Pending',
          })
        } catch (e) {
          // ignore duplicate
        }
      }

      onOpenChange(false)
      onSuccess()
    } catch (error) {
      toast.error('Erro ao salvar fórum', { description: getErrorMessage(error) })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingForum ? 'Editar Fórum Técnico' : 'Novo Fórum Técnico'}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="code">Código</Label>
              <Input id="code" value={code} readOnly className="bg-muted/50 font-mono" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="pilar">Pilar do PNATRANS *</Label>
              <Select value={pilar} onValueChange={setPilar}>
                <SelectTrigger id="pilar">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PILAR_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.pilar_pnatrans && (
                <p className="text-sm text-destructive">{errors.pilar_pnatrans}</p>
              )}
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="title">Pergunta (Tema) *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Como podemos melhorar o atendimento pré-hospitalar?"
            />
            {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
          </div>

          <div className="grid gap-2">
            <Label>Temas (Tags)</Label>
            <div className="flex flex-wrap gap-2 mb-1">
              {selectedTags.map((tagId) => {
                const tag = availableTags.find((t) => t.id === tagId)
                if (!tag) return null
                return (
                  <Badge key={tag.id} variant="secondary" className="flex items-center gap-1">
                    {tag.name}
                    <button
                      type="button"
                      onClick={() => setSelectedTags((prev) => prev.filter((id) => id !== tag.id))}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )
              })}
            </div>
            <div className="flex items-center gap-2">
              <Input
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                placeholder="Adicionar novo tema..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddTag()
                  }
                }}
              />
              <Button type="button" variant="secondary" onClick={handleAddTag}>
                Adicionar
              </Button>
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Fóruns Relacionados (Links Pendentes)</Label>
            <div className="flex flex-wrap gap-2 mb-1">
              {selectedRelatedForums.map((fId) => {
                const f = availableForums.find((af) => af.id === fId)
                if (!f) return null
                return (
                  <Badge
                    key={fId}
                    variant="outline"
                    className="flex items-center gap-1 bg-background"
                  >
                    {f.code}
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedRelatedForums((prev) => prev.filter((id) => id !== fId))
                      }
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )
              })}
            </div>
            <Select
              onValueChange={(val) => {
                if (val && !selectedRelatedForums.includes(val)) {
                  setSelectedRelatedForums([...selectedRelatedForums, val])
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um fórum existente para vincular..." />
              </SelectTrigger>
              <SelectContent>
                {availableForums
                  .filter((f) => f.id !== editingForum?.id && !selectedRelatedForums.includes(f.id))
                  .map((f) => (
                    <SelectItem key={f.id} value={f.id}>
                      <span className="font-mono text-xs mr-2 text-muted-foreground">{f.code}</span>
                      <span className="truncate max-w-[300px] inline-block align-bottom">
                        {f.title}
                      </span>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <p className="text-[11px] text-muted-foreground">
              Estes links serão criados como "Pendentes" e deverão ser aprovados.
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="objective">Objetivo *</Label>
            <Textarea
              id="objective"
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              placeholder="Descreva o objetivo do fórum..."
              rows={3}
            />
            {errors.objective && <p className="text-sm text-destructive">{errors.objective}</p>}
          </div>
          <div className="grid gap-2">
            <Label>Relator *</Label>
            <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" className="justify-between w-full">
                  {selectedRelator
                    ? selectedRelator.full_name || selectedRelator.name
                    : 'Selecione o relator...'}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0" align="start">
                <Command>
                  <CommandInput placeholder="Buscar usuário..." />
                  <CommandList>
                    <CommandEmpty>Nenhum usuário encontrado.</CommandEmpty>
                    <CommandGroup>
                      {users.map((u) => (
                        <CommandItem
                          key={u.id}
                          value={`${u.full_name || u.name} ${u.email}`}
                          onSelect={() => {
                            setRelatorId(u.id)
                            setComboboxOpen(false)
                          }}
                        >
                          <Check
                            className={cn(
                              'mr-2 h-4 w-4',
                              relatorId === u.id ? 'opacity-100' : 'opacity-0',
                            )}
                          />
                          <span>{u.full_name || u.name}</span>
                          <span className="text-xs text-muted-foreground ml-1">{u.email}</span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {errors.relator_id && <p className="text-sm text-destructive">{errors.relator_id}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="opening_date">Data de Abertura *</Label>
              <Input
                id="opening_date"
                type="date"
                value={openingDate}
                onChange={(e) => setOpeningDate(e.target.value)}
              />
              {errors.opening_date && (
                <p className="text-sm text-destructive">{errors.opening_date}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="closing_date">Data de Fechamento</Label>
              <Input
                id="closing_date"
                type="date"
                value={closingDate}
                onChange={(e) => setClosingDate(e.target.value)}
              />
              {errors.closing_date && (
                <p className="text-sm text-destructive">{errors.closing_date}</p>
              )}
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSaving}>
            {isSaving ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
