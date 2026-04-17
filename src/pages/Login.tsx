import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import useAuthStore from '@/stores/useAuthStore'
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  User as UserIcon,
  Calendar,
  MapPin,
  Briefcase,
  IdCard,
  Loader2,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { extractFieldErrors } from '@/lib/pocketbase/errors'
import pb from '@/lib/pocketbase/client'

const loginSchema = z.object({
  email: z.string().email('E-mail inválido.'),
  password: z.string().min(1, 'A senha é obrigatória'),
})

function isValidCPF(cpf: string) {
  cpf = cpf.replace(/[^\d]+/g, '')
  if (cpf.length !== 11 || !!cpf.match(/(\d)\1{10}/)) return false
  let sum = 0
  let remainder
  for (let i = 1; i <= 9; i++) sum = sum + parseInt(cpf.substring(i - 1, i)) * (11 - i)
  remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== parseInt(cpf.substring(9, 10))) return false
  sum = 0
  for (let i = 1; i <= 10; i++) sum = sum + parseInt(cpf.substring(i - 1, i)) * (12 - i)
  remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== parseInt(cpf.substring(10, 11))) return false
  return true
}

const registerSchema = z
  .object({
    turma: z.coerce.number().min(0, 'Inválido').max(16, 'Máximo 16'),
    full_name: z.string().min(3, 'Nome muito curto.'),
    nickname: z.string().optional(),
    cpf_document: z.string().min(1, 'Obrigatório').refine(isValidCPF, { message: 'CPF inválido.' }),
    rg: z.string().min(1, 'Obrigatório'),
    rg_issuer: z.string().min(1, 'Obrigatório'),
    rg_state: z.string().min(1, 'Obrigatório'),
    birth_date: z
      .string()
      .min(1, 'Obrigatório')
      .refine(
        (val) => {
          const date = new Date(val)
          if (isNaN(date.getTime())) return false
          const year = date.getFullYear()
          const currentYear = new Date().getFullYear()
          return year > 1900 && year <= currentYear
        },
        { message: 'Ano deve ser entre 1900 e o atual.' },
      ),
    email: z.string().email('E-mail inválido.'),
    password: z.string().min(8, 'A senha deve ter pelo menos 8 caracteres'),
    passwordConfirm: z.string().min(8, 'A confirmação de senha deve ter pelo menos 8 caracteres'),
    city: z.string().min(1, 'Obrigatório'),
    state: z.string().min(1, 'Obrigatório'),
    country: z.string().min(1, 'Obrigatório'),
    workplace: z.string().optional(),
    lgpd_consent: z.boolean().refine((val) => val === true, {
      message: 'Você deve aceitar os termos de uso e política de privacidade.',
    }),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: 'As senhas não coincidem',
    path: ['passwordConfirm'],
  })

type LoginForm = z.infer<typeof loginSchema>
type RegisterForm = z.infer<typeof registerSchema>

export default function Login() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { login, register, isAuthenticated, user, logout } = useAuthStore()
  const navigate = useNavigate()
  const { toast } = useToast()

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.is_active === false) {
        logout()
        toast({
          title: 'Acesso Negado',
          description:
            'Sua conta está aguardando aprovação do administrador ou foi suspensa. Por favor, aguarde.',
          variant: 'destructive',
        })
      } else {
        navigate(user.role === 'admin' ? '/admin' : '/')
      }
    }
  }, [isAuthenticated, user, navigate, logout, toast])

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const registerForm = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
    defaultValues: {
      turma: '' as any,
      full_name: '',
      nickname: '',
      cpf_document: '',
      rg: '',
      rg_issuer: '',
      rg_state: '',
      birth_date: '',
      email: '',
      password: '',
      passwordConfirm: '',
      city: '',
      state: '',
      country: '',
      workplace: '',
      lgpd_consent: false,
    },
  })

  const onLogin = async (data: LoginForm) => {
    setIsLoading(true)
    try {
      await login(data.email, data.password)
      const record = pb.authStore.record
      if (record && record.is_active === false) {
        logout()
        toast({
          title: 'Acesso Negado',
          description:
            'Sua conta está aguardando aprovação do administrador ou foi suspensa. Por favor, aguarde.',
          variant: 'destructive',
        })
        return
      }
      const isAdmin = record?.role === 'admin' || data.email.toLowerCase() === 'maurog1@hotmail.com'
      navigate(isAdmin ? '/admin' : '/')
    } catch (err: any) {
      if (err.status === 0) {
        toast({
          title: 'Erro de Conexão',
          description:
            'Não foi possível conectar ao servidor. Verifique sua conexão com a internet ou se há bloqueios de firewall em sua rede.',
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'Erro ao entrar',
          description: 'E-mail ou senha inválidos.',
          variant: 'destructive',
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const onRegister = async (data: RegisterForm) => {
    setIsLoading(true)
    toast({
      title: 'Conectando...',
      description: 'Estabelecendo conexão com os serviços em nuvem.',
    })
    try {
      await register(data)
      toast({
        title: 'Cadastro Realizado',
        description: 'Sua conta foi criada com sucesso! Bem-vindo.',
      })
      // The useEffect will handle the redirect to the dashboard
    } catch (err: any) {
      const fieldErrors = extractFieldErrors(err)

      if (err.status === 0) {
        toast({
          title: 'Erro de Conexão',
          description:
            'Não foi possível conectar ao servidor. Verifique sua conexão com a internet ou se há bloqueios de firewall em sua rede.',
          variant: 'destructive',
        })
      } else if (fieldErrors.email) {
        toast({
          title: 'Erro ao registrar',
          description: 'Este e-mail já está em uso. Por favor, faça login ou recupere sua senha.',
          variant: 'destructive',
        })
        registerForm.setError('email', { type: 'manual', message: 'E-mail já está em uso.' })
      } else if (Object.keys(fieldErrors).length > 0) {
        Object.entries(fieldErrors).forEach(([field, message]) => {
          registerForm.setError(field as any, { type: 'manual', message })
        })
      } else {
        toast({
          title: 'Erro ao registrar',
          description: 'Verifique os dados informados ou se o e-mail já está em uso.',
          variant: 'destructive',
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4 relative overflow-hidden">
      <div className="absolute top-[-15%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse duration-1000" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-[20%] right-[10%] w-[20%] h-[20%] bg-amber-500/10 rounded-full blur-[80px] pointer-events-none" />

      <Card className="w-full max-w-xl shadow-elevation border-border/60 relative z-10 backdrop-blur-md bg-background/80 animate-fade-in-up">
        <CardHeader className="space-y-3 pb-6 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight">
            Portal Estratégico ONSV
          </CardTitle>
          <CardDescription className="text-base font-medium uppercase text-primary">
            MAPEAMENTO E JORNADA DO OBSERVADOR CERTIFICADO
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Entrar</TabsTrigger>
              <TabsTrigger value="register">Cadastrar</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="animate-fade-in-up">
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                  <FormField
                    control={loginForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>E-mail Institucional</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                            <Input
                              placeholder="seu.nome@onsv.org"
                              className="pl-10 h-11"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between">
                          <FormLabel>Senha</FormLabel>
                        </div>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                            <Input
                              type={showPassword ? 'text' : 'password'}
                              placeholder="••••••••"
                              className="pl-10 pr-10 h-11"
                              {...field}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground flex items-center justify-center h-full min-w-[30px] -translate-y-2.5"
                            >
                              {showPassword ? (
                                <EyeOff className="h-5 w-5" />
                              ) : (
                                <Eye className="h-5 w-5" />
                              )}
                            </button>
                          </div>
                        </FormControl>
                        <div className="flex justify-end mt-1">
                          <Link
                            to="/forgot-password"
                            className="text-xs text-primary hover:underline font-medium"
                          >
                            Esqueci minha senha
                          </Link>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full h-11 font-bold mt-2" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Autenticando...
                      </>
                    ) : (
                      'Acessar'
                    )}
                  </Button>
                </form>
              </Form>
            </TabsContent>

            <TabsContent value="register" className="animate-fade-in-up">
              <Form {...registerForm}>
                <form
                  onSubmit={registerForm.handleSubmit(onRegister)}
                  className="space-y-4 max-h-[65vh] overflow-y-auto px-1 pb-2"
                >
                  <div className="mb-4 pt-2">
                    <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider border-b pb-2">
                      BLOCO 1 - IDENTIFICAÇÃO GERAL
                    </h3>
                  </div>

                  <FormField
                    control={registerForm.control}
                    name="turma"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Turma do Curso de Formação *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            max={16}
                            placeholder="Ex: 10"
                            className="h-11"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={registerForm.control}
                    name="full_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome Completo (sem abreviar) *</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <UserIcon className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                            <Input
                              placeholder="Seu Nome Completo"
                              className="pl-10 h-11"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={registerForm.control}
                    name="nickname"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Como você prefere ser chamado (a)? (Ex.: Ramalho, Ju)</FormLabel>
                        <FormControl>
                          <Input placeholder="Apelido/Nome Social" className="h-11" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={registerForm.control}
                      name="cpf_document"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CPF / Documento estrangeiro *</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <IdCard className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                              <Input
                                placeholder="Apenas números"
                                className="pl-10 h-11"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="rg"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>RG (XX.XXX.XXX-X) *</FormLabel>
                          <FormControl>
                            <Input placeholder="Número do RG" className="h-11" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={registerForm.control}
                      name="rg_issuer"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Órgão emissor *</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: SSP" className="h-11" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="rg_state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estado do órgão emissor *</FormLabel>
                          <FormControl>
                            <Input placeholder="UF" className="h-11" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={registerForm.control}
                      name="birth_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data de Nascimento *</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                              <Input type="date" className="pl-10 h-11" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>E-mail *</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                              <Input
                                placeholder="seu.nome@onsv.org"
                                className="pl-10 h-11"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={registerForm.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cidade *</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                              <Input placeholder="Cidade" className="pl-10 h-11" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estado *</FormLabel>
                          <FormControl>
                            <Input placeholder="UF" className="h-11" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>País *</FormLabel>
                          <FormControl>
                            <Input placeholder="Brasil" className="h-11" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={registerForm.control}
                    name="workplace"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Local de Trabalho</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Briefcase className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                            <Input
                              placeholder="Empresa / Organização"
                              className="pl-10 h-11"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={registerForm.control}
                    name="lgpd_consent"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 bg-muted/10 mt-2 mb-4">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <div className="space-y-1.5 leading-none">
                          <FormLabel className="text-sm font-semibold leading-none">
                            Li e concordo com os termos de uso e política de privacidade *
                          </FormLabel>
                          <p className="text-xs text-muted-foreground mt-1">
                            Seus dados pessoais (Nome, CPF, RG, Localização) serão armazenados e
                            utilizados exclusivamente para fins de certificação, e utilizamos
                            cookies essenciais para autenticação e segurança.
                          </p>
                        </div>
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Senha *</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                              <Input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                className="pl-10 pr-10 h-11"
                                {...field}
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground flex items-center justify-center h-full min-w-[30px] -translate-y-2.5"
                              >
                                {showPassword ? (
                                  <EyeOff className="h-5 w-5" />
                                ) : (
                                  <Eye className="h-5 w-5" />
                                )}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="passwordConfirm"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirmar Senha *</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                              <Input
                                type={showConfirmPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                className="pl-10 pr-10 h-11"
                                {...field}
                              />
                              <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground flex items-center justify-center h-full min-w-[30px] -translate-y-2.5"
                              >
                                {showConfirmPassword ? (
                                  <EyeOff className="h-5 w-5" />
                                ) : (
                                  <Eye className="h-5 w-5" />
                                )}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-11 font-bold mt-4"
                    disabled={isLoading || !registerForm.formState.isValid}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Cadastrando...
                      </>
                    ) : (
                      'Criar Conta'
                    )}
                  </Button>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
