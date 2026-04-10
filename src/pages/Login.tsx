import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
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
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { extractFieldErrors } from '@/lib/pocketbase/errors'
import pb from '@/lib/pocketbase/client'

const loginSchema = z.object({
  email: z.string().email('E-mail inválido.'),
  password: z.string().min(1, 'A senha é obrigatória'),
})

const registerSchema = z
  .object({
    name: z.string().min(3, 'Nome muito curto.'),
    email: z.string().email('E-mail inválido.'),
    password: z.string().min(8, 'A senha deve ter pelo menos 8 caracteres'),
    passwordConfirm: z.string().min(8, 'A confirmação de senha deve ter pelo menos 8 caracteres'),
    birth_date: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    workplace: z.string().optional(),
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
            'Sua conta está suspensa pelo administrador. Por favor, entre em contato com o suporte.',
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
      name: '',
      email: '',
      password: '',
      passwordConfirm: '',
      birth_date: '',
      city: '',
      state: '',
      country: '',
      workplace: '',
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
            'Sua conta está suspensa pelo administrador. Por favor, entre em contato com o suporte.',
          variant: 'destructive',
        })
        return
      }
      const isAdmin = record?.role === 'admin' || data.email.toLowerCase() === 'maurog1@hotmail.com'
      navigate(isAdmin ? '/admin' : '/')
    } catch (err: any) {
      toast({
        title: 'Erro ao entrar',
        description: 'E-mail ou senha inválidos.',
        variant: 'destructive',
      })
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
        title: 'Sucesso',
        description: 'Conta criada com sucesso. Você já está logado.',
      })
      navigate('/')
    } catch (err: any) {
      const fieldErrors = extractFieldErrors(err)

      if (err.status === 0) {
        toast({
          title: 'Erro de Conexão',
          description:
            'Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.',
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
          <CardDescription className="text-base font-medium">
            Jornada de Evolução do Observador Certificado
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
                        <FormLabel>Senha</FormLabel>
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
                  <Button type="submit" className="w-full h-11 font-bold mt-2" disabled={isLoading}>
                    {isLoading ? 'Autenticando...' : 'Acessar'}
                  </Button>
                </form>
              </Form>
            </TabsContent>

            <TabsContent value="register" className="animate-fade-in-up">
              <Form {...registerForm}>
                <form
                  onSubmit={registerForm.handleSubmit(onRegister)}
                  className="space-y-4 max-h-[60vh] overflow-y-auto px-1 pb-2"
                >
                  <FormField
                    control={registerForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome Completo *</FormLabel>
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

                    <FormField
                      control={registerForm.control}
                      name="birth_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data de Nascimento</FormLabel>
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
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={registerForm.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cidade</FormLabel>
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
                          <FormLabel>Estado</FormLabel>
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
                          <FormLabel>País</FormLabel>
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
                    {isLoading ? 'Cadastrando...' : 'Criar Conta'}
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
