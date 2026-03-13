import { rankingData } from '@/lib/data'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'

export default function Ranking() {
  const top3 = rankingData.slice(0, 3)
  const rest = rankingData.slice(3)

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-fade-in-up pb-10">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center mb-2">
          <img
            src="/logo.png"
            alt="Logo Observador Certificado"
            className="w-20 h-20 drop-shadow-md"
          />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Quadro de Honra</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          O princípio da Meritocracia em ação. Acompanhe os líderes da Jornada de Evolução.
        </p>
      </div>

      {/* Podium */}
      <div className="flex justify-center items-end gap-2 md:gap-6 pt-10 pb-6 px-4">
        {[top3[1], top3[0], top3[2]].map((user, idx) => {
          const isFirst = idx === 1
          const position = isFirst ? 1 : idx === 0 ? 2 : 3
          const heightClass = position === 1 ? 'h-56' : position === 2 ? 'h-44' : 'h-36'
          const colorClass =
            position === 1
              ? 'bg-amber-500 text-amber-950 shadow-amber-500/20'
              : position === 2
                ? 'bg-zinc-300 text-zinc-800 shadow-zinc-400/20'
                : 'bg-orange-300/90 text-orange-900 shadow-orange-500/20'

          return (
            <div
              key={user.rank}
              className="flex flex-col items-center relative animate-slide-up flex-1 max-w-[160px]"
              style={{ animationDelay: `${(3 - position) * 150}ms` }}
            >
              {position === 1 && (
                <img
                  src="/logo.png"
                  alt="Primeiro Lugar"
                  className="w-20 h-20 absolute -top-24 drop-shadow-xl z-20"
                />
              )}
              <Avatar
                className={cn(
                  'border-4 shadow-xl mb-5 z-10',
                  position === 1 ? 'w-28 h-28 border-amber-500' : 'w-24 h-24 border-background',
                )}
              >
                <AvatarImage src={user.avatar} />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="text-center mb-5 px-2">
                <p className="font-bold whitespace-nowrap text-sm md:text-base">{user.name}</p>
                <p className="text-xs md:text-sm font-semibold text-muted-foreground">
                  {user.points} pts
                </p>
              </div>
              <div
                className={cn(
                  'w-full rounded-t-xl flex flex-col items-center justify-start pt-6 shadow-lg relative overflow-hidden',
                  heightClass,
                  colorClass,
                )}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent"></div>
                <span className="text-4xl font-black relative z-10 opacity-80">{position}</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Table */}
      <Card className="border-border/60 shadow-elevation overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/40 border-b border-border/50">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-20 text-center py-4">Posição</TableHead>
                <TableHead>Observador Certificado</TableHead>
                <TableHead>Maturidade</TableHead>
                <TableHead className="text-right pr-6">Pontuação Geral</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rest.map((user) => (
                <TableRow key={user.rank} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="text-center py-4">
                    <span className="font-bold text-muted-foreground text-lg">{user.rank}º</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-4">
                      <Avatar className="w-10 h-10 border-2 border-background shadow-sm">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="font-bold text-base">{user.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-semibold px-3 py-1 rounded-full bg-secondary/10 text-secondary border border-secondary/20">
                      {user.level}
                    </span>
                  </TableCell>
                  <TableCell className="text-right pr-6 font-black text-lg text-foreground/80">
                    {user.points}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
