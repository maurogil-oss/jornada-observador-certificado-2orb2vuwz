import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
}

export function Logo({ className }: LogoProps) {
  return (
    <div
      className={cn('relative flex items-center justify-center shrink-0', className)}
      title="Observador Certificado - ONSV"
    >
      <img
        src="/logo.png"
        alt="Logo Observador Certificado"
        className="w-full h-full object-contain drop-shadow-md"
        loading="eager"
        fetchPriority="high"
      />
    </div>
  )
}
