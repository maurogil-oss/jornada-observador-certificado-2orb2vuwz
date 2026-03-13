import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Star } from 'lucide-react'
import { rankingData } from '@/lib/data'

export function HighlightsMural() {
  return (
    <Card className="shadow-elevation border-border/60 overflow-hidden bg-gradient-to-br from-amber-500/5 to-transparent">
      <CardHeader className="pb-2 border-b border-border/30">
        <CardTitle className="text-lg flex items-center gap-2 text-amber-600 dark:text-amber-500">
          <Star className="w-5 h-5 fill-current" /> Mural de Destaques
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 relative px-10 md:px-14">
        <Carousel
          opts={{
            align: 'start',
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {rankingData.slice(0, 6).map((user, index) => (
              <CarouselItem
                key={user.rank}
                className="pl-2 md:pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5"
              >
                <div className="flex flex-col items-center p-4 bg-background rounded-xl border border-border/50 text-center h-full hover:border-amber-500/40 hover:shadow-subtle transition-all">
                  <div className="relative mb-3">
                    {index === 0 && (
                      <div className="absolute -top-3 -right-3 bg-amber-500 text-amber-950 text-[10px] font-black px-2 py-0.5 rounded-full z-10 shadow-sm">
                        TOP 1
                      </div>
                    )}
                    <Avatar
                      className={`w-16 h-16 border-2 shadow-sm ${index === 0 ? 'border-amber-500' : 'border-background'}`}
                    >
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </div>
                  <span className="font-bold text-sm line-clamp-1 leading-tight">{user.name}</span>
                  <span
                    className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground bg-secondary/10 px-1.5 py-0.5 rounded-full mt-1.5 line-clamp-1"
                    title={user.level}
                  >
                    {user.level}
                  </span>
                  <span className="text-sm font-black mt-2 text-foreground/80">
                    {user.points} pts
                  </span>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="-left-6 md:-left-8 bg-background border-border/50" />
          <CarouselNext className="-right-6 md:-right-8 bg-background border-border/50" />
        </Carousel>
      </CardContent>
    </Card>
  )
}
