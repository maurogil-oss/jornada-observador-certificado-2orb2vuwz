import { cn } from '@/lib/utils'
import logoImg from '/logo.png'

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
        src={logoImg}
        alt="Coroa de Louros Oficial"
        className="w-full h-full object-contain"
        loading="eager"
        fetchPriority="high"
      />
    </div>
  )
}
