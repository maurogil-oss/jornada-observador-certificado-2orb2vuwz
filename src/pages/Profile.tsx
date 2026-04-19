import { useState, useEffect, useRef } from 'react'
import useAuthStore from '@/stores/useAuthStore'
import { updateUser } from '@/services/users'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from 'sonner'
import pb from '@/lib/pocketbase/client'
import { Loader2, Camera } from 'lucide-react'
import { getErrorMessage } from '@/lib/pocketbase/errors'

const formatCPF = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1')
}

const isValidCPF = (cpf: string) => {
  cpf = cpf.replace(/[^\d]+/g, '')
  if (cpf.length !== 11 || !!cpf.match(/(\d)\1{10}/)) return false
  const cpfDigits = cpf.split('').map((el) => +el)
  const rest = (count: number) =>
    ((cpfDigits.slice(0, count - 12).reduce((soma, el, index) => soma + el * (count - index), 0) *
      10) %
      11) %
    10
  return rest(10) === cpfDigits[9] && rest(11) === cpfDigits[10]
}

const isValidDate = (dateString: string) => {
  if (!dateString) return true
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return false
  const now = new Date()
  if (date > now) return false
  if (date.getFullYear() < 1900) return false
  const age = now.getFullYear() - date.getFullYear()
  if (age > 110) return false
  return true
}

const BRAZILIAN_STATES = [
  'AC',
  'AL',
  'AP',
  'AM',
  'BA',
  'CE',
  'DF',
  'ES',
  'GO',
  'MA',
  'MT',
  'MS',
  'MG',
  'PA',
  'PB',
  'PR',
  'PE',
  'PI',
  'RJ',
  'RN',
  'RS',
  'RO',
  'RR',
  'SC',
  'SP',
  'SE',
  'TO',
]

export default function Profile() {
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    full_name: '',
    cpf_document: '',
    birth_date: '',
    workplace: '',
    city: '',
    state: '',
    country: 'Brasil',
  })

  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        cpf_document: formatCPF(user.cpf_document || ''),
        birth_date: user.birth_date || '',
        workplace: user.workplace || '',
        city: user.city || '',
        state: user.state || '',
        country: user.country || 'Brasil',
      })
      if (user.avatar) {
        setAvatarPreview(user.avatar)
      }
    }
  }, [user])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value
    if (e.target.name === 'cpf_document') {
      value = formatCPF(value)
    }
    setFormData((prev) => ({ ...prev, [e.target.name]: value }))
  }

  const handleStateChange = (val: string) => {
    setFormData((prev) => ({ ...prev, state: val }))
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      setAvatarPreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    if (formData.cpf_document) {
      const cleanCPF = formData.cpf_document.replace(/[^\d]+/g, '')
      if (cleanCPF.length > 0 && !isValidCPF(cleanCPF)) {
        toast.error('CPF inválido. Verifique o número digitado.')
        return
      }
    }

    if (formData.birth_date && !isValidDate(formData.birth_date)) {
      toast.error('Data de nascimento inválida.')
      return
    }

    setLoading(true)
    try {
      const data = new FormData()

      // Append all text fields correctly
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          data.append(key, value)
        }
      })

      // Append avatar if a new one was selected
      if (avatarFile) {
        data.append('avatar', avatarFile)
      }

      await updateUser(user.id, data)
      await pb.collection('users').authRefresh()

      // Clear avatar file from state after successfully uploading
      setAvatarFile(null)
      toast.success('Perfil atualizado com sucesso!')
    } catch (error) {
      toast.error(getErrorMessage(error) || 'Erro ao atualizar perfil.')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Meu Perfil</h1>
        <p className="text-muted-foreground mt-2 text-sm sm:text-base">
          Atualize suas informações pessoais e profissionais para nos ajudar a conhecer melhor nossa
          rede.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-card rounded-xl border border-border/40 shadow-sm p-6 sm:p-8"
      >
        {/* Avatar Section */}
        <div className="flex flex-col items-center space-y-3 mb-8">
          <div
            className="relative group cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <Avatar className="w-24 h-24 sm:w-28 sm:h-28 border border-border/50 shadow-sm bg-slate-100">
              <AvatarImage src={avatarPreview || undefined} alt="Avatar" className="object-cover" />
              <AvatarFallback className="text-3xl font-medium text-slate-500">
                {user?.full_name?.charAt(0)?.toUpperCase() ||
                  user?.email?.charAt(0)?.toUpperCase() ||
                  'U'}
              </AvatarFallback>
            </Avatar>
            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <Camera className="w-8 h-8 text-white" />
            </div>
          </div>
          <div className="text-center space-y-1">
            <p className="text-sm font-semibold text-foreground">Foto de Perfil</p>
            <p className="text-xs text-muted-foreground">PNG ou JPG (Max. 5MB)</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png, image/jpeg, image/jpg"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>

        {/* Fields Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          <div className="space-y-2">
            <Label htmlFor="full_name">Nome Completo</Label>
            <Input
              id="full_name"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              value={user?.email || ''}
              disabled
              className="bg-muted text-muted-foreground cursor-not-allowed"
            />
            <p className="text-xs text-muted-foreground">O e-mail não pode ser alterado.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="birth_date">Data de Nascimento</Label>
            <Input
              id="birth_date"
              name="birth_date"
              type="date"
              value={formData.birth_date}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="workplace">Local de Trabalho</Label>
            <Input
              id="workplace"
              name="workplace"
              value={formData.workplace}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">Cidade</Label>
            <Input id="city" name="city" value={formData.city} onChange={handleChange} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="state">Estado</Label>
            <Select value={formData.state || undefined} onValueChange={handleStateChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um estado" />
              </SelectTrigger>
              <SelectContent>
                {BRAZILIAN_STATES.map((uf) => (
                  <SelectItem key={uf} value={uf}>
                    {uf}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="country">País</Label>
            <Input id="country" name="country" value={formData.country} onChange={handleChange} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cpf_document">CPF</Label>
            <Input
              id="cpf_document"
              name="cpf_document"
              value={formData.cpf_document}
              onChange={handleChange}
              placeholder="000.000.000-00"
            />
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border/50 flex justify-end">
          <Button
            type="submit"
            disabled={loading}
            className="bg-green-700 hover:bg-green-800 text-white w-full sm:w-auto min-w-[160px]"
          >
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Salvar Alterações
          </Button>
        </div>
      </form>
    </div>
  )
}
