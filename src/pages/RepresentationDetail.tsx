import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import {
  Building2,
  Users,
  Calendar,
  FileText,
  MessageSquare,
  ShieldCheck,
  AlertCircle,
  Clock,
  Plus,
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  Download,
  AlertTriangle,
  UserCheck,
  FileCheck,
  Send,
  Sparkles,
  Info,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  getRepresentationDetail,
  createTopic,
  createDocument,
  createMeeting,
  createMember,
  getFileUrl,
  RepresentationInstitution,
  RepresentationMember,
  RepresentationDocument,
  RepresentationMeeting,
  RepresentationTopic,
} from '@/services/representations'
import useAuthStore from '@/stores/useAuthStore'
import { toast } from 'sonner'

export default function RepresentationDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const [institution, setInstitution] = useState<RepresentationInstitution | null>(null)
  const [loading, setLoading] = useState(true)

  // Modals state
  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false)
  const [isDocModalOpen, setIsDocModalOpen] = useState(false)
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false)
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false)

  // Forms
  const [topicForm, setTopicForm] = useState({
    title: '',
    description: '',
    attention_flag: false,
  })

  const [docForm, setDocForm] = useState({
    title: '',
    category: 'Outros' as RepresentationDocument['category'],
    description: '',
    url: '',
    file: null as File | null,
  })

  const [meetingForm, setMeetingForm] = useState({
    title: '',
    meeting_type: 'Ordinária' as RepresentationMeeting['meeting_type'],
    meeting_date: new Date().toISOString().split('T')[0],
    location_or_link: '',
    agenda: '',
    minutes_summary: '',
    decisions: '',
    attendees_count: 0,
  })

  const [memberForm, setMemberForm] = useState({
    name: '',
    email: '',
    role_type: 'Titular' as RepresentationMember['role_type'],
    appointment_act: '',
    commitment_term_signed: true,
    status: 'Ativo' as RepresentationMember['status'],
  })

  const currentTab = searchParams.get('tab') || 'identificacao'

  useEffect(() => {
    if (id) {
      loadDetail()
    }
  }, [id])

  const loadDetail = async () => {
    if (!id) return
    setLoading(true)
    const data = await getRepresentationDetail(id)
    setInstitution(data)
    setLoading(false)
  }

  const handleTabChange = (val: string) => {
    setSearchParams({ tab: val })
  }

  // Handle New Topic / Discussion Submit (6.6 & 6.10)
  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id || !topicForm.title) return

    try {
      await createTopic({
        institution_id: id,
        title: topicForm.title,
        description: topicForm.description,
        status: topicForm.attention_flag ? 'Sinalizado ONSV' : 'Em Discussão',
        attention_flag: topicForm.attention_flag,
        author_id: user?.id,
      })
      toast.success(
        topicForm.attention_flag
          ? 'Tema registrado e SINALIZADO PARA O ONSV com sucesso!'
          : 'Tema registrado para discussão.',
      )
      setIsTopicModalOpen(false)
      setTopicForm({ title: '', description: '', attention_flag: false })
      loadDetail()
    } catch (err) {
      toast.error('Erro ao registrar assunto em discussão.')
    }
  }

  // Handle New Document Submit (6.4)
  const handleCreateDoc = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id || !docForm.title) return

    try {
      const formData = new FormData()
      formData.append('institution_id', id)
      formData.append('title', docForm.title)
      formData.append('category', docForm.category)
      if (docForm.description) formData.append('description', docForm.description)
      if (docForm.url) formData.append('url', docForm.url)
      if (docForm.file) formData.append('file', docForm.file)
      if (user?.id) formData.append('uploaded_by', user.id)

      await createDocument(formData)
      toast.success('Documento adicionado ao repositório!')
      setIsDocModalOpen(false)
      setDocForm({ title: '', category: 'Outros', description: '', url: '', file: null })
      loadDetail()
    } catch (err) {
      toast.error('Erro ao enviar documento.')
    }
  }

  // Handle New Meeting Submit (6.5)
  const handleCreateMeeting = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id || !meetingForm.title) return

    try {
      const formData = new FormData()
      formData.append('institution_id', id)
      formData.append('title', meetingForm.title)
      formData.append('meeting_type', meetingForm.meeting_type)
      formData.append('meeting_date', meetingForm.meeting_date)
      if (meetingForm.location_or_link)
        formData.append('location_or_link', meetingForm.location_or_link)
      if (meetingForm.agenda) formData.append('agenda', meetingForm.agenda)
      if (meetingForm.minutes_summary)
        formData.append('minutes_summary', meetingForm.minutes_summary)
      if (meetingForm.decisions) formData.append('decisions', meetingForm.decisions)
      if (meetingForm.attendees_count)
        formData.append('attendees_count', String(meetingForm.attendees_count))
      if (user?.id) formData.append('created_by', user.id)

      await createMeeting(formData)
      toast.success('Reunião e ata registradas com sucesso!')
      setIsMeetingModalOpen(false)
      setMeetingForm({
        title: '',
        meeting_type: 'Ordinária',
        meeting_date: new Date().toISOString().split('T')[0],
        location_or_link: '',
        agenda: '',
        minutes_summary: '',
        decisions: '',
        attendees_count: 0,
      })
      loadDetail()
    } catch (err) {
      toast.error('Erro ao salvar reunião.')
    }
  }

  // Handle Add Member Submit (6.3)
  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id || !memberForm.name) return

    try {
      await createMember({
        institution_id: id,
        name: memberForm.name,
        email: memberForm.email,
        role_type: memberForm.role_type,
        appointment_act: memberForm.appointment_act,
        commitment_term_signed: memberForm.commitment_term_signed,
        status: memberForm.status,
      })
      toast.success('Representante vinculado com sucesso!')
      setIsMemberModalOpen(false)
      setMemberForm({
        name: '',
        email: '',
        role_type: 'Titular',
        appointment_act: '',
        commitment_term_signed: true,
        status: 'Ativo',
      })
      loadDetail()
    } catch (err) {
      toast.error('Erro ao vincular representante.')
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-7xl space-y-4">
        <div className="h-10 w-48 bg-muted animate-pulse rounded" />
        <div className="h-32 bg-muted animate-pulse rounded-lg" />
        <div className="h-64 bg-muted animate-pulse rounded-lg" />
      </div>
    )
  }

  if (!institution) {
    return (
      <div className="container mx-auto p-6 max-w-7xl text-center space-y-4">
        <h2 className="text-xl font-bold">Representação não encontrada</h2>
        <Button onClick={() => navigate('/representacoes')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para a lista
        </Button>
      </div>
    )
  }

  const members = institution.expand?.representation_members_via_institution_id || []
  const docs = institution.expand?.representation_documents_via_institution_id || []
  const meetings = institution.expand?.representation_meetings_via_institution_id || []
  const topics = institution.expand?.representation_topics_via_institution_id || []

  const signaledTopics = topics.filter((t) => t.attention_flag || t.status === 'Sinalizado ONSV')
  const guidedTopics = topics.filter((t) => t.onsv_guidance)

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6 max-w-7xl animate-fade-in">
      {/* NAVEGAÇÃO VOLTAR */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/representacoes')}
          className="gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para Representações ONSV</span>
        </Button>
      </div>

      {/* CABEÇALHO DO DETALHE */}
      <Card className="border-t-4 border-t-primary shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant={
                    institution.category === 'Federal'
                      ? 'default'
                      : institution.category === 'Estadual'
                        ? 'secondary'
                        : 'outline'
                  }
                  className="font-bold text-xs"
                >
                  Instância {institution.category}{' '}
                  {institution.state ? `(${institution.state})` : ''}
                </Badge>

                {institution.is_active ? (
                  <Badge
                    variant="outline"
                    className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-300 gap-1 text-xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Ativa</span>
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-muted-foreground text-xs">
                    Inativa
                  </Badge>
                )}
              </div>

              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
                [ {institution.acronym} ] – {institution.name}
              </h1>

              {institution.description && (
                <p className="text-muted-foreground text-sm max-w-4xl">{institution.description}</p>
              )}
            </div>

            {/* BOTÃO RÁPIDO SINALIZAR / AÇÃO */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <Dialog open={isTopicModalOpen} onOpenChange={setIsTopicModalOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2 font-semibold bg-amber-600 hover:bg-amber-700 text-white shadow-xs">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Sinalizar p/ ONSV</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-amber-600">
                      <AlertTriangle className="w-5 h-5" />
                      <span>Sinalizar Assunto para o ONSV (6.10)</span>
                    </DialogTitle>
                  </DialogHeader>

                  <form onSubmit={handleCreateTopic} className="space-y-4 pt-2">
                    <div className="space-y-2">
                      <Label htmlFor="top-title">Título da Pauta / Assunto *</Label>
                      <Input
                        id="top-title"
                        required
                        placeholder="Ex: Proposta de alteração da Resolução de Vias Urbanas..."
                        value={topicForm.title}
                        onChange={(e) => setTopicForm({ ...topicForm, title: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="top-desc">Detalhamento / Contexto da Discussão</Label>
                      <Textarea
                        id="top-desc"
                        rows={3}
                        placeholder="Descreva o que está em pauta no colegiado e por que necessita da atenção do ONSV..."
                        value={topicForm.description}
                        onChange={(e) =>
                          setTopicForm({ ...topicForm, description: e.target.value })
                        }
                      />
                    </div>

                    <div className="flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-300 rounded-lg">
                      <input
                        type="checkbox"
                        id="flag-onsv"
                        checked={topicForm.attention_flag}
                        onChange={(e) =>
                          setTopicForm({ ...topicForm, attention_flag: e.target.checked })
                        }
                        className="rounded border-amber-400 text-amber-600 focus:ring-amber-500 h-4 w-4"
                      />
                      <label
                        htmlFor="flag-onsv"
                        className="text-xs font-semibold text-amber-900 dark:text-amber-200 cursor-pointer"
                      >
                        Marcar como PRIORITÁRIO (Requer Posicionamento/Orientação Técnica do ONSV)
                      </label>
                    </div>

                    <DialogFooter className="pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsTopicModalOpen(false)}
                      >
                        Cancelar
                      </Button>
                      <Button
                        type="submit"
                        className="gap-2 bg-amber-600 hover:bg-amber-700 text-white"
                      >
                        <Send className="w-4 h-4" />
                        <span>Enviar Sinalização</span>
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 6.9 SEÇÕES / ABAS CONFORME IMAGEM DE REFERÊNCIA */}
      {/* IDENTIFICAÇÃO, LEGISLAÇÃO E DOCUMENTOS, REPRESENTANTES, REUNIÕES, ASSUNTOS EM DISCUSSÃO, DECISÕES E ENCAMINHAMENTOS, POSICIONAMENTOS/ORIENTAÇÕES DO ONSV */}

      <Tabs value={currentTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="flex flex-wrap h-auto p-1.5 bg-muted rounded-lg border gap-1">
          <TabsTrigger value="identificacao" className="text-xs font-semibold gap-1.5 py-2">
            <Building2 className="w-3.5 h-3.5" />
            <span>Identificação</span>
          </TabsTrigger>
          <TabsTrigger value="documentos" className="text-xs font-semibold gap-1.5 py-2">
            <FileText className="w-3.5 h-3.5" />
            <span>Legislação & Docs ({docs.length})</span>
          </TabsTrigger>
          <TabsTrigger value="representantes" className="text-xs font-semibold gap-1.5 py-2">
            <Users className="w-3.5 h-3.5" />
            <span>Representantes ({members.length})</span>
          </TabsTrigger>
          <TabsTrigger value="reunioes" className="text-xs font-semibold gap-1.5 py-2">
            <Calendar className="w-3.5 h-3.5" />
            <span>Reuniões ({meetings.length})</span>
          </TabsTrigger>
          <TabsTrigger value="discussoes" className="text-xs font-semibold gap-1.5 py-2">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Assuntos em Discussão ({topics.length})</span>
          </TabsTrigger>
          <TabsTrigger
            value="posicionamentos"
            className="text-xs font-semibold gap-1.5 py-2 relative"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-primary" />
            <span>Orientações do ONSV</span>
            {signaledTopics.length > 0 && (
              <span className="ml-1 bg-amber-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                {signaledTopics.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* 1. SEÇÃO IDENTIFICAÇÃO */}
        <TabsContent value="identificacao" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                <span>Dados de Identificação da Representação</span>
              </CardTitle>
              <CardDescription>
                Informações gerais sobre o órgão colegiado, esfera de atuação e vigência da
                representação.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div className="space-y-3 bg-muted/20 p-4 rounded-lg border">
                <div>
                  <span className="text-xs text-muted-foreground uppercase font-semibold block">
                    Nome Completo
                  </span>
                  <span className="font-bold text-foreground text-base">{institution.name}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground uppercase font-semibold block">
                    Sigla do Colegiado
                  </span>
                  <span className="font-bold text-foreground text-base">{institution.acronym}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground uppercase font-semibold block">
                    Categoria / Instância
                  </span>
                  <Badge variant="outline" className="mt-1 font-semibold">
                    {institution.category}
                  </Badge>
                </div>
                {institution.state && (
                  <div>
                    <span className="text-xs text-muted-foreground uppercase font-semibold block">
                      Estado / Abrangência
                    </span>
                    <span className="font-medium text-foreground">
                      {institution.state} {institution.city ? `- ${institution.city}` : ''}
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-3 bg-muted/20 p-4 rounded-lg border">
                <div>
                  <span className="text-xs text-muted-foreground uppercase font-semibold block">
                    Escopo / Câmaras Temáticas
                  </span>
                  <span className="font-semibold text-foreground">
                    {institution.scope || 'Não informado'}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground uppercase font-semibold block">
                    Início da Vigência do Mandato
                  </span>
                  <span className="font-medium text-foreground">
                    {institution.term_start
                      ? new Date(institution.term_start).toLocaleDateString('pt-BR')
                      : 'Não informada'}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground uppercase font-semibold block">
                    Término da Vigência
                  </span>
                  <span className="font-medium text-foreground">
                    {institution.term_end
                      ? new Date(institution.term_end).toLocaleDateString('pt-BR')
                      : 'Indeterminado'}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground uppercase font-semibold block">
                    Status
                  </span>
                  <span className="font-bold text-emerald-600">
                    {institution.is_active ? 'Ativo e Regular' : 'Inativo / Arquivado'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 2. LEGISLAÇÃO E DOCUMENTOS (6.4) */}
        <TabsContent value="documentos" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              <span>Biblioteca de Documentos (6.4)</span>
            </h3>

            <Dialog open={isDocModalOpen} onOpenChange={setIsDocModalOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2">
                  <Plus className="w-4 h-4" />
                  <span>Adicionar Documento</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Anexar Documento ao Repositório</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleCreateDoc} className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <Label htmlFor="doc-title">Título do Documento *</Label>
                    <Input
                      id="doc-title"
                      required
                      placeholder="Ex: Regimento Interno 2024 / Portaria de Nomeação"
                      value={docForm.title}
                      onChange={(e) => setDocForm({ ...docForm, title: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="doc-cat">Categoria do Documento</Label>
                    <Select
                      value={docForm.category}
                      onValueChange={(val: any) => setDocForm({ ...docForm, category: val })}
                    >
                      <SelectTrigger id="doc-cat">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Legislação">Legislação</SelectItem>
                        <SelectItem value="Regimento Interno">Regimento Interno</SelectItem>
                        <SelectItem value="Edital">Edital</SelectItem>
                        <SelectItem value="Ato de Nomeação">Ato de Nomeação</SelectItem>
                        <SelectItem value="Nota Técnica">Nota Técnica</SelectItem>
                        <SelectItem value="Outros">Outros</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="doc-desc">Descrição Breve</Label>
                    <Input
                      id="doc-desc"
                      placeholder="Resumo das disposições principais..."
                      value={docForm.description}
                      onChange={(e) => setDocForm({ ...docForm, description: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="doc-file">Arquivo (PDF, DOCX, Imagem)</Label>
                    <Input
                      id="doc-file"
                      type="file"
                      onChange={(e) =>
                        setDocForm({ ...docForm, file: e.target.files?.[0] || null })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="doc-url">Ou Link Externo (URL)</Label>
                    <Input
                      id="doc-url"
                      type="url"
                      placeholder="https://..."
                      value={docForm.url}
                      onChange={(e) => setDocForm({ ...docForm, url: e.target.value })}
                    />
                  </div>

                  <DialogFooter className="pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDocModalOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit">Salvar Documento</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {docs.length === 0 ? (
            <Card className="text-center p-8">
              <CardContent className="space-y-2 pt-6">
                <FileText className="w-10 h-10 text-muted-foreground mx-auto" />
                <p className="text-muted-foreground text-sm font-medium">
                  Nenhum documento anexado a este repositório.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {docs.map((doc) => (
                <Card key={doc.id} className="hover:border-primary/50 transition-all shadow-xs">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <Badge variant="outline" className="text-xs font-bold">
                          {doc.category}
                        </Badge>
                        <h4 className="font-bold text-foreground text-sm leading-snug">
                          {doc.title}
                        </h4>
                      </div>

                      {doc.file && (
                        <a
                          href={getFileUrl(doc, doc.file)}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-md transition-colors shrink-0"
                          title="Baixar arquivo"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      )}
                      {!doc.file && doc.url && (
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-md transition-colors shrink-0"
                          title="Acessar link público"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>

                    {doc.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {doc.description}
                      </p>
                    )}

                    <div className="text-[11px] text-muted-foreground pt-2 border-t flex items-center justify-between">
                      <span>Publicado em: {new Date(doc.created).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* 3. REPRESENTANTES (6.3) */}
        <TabsContent value="representantes" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                <span>Cadastro de Representantes e Observadores (6.3)</span>
              </h3>
              <p className="text-xs text-muted-foreground">
                Suporte a múltiplos observadores por colegiado (titulares e suplentes) e controle do
                termo de compromisso.
              </p>
            </div>

            <Dialog open={isMemberModalOpen} onOpenChange={setIsMemberModalOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2">
                  <Plus className="w-4 h-4" />
                  <span>Vincular Representante</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Cadastrar / Vincular Observador Representante</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleCreateMember} className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <Label htmlFor="mem-name">Nome Completo *</Label>
                    <Input
                      id="mem-name"
                      required
                      placeholder="Ex: Dr. Roberto Alves"
                      value={memberForm.name}
                      onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="mem-email">E-mail de Contato</Label>
                    <Input
                      id="mem-email"
                      type="email"
                      placeholder="roberto@onsv.org.br"
                      value={memberForm.email}
                      onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="mem-role">Função / Condição</Label>
                      <Select
                        value={memberForm.role_type}
                        onValueChange={(val: any) =>
                          setMemberForm({ ...memberForm, role_type: val })
                        }
                      >
                        <SelectTrigger id="mem-role">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Titular">Titular</SelectItem>
                          <SelectItem value="Suplente">Suplente</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="mem-status">Status</Label>
                      <Select
                        value={memberForm.status}
                        onValueChange={(val: any) => setMemberForm({ ...memberForm, status: val })}
                      >
                        <SelectTrigger id="mem-status">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Ativo">Ativo</SelectItem>
                          <SelectItem value="Pendente">Pendente</SelectItem>
                          <SelectItem value="Encerrado">Encerrado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="mem-act">Ato de Nomeação / Portaria</Label>
                    <Input
                      id="mem-act"
                      placeholder="Ex: Portaria Senatran nº 88/2024"
                      value={memberForm.appointment_act}
                      onChange={(e) =>
                        setMemberForm({ ...memberForm, appointment_act: e.target.value })
                      }
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="term-signed"
                      checked={memberForm.commitment_term_signed}
                      onChange={(e) =>
                        setMemberForm({ ...memberForm, commitment_term_signed: e.target.checked })
                      }
                      className="rounded border-gray-300 text-primary h-4 w-4"
                    />
                    <label htmlFor="term-signed" className="text-xs font-semibold cursor-pointer">
                      Termo de Compromisso de Representação Assinado
                    </label>
                  </div>

                  <DialogFooter className="pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsMemberModalOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit">Salvar Representante</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {members.length === 0 ? (
            <Card className="text-center p-8">
              <CardContent className="space-y-2 pt-6">
                <Users className="w-10 h-10 text-muted-foreground mx-auto" />
                <p className="text-muted-foreground text-sm font-medium">
                  Nenhum representante indicado ainda.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {members.map((mem) => (
                <Card key={mem.id} className="shadow-xs border-l-4 border-l-primary">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-foreground text-base">{mem.name}</span>
                          <Badge
                            variant={mem.role_type === 'Titular' ? 'default' : 'secondary'}
                            className="text-xs font-bold"
                          >
                            {mem.role_type}
                          </Badge>
                        </div>

                        {mem.email && (
                          <p className="text-xs text-muted-foreground mt-0.5">{mem.email}</p>
                        )}
                      </div>

                      <Badge
                        variant="outline"
                        className={
                          mem.status === 'Ativo'
                            ? 'bg-emerald-500/10 text-emerald-700 border-emerald-300 text-xs'
                            : 'text-muted-foreground text-xs'
                        }
                      >
                        {mem.status}
                      </Badge>
                    </div>

                    <div className="text-xs space-y-1 bg-muted/30 p-2.5 rounded border">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Ato de Nomeação:</span>
                        <span className="font-medium text-foreground">
                          {mem.appointment_act || 'Pendente'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Termo de Compromisso:</span>
                        {mem.commitment_term_signed ? (
                          <span className="text-emerald-600 font-bold flex items-center gap-1">
                            <FileCheck className="w-3.5 h-3.5" /> Assinado
                          </span>
                        ) : (
                          <span className="text-amber-600 font-bold">Pendente</span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* 4. LIVRO DE REUNIÕES (6.5) */}
        <TabsContent value="reunioes" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                <span>Livro de Reuniões e Encontros (6.5)</span>
              </h3>
              <p className="text-xs text-muted-foreground">
                Registro de reuniões ordinárias/extraordinárias com pautas, resumos de atas e
                deliberações.
              </p>
            </div>

            <Dialog open={isMeetingModalOpen} onOpenChange={setIsMeetingModalOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2">
                  <Plus className="w-4 h-4" />
                  <span>Registrar Reunião</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Registrar Nova Reunião do Colegiado</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleCreateMeeting} className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <Label htmlFor="meet-title">Título / Edição da Reunião *</Label>
                    <Input
                      id="meet-title"
                      required
                      placeholder="Ex: 129ª Reunião Ordinária da Plenária"
                      value={meetingForm.title}
                      onChange={(e) => setMeetingForm({ ...meetingForm, title: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="meet-type">Tipo</Label>
                      <Select
                        value={meetingForm.meeting_type}
                        onValueChange={(val: any) =>
                          setMeetingForm({ ...meetingForm, meeting_type: val })
                        }
                      >
                        <SelectTrigger id="meet-type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Ordinária">Ordinária</SelectItem>
                          <SelectItem value="Extraordinária">Extraordinária</SelectItem>
                          <SelectItem value="Câmara Temática">Câmara Temática</SelectItem>
                          <SelectItem value="Grupo de Trabalho">Grupo de Trabalho</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="meet-date">Data da Reunião *</Label>
                      <Input
                        id="meet-date"
                        type="date"
                        required
                        value={meetingForm.meeting_date}
                        onChange={(e) =>
                          setMeetingForm({ ...meetingForm, meeting_date: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="meet-agenda">Pauta Principal</Label>
                    <Textarea
                      id="meet-agenda"
                      rows={2}
                      placeholder="Tópicos discutidos na ordem do dia..."
                      value={meetingForm.agenda}
                      onChange={(e) => setMeetingForm({ ...meetingForm, agenda: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="meet-decisions">Decisões e Deliberações</Label>
                    <Textarea
                      id="meet-decisions"
                      rows={2}
                      placeholder="Principais deliberações e votações do colegiado..."
                      value={meetingForm.decisions}
                      onChange={(e) =>
                        setMeetingForm({ ...meetingForm, decisions: e.target.value })
                      }
                    />
                  </div>

                  <DialogFooter className="pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsMeetingModalOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit">Salvar Reunião</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {meetings.length === 0 ? (
            <Card className="text-center p-8">
              <CardContent className="space-y-2 pt-6">
                <Calendar className="w-10 h-10 text-muted-foreground mx-auto" />
                <p className="text-muted-foreground text-sm font-medium">
                  Nenhuma reunião registrada neste colegiado.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {meetings.map((meet) => (
                <Card key={meet.id} className="hover:border-primary/50 transition-all shadow-xs">
                  <CardHeader className="pb-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className="font-bold text-xs bg-primary/5 text-primary border-primary/20"
                        >
                          {meet.meeting_type}
                        </Badge>
                        <CardTitle className="text-base font-bold text-foreground">
                          {meet.title}
                        </CardTitle>
                      </div>

                      <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Data: {new Date(meet.meeting_date).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3 text-xs">
                    {meet.agenda && (
                      <div className="bg-muted/30 p-3 rounded border space-y-1">
                        <span className="font-bold text-foreground block uppercase text-[10px]">
                          Pauta
                        </span>
                        <p className="text-muted-foreground whitespace-pre-wrap">{meet.agenda}</p>
                      </div>
                    )}

                    {meet.decisions && (
                      <div className="bg-emerald-500/5 p-3 rounded border border-emerald-200/50 space-y-1">
                        <span className="font-bold text-emerald-800 dark:text-emerald-300 block uppercase text-[10px]">
                          Decisões / Deliberações
                        </span>
                        <p className="text-foreground whitespace-pre-wrap">{meet.decisions}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* 5. ESPAÇO DE DISCUSSÃO & ENCAMINHAMENTOS (6.6 & 6.7) */}
        <TabsContent value="discussoes" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                <span>Espaço de Discussão e Pautas Internas (6.6)</span>
              </h3>
              <p className="text-xs text-muted-foreground">
                Fórum interno de temas debatidos no colegiado com sinalização e encaminhamentos.
              </p>
            </div>

            <Button size="sm" onClick={() => setIsTopicModalOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              <span>Novo Tema em Pauta</span>
            </Button>
          </div>

          {topics.length === 0 ? (
            <Card className="text-center p-8">
              <CardContent className="space-y-2 pt-6">
                <MessageSquare className="w-10 h-10 text-muted-foreground mx-auto" />
                <p className="text-muted-foreground text-sm font-medium">
                  Nenhum tema registrado em discussão.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {topics.map((top) => (
                <Card key={top.id} className="hover:border-primary/50 transition-all shadow-xs">
                  <CardHeader className="pb-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-base font-bold text-foreground">
                            {top.title}
                          </CardTitle>
                          {top.attention_flag && (
                            <Badge className="bg-amber-600 text-white font-bold text-[10px]">
                              Atenção ONSV
                            </Badge>
                          )}
                        </div>
                      </div>

                      <Badge
                        variant="outline"
                        className={
                          top.status === 'Orientado ONSV'
                            ? 'bg-emerald-500/10 text-emerald-700 border-emerald-300'
                            : top.status === 'Sinalizado ONSV'
                              ? 'bg-amber-500/10 text-amber-700 border-amber-300'
                              : 'bg-muted text-muted-foreground'
                        }
                      >
                        {top.status}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3 text-xs">
                    {top.description && (
                      <p className="text-muted-foreground leading-relaxed">{top.description}</p>
                    )}

                    {/* POSICIONAMENTO / ORIENTAÇÃO DO ONSV (6.7) */}
                    {top.onsv_guidance && (
                      <div className="p-3.5 bg-primary/5 border border-primary/20 rounded-lg space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-primary text-xs uppercase">
                          <ShieldCheck className="w-4 h-4" />
                          <span>Orientação / Posicionamento do ONSV</span>
                        </div>
                        <p className="text-foreground leading-relaxed font-medium">
                          {top.onsv_guidance}
                        </p>
                      </div>
                    )}

                    {top.decisions_forwarded && (
                      <div className="p-3 bg-muted/40 rounded border space-y-1">
                        <span className="font-bold text-foreground block uppercase text-[10px]">
                          Encaminhamentos
                        </span>
                        <p className="text-muted-foreground">{top.decisions_forwarded}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* 6. POSICIONAMENTOS E ORIENTAÇÕES DO ONSV (6.7 & 6.10) */}
        <TabsContent value="posicionamentos" className="space-y-4">
          <Card className="border-l-4 border-l-primary">
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2 text-primary">
                <ShieldCheck className="w-5 h-5" />
                <span>Posicionamentos e Orientações Técnicas do ONSV</span>
              </CardTitle>
              <CardDescription>
                Consolidação dos direcionamentos emitidos pelo Observatório Nacional de Segurança
                Viária para este colegiado.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {guidedTopics.length === 0 ? (
                <div className="text-center p-6 text-muted-foreground text-sm">
                  Ainda não há orientações técnicas formalizadas para esta representação.
                </div>
              ) : (
                guidedTopics.map((gt) => (
                  <div key={gt.id} className="p-4 bg-muted/20 rounded-lg border space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-foreground text-sm">{gt.title}</span>
                      <Badge className="bg-emerald-600 text-white text-[10px]">
                        Orientação Emitida
                      </Badge>
                    </div>

                    <div className="p-3 bg-background rounded border text-xs text-foreground font-medium space-y-1">
                      <span className="text-primary font-bold block text-[11px]">
                        SÍNTESE DA ORIENTAÇÃO ONSV:
                      </span>
                      <p>{gt.onsv_guidance}</p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
