import { useState, useEffect } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
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
import { Progress } from '@/components/ui/progress'
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
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { extractFieldErrors } from '@/lib/pocketbase/errors'
import pb from '@/lib/pocketbase/client'
import { toTitleCase } from '@/lib/utils'
import logo15Anos from '@/assets/image-123e2.png'
import logoMaioAmarelo from '@/assets/image-cb3e5.png'
import logoOC from '@/assets/image-29272.png'
import { AppFooter } from '@/components/layout/AppFooter'
import { COUNTRIES, BRAZILIAN_STATES, LOCATIONS } from '@/lib/data'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

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

const formatCPF = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1')
}

const registerSchema = z
  .object({
    email: z.string().email('E-mail inválido.'),
    password: z.string().min(8, 'A senha deve ter pelo menos 8 caracteres'),
    passwordConfirm: z.string().min(8, 'A confirmação de senha deve ter pelo menos 8 caracteres'),
    full_name: z.string().min(3, 'Nome muito curto.'),
    nickname: z.string().optional(),
    cpf_document: z.string().min(1, 'Obrigatório').refine(isValidCPF, { message: 'CPF inválido.' }),
    rg: z
      .string()
      .min(1, 'Obrigatório')
      .regex(/^[a-zA-Z0-9.-]+$/, 'RG inválido (apenas letras, números e pontuação)'),
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
          const age = currentYear - year
          return year > 1900 && age <= 110 && date <= new Date()
        },
        { message: 'Data inválida ou idade superior a 110 anos.' },
      ),
    workplace: z.string().optional(),
    turma: z.coerce.number().min(0, 'Inválido').max(16, 'Máximo 16'),
    cep: z.string().optional(),
    city: z.string().min(1, 'Obrigatório'),
    state: z.string().min(1, 'Obrigatório'),
    country: z.string().min(1, 'Obrigatório'),
    lgpd_consent: z.boolean().refine((val) => val === true, {
      message: 'Você deve aceitar os termos de uso e política de privacidade.',
    }),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: 'As senhas não coincidem',
    path: ['passwordConfirm'],
  })
  .refine(
    (data) => {
      if (data.country === 'Outro' || !LOCATIONS[data.country]) return true
      const states = LOCATIONS[data.country]
      if (!states[data.state]) return false
      if (!states[data.state].includes(data.city)) return false
      return true
    },
    {
      message: 'A cidade selecionada não pertence ao estado selecionado.',
      path: ['city'],
    },
  )

type LoginForm = z.infer<typeof loginSchema>
type RegisterForm = z.infer<typeof registerSchema>

const STEPS = [
  {
    id: 'account',
    title: 'Configuração da Conta',
    fields: ['email', 'password', 'passwordConfirm'],
  },
  {
    id: 'identity',
    title: 'Identidade Pessoal',
    fields: ['full_name', 'nickname', 'cpf_document', 'rg', 'rg_issuer', 'rg_state', 'birth_date'],
  },
  {
    id: 'professional',
    title: 'Contexto Profissional',
    fields: ['workplace', 'turma', 'country', 'cep', 'city', 'state', 'lgpd_consent'],
  },
]

export default function Login() {
  const [activeTab, setActiveTab] = useState('login')
  const [step, setStep] = useState(0)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const {
    login,
    register,
    isAuthenticated,
    user,
    logout,
    isLoading: isAuthLoading,
  } = useAuthStore()
  const navigate = useNavigate()
  const { toast } = useToast()
  const location = useLocation()
  const from = location.state?.from?.pathname || (user?.role === 'admin' ? '/admin' : '/')

  useEffect(() => {
    if (!isAuthLoading && isAuthenticated && user) {
      if (user.is_active === false) {
        logout()
        toast({
          title: 'Conta em Análise',
          description:
            'Sua conta está em análise. Por favor, aguarde a ativação pelo administrador para acessar o sistema.',
          variant: 'destructive',
        })
      } else {
        navigate(from, { replace: true })
      }
    }
  }, [isAuthLoading, isAuthenticated, user, navigate, logout, toast, from])

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
      cep: '',
      city: '',
      state: '',
      country: 'Brasil',
      workplace: '',
      lgpd_consent: false,
    },
  })

  if (isAuthLoading || (isAuthenticated && user)) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-center items-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground font-medium animate-pulse">Acessando...</p>
      </div>
    )
  }

  const onLogin = async (data: LoginForm) => {
    setIsLoading(true)
    try {
      await login(data.email, data.password)
      const record = pb.authStore.record
      if (record && record.is_active === false) {
        logout()
        toast({
          title: 'Conta em Análise',
          description:
            'Sua conta está em análise. Por favor, aguarde a ativação pelo administrador para acessar o sistema.',
          variant: 'destructive',
        })
        try {
          await pb.send('/backend/v1/log-login-attempt', {
            method: 'POST',
            body: { email: data.email, status: 'failure', reason: 'Attempt with inactive account' },
          })
        } catch {
          /* intentionally ignored */
        }
        return
      }
      try {
        await pb.send('/backend/v1/log-login-attempt', {
          method: 'POST',
          body: { email: data.email, status: 'success', reason: 'Successfully logged in' },
        })
      } catch {
        /* intentionally ignored */
      }
      const isAdmin = record?.role === 'admin' || data.email.toLowerCase() === 'maurog1@hotmail.com'
      const redirectPath = location.state?.from?.pathname || (isAdmin ? '/admin' : '/')
      navigate(redirectPath, { replace: true })
    } catch (err: any) {
      if (err.status === 0) {
        toast({
          title: 'Erro de Conexão',
          description:
            'Não foi possível conectar ao servidor. Verifique sua internet e tente novamente em instantes.',
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'Erro ao entrar',
          description: 'E-mail ou senha incorretos. Por favor, tente novamente.',
          variant: 'destructive',
        })
        try {
          await pb.send('/backend/v1/log-login-attempt', {
            method: 'POST',
            body: { email: data.email, status: 'failure', reason: 'Invalid credentials' },
          })
        } catch {
          /* intentionally ignored */
        }
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleNextStep = async () => {
    const fields = STEPS[step].fields as any[]
    const isValid = await registerForm.trigger(fields)
    if (isValid) {
      setStep((s) => s + 1)
    }
  }

  const handlePrevStep = () => {
    setStep((s) => s - 1)
  }

  const onRegister = async (data: RegisterForm) => {
    setIsLoading(true)
    toast({
      title: 'Conectando...',
      description: 'Estabelecendo conexão com os serviços em nuvem.',
    })
    try {
      await register(data)
      setIsSuccess(true)
      registerForm.reset()
      setStep(0)
    } catch (err: any) {
      const fieldErrors = extractFieldErrors(err)

      if (err.status === 0) {
        toast({
          title: 'Erro de Conexão',
          description:
            'Não foi possível conectar ao servidor. Verifique sua conexão com a internet.',
          variant: 'destructive',
        })
      } else if (fieldErrors.email) {
        toast({
          title: 'Erro ao registrar',
          description: 'Este e-mail já está em uso.',
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
          description: 'Verifique os dados informados.',
          variant: 'destructive',
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="h-[100dvh] bg-background flex flex-col relative overflow-hidden">
      <div className="absolute top-[-15%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse duration-1000 z-0" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none z-0" />
      <div className="absolute top-[20%] right-[10%] w-[20%] h-[20%] bg-amber-500/10 rounded-full blur-[80px] pointer-events-none z-0" />

      <div className="flex-1 flex flex-col items-center p-4 sm:p-6 z-10 w-full overflow-y-auto">
        <Card className="w-full max-w-xl shadow-elevation border-border/60 relative z-10 backdrop-blur-md bg-background/80 animate-fade-in-up my-auto shrink-0">
          <CardHeader className="space-y-2 pb-4 text-center">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-5 mb-2">
              <img
                src={logo15Anos}
                alt="Observatório 15 Anos Logo"
                className="h-12 md:h-16 object-contain"
              />
              <div className="hidden sm:block w-px h-12 bg-border/60"></div>
              <img
                src={logoMaioAmarelo}
                alt="Maio Amarelo Campaign"
                className="h-10 md:h-14 object-contain"
              />
            </div>

            <div className="flex justify-center mt-2 mb-1">
              <img
                src={logoOC}
                alt="Observador Certificado"
                className="h-20 sm:h-24 md:h-28 w-auto max-w-[90%] object-contain drop-shadow-sm"
              />
            </div>

            <CardTitle className="text-xl md:text-2xl font-bold tracking-tight">
              Portal Estratégico ONSV
            </CardTitle>
            <CardDescription className="text-sm md:text-base font-medium uppercase text-primary">
              MAPEAMENTO E JORNADA DO OBSERVADOR CERTIFICADO
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
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
                    <Button
                      type="submit"
                      className="w-full h-11 font-bold mt-2"
                      disabled={isLoading}
                    >
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
                {isSuccess ? (
                  <div className="text-center py-10 space-y-4 animate-fade-in">
                    <div className="flex justify-center mb-4">
                      <CheckCircle2 className="w-16 h-16 text-green-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground">
                      Cadastro Realizado com Sucesso!
                    </h3>
                    <p className="text-muted-foreground max-w-sm mx-auto">
                      Obrigado por se cadastrar na Jornada do Observador Certificado. Suas
                      informações foram recebidas e agora serão validadas pelos nossos
                      administradores. Você receberá uma notificação por e-mail assim que seu acesso
                      for liberado para acessar a plataforma e seus certificados.
                    </p>
                    <Button
                      className="mt-6"
                      onClick={() => {
                        setIsSuccess(false)
                        setActiveTab('login')
                      }}
                    >
                      Voltar para o Login
                    </Button>
                  </div>
                ) : (
                  <Form {...registerForm}>
                    <form
                      onSubmit={registerForm.handleSubmit(onRegister)}
                      className="space-y-4 px-1 pb-2"
                    >
                      <div className="mb-2">
                        <Progress value={((step + 1) / STEPS.length) * 100} className="h-2" />
                      </div>
                      <div className="mb-4 pt-2 flex items-center justify-between border-b pb-2">
                        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                          {STEPS[step].title}
                        </h3>
                        <span className="text-xs font-semibold bg-primary/10 text-primary px-2 py-1 rounded-full">
                          Passo {step + 1} de {STEPS.length}
                        </span>
                      </div>

                      <div className="space-y-4 min-h-[300px]">
                        {step === 0 && (
                          <div className="animate-fade-in-right space-y-4">
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
                                          onClick={() =>
                                            setShowConfirmPassword(!showConfirmPassword)
                                          }
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
                          </div>
                        )}

                        {step === 1 && (
                          <div className="animate-fade-in-right space-y-4">
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

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <FormField
                                control={registerForm.control}
                                name="nickname"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Apelido / Nome Social</FormLabel>
                                    <FormControl>
                                      <Input
                                        placeholder="Como prefere ser chamado(a)"
                                        className="h-11"
                                        {...field}
                                        onBlur={(e) => {
                                          field.onChange(toTitleCase(e.target.value))
                                          field.onBlur()
                                        }}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

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
                                          placeholder="000.000.000-00"
                                          className="pl-10 h-11"
                                          {...field}
                                          onChange={(e) => {
                                            e.target.value = formatCPF(e.target.value)
                                            field.onChange(e)
                                          }}
                                        />
                                      </div>
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            <FormField
                              control={registerForm.control}
                              name="rg"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>RG *</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Número do RG" className="h-11" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                                    <FormLabel>Estado do RG *</FormLabel>
                                    <FormControl>
                                      <Input placeholder="UF" className="h-11" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={registerForm.control}
                                name="birth_date"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Data de Nascimento *</FormLabel>
                                    <FormControl>
                                      <Input type="date" className="h-11" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>
                        )}

                        {step === 2 && (
                          <div className="animate-fade-in-right space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                name="turma"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Turma do Curso *</FormLabel>
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
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <FormField
                                control={registerForm.control}
                                name="country"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>País *</FormLabel>
                                    <Select
                                      onValueChange={(val) => {
                                        field.onChange(val)
                                        registerForm.setValue('state', '')
                                        registerForm.setValue('city', '')
                                      }}
                                      defaultValue={field.value || 'Brasil'}
                                    >
                                      <FormControl>
                                        <SelectTrigger className="h-11">
                                          <SelectValue placeholder="Selecione um país" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        {Object.keys(LOCATIONS).map((c) => (
                                          <SelectItem key={c} value={c}>
                                            {c}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              {registerForm.watch('country') === 'Brasil' && (
                                <FormField
                                  control={registerForm.control}
                                  name="cep"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>CEP *</FormLabel>
                                      <FormControl>
                                        <Input
                                          placeholder="00000-000"
                                          className="h-11"
                                          value={field.value || ''}
                                          onChange={(e) => {
                                            let value = e.target.value.replace(/\D/g, '')
                                            if (value.length > 8) value = value.slice(0, 8)
                                            let formatted = value
                                            if (value.length > 5) {
                                              formatted = `${value.slice(0, 5)}-${value.slice(5)}`
                                            }
                                            field.onChange(formatted)

                                            if (value.length === 8) {
                                              fetch(`https://viacep.com.br/ws/${value}/json/`)
                                                .then((res) => res.json())
                                                .then((data) => {
                                                  if (!data.erro) {
                                                    const uf = data.uf
                                                    const localidade = data.localidade

                                                    // Ensure the city is in the LOCATIONS array so it passes validation and appears in select
                                                    if (
                                                      LOCATIONS['Brasil'] &&
                                                      LOCATIONS['Brasil'][uf]
                                                    ) {
                                                      if (
                                                        !LOCATIONS['Brasil'][uf].includes(
                                                          localidade,
                                                        )
                                                      ) {
                                                        LOCATIONS['Brasil'][uf].push(localidade)
                                                      }
                                                    }

                                                    registerForm.setValue('state', uf, {
                                                      shouldValidate: true,
                                                    })
                                                    registerForm.setValue('city', localidade, {
                                                      shouldValidate: true,
                                                    })
                                                  } else {
                                                    toast({
                                                      title: 'CEP não encontrado',
                                                      description:
                                                        'Verifique o CEP digitado e tente novamente.',
                                                      variant: 'destructive',
                                                    })
                                                  }
                                                })
                                                .catch(console.error)
                                            }
                                          }}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <FormField
                                control={registerForm.control}
                                name="state"
                                render={({ field }) => {
                                  const country = registerForm.watch('country') || 'Brasil'
                                  const states = LOCATIONS[country]
                                    ? Object.keys(LOCATIONS[country])
                                    : []

                                  return (
                                    <FormItem>
                                      <FormLabel>Estado / Província *</FormLabel>
                                      <Select
                                        onValueChange={(val) => {
                                          field.onChange(val)
                                          registerForm.setValue('city', '')
                                        }}
                                        value={field.value || undefined}
                                        disabled={states.length === 0}
                                      >
                                        <FormControl>
                                          <SelectTrigger className="h-11">
                                            <SelectValue placeholder="Selecione o estado" />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          {states.map((s) => (
                                            <SelectItem key={s} value={s}>
                                              {s}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                      <FormMessage />
                                    </FormItem>
                                  )
                                }}
                              />

                              <FormField
                                control={registerForm.control}
                                name="city"
                                render={({ field }) => {
                                  const country = registerForm.watch('country') || 'Brasil'
                                  const state = registerForm.watch('state')
                                  const cities =
                                    state && LOCATIONS[country]
                                      ? LOCATIONS[country][state] || []
                                      : []

                                  return (
                                    <FormItem>
                                      <FormLabel>Cidade *</FormLabel>
                                      <Select
                                        onValueChange={field.onChange}
                                        value={field.value || undefined}
                                        disabled={cities.length === 0}
                                      >
                                        <FormControl>
                                          <SelectTrigger className="h-11">
                                            <SelectValue placeholder="Selecione a cidade" />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          {cities.map((c) => (
                                            <SelectItem key={c} value={c}>
                                              {c}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                      <FormMessage />
                                    </FormItem>
                                  )
                                }}
                              />
                            </div>

                            <FormField
                              control={registerForm.control}
                              name="lgpd_consent"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 bg-muted/10 mt-2 mb-4">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                  <div className="space-y-1.5 leading-none">
                                    <FormLabel className="text-sm font-semibold leading-none">
                                      Li e concordo com os termos de uso e política de privacidade *
                                    </FormLabel>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      Seus dados pessoais serão armazenados e utilizados
                                      exclusivamente para fins de certificação.
                                    </p>
                                  </div>
                                </FormItem>
                              )}
                            />
                          </div>
                        )}
                      </div>

                      <div className="flex gap-3 pt-4 border-t mt-4">
                        {step > 0 && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handlePrevStep}
                            className="flex-1 h-11"
                          >
                            <ChevronLeft className="w-4 h-4 mr-2" />
                            Voltar
                          </Button>
                        )}

                        {step < STEPS.length - 1 ? (
                          <Button type="button" onClick={handleNextStep} className="flex-1 h-11">
                            Continuar
                            <ChevronRight className="w-4 h-4 ml-2" />
                          </Button>
                        ) : (
                          <Button
                            type="submit"
                            className="flex-1 h-11 font-bold bg-green-600 hover:bg-green-700 text-white"
                            disabled={isLoading}
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
                        )}
                      </div>
                    </form>
                  </Form>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <AppFooter />
    </div>
  )
}
