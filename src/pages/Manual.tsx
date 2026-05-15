import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { useEffect, useState } from 'react'
import pb from '@/lib/pocketbase/client'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import useAuthStore from '@/stores/useAuthStore'
import { BookOpen, AlertCircle, ShieldCheck } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'

export default function Manual() {
  const { user } = useAuthStore()
  const [metadata, setMetadata] = useState<any[]>([])

  useEffect(() => {
    if (user) localStorage.setItem(`manual_read_${user.id}`, 'true')

    pb.collection('activities_metadata')
      .getFullList({ sort: 'title' })
      .then((res) => setMetadata(res))
      .catch(console.error)
  }, [user])

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
                <h4 className="font-bold text-emerald-800 dark:text-emerald-400">
                  Nível I - Observador Certificado
                </h4>
                <p className="text-sm mt-1 text-emerald-900 dark:text-emerald-300">
                  Status inicial conferido após a aprovação na prova de nivelamento e documentação
                  básica (ex: Ensino Médio).
                </p>
              </div>
              <div className="p-4 rounded-lg bg-blue-50 border border-blue-200 dark:bg-blue-950/20 dark:border-blue-800">
                <h4 className="font-bold text-blue-800 dark:text-blue-400">
                  Nível II - Observador Certificado Pleno
                </h4>
                <p className="text-sm mt-1 text-blue-900 dark:text-blue-300">
                  Requer acúmulo de <strong>500 pontos</strong> em evidências válidas. Demonstra
                  atuação constante e desenvolvimento contínuo.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 dark:bg-amber-950/20 dark:border-amber-800">
                <h4 className="font-bold text-amber-800 dark:text-amber-400">
                  Nível III - Observador Certificado Mobilizador
                </h4>
                <p className="text-sm mt-1 text-amber-900 dark:text-amber-300">
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
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead>Atividade / Eixo</TableHead>
                    <TableHead className="text-right">Pontos</TableHead>
                    <TableHead>Limite Máximo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {metadata.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                        Carregando regras de pontuação...
                      </TableCell>
                    </TableRow>
                  ) : (
                    metadata.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="font-medium text-foreground">{item.title}</div>
                          {item.axis && (
                            <Badge variant="outline" className="mt-1 text-[10px]">
                              {item.axis}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-bold text-primary whitespace-nowrap">
                          {item.points} pts
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {item.max_limit || 'Sem limite específico'}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
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
