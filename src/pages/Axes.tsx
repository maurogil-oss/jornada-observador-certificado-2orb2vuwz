import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { axesData } from '@/lib/data'
import { CheckCircle, PlusCircle } from 'lucide-react'
import { SubmitEvidenceDialog } from '@/components/submissions/SubmitEvidenceDialog'
import { useState } from 'react'

export default function Axes() {
  const [selectedItem, setSelectedItem] = useState<{
    title: string
    points: number
    axis: string
  } | null>(null)

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Eixos de Evolução</h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Explore as atividades e submeta suas comprovações para avançar na sua jornada.
        </p>
      </div>

      <Tabs defaultValue="I" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8 bg-muted/60 p-1.5 rounded-lg h-auto">
          {axesData.map((eixo) => (
            <TabsTrigger
              key={eixo.id}
              value={eixo.id}
              className="text-sm md:text-base py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md rounded-md transition-all"
            >
              Eixo {eixo.id} <span className="hidden md:inline ml-2">- {eixo.title}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {axesData.map((eixo) => (
          <TabsContent
            key={eixo.id}
            value={eixo.id}
            className="space-y-6 outline-none animate-slide-up"
          >
            <div className="bg-secondary text-secondary-foreground p-6 md:p-8 rounded-xl flex flex-col md:flex-row items-start md:items-center gap-6 shadow-elevation">
              <div className="p-4 bg-primary/20 rounded-2xl shrink-0">
                <eixo.icon className="w-10 h-10 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-2xl font-bold tracking-tight">{eixo.title}</h2>
                <p className="text-secondary-foreground/80 mt-2 text-lg">{eixo.purpose}</p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {eixo.items.map((item, idx) => (
                <Card
                  key={idx}
                  className="flex flex-col border-border/80 hover:border-primary/50 hover:shadow-subtle transition-all duration-300"
                >
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start mb-3">
                      <Badge
                        variant="secondary"
                        className="bg-accent/10 text-accent font-bold px-3 py-1 text-sm border-accent/20"
                      >
                        Até {item.points} pts
                      </Badge>
                      {idx === 0 ? (
                        <CheckCircle className="w-6 h-6 text-primary drop-shadow-sm" />
                      ) : null}
                    </div>
                    <CardTitle className="text-xl leading-tight">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                  </CardContent>
                  <CardFooter className="pt-2">
                    <Button
                      variant={idx === 0 ? 'outline' : 'default'}
                      className="w-full font-semibold"
                      disabled={idx === 0}
                      onClick={() =>
                        setSelectedItem({
                          title: item.title,
                          points: item.points,
                          axis: `Eixo ${eixo.id}`,
                        })
                      }
                    >
                      {idx === 0 ? (
                        'Missão Concluída'
                      ) : (
                        <>
                          <PlusCircle className="w-4 h-4 mr-2" /> Submeter Prova
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <SubmitEvidenceDialog
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        item={selectedItem}
      />
    </div>
  )
}
