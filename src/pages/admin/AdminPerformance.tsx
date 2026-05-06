import { useState, useMemo } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { TrendingUp } from 'lucide-react'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import useSubmissionsStore from '@/stores/useSubmissionsStore'

export default function AdminPerformance() {
  const { submissions } = useSubmissionsStore()
  const [selectedTurma, setSelectedTurma] = useState<string>('all')

  const chartData = useMemo(() => {
    let approved = submissions.filter((s) => s.status === 'Aprovado')

    if (selectedTurma !== 'all') {
      const turmaNum = parseInt(selectedTurma, 10)
      approved = approved.filter((s) => s.turma === turmaNum)
    }

    const grouped: Record<string, number> = {}
    approved.forEach((sub) => {
      const dateKey = format(new Date(sub.created), 'yyyy-MM')
      if (!grouped[dateKey]) grouped[dateKey] = 0
      grouped[dateKey] += Number(sub.points) || 0
    })

    const sortedKeys = Object.keys(grouped).sort()
    let cumulative = 0
    return sortedKeys.map((key) => {
      cumulative += grouped[key]
      const [year, month] = key.split('-')
      const dateObj = new Date(parseInt(year), parseInt(month) - 1)
      return {
        date: format(dateObj, 'MMM/yy', { locale: ptBR }),
        pontosMes: grouped[key],
        pontosAcumulados: cumulative,
      }
    })
  }, [submissions, selectedTurma])

  const chartConfig = {
    pontosAcumulados: {
      label: 'Pontos Acumulados',
      color: 'hsl(var(--primary))',
    },
    pontosMes: {
      label: 'Pontos no Mês',
      color: 'hsl(var(--accent))',
    },
  }

  const turmaOptions = Array.from({ length: 15 }, (_, i) => i + 1)

  return (
    <div className="p-6 max-w-7xl mx-auto flex flex-col gap-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <TrendingUp className="w-8 h-8 text-primary" />
            Dashboard de Performance
          </h1>
          <p className="text-muted-foreground mt-1">
            Acompanhe a evolução temporal dos pontos das submissões aprovadas.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="whitespace-nowrap font-medium text-sm">Filtrar Turma:</span>
          <Select value={selectedTurma} onValueChange={setSelectedTurma}>
            <SelectTrigger className="w-[180px] bg-background">
              <SelectValue placeholder="Selecione a Turma" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as Turmas</SelectItem>
              {turmaOptions.map((t) => (
                <SelectItem key={t} value={String(t)}>
                  Turma {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="shadow-sm border-border/50">
        <CardHeader>
          <CardTitle>Evolução de Pontos no Tempo</CardTitle>
          <CardDescription>
            Gráfico de área mostrando o total de pontos acumulados ao longo dos meses.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {chartData.length === 0 ? (
            <div className="h-[400px] flex items-center justify-center text-muted-foreground border border-dashed rounded-lg">
              Sem dados de submissões aprovadas para o filtro selecionado.
            </div>
          ) : (
            <div className="h-[400px] w-full">
              <ChartContainer config={chartConfig} className="h-full w-full">
                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorAcumulados" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="var(--color-pontosAcumulados)"
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor="var(--color-pontosAcumulados)"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    className="text-xs"
                  />
                  <YAxis tickLine={false} axisLine={false} tickMargin={8} className="text-xs" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="pontosAcumulados"
                    stroke="var(--color-pontosAcumulados)"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorAcumulados)"
                    name="Pontos Acumulados"
                  />
                </AreaChart>
              </ChartContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
