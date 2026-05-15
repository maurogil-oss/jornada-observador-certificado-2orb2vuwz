import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useEffect, useState, useCallback } from 'react'
import pb from '@/lib/pocketbase/client'
import useAuthStore from '@/stores/useAuthStore'
import { BookOpen, AlertCircle, ShieldCheck, Loader2, RefreshCw } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useRealtime } from '@/hooks/use-realtime'
import { ActivityMetadata } from '@/services/activities_metadata'

export default function Manual() {
  const { user } = useAuthStore()
  const [metadata, setMetadata] = useState<ActivityMetadata[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMetadata = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const res = await pb
        .collection('activities_metadata')
        .getFullList<ActivityMetadata>({ sort: 'axis,title' })
      setMetadata(res)
    } catch (err: any) {
      if (!err.isAbort) {
        setError(
          'Não foi possível carregar as regras de pontuação. Por favor, tente novamente mais tarde.',
        )
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (user) localStorage.setItem(`manual_read_${user.id}`, 'true')
    fetchMetadata()
  }, [user, fetchMetadata])

  useRealtime('activities_metadata', () => {
    fetchMetadata()
  })

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-10">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-primary/10 rounded-xl">
          <BookOpen className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Guia da Jornada</h1>
          <p className="text-muted-foreground text-lg mt-1">
            Manual completo de regras, pontuação e níveis.
          </p>
        </div>
      </div>

      <Accordion
        type="single"
        collapsible
        className="w-full space-y-4"
        defaultValue="primeiros-passos"
      >
        <AccordionItem value="primeiros-passos" className="border rounded-xl px-4 bg-card">
          <AccordionTrigger className="text-lg font-semibold hover:no-underline">
            Primeiros Passos
          </AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-4 pb-4">
            <p>
              Bem-vindo à Jornada de Evolução. Para garantir que sua experiência e certificados
              sejam gerados corretamente, é fundamental manter seu perfil atualizado.
            </p>
            <Alert className="bg-primary/5 border-primary/20 text-primary-foreground">
              <AlertCircle className="h-4 w-4 text-primary" />
              <AlertTitle className="text-primary font-semibold">Importante</AlertTitle>
              <AlertDescription className="text-foreground/90 mt-2">
                Acesse a página "Meu Perfil" e certifique-se de que seu{' '}
                <strong>Nome Completo</strong>, <strong>CPF</strong>, <strong>RG</strong> e{' '}
                <strong>Cidade/Estado</strong> estejam preenchidos corretamente. Esses dados são
                usados para a validação das evidências e emissão do certificado.
              </AlertDescription>
            </Alert>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="entendendo-eixos" className="border rounded-xl px-4 bg-card">
          <AccordionTrigger className="text-lg font-semibold hover:no-underline">
            Entendendo os Níveis
          </AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-4 pb-4">
            <p>
              A Jornada é dividida em três níveis de certificação, refletindo o seu engajamento
              institucional e técnico:
            </p>
            <div className="space-y-4 mt-4">
              <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h4 className="font-bold text-emerald-800 dark:text-emerald-400">
                    Nível I - Observador Certificado
                  </h4>
                  <Badge
                    variant="outline"
                    className="w-fit bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/50 dark:text-emerald-300 dark:border-emerald-700"
                  >
                    000 a 499 pontos
                  </Badge>
                </div>
                <p className="text-sm mt-2 text-emerald-900 dark:text-emerald-300">
                  Status inicial conferido após a aprovação na prova de nivelamento e documentação
                  básica (ex: Ensino Médio).
                </p>
              </div>
              <div className="p-4 rounded-lg bg-blue-50 border border-blue-200 dark:bg-blue-950/20 dark:border-blue-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h4 className="font-bold text-blue-800 dark:text-blue-400">
                    Nível II - Observador Certificado Pleno
                  </h4>
                  <Badge
                    variant="outline"
                    className="w-fit bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-700"
                  >
                    500 a 999 pontos
                  </Badge>
                </div>
                <p className="text-sm mt-2 text-blue-900 dark:text-blue-300">
                  Requer acúmulo de <strong>500 pontos</strong> em evidências válidas. Demonstra
                  atuação constante e desenvolvimento contínuo.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 dark:bg-amber-950/20 dark:border-amber-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h4 className="font-bold text-amber-800 dark:text-amber-400">
                    Nível III - Observador Certificado Mobilizador
                  </h4>
                  <Badge
                    variant="outline"
                    className="w-fit bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/50 dark:text-amber-300 dark:border-amber-700"
                  >
                    1000+ pontos
                  </Badge>
                </div>
                <p className="text-sm mt-2 text-amber-900 dark:text-amber-300">
                  O topo da jornada, requerendo <strong>1000 pontos</strong>. Demonstra forte
                  capacidade de liderança, impacto social relevante e articulação em prol do
                  Movimento Maio Amarelo e outras campanhas do ONSV.
                </p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="regras-pontuacao" className="border rounded-xl px-4 bg-card">
          <AccordionTrigger className="text-lg font-semibold hover:no-underline">
            Regras de Pontuação e Limites
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            <p className="text-muted-foreground mb-4">
              Abaixo estão listadas todas as atividades pontuáveis, seus respectivos valores e
              limites máximos permitidos na jornada.
            </p>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground border rounded-xl bg-muted/20">
                <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary" />
                <p>Carregando regras de pontuação...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-12 text-destructive border border-destructive/20 rounded-xl bg-destructive/5 px-4 text-center">
                <AlertCircle className="h-8 w-8 mb-4" />
                <p className="mb-4">{error}</p>
                <Button onClick={fetchMetadata} variant="outline" className="text-foreground">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Tentar Novamente
                </Button>
              </div>
            ) : metadata.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground border rounded-xl bg-muted/20">
                Nenhuma regra de pontuação cadastrada no momento.
              </div>
            ) : (
              <div className="rounded-xl border bg-card overflow-hidden overflow-x-auto">
                <Table className="w-full text-sm">
                  <TableHeader>
                    <TableRow className="bg-muted/50 hover:bg-muted/50">
                      <TableHead className="min-w-[250px] py-4">Atividade</TableHead>
                      <TableHead className="py-4">Eixo</TableHead>
                      <TableHead className="text-center py-4 whitespace-nowrap">Nível I</TableHead>
                      <TableHead className="text-center py-4 whitespace-nowrap">Nível II</TableHead>
                      <TableHead className="text-center py-4 whitespace-nowrap">
                        Nível III
                      </TableHead>
                      <TableHead className="py-4 whitespace-nowrap">Limite Máximo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {metadata.map((item) => (
                      <TableRow key={item.id} className="group">
                        <TableCell className="font-medium align-top py-4">
                          <span className="text-foreground">{item.title}</span>
                          {(item.definition || item.required_evidence) && (
                            <div className="mt-2 space-y-2 text-xs text-muted-foreground font-normal">
                              {item.definition && (
                                <p>
                                  <strong className="text-foreground/80">Definição:</strong>{' '}
                                  {item.definition}
                                </p>
                              )}
                              {item.required_evidence && (
                                <p>
                                  <strong className="text-foreground/80">Evidência:</strong>{' '}
                                  {item.required_evidence}
                                </p>
                              )}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="align-top py-4 text-muted-foreground">
                          {item.axis || '-'}
                        </TableCell>
                        <TableCell className="align-top text-center py-4">
                          <Badge variant="secondary" className="font-bold">
                            {item.points_level_1 ?? item.points ?? '-'} pts
                          </Badge>
                        </TableCell>
                        <TableCell className="align-top text-center py-4">
                          <Badge
                            variant="secondary"
                            className="font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                          >
                            {item.points_level_2 ?? item.points ?? '-'} pts
                          </Badge>
                        </TableCell>
                        <TableCell className="align-top text-center py-4">
                          <Badge
                            variant="secondary"
                            className="font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/30"
                          >
                            {item.points_level_3 ?? item.points ?? '-'} pts
                          </Badge>
                        </TableCell>
                        <TableCell className="align-top py-4 text-muted-foreground">
                          {item.max_limit || 'Sem limite específico'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="validos-excedentes" className="border rounded-xl px-4 bg-card">
          <AccordionTrigger className="text-lg font-semibold hover:no-underline">
            Pontos Válidos vs. Pontos Excedentes
          </AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-4 pb-4">
            <p>
              Para garantir que o profissional se desenvolva em diversas áreas e não concentre suas
              atividades em apenas um tipo de ação, estabelecemos limites de pontuação para certas
              categorias.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="p-4 border rounded-lg bg-green-50/50 dark:bg-green-950/20 border-green-200 dark:border-green-900">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck className="w-5 h-5 text-green-600" />
                  <h4 className="font-bold text-foreground">Pontos Válidos</h4>
                </div>
                <p className="text-sm">
                  É a soma da sua pontuação aprovada, <strong>respeitando o limite máximo</strong>{' '}
                  de cada atividade. Esses são os pontos que efetivamente contam para você evoluir
                  de nível (Nível I ➔ Nível II ➔ Nível III).
                </p>
              </div>
              <div className="p-4 border rounded-lg bg-orange-50/50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                  <h4 className="font-bold text-foreground">Pontos Excedentes</h4>
                </div>
                <p className="text-sm">
                  Se você ultrapassar o limite permitido de uma determinada atividade (ex: enviar 5
                  diplomas sendo o limite 3), as evidências adicionais gerarão{' '}
                  <strong>pontos excedentes</strong>. Eles demonstram seu esforço histórico, mas{' '}
                  <strong>não são contabilizados para mudança de nível</strong>.
                </p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="como-enviar" className="border rounded-xl px-4 bg-card">
          <AccordionTrigger className="text-lg font-semibold hover:no-underline">
            Como Enviar Evidências
          </AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-4 pb-4">
            <ol className="list-decimal list-inside space-y-3">
              <li>
                Acesse o <strong>Cofre de Evidências</strong> no menu lateral.
              </li>
              <li>
                Clique no botão <strong>Nova Submissão</strong>.
              </li>
              <li>
                Selecione a atividade correspondente ao que você realizou (veja a aba de regras
                acima).
              </li>
              <li>
                Anexe um <strong>Arquivo</strong> (PDF, imagem do certificado/comprovação) OU
                forneça um <strong>Link</strong> (ex: link de uma reportagem, vídeo no YouTube,
                postagem).
              </li>
              <li>Adicione uma breve descrição para contextualizar a avaliação do ONSV.</li>
              <li>
                Pronto! Sua evidência entrará no status <strong>"Em Análise"</strong>. A equipe do
                ONSV irá revisar, e caso aprovada, os pontos serão computados. Caso contrário, você
                receberá um status de <strong>"Ajuste Necessário"</strong> com feedback do
                avaliador.
              </li>
            </ol>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
