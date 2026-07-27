import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, MessageSquare, User } from 'lucide-react'
import type { Forum } from '@/services/forums'

const statusConfig: Record<string, string> = {
  Abertura: 'bg-blue-100 text-blue-700 border-blue-200',
  Discussões: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  Consolidação: 'bg-amber-100 text-amber-700 border-amber-200',
  Aprovação: 'bg-purple-100 text-purple-700 border-purple-200',
  Publicação: 'bg-gray-100 text-gray-700 border-gray-200',
}

const pilarConfig: Record<string, string> = {
  'Pilar 1: Gestão da Segurança no Trânsito': 'bg-pink-100 text-pink-800 border-pink-200',
  'Pilar 2: Vias Seguras': 'bg-emerald-100 text-emerald-800 border-emerald-200',
  'Pilar 3: Segurança Veicular': 'bg-amber-100 text-amber-800 border-amber-200',
  'Pilar 4: Educação para o Trânsito': 'bg-cyan-100 text-cyan-800 border-cyan-200',
  'Pilar 5: Atendimento às Vítimas': 'bg-red-100 text-red-800 border-red-200',
  'Pilar 6: Normatização e Fiscalização': 'bg-purple-100 text-purple-800 border-purple-200',
  'Não Definido': 'bg-gray-100 text-gray-800 border-gray-200',
}

const formatDate = (d: string) => {
  if (!d) return '-'
  const datePart = d.substring(0, 10)
  if (!datePart) return '-'
  const [year, month, day] = datePart.split('-')
  if (!year || !month || !day) return '-'
  return `${day}/${month}/${year}`
}

export function ForumCard({ forum, messageCount = 0 }: { forum: Forum; messageCount?: number }) {
  const relator = forum.expand?.relator_id
  const relatorName = relator?.name || relator?.email?.split('@')[0] || 'N/A'

  return (
    <Link to={`/foruns/${forum.id}`}>
      <Card className="hover:shadow-md transition-shadow h-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-mono font-bold text-primary bg-primary/5 px-2 py-1 rounded">
              {forum.code}
            </span>
            <Badge variant="outline" className={`text-xs ${statusConfig[forum.status] || ''}`}>
              {forum.status}
            </Badge>
          </div>
          <div className="flex flex-wrap gap-1 mt-3">
            {forum.pilar_pnatrans && forum.pilar_pnatrans !== 'Não Definido' && (
              <Badge
                variant="outline"
                className={`text-[10px] ${pilarConfig[forum.pilar_pnatrans] || ''}`}
              >
                {forum.pilar_pnatrans.split(':')[0]}
              </Badge>
            )}
            {forum.expand?.theme_tags?.slice(0, 2).map((tag) => (
              <Badge key={tag.id} variant="secondary" className="text-[10px]">
                {tag.name}
              </Badge>
            ))}
            {(forum.expand?.theme_tags?.length || 0) > 2 && (
              <Badge variant="secondary" className="text-[10px]">
                +{(forum.expand?.theme_tags?.length || 0) - 2}
              </Badge>
            )}
          </div>
          <CardTitle className="text-base mt-2 line-clamp-2">{forum.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {forum.objective && (
            <p className="text-xs text-muted-foreground line-clamp-2">{forum.objective}</p>
          )}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <MessageSquare className="w-3 h-3" /> Discussões:{' '}
              <span className="font-bold text-primary">{messageCount}</span>
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <User className="w-3 h-3" /> <span>Relator: {relatorName}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="w-3 h-3" />
            <span>
              {formatDate(forum.opening_date)} — {formatDate(forum.closing_date)}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
