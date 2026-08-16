import React, { useEffect, useState } from 'react'
import {
  Building2,
  Plus,
  Trash2,
  Edit,
  ShieldCheck,
  CheckCircle2,
  Layers,
  Search,
  Users,
  FileText,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  getAllRepresentationInstitutionsAdmin,
  createInstitution,
  updateInstitution,
  deleteInstitution,
  RepresentationInstitution,
} from '@/services/representations'
import { toast } from 'sonner'

export default function AdminRepresentationsPage() {
  const [institutions, setInstitutions] = useState<RepresentationInstitution[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  // Dialog state
  const [isOpen, setIsOpen] = useState(false)
  const [editingInst, setEditingInst] = useState<RepresentationInstitution | null>(null)

  const [form, setForm] = useState({
    name: '',
    acronym: '',
    category: 'Federal' as RepresentationInstitution['category'],
    state: '',
    city: '',
    description: '',
    scope: '',
    term_start: '',
    term_end: '',
    is_active: true,
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    const data = await getAllRepresentationInstitutionsAdmin()
    setInstitutions(data)
    setLoading(false)
  }

  const handleOpenCreate = () => {
    setEditingInst(null)
    setForm({
      name: '',
      acronym: '',
      category: 'Federal',
      state: '',
      city: '',
      description: '',
      scope: '',
      term_start: '',
      term_end: '',
      is_active: true,
    })
    setIsOpen(true)
  }

  const handleOpenEdit = (inst: RepresentationInstitution) => {
    setEditingInst(inst)
    setForm({
      name: inst.name,
      acronym: inst.acronym,
      category: inst.category,
      state: inst.state || '',
      city: inst.city || '',
      description: inst.description || '',
      scope: inst.scope || '',
      term_start: inst.term_start ? inst.term_start.split('T')[0] : '',
      term_end: inst.term_end ? inst.term_end.split('T')[0] : '',
      is_active: inst.is_active,
    })
    setIsOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.acronym) {
      toast.error('Preencha o nome e a sigla do colegiado.')
      return
    }

    try {
      if (editingInst) {
        await updateInstitution(editingInst.id, form)
        toast.success('Representação atualizada com sucesso!')
      } else {
        await createInstitution(form)
        toast.success('Nova Representação criada com sucesso!')
      }
      setIsOpen(false)
      loadData()
    } catch (err) {
      toast.error('Erro ao salvar representação.')
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Tem certeza que deseja excluir o colegiado "${name}"?`)) return

    try {
      await deleteInstitution(id)
      toast.success('Representação excluída.')
      loadData()
    } catch (err) {
      toast.error('Erro ao excluir representação.')
    }
  }

  const filtered = institutions.filter(
    (i) =>
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.acronym.toLowerCase().includes(search.toLowerCase()) ||
      i.category.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6 max-w-7xl animate-fade-in">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6">
        <div>
          <div className="flex items-center gap-2 text-primary font-semibold text-sm uppercase tracking-wider mb-1">
            <ShieldCheck className="w-5 h-5 text-primary" />
            <span>Painel Administrativo</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Gestão de Representações ONSV
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Cadastre, edite e gerencie órgãos colegiados, comitês estaduais/municipais e mandatos do
            ONSV.
          </p>
        </div>

        <Button onClick={handleOpenCreate} className="gap-2 font-semibold shadow-xs">
          <Plus className="w-4 h-4" />
          <span>Nova Representação</span>
        </Button>
      </div>

      {/* BUSCA E FILTROS */}
      <div className="flex items-center gap-2 max-w-md">
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, sigla ou categoria..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-sm"
          />
        </div>
      </div>

      {/* TABELA / LISTA ADMIN */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="text-center p-8">
          <CardContent className="pt-6">
            <p className="text-muted-foreground font-medium">Nenhum colegiado encontrado.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filtered.map((inst) => (
            <Card key={inst.id} className="hover:border-primary/40 transition-all shadow-xs">
              <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-lg font-black text-foreground">[ {inst.acronym} ]</span>
                    <span className="text-sm font-semibold text-muted-foreground">
                      – {inst.name}
                    </span>
                    <Badge variant="outline" className="text-xs font-bold">
                      {inst.category}
                    </Badge>
                    {inst.is_active ? (
                      <Badge className="bg-emerald-600 text-white text-[10px]">Ativa</Badge>
                    ) : (
                      <Badge variant="secondary" className="text-[10px]">
                        Inativa
                      </Badge>
                    )}
                  </div>

                  {inst.scope && (
                    <p className="text-xs text-muted-foreground">
                      Escopo: <strong>{inst.scope}</strong>
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenEdit(inst)}
                    className="gap-1.5"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Editar</span>
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(inst.id, inst.name)}
                    className="gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Excluir</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* DIALOG FORMULARIO INSTITUICAO */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingInst ? 'Editar Representação' : 'Cadastrar Nova Representação'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="inst-name">Nome do Orgão / Colegiado *</Label>
              <Input
                id="inst-name"
                required
                placeholder="Ex: Conselho Estadual de Trânsito de São Paulo"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="inst-acronym">Sigla *</Label>
                <Input
                  id="inst-acronym"
                  required
                  placeholder="Ex: CETRAN-SP"
                  value={form.acronym}
                  onChange={(e) => setForm({ ...form, acronym: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="inst-cat">Instância / Categoria *</Label>
                <Select
                  value={form.category}
                  onValueChange={(val: any) => setForm({ ...form, category: val })}
                >
                  <SelectTrigger id="inst-cat">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Federal">Federal</SelectItem>
                    <SelectItem value="Estadual">Estadual</SelectItem>
                    <SelectItem value="Municipal">Municipal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="inst-state">UF (Estado)</Label>
                <Input
                  id="inst-state"
                  placeholder="Ex: SP"
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="inst-city">Município (se aplicável)</Label>
                <Input
                  id="inst-city"
                  placeholder="Ex: São Paulo"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="inst-scope">Escopo / Câmaras Temáticas</Label>
              <Input
                id="inst-scope"
                placeholder="Ex: Câmara Temática de Esforço Legal"
                value={form.scope}
                onChange={(e) => setForm({ ...form, scope: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="inst-desc">Descrição / Atribuições</Label>
              <Textarea
                id="inst-desc"
                rows={3}
                placeholder="Resumo das atribuições e relevância do colegiado..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="term-start">Início da Vigência</Label>
                <Input
                  id="term-start"
                  type="date"
                  value={form.term_start}
                  onChange={(e) => setForm({ ...form, term_start: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="term-end">Fim da Vigência</Label>
                <Input
                  id="term-end"
                  type="date"
                  value={form.term_end}
                  onChange={(e) => setForm({ ...form, term_end: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="is-active"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                className="rounded border-gray-300 text-primary h-4 w-4"
              />
              <label htmlFor="is-active" className="text-xs font-semibold cursor-pointer">
                Representação Ativa
              </label>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                {editingInst ? 'Salvar Alterações' : 'Criar Representação'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
