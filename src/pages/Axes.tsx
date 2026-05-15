import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Trophy, Star, Shield, ArrowRight, BookOpen, Target, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export default function Axes() {
  return (
    <div className="container mx-auto py-8 max-w-5xl space-y-8 animate-fade-in px-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Níveis de Evolução</h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Compreenda os requisitos de pontuação para progredir na sua Jornada de Evolução como
          Observador Certificado.
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          Progressão de Níveis
        </h2>
        <p className="text-muted-foreground">
          Sua jornada é dividida em três níveis de reconhecimento. Acumule pontos através de suas
          contribuições para avançar.
        </p>

        <div className="grid gap-6 md:grid-cols-3 mt-6">
          <Card className="relative overflow-hidden border-border/50 bg-card hover:bg-muted/20 transition-all shadow-sm group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Star className="w-24 h-24" />
            </div>
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-4">
                <Star className="w-6 h-6 text-amber-600 dark:text-amber-500" />
              </div>
              <CardTitle className="text-2xl text-foreground">Nível I</CardTitle>
              <CardDescription className="text-base font-bold text-foreground mt-1">
                Nível I de 000 a 499
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                O início da sua jornada como Observador Certificado. Foco em capacitação, titulação
                e nas suas primeiras ações de impacto.
              </p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-border/50 bg-card hover:bg-muted/20 transition-all shadow-sm group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Shield className="w-24 h-24" />
            </div>
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-emerald-600 dark:text-emerald-500" />
              </div>
              <CardTitle className="text-2xl text-foreground">Nível II</CardTitle>
              <CardDescription className="text-base font-bold text-foreground mt-1">
                Nível II 500 à 999
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Nível intermediário de engajamento ativo. Demonstra dedicação contínua e resultados
                expressivos em projetos de segurança viária.
              </p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-border/50 bg-card hover:bg-muted/20 transition-all shadow-sm group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Trophy className="w-24 h-24" />
            </div>
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
                <Trophy className="w-6 h-6 text-blue-600 dark:text-blue-500" />
              </div>
              <CardTitle className="text-2xl text-foreground">Nível III</CardTitle>
              <CardDescription className="text-base font-bold text-foreground mt-1">
                Nível III acima de 1000
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                A excelência na jornada. Liderança reconhecida, influência significativa na
                sociedade e atuação como mentor para a rede.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="space-y-4 pt-6">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          Eixos de Avaliação
        </h2>
        <p className="text-muted-foreground mb-6">
          Suas atividades e submissões são pontuadas através de três eixos fundamentais que compõem
          o perfil de um Observador Certificado.
        </p>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="border-border/50 shadow-sm bg-card">
            <CardHeader>
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <CardTitle className="text-xl text-foreground">Eixo 1</CardTitle>
              <CardDescription>Capacitação e Titulação</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Valoriza a busca contínua por conhecimento, incluindo graduações, pós-graduações,
                mestrados e cursos na área de trânsito e mobilidade.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm bg-card">
            <CardHeader>
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                <Target className="w-5 h-5 text-primary" />
              </div>
              <CardTitle className="text-xl text-foreground">Eixo 2</CardTitle>
              <CardDescription>Atuação Prática e Impacto</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Mede o resultado prático de suas ações: projetos locais ou nacionais, produção de
                materiais educativos e participação ativa na mídia.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm bg-card">
            <CardHeader>
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <CardTitle className="text-xl text-foreground">Eixo 3</CardTitle>
              <CardDescription>Liderança e Representação</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Reconhece o papel de liderança institucional, como mentoria no programa, atuação em
                comitês estratégicos e representação técnica.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="mt-8 border-primary/20 bg-primary/5 shadow-sm">
        <CardContent className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start md:items-center gap-4">
            <div className="p-3 bg-primary/20 rounded-full shrink-0">
              <ArrowRight className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-foreground mb-1">Pronto para evoluir?</h3>
              <p className="text-muted-foreground">
                Envie suas evidências para análise e garanta seus pontos na jornada de evolução.
              </p>
            </div>
          </div>
          <Button asChild className="w-full md:w-auto shrink-0">
            <Link to="/submissoes">Ir para o Cofre de Evidências</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
