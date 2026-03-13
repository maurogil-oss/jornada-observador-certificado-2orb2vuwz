import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
}

export function Logo({ className }: LogoProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('shrink-0', className)}
    >
      {/* Base/Arch of the crown */}
      <path
        d="M15 80 Q 50 95 85 80 L 80 70 L 20 70 Z"
        fill="currentColor"
        className="text-amber-600 dark:text-amber-700"
      />
      {/* Bottom rim */}
      <rect
        x="22"
        y="74"
        width="56"
        height="5"
        rx="2.5"
        fill="currentColor"
        className="text-amber-800/40"
      />

      {/* Main Crown Body with 5 points */}
      <path
        d="M10 70 L 5 30 L 28 50 L 50 15 L 72 50 L 95 30 L 90 70 Z"
        fill="currentColor"
        className="text-amber-500"
      />
      {/* 3D shading/inner details */}
      <path
        d="M50 15 L 28 50 L 50 70 L 72 50 Z"
        fill="currentColor"
        className="text-amber-400 opacity-70"
      />

      {/* Jewels on peaks */}
      <circle
        cx="5"
        cy="25"
        r="5"
        fill="currentColor"
        className="text-emerald-600 dark:text-emerald-500"
      />
      <circle
        cx="28"
        cy="45"
        r="4"
        fill="currentColor"
        className="text-emerald-600 dark:text-emerald-500"
      />
      <circle
        cx="50"
        cy="10"
        r="6"
        fill="currentColor"
        className="text-emerald-600 dark:text-emerald-500"
      />
      <circle
        cx="72"
        cy="45"
        r="4"
        fill="currentColor"
        className="text-emerald-600 dark:text-emerald-500"
      />
      <circle
        cx="95"
        cy="25"
        r="5"
        fill="currentColor"
        className="text-emerald-600 dark:text-emerald-500"
      />
    </svg>
  )
}
