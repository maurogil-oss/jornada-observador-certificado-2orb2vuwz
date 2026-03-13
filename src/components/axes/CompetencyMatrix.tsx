import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { competencyMatrixData } from '@/lib/playbookData'
import { Sprout } from 'lucide-react'

export function CompetencyMatrix() {
  return (
    <Card className="mt-12 shadow-subtle border-border/60 overflow-hidden">
      <CardHeader className="bg-muted/30 border-b border-border/50">
        <CardTitle className="text-2xl">Matriz Evolutiva de Competências</CardTitle>
        <CardDescription className="text-base">
          O caminho estruturado para a excelência na segurança viária.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0 overflow-x-auto">
        <Table className="min-w-[700px]">
          <TableHeader className="bg-muted/20">
            <TableRow>
              <TableHead className="w-1/4 font-black text-foreground pl-6">Pilares</TableHead>
              <TableHead className="w-1/4">
                <div className="flex flex-col items-start gap-1 py-2">
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                    <Sprout className="w-4 h-4" />
                    <span className="font-bold text-foreground">Nível I</span>
                  </div>
                </div>
              </TableHead>
              <TableHead className="w-1/4">
                <div className="flex flex-col items-start gap-1 py-2">
                  <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                    <img
                      src="/logo.png"
                      alt="Badge Pleno"
                      className="w-5 h-5 opacity-80 mix-blend-luminosity filter grayscale"
                    />
                    <span className="font-bold text-foreground">Nível II</span>
                  </div>
                </div>
              </TableHead>
              <TableHead className="w-1/4 pr-6">
                <div className="flex flex-col items-start gap-1 py-2">
                  <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                    <img
                      src="/logo.png"
                      alt="Badge Mobilizador"
                      className="w-6 h-6 drop-shadow-sm"
                    />
                    <span className="font-bold text-foreground">Nível III</span>
                  </div>
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {competencyMatrixData.map((row, idx) => (
              <TableRow key={idx} className="hover:bg-muted/30">
                <TableCell className="font-bold text-muted-foreground pl-6 align-top">
                  {row.pilar}
                </TableCell>
                <TableCell className="text-sm align-top leading-relaxed text-muted-foreground">
                  {row.nivel1}
                </TableCell>
                <TableCell className="text-sm align-top leading-relaxed text-muted-foreground">
                  {row.nivel2}
                </TableCell>
                <TableCell className="text-sm align-top leading-relaxed pr-6 text-foreground font-medium">
                  {row.nivel3}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
