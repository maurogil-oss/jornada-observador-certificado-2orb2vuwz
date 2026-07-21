import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Calendar, Target, Flag } from 'lucide-react'
import pb from '@/lib/pocketbase/client'
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

export function ForumHeader({ forum }: { forum: Forum }) {
  const relator = forum.expand?.relator_id
  const relatorName = relator?.name || relator?.email?.split('@')[0] || 'N/A'
  const avatarUrl = relator?.avatar ? pb.files.getUrl(relator, relator.avatar) : ''

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm font-mono font-bold text-primary bg-primary/5 px-3 py-1 rounded">
              {forum.code}
            </span>
            <Badge variant="outline" className={statusConfig[forum.status] || ''}>
              {forum.status}
            </Badge>
            {forum.pilar_pnatrans && forum.pilar_pnatrans !== 'Não Definido' && (
              <Badge variant="outline" className={pilarConfig[forum.pilar_pnatrans] || ''}>
                {forum.pilar_pnatrans}
              </Badge>
            )}
            {forum.expand?.theme_tags?.map((tag) => (
              <Badge key={tag.id} variant="secondary" className="text-xs">
                {tag.name}
              </Badge>
            ))}
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{forum.title}</h1>
        </div>
        {forum.objective && (
          <div className="flex items-start gap-2 text-sm">
            <Target className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
            <p className="text-muted-foreground">{forum.objective}</p>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              {avatarUrl && <AvatarImage src={avatarUrl} alt={relatorName} />}
              <AvatarFallback className="text-xs">
                {relatorName.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-xs text-muted-foreground">Relator</p>
              <p className="text-sm font-medium">{relatorName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Abertura</p>
              <p className="text-sm font-medium">{formatDate(forum.opening_date)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Flag className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Encerramento</p>
              <p className="text-sm font-medium">{formatDate(forum.closing_date)}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
