import { cn } from '@/lib/utils'

interface DonutChartProps {
  progress: number
  size?: number
  strokeWidth?: number
  className?: string
}

export function DonutChart({ progress, size = 120, strokeWidth = 10, className }: DonutChartProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (progress / 100) * circumference

  return (
    <div
      className={cn('relative inline-flex items-center justify-center', className)}
      style={{ width: size, height: size }}
    >
      <svg className="transform -rotate-90 w-full h-full">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          stroke-width={strokeWidth}
          fill="transparent"
          className="text-muted/30"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          stroke-width={strokeWidth}
          fill="transparent"
          className="text-primary transition-all duration-1000 ease-out"
          stroke-dasharray={circumference}
          stroke-dashoffset={offset}
          stroke-linecap="round"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-3xl font-black">{progress}%</span>
      </div>
    </div>
  )
}
