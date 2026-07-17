import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, User } from 'lucide-react'
import type { Forum } from '@/services/forums'

const statusConfig: Record<string, string> = {
  Aberto: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  'Em Consolidação': 'bg-amber-100 text-amber-700 border-amber-200',
  Encerrado: 'bg-gray-100 text-gray-700 border-gray-200',
}

const formatDate = (d: string) => {
  if (!d) return '-'
  try {
    return new Date(d).toLocaleDateString('pt-BR')
  } catch {
    return '-'
  }
}

export function ForumCard({ forum }: { forum: Forum }) {
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
          <CardTitle className="text-base mt-2 line-clamp-2">{forum.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {forum.objective && (
            <p className="text-xs text-muted-foreground line-clamp-2">{forum.objective}</p>
          )}
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
