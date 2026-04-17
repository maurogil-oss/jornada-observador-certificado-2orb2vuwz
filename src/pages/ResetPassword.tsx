import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Lock, Loader2, Eye, EyeOff } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import pb from '@/lib/pocketbase/client'

const schema = z
  .object({
    password: z.string().min(8, 'A senha deve ter pelo menos 8 caracteres'),
    passwordConfirm: z.string().min(8, 'A confirmação de senha deve ter pelo menos 8 caracteres'),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: 'As senhas não coincidem',
    path: ['passwordConfirm'],
  })

type FormValues = z.infer<typeof schema>

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { toast } = useToast()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { password: '', passwordConfirm: '' },
    mode: 'onChange',
  })

  useEffect(() => {
    if (!token) {
      toast({
        title: 'Token ausente',
        description: 'O link de recuperação não contém um token válido.',
        variant: 'destructive',
      })
    }
  }, [token, toast])

  const onSubmit = async (data: FormValues) => {
    if (!token) return

    setIsLoading(true)
    try {
      await pb.collection('users').confirmPasswordReset(token, data.password, data.passwordConfirm)
      toast({
        title: 'Senha alterada com sucesso!',
        description: 'Faça login com sua nova senha.',
      })
      navigate('/login')
    } catch (err: any) {
      toast({
        title: 'Erro ao redefinir senha',
        description: 'O link de recuperação é inválido ou expirou. Por favor, solicite um novo.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4 relative overflow-hidden">
        <div className="absolute top-[-15%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse duration-1000" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-[20%] right-[10%] w-[20%] h-[20%] bg-amber-500/10 rounded-full blur-[80px] pointer-events-none" />

        <Card className="w-full max-w-md shadow-elevation border-border/60 relative z-10 backdrop-blur-md bg-background/80 animate-fade-in-up">
          <CardHeader className="space-y-3 pb-6 text-center">
            <CardTitle className="text-2xl font-bold tracking-tight">Link Inválido</CardTitle>
            <CardDescription className="text-base font-medium text-destructive">
              O token de redefinição não foi encontrado ou é inválido.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button asChild className="w-full h-11">
              <Link to="/forgot-password">Solicitar novo link</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4 relative overflow-hidden">
      <div className="absolute top-[-15%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse duration-1000" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-[20%] right-[10%] w-[20%] h-[20%] bg-amber-500/10 rounded-full blur-[80px] pointer-events-none" />

      <Card className="w-full max-w-md shadow-elevation border-border/60 relative z-10 backdrop-blur-md bg-background/80 animate-fade-in-up">
        <CardHeader className="space-y-3 pb-6 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight">Redefinir Senha</CardTitle>
          <CardDescription className="text-base font-medium">
            Crie uma nova senha segura para sua conta.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nova Senha</FormLabel>
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
                control={form.control}
                name="passwordConfirm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmar Nova Senha</FormLabel>
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
              <Button
                type="submit"
                className="w-full h-11 font-bold mt-2"
                disabled={isLoading || !form.formState.isValid}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Alterando...
                  </>
                ) : (
                  'Alterar Senha'
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
