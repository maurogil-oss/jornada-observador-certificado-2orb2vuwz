import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Flag, Upload } from 'lucide-react'
import { eixo3Playbook } from '@/lib/playbookData'

interface Props {
  onSelect: (item: { title: string; points: number; axis: string }) => void
}

export function PlaybookEixo3({ onSelect }: Props) {
  return (
    <div className="space-y-8 animate-slide-up outline-none">
      {eixo3Playbook.map((category, cIdx) => (
        <div key={cIdx} className="space-y-6">
          <div className="bg-amber-50 text-amber-950 dark:bg-amber-950/20 dark:text-amber-50 p-6 rounded-xl flex flex-col md:flex-row items-start md:items-center gap-6 shadow-elevation border border-amber-200 dark:border-amber-900/50">
            <div className="p-4 bg-amber-200 dark:bg-amber-900/50 rounded-2xl shrink-0">
              <Flag className="w-10 h-10 text-amber-700 dark:text-amber-400" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold tracking-tight">{category.mainTitle}</h2>
              <p className="opacity-90 mt-2 text-base md:text-lg">{category.desc}</p>
            </div>
          </div>

          <div className="grid gap-6">
            {category.groups.map((group, gIdx) => (
              <Card key={gIdx} className="overflow-hidden border-border/60 shadow-subtle">
                <CardHeader className="bg-muted/30 border-b border-border/50 py-4">
                  <CardTitle className="text-lg flex flex-wrap items-baseline gap-2">
                    <span>{group.title}</span>
                    {group.desc && (
                      <span className="text-muted-foreground font-normal text-sm md:text-base">
                        {group.desc}
                      </span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-border/50">
                    {group.items.map((item, iIdx) => (
                      <div
                        key={iIdx}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-4 hover:bg-muted/20 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Badge className="bg-amber-600 hover:bg-amber-700 text-white font-mono px-2 py-0.5 rounded shadow-sm whitespace-nowrap">
                            [{item.points} pts]
                          </Badge>
                          <span className="font-medium text-sm md:text-base">{item.text}</span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="shrink-0 sm:w-auto w-full border-amber-200 hover:bg-amber-50 hover:text-amber-700 dark:border-amber-800 dark:hover:bg-amber-950 dark:hover:text-amber-300"
                          onClick={() =>
                            onSelect({
                              title: item.text,
                              points: item.points,
                              axis: `Eixo III: ${category.mainTitle}`,
                            })
                          }
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Upload
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
