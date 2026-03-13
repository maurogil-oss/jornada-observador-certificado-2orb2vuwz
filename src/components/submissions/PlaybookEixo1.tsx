import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BookOpen, Upload } from 'lucide-react'
import { eixo1Sections } from '@/lib/playbookData'

interface Props {
  onSelect: (item: { title: string; points: number; axis: string }) => void
}

export function PlaybookEixo1({ onSelect }: Props) {
  return (
    <div className="space-y-6 animate-slide-up outline-none">
      <div className="bg-emerald-50 text-emerald-950 dark:bg-emerald-950/20 dark:text-emerald-50 p-6 md:p-8 rounded-xl flex flex-col md:flex-row items-start md:items-center gap-6 shadow-elevation border border-emerald-200 dark:border-emerald-900/50">
        <div className="p-4 bg-emerald-100 dark:bg-emerald-900/50 rounded-2xl shrink-0">
          <BookOpen className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Playbook Nível I: Observador Certificado
          </h2>
          <p className="opacity-90 mt-2 text-lg">
            Construa sua base e autoridade técnica. Atividades estruturais (Titulação) não são
            cumulativas.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {eixo1Sections.map((section, sIdx) => (
          <Card key={sIdx} className="overflow-hidden border-border/60 shadow-subtle">
            <CardHeader className="bg-muted/30 border-b border-border/50 py-4">
              <CardTitle className="text-lg flex flex-wrap items-baseline gap-2">
                <span>{section.title}</span>
                {section.desc && (
                  <span className="text-muted-foreground font-normal text-sm md:text-base">
                    {section.desc}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/50">
                {section.items.map((item, iIdx) => (
                  <div
                    key={iIdx}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-4 hover:bg-muted/20 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white font-mono px-2 py-0.5 rounded shadow-sm whitespace-nowrap">
                        [{item.points} pts]
                      </Badge>
                      <span className="font-medium text-sm md:text-base">{item.text}</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="shrink-0 sm:w-auto w-full border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 dark:border-emerald-800 dark:hover:bg-emerald-950 dark:hover:text-emerald-300"
                      onClick={() =>
                        onSelect({
                          title: item.text,
                          points: item.points,
                          axis: 'Nível I: Observador Certificado',
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
  )
}
