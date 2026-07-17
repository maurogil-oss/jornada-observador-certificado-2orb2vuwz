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
import { Check, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { type Forum, getNextForumCode, createForum, updateForum } from '@/services/forums'
import { getErrorMessage } from '@/lib/pocketbase/errors'
import { toast } from 'sonner'

interface ForumFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingForum: Forum | null
  users: any[]
  onSuccess: () => void
}

const STATUS_OPTIONS = ['Aberto', 'Em Consolidação', 'Encerrado'] as const

export function ForumFormDialog({
  open,
  onOpenChange,
  editingForum,
  users,
  onSuccess,
}: ForumFormDialogProps) {
  const [code, setCode] = useState('')
  const [title, setTitle] = useState('')
  const [objective, setObjective] = useState('')
  const [relatorId, setRelatorId] = useState('')
  const [openingDate, setOpeningDate] = useState('')
  const [closingDate, setClosingDate] = useState('')
  const [status, setStatus] = useState<string>('Aberto')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [comboboxOpen, setComboboxOpen] = useState(false)

  useEffect(() => {
    if (open) {
      if (editingForum) {
        setCode(editingForum.code)
        setTitle(editingForum.title)
        setObjective(editingForum.objective || '')
        setRelatorId(editingForum.relator_id)
        setOpeningDate(editingForum.opening_date ? editingForum.opening_date.substring(0, 10) : '')
        setClosingDate(editingForum.closing_date ? editingForum.closing_date.substring(0, 10) : '')
        setStatus(editingForum.status || 'Aberto')
      } else {
        setCode('')
        setTitle('')
        setObjective('')
        setRelatorId('')
        setOpeningDate('')
        setClosingDate('')
        setStatus('Aberto')
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
    if (!title.trim()) errs.title = 'O tema é obrigatório.'
    if (!objective.trim()) errs.objective = 'O objetivo é obrigatório.'
    if (!relatorId) errs.relator_id = 'O relator é obrigatório.'
    if (!openingDate) errs.opening_date = 'A data de abertura é obrigatória.'
    if (closingDate && openingDate && closingDate < openingDate) {
      errs.closing_date = 'A data de fechamento deve ser posterior à de abertura.'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setIsSaving(true)
    try {
      const data: Record<string, any> = {
        code,
        title: title.trim(),
        objective: objective.trim(),
        relator_id: relatorId,
        opening_date: openingDate || null,
        closing_date: closingDate || null,
        status,
      }
      if (editingForum) {
        await updateForum(editingForum.id, data as any)
        toast.success('Fórum atualizado com sucesso!')
      } else {
        await createForum(data as any)
        toast.success('Fórum criado com sucesso!')
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
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>{editingForum ? 'Editar Fórum Técnico' : 'Novo Fórum Técnico'}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="code">Código</Label>
            <Input id="code" value={code} readOnly className="bg-muted/50 font-mono" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="title">Tema *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Atendimento às Vítimas"
            />
            {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
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
