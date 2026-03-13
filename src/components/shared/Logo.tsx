import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
}

export function Logo({ className }: LogoProps) {
  return (
    <div
      className={cn('relative flex items-center justify-center shrink-0 aspect-square', className)}
      title="Observador Certificado - ONSV"
    >
      <img
        src="/logo.png"
        alt="Coroa de Louros Oficial"
        className="w-full h-full object-contain"
        loading="eager"
        fetchPriority="high"
      />
    </div>
  )
}
