import { rankingData } from '@/lib/data'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { Logo } from '@/components/shared/Logo'
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
          <Logo className="w-24 h-24 drop-shadow-md" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Quadro de Honra</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto px-4">
          O princípio da Meritocracia em ação. Acompanhe os líderes da Jornada de Evolução.
        </p>
      </div>

      {/* Podium */}
      <div className="flex justify-center items-end gap-2 md:gap-6 pt-10 pb-6 px-2 sm:px-4">
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
                <Logo className="w-16 h-16 sm:w-20 sm:h-20 absolute -top-20 sm:-top-24 drop-shadow-xl z-20" />
              )}
              <Avatar
                className={cn(
                  'border-4 shadow-xl mb-3 sm:mb-5 z-10 bg-background',
                  position === 1
                    ? 'w-20 h-20 sm:w-28 sm:h-28 border-amber-500'
                    : 'w-16 h-16 sm:w-24 sm:h-24 border-background',
                )}
              >
                <AvatarImage src={user.avatar} />
                <AvatarFallback className="font-bold text-lg sm:text-2xl text-muted-foreground">
                  {user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="text-center mb-3 sm:mb-5 px-1 sm:px-2">
                <p className="font-bold text-xs sm:text-base leading-tight truncate w-full max-w-[100px] sm:max-w-[140px]">
                  {user.name}
                </p>
                <p className="text-[10px] sm:text-sm font-semibold text-muted-foreground">
                  {user.points} pts
                </p>
              </div>
              <div
                className={cn(
                  'w-full rounded-t-xl flex flex-col items-center justify-start pt-4 sm:pt-6 shadow-lg relative overflow-hidden',
                  heightClass,
                  colorClass,
                )}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent"></div>
                <span className="text-3xl sm:text-4xl font-black relative z-10 opacity-80">
                  {position}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block">
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
                    <TableCell className="py-4">
                      <div className="flex items-center gap-4">
                        <Avatar className="w-10 h-10 border-2 border-background shadow-sm shrink-0">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback className="font-semibold text-muted-foreground">
                            {user.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-bold text-base">{user.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <span className="text-sm font-semibold px-3 py-1 rounded-full bg-secondary/10 text-secondary border border-secondary/20">
                        {user.level}
                      </span>
                    </TableCell>
                    <TableCell className="text-right pr-6 font-black text-lg text-foreground/80 py-4">
                      {user.points}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3 px-2">
        {rest.map((user) => (
          <Card
            key={user.rank}
            className="p-4 flex items-center justify-between border-border/60 shadow-sm bg-card hover:bg-muted/10 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="font-bold text-muted-foreground text-base w-6 text-center">
                {user.rank}º
              </span>
              <Avatar className="w-11 h-11 border-2 border-background shadow-sm">
                <AvatarImage src={user.avatar} />
                <AvatarFallback className="font-semibold text-muted-foreground">
                  {user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="font-bold text-sm leading-tight text-foreground">{user.name}</span>
                <span className="text-[11px] font-semibold text-secondary mt-0.5 uppercase tracking-wider">
                  {user.level}
                </span>
              </div>
            </div>
            <div className="font-black text-foreground/80 text-base">{user.points}</div>
          </Card>
        ))}
      </div>
    </div>
  )
}
