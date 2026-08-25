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
  UserCheck,
  UserPlus,
  X,
  ExternalLink,
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
  getMembersByInstitution,
  createMember,
  updateMember,
  deleteMember,
  RepresentationInstitution,
  RepresentationMember,
} from '@/services/representations'
import { getUsers } from '@/services/users'
import { toast } from 'sonner'

export default function AdminRepresentationsPage() {
  const [institutions, setInstitutions] = useState<RepresentationInstitution[]>([])
  const [usersList, setUsersList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  // Dialog state
  const [isOpen, setIsOpen] = useState(false)
  const [editingInst, setEditingInst] = useState<RepresentationInstitution | null>(null)
  const [submitting, setSubmitting] = useState(false)

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

  // Representative state for dialog
  const [existingPrimaryMember, setExistingPrimaryMember] = useState<RepresentationMember | null>(
    null,
  )
  const [repName, setRepName] = useState('')
  const [repEmail, setRepEmail] = useState('')
  const [repUserId, setRepUserId] = useState<string | null>(null)
  const [repRoleType, setRepRoleType] = useState<'Titular' | 'Suplente'>('Titular')
  const [repAppointmentAct, setRepAppointmentAct] = useState('')
  const [repSearchQuery, setRepSearchQuery] = useState('')
  const [showUserDropdown, setShowUserDropdown] = useState(false)

  useEffect(() => {
    loadData()
    loadUsers()
  }, [])

  const loadData = async () => {
    setLoading(true)
    const data = await getAllRepresentationInstitutionsAdmin()
    setInstitutions(data)
    setLoading(false)
  }

  const loadUsers = async () => {
    try {
      const users = await getUsers()
      setUsersList(users)
    } catch (err) {
      console.error('Error fetching users:', err)
    }
  }

  const handleOpenCreate = () => {
    setEditingInst(null)
    setExistingPrimaryMember(null)
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
    setRepName('')
    setRepEmail('')
    setRepUserId(null)
    setRepRoleType('Titular')
    setRepAppointmentAct('')
    setRepSearchQuery('')
    setShowUserDropdown(false)
    setIsOpen(true)
  }

  const handleOpenEdit = async (inst: RepresentationInstitution) => {
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

    // Find primary member (Titular preferred, or first member)
    const members = inst.expand?.representation_members_via_institution_id || []
    let primary = members.find((m) => m.role_type === 'Titular') || members[0] || null

    if (!primary && inst.id) {
      try {
        const fetched = await getMembersByInstitution(inst.id)
        if (fetched.length > 0) {
          primary = fetched.find((m) => m.role_type === 'Titular') || fetched[0]
        }
      } catch (e) {
        console.error(e)
      }
    }

    setExistingPrimaryMember(primary)
    if (primary) {
      setRepName(primary.name || '')
      setRepEmail(primary.email || '')
      setRepUserId(primary.user_id || null)
      setRepRoleType(primary.role_type || 'Titular')
      setRepAppointmentAct(primary.appointment_act || '')
      setRepSearchQuery(primary.name || '')
    } else {
      setRepName('')
      setRepEmail('')
      setRepUserId(null)
      setRepRoleType('Titular')
      setRepAppointmentAct('')
      setRepSearchQuery('')
    }

    setShowUserDropdown(false)
    setIsOpen(true)
  }

  const handleSelectUser = (u: any) => {
    const displayName = u.full_name || u.name || u.nickname || u.email
    setRepName(displayName)
    setRepEmail(u.email || '')
    setRepUserId(u.id)
    setRepSearchQuery(displayName)
    setShowUserDropdown(false)
  }

  const handleManualNameChange = (value: string) => {
    setRepSearchQuery(value)
    setRepName(value)
    // If the typed text no longer matches the selected user, clear user_id binding to treat as manual
    if (repUserId) {
      const selected = usersList.find((u) => u.id === repUserId)
      const selectedName = selected?.full_name || selected?.name || selected?.nickname || ''
      if (selectedName.toLowerCase() !== value.toLowerCase()) {
        setRepUserId(null)
      }
    }
  }

  const handleClearSelectedUser = () => {
    setRepName('')
    setRepEmail('')
    setRepUserId(null)
    setRepSearchQuery('')
    setShowUserDropdown(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.acronym) {
      toast.error('Preencha o nome e a sigla do colegiado.')
      return
    }

    setSubmitting(true)
    try {
      let instId = editingInst?.id

      if (editingInst) {
        await updateInstitution(editingInst.id, form)
      } else {
        const created = await createInstitution(form)
        instId = created.id
      }

      // Handle representative member association
      if (instId && repName.trim()) {
        const memberData = {
          institution_id: instId,
          name: repName.trim(),
          email: repEmail.trim(),
          user_id: repUserId || undefined,
          role_type: repRoleType,
          appointment_act: repAppointmentAct.trim(),
          commitment_term_signed: true,
          status: 'Ativo' as const,
          term_start: form.term_start || undefined,
          term_end: form.term_end || undefined,
        }

        if (existingPrimaryMember) {
          await updateMember(existingPrimaryMember.id, memberData)
        } else {
          await createMember(memberData)
        }
      }

      toast.success(
        editingInst
          ? 'Representação e vínculo atualizados com sucesso!'
          : 'Nova Representação e representante cadastrados com sucesso!',
      )
      setIsOpen(false)
      loadData()
    } catch (err) {
      console.error(err)
      toast.error('Erro ao salvar representação.')
    } finally {
      setSubmitting(false)
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

  const filtered = institutions.filter((i) => {
    const q = search.toLowerCase()
    const memberNames = (i.expand?.representation_members_via_institution_id || [])
      .map((m) => m.name.toLowerCase())
      .join(' ')
    return (
      i.name.toLowerCase().includes(q) ||
      i.acronym.toLowerCase().includes(q) ||
      i.category.toLowerCase().includes(q) ||
      memberNames.includes(q)
    )
  })

  const filteredUsers = repSearchQuery.trim()
    ? usersList
        .filter((u) => {
          const q = repSearchQuery.toLowerCase()
          return (
            (u.full_name && u.full_name.toLowerCase().includes(q)) ||
            (u.name && u.name.toLowerCase().includes(q)) ||
            (u.nickname && u.nickname.toLowerCase().includes(q)) ||
            (u.email && u.email.toLowerCase().includes(q))
          )
        })
        .slice(0, 6)
    : []

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
          {filtered.map((inst) => {
            const members = inst.expand?.representation_members_via_institution_id || []
            const primary = members.find((m) => m.role_type === 'Titular') || members[0]

            return (
              <Card key={inst.id} className="hover:border-primary/40 transition-all shadow-xs">
                <CardContent className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-2 flex-1">
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

                    {/* REPRESENTANTE DO ONSV NA LISTAGEM */}
                    <div className="flex flex-wrap items-center gap-2 pt-0.5">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-primary/10 text-primary border border-primary/20 text-xs font-semibold">
                        <UserCheck className="w-3.5 h-3.5 shrink-0" />
                        <span>Representante ONSV:</span>
                        {primary ? (
                          <span className="text-foreground font-bold">
                            {primary.name} {primary.role_type ? `(${primary.role_type})` : ''}
                          </span>
                        ) : (
                          <span className="text-amber-600 dark:text-amber-400 font-medium italic">
                            Não informado
                          </span>
                        )}
                      </div>

                      {members.length > 1 && (
                        <Badge variant="outline" className="text-[11px] text-muted-foreground">
                          +{members.length - 1} outro(s) membro(s)
                        </Badge>
                      )}

                      {inst.scope && (
                        <span className="text-xs text-muted-foreground">
                          • Escopo: <strong className="text-foreground">{inst.scope}</strong>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 pt-2 lg:pt-0">
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
            )
          })}
        </div>
      )}

      {/* DIALOG FORMULARIO INSTITUICAO E REPRESENTANTE */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingInst ? 'Editar Representação' : 'Cadastrar Nova Representação'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-5 pt-2">
            {/* SEÇÃO 1: DADOS DO COLEGIADO */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase border-b pb-1">
                <Building2 className="w-4 h-4" />
                <span>Dados do Colegiado</span>
              </div>

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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                  rows={2}
                  placeholder="Resumo das atribuições e relevância do colegiado..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

              <div className="flex items-center gap-2 pt-1">
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
            </div>

            {/* SEÇÃO 2: OBSERVADOR REPRESENTANTE DO ONSV */}
            <div className="space-y-4 p-4 bg-muted/20 border border-primary/20 rounded-lg">
              <div className="flex items-center justify-between border-b pb-2">
                <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase">
                  <UserCheck className="w-4 h-4" />
                  <span>Observador Representante do ONSV</span>
                </div>
                {repUserId && (
                  <Badge className="bg-emerald-600 text-white text-[10px] gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Observador Cadastrado</span>
                  </Badge>
                )}
              </div>

              <div className="space-y-2 relative">
                <Label htmlFor="rep-search">Nome do Observador / Representante</Label>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="rep-search"
                    placeholder="Digite o nome manualmente ou busque um observador cadastrado..."
                    value={repSearchQuery}
                    onChange={(e) => {
                      handleManualNameChange(e.target.value)
                      setShowUserDropdown(true)
                    }}
                    onFocus={() => {
                      if (repSearchQuery.trim()) setShowUserDropdown(true)
                    }}
                    className="pl-9 pr-9 text-sm"
                  />
                  {repSearchQuery && (
                    <button
                      type="button"
                      onClick={handleClearSelectedUser}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Dropdown de sugestão de usuários da base */}
                {showUserDropdown && filteredUsers.length > 0 && (
                  <div className="absolute z-50 left-0 right-0 mt-1 bg-popover border rounded-md shadow-lg max-h-60 overflow-y-auto p-1 space-y-1">
                    <div className="px-2 py-1 text-[11px] font-semibold text-muted-foreground uppercase">
                      Observadores Encontrados na Plataforma:
                    </div>
                    {filteredUsers.map((u) => {
                      const uDisplayName = u.full_name || u.name || u.nickname || u.email
                      return (
                        <div
                          key={u.id}
                          className="px-3 py-2 text-sm rounded cursor-pointer hover:bg-accent hover:text-accent-foreground flex items-center justify-between gap-2"
                          onClick={() => handleSelectUser(u)}
                        >
                          <div>
                            <div className="font-semibold text-foreground flex items-center gap-1.5">
                              <span>{uDisplayName}</span>
                              {u.nickname && u.nickname !== uDisplayName && (
                                <span className="text-xs text-muted-foreground font-normal">
                                  ({u.nickname})
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {u.email} {u.state ? `• ${u.state}` : ''}{' '}
                              {u.level ? `• ${u.level}` : ''}
                            </div>
                          </div>
                          <Badge variant="outline" className="text-[10px] shrink-0">
                            Selecionar
                          </Badge>
                        </div>
                      )
                    })}
                  </div>
                )}

                <p className="text-[11px] text-muted-foreground">
                  Você pode selecionar um observador já cadastrado na lista ou apenas digitar o nome
                  livremente.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="rep-email">E-mail do Representante</Label>
                  <Input
                    id="rep-email"
                    type="email"
                    placeholder="observador@onsv.org.br"
                    value={repEmail}
                    onChange={(e) => setRepEmail(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rep-role">Condição / Função</Label>
                  <Select value={repRoleType} onValueChange={(val: any) => setRepRoleType(val)}>
                    <SelectTrigger id="rep-role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Titular">Titular</SelectItem>
                      <SelectItem value="Suplente">Suplente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rep-act">Ato de Nomeação / Portaria (opcional)</Label>
                <Input
                  id="rep-act"
                  placeholder="Ex: Portaria Senatran nº 45/2024"
                  value={repAppointmentAct}
                  onChange={(e) => setRepAppointmentAct(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                disabled={submitting}
                onClick={() => setIsOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting
                  ? 'Salvando...'
                  : editingInst
                    ? 'Salvar Alterações'
                    : 'Criar Representação'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
