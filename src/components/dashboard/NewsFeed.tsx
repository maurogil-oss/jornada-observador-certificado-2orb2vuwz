import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Bell } from 'lucide-react'

const newsFeedData = [
  {
    id: 1,
    title: 'Novas Diretrizes de Submissão 2026',
    date: '10/03/2026',
    content:
      'Atualizamos o playbook do Nível II. Projetos locais agora contam com avaliação acelerada e bônus de pontuação.',
  },
  {
    id: 2,
    title: 'Webinar: Como alcançar o Nível III - Mobilizador',
    date: '08/03/2026',
    content:
      'Participe do nosso encontro na próxima terça-feira e descubra as melhores estratégias de impacto institucional.',
  },
  {
    id: 3,
    title: 'Ranking Atualizado - Março',
    date: '01/03/2026',
    content:
      'Confira os destaques do mês no Mural. A competição saudável fomenta a excelência técnica na nossa rede.',
  },
]

export function NewsFeed() {
  return (
    <Card className="shadow-subtle border-border/60">
      <CardHeader className="pb-3 border-b border-border/30">
        <CardTitle className="text-lg flex items-center gap-2">
          <Bell className="w-5 h-5 text-amber-500" /> Comunicados ONSV
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-5">
        {newsFeedData.map((news) => (
          <div key={news.id} className="space-y-1 group">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 sm:gap-4">
              <h4 className="font-bold text-sm leading-tight text-foreground group-hover:text-primary transition-colors">
                <span>{news.title}</span>
              </h4>
              <span className="text-[11px] font-semibold text-muted-foreground whitespace-nowrap bg-muted px-2 py-0.5 rounded-full">
                {news.date}
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              <span>{news.content}</span>
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
