import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
}

export function Logo({ className }: LogoProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('shrink-0', className)}
    >
      <path
        d="M50 5 L10 25 V50 C10 75 30 90 50 95 C70 90 90 75 90 50 V25 Z"
        fill="currentColor"
        className="text-amber-500"
      />
      <path d="M50 15 L20 32 V50 C20 70 35 82 50 85 C65 82 80 70 80 50 V32 Z" fill="#ffffff" />
      <path
        d="M40 55 L48 63 L65 40"
        stroke="currentColor"
        stroke-width="8"
        stroke-linecap="round"
        stroke-linejoin="round"
        fill="none"
        className="text-emerald-600"
      />
    </svg>
  )
}
