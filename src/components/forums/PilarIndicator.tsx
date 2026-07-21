import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

const PILAR_COLORS: Record<string, string> = {
  'Pilar 1: Gestão da Segurança no Trânsito': 'bg-pink-100 text-pink-800 border-pink-200',
  'Pilar 2: Vias Seguras': 'bg-emerald-100 text-emerald-800 border-emerald-200',
  'Pilar 3: Segurança Veicular': 'bg-amber-100 text-amber-800 border-amber-200',
  'Pilar 4: Educação para o Trânsito': 'bg-cyan-100 text-cyan-800 border-cyan-200',
  'Pilar 5: Atendimento às Vítimas': 'bg-red-100 text-red-800 border-red-200',
  'Pilar 6: Normatização e Fiscalização': 'bg-purple-100 text-purple-800 border-purple-200',
  'Não Definido': 'bg-gray-100 text-gray-500 border-gray-200',
}

function getPilarNumber(pilar: string): string {
  if (!pilar || pilar === 'Não Definido') return '?'
  const match = pilar.match(/Pilar\s+(\d+)/)
  return match ? match[1] : '?'
}

export function PilarIndicator({ pilar }: { pilar: string }) {
  const colorClass = PILAR_COLORS[pilar] || PILAR_COLORS['Não Definido']
  const number = getPilarNumber(pilar)
  const label = pilar || 'Não Definido'

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={`inline-flex items-center justify-center w-7 h-7 rounded-full border text-xs font-bold cursor-default ${colorClass}`}
          >
            {number}
          </span>
        </TooltipTrigger>
        <TooltipContent sideOffset={4}>
          <p className="text-xs font-medium">{label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
