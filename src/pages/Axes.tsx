import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { niveisData } from '@/lib/data'
import { CheckCircle, PlusCircle } from 'lucide-react'
import { SubmitEvidenceDialog } from '@/components/submissions/SubmitEvidenceDialog'
import { CompetencyMatrix } from '@/components/axes/CompetencyMatrix'
import { useState } from 'react'
import { cn } from '@/lib/utils'

export default function Axes() {
  const [selectedItem, setSelectedItem] = useState<{
    title: string
    points: number
    axis: string
  } | null>(null)

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Níveis de Evolução</h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Explore as atividades e submeta suas comprovações para avançar na sua jornada.
        </p>
      </div>

      <Tabs defaultValue="I" className="w-full">
        <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 mb-8 bg-muted/60 p-1.5 rounded-lg h-auto gap-2 md:gap-0">
          {niveisData.map((nivel) => (
            <TabsTrigger
              key={nivel.id}
              value={nivel.id}
              className="text-sm md:text-base py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md rounded-md transition-all flex-col xl:flex-row"
            >
              <span className="whitespace-nowrap">Nível {nivel.id}</span>
              <span className="hidden md:inline ml-1 opacity-90 font-normal truncate max-w-full text-xs xl:text-sm">
                - {nivel.title}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        {niveisData.map((nivel) => {
          const isAmber = nivel.id === 'III'
          const isBlue = nivel.id === 'II'

          return (
            <TabsContent
              key={nivel.id}
              value={nivel.id}
              className="space-y-6 outline-none animate-slide-up"
            >
              <div
                className={cn(
                  'p-6 md:p-8 rounded-xl flex flex-col md:flex-row items-start md:items-center gap-6 shadow-elevation border',
                  isAmber
                    ? 'bg-amber-50 text-amber-950 border-amber-200 dark:bg-amber-950/20 dark:text-amber-50 dark:border-amber-900/50'
                    : isBlue
                      ? 'bg-blue-50 text-blue-950 border-blue-200 dark:bg-blue-950/20 dark:text-blue-50 dark:border-blue-900/50'
                      : 'bg-emerald-50 text-emerald-950 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-50 dark:border-emerald-900/50',
                )}
              >
                <div
                  className={cn(
                    'p-4 rounded-2xl shrink-0',
                    isAmber
                      ? 'bg-amber-200 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400'
                      : isBlue
                        ? 'bg-blue-200 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400'
                        : 'bg-emerald-200 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400',
                  )}
                >
                  <nivel.icon className="w-10 h-10" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">
                    Nível {nivel.id} - {nivel.title}
                  </h2>
                  <p className="opacity-80 mt-2 text-lg">{nivel.purpose}</p>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {nivel.items.map((item, idx) => (
                  <Card
                    key={idx}
                    className={cn(
                      'flex flex-col border-border/80 hover:shadow-subtle transition-all duration-300',
                      isAmber && 'hover:border-amber-500/50',
                      isBlue && 'hover:border-blue-500/50',
                      !isAmber && !isBlue && 'hover:border-emerald-500/50',
                    )}
                  >
                    <CardHeader className="pb-4">
                      <div className="flex justify-between items-start mb-3">
                        <Badge
                          variant="secondary"
                          className={cn(
                            'font-bold px-3 py-1 text-sm border',
                            isAmber
                              ? 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400'
                              : isBlue
                                ? 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400'
                                : 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400',
                          )}
                        >
                          Até {item.points} pts
                        </Badge>
                        {idx === 0 ? (
                          <CheckCircle
                            className={cn(
                              'w-6 h-6 drop-shadow-sm',
                              isAmber
                                ? 'text-amber-600'
                                : isBlue
                                  ? 'text-blue-600'
                                  : 'text-emerald-600',
                            )}
                          />
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
                        className={cn(
                          'w-full font-semibold',
                          idx !== 0 && isAmber && 'bg-amber-600 hover:bg-amber-700 text-white',
                          idx !== 0 && isBlue && 'bg-blue-600 hover:bg-blue-700 text-white',
                          idx !== 0 &&
                            !isAmber &&
                            !isBlue &&
                            'bg-emerald-600 hover:bg-emerald-700 text-white',
                        )}
                        disabled={idx === 0}
                        onClick={() =>
                          setSelectedItem({
                            title: item.title,
                            points: item.points,
                            axis: `Nível ${nivel.id}`,
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
          )
        })}
      </Tabs>

      <CompetencyMatrix />

      <SubmitEvidenceDialog
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        item={selectedItem}
      />
    </div>
  )
}
