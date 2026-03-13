import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
}

export function Logo({ className }: LogoProps) {
  // Cache buster ensures the latest official high-fidelity Coroa de Louros file is loaded
  // completely replacing any previously cached versions or placeholders.
  const logoPath = '/logo.png?v=coroa-oficial-2026'

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
