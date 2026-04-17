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
    name: '',
    birth_date: '',
    city: '',
    state: '',
    country: 'Brasil',
    workplace: '',
  })

  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        birth_date: user.birth_date || '',
        city: user.city || '',
        state: user.state || '',
        country: user.country || 'Brasil',
        workplace: user.workplace || '',
      })
      if (user.avatar) {
        setAvatarPreview(`${pb.baseURL}/api/files/users/${user.id}/${user.avatar}`)
      }
    }
  }, [user])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleStateChange = (val: string) => {
    setFormData((prev) => ({ ...prev, state: val }))
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('A imagem deve ter no máximo 5MB.')
        return
      }
      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        toast.error('Formato não suportado. Use JPG ou PNG.')
        return
      }
      setAvatarFile(file)
      setAvatarPreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    try {
      const data = new FormData()
      Object.entries(formData).forEach(([key, value]) => {
        data.append(key, value)
      })
      if (avatarFile) {
        data.append('avatar', avatarFile)
      }

      await updateUser(user.id, data)
      await pb.collection('users').authRefresh()
      toast.success('Perfil atualizado com sucesso!')
    } catch (error) {
      toast.error(getErrorMessage(error) || 'Erro ao atualizar perfil.')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Meu Perfil</h1>
        <p className="text-muted-foreground">
          Atualize suas informações pessoais e profissionais para nos ajudar a conhecer melhor nossa
          rede.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-card p-6 rounded-lg border shadow-sm">
        <div className="flex flex-col items-center space-y-4 mb-6">
          <div
            className="relative group cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <Avatar className="w-24 h-24 border-2 border-border">
              <AvatarImage src={avatarPreview || undefined} alt="Avatar" className="object-cover" />
              <AvatarFallback className="text-2xl">{user?.name?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium">Foto de Perfil</p>
            <p className="text-xs text-muted-foreground mt-1">PNG ou JPG (Max. 5MB)</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png, image/jpeg"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name">Nome Completo</Label>
            <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              value={user?.email || ''}
              disabled
              className="bg-muted"
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
              placeholder="Empresa, Instituição ou Entidade..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">Cidade</Label>
            <Input
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="Ex: São Paulo"
            />
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
        </div>

        <div className="flex justify-end pt-4 border-t border-border/50">
          <Button type="submit" disabled={loading} className="w-full sm:w-auto">
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Salvar Alterações
          </Button>
        </div>
      </form>
    </div>
  )
}
