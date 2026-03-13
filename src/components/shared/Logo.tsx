import { cn } from '@/lib/utils'

// Static import implementation to prevent path resolution errors across different nested routes (e.g., /ranking)
import logoImg from '/logo.png'

interface LogoProps {
  className?: string
}

export function Logo({ className }: LogoProps) {
  // Cache buster ensures the latest official high-fidelity Coroa de Louros file is loaded
  // completely replacing any previously cached versions or placeholders.
  const logoPath = `${logoImg}?v=coroa-oficial-2026`

  return (
    <div
      className={cn('relative flex items-center justify-center shrink-0', className)}
      title="Observador Certificado - ONSV"
    >
      <img
        src={logoPath}
        alt="Coroa de Louros Oficial"
        className="w-full h-full object-contain drop-shadow-md"
        loading="eager"
        fetchPriority="high"
      />
    </div>
  )
}
