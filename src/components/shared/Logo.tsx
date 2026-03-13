import { cn } from '@/lib/utils'
import { useState, useEffect } from 'react'

interface LogoProps {
  className?: string
}

export function Logo({ className }: LogoProps) {
  const [hasError, setHasError] = useState(false)

  // Ensure the base URL is respected for production builds to prevent broken links.
  // If Vite base is set to './', we force it to '/' to prevent relative path issues
  // on nested client-side routes like /ranking.
  const rawBase = import.meta.env.BASE_URL || '/'
  const resolvedBase = rawBase === './' ? '/' : rawBase
  const safeBase = resolvedBase.replace(/\/$/, '')

  // Cache buster ensures the latest official Coroa de Louros file is loaded
  // over any previously cached "similar" SVG or placeholder versions.
  const logoPath = `${safeBase}/logo.png?v=coroa-oficial-2026`

  useEffect(() => {
    setHasError(false)
  }, [logoPath])

  return (
    <div
      className={cn('relative flex items-center justify-center shrink-0', className)}
      title="Observador Certificado - ONSV"
    >
      {!hasError && (
        <img
          src={logoPath}
          alt="Coroa de Louros Oficial"
          className="w-full h-full object-contain drop-shadow-md"
          loading="eager"
          fetchPriority="high"
          // Prevent broken image icon or alt text from showing if the file is momentarily unavailable
          onError={() => setHasError(true)}
        />
      )}
    </div>
  )
}
