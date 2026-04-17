import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Info, CheckCircle2, Lock } from 'lucide-react'
import useGameStore from '@/stores/useGameStore'

export default function Axes() {
  const { level } = useGameStore()

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Níveis de Evolução</h1>
        <p className="text-muted-foreground mt-2">
          Acompanhe sua jornada e descubra os requisitos para alcançar novos níveis de certificação
          na plataforma.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="relative overflow-hidden border-emerald-500/50 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-sm transition-all hover:shadow-md">
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle className="text-xl text-emerald-700 dark:text-emerald-400">
                Nível I
              </CardTitle>
              <Badge className="bg-emerald-500 text-white">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Concluído
              </Badge>
            </div>
            <CardDescription className="font-semibold text-foreground/80">
              Observador Certificado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-3 bg-emerald-100/60 dark:bg-emerald-900/40 p-4 rounded-md border border-emerald-200 dark:border-emerald-800">
              <Info className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
              <p className="text-sm text-emerald-900 dark:text-emerald-100 font-medium">
                Este nível é automaticamente concluído para Observadores Certificados, pois a
                formação inicial e o ensino médio são pré-requisitos já atendidos.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card
          className={`transition-all ${level >= 2 ? 'border-blue-500/50 bg-blue-50/50 dark:bg-blue-950/20 shadow-sm hover:shadow-md' : 'opacity-80 grayscale-[0.2]'}`}
        >
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle
                className={`text-xl ${level >= 2 ? 'text-blue-700 dark:text-blue-400' : 'text-muted-foreground'}`}
              >
                Nível II
              </CardTitle>
              {level >= 2 ? (
                <Badge className="bg-blue-500 text-white">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Concluído
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="border-muted-foreground/30 text-muted-foreground"
                >
                  <Lock className="w-3.5 h-3.5 mr-1" /> Bloqueado
                </Badge>
              )}
            </div>
            <CardDescription className="font-semibold">
              Observador Certificado Pleno
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Alcance <strong>500 pontos</strong> submetendo evidências de missões de impacto.
              Complete formações adicionais e comprove sua atuação para desbloquear este nível.
            </p>
          </CardContent>
        </Card>

        <Card
          className={`transition-all ${level >= 3 ? 'border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/20 shadow-sm hover:shadow-md' : 'opacity-80 grayscale-[0.2]'}`}
        >
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle
                className={`text-xl ${level >= 3 ? 'text-amber-700 dark:text-amber-400' : 'text-muted-foreground'}`}
              >
                Nível III
              </CardTitle>
              {level >= 3 ? (
                <Badge className="bg-amber-500 text-amber-950">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Concluído
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="border-muted-foreground/30 text-muted-foreground"
                >
                  <Lock className="w-3.5 h-3.5 mr-1" /> Bloqueado
                </Badge>
              )}
            </div>
            <CardDescription className="font-semibold">
              Observador Certificado Mobilizador
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">
              O topo da jornada. Alcance <strong>1000 pontos</strong> com forte impacto
              institucional e liderança para conquistar o nível mais alto de nossa certificação.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
