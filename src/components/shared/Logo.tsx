import { cn } from '@/lib/utils'
import { useState } from 'react'

interface LogoProps {
  className?: string
}

export function Logo({ className }: LogoProps) {
  const [imgError, setImgError] = useState(false)

  return (
    <div className={cn('relative flex items-center justify-center shrink-0', className)}>
      {!imgError ? (
        <img
          src="/logo.png"
          alt="Observador Certificado Logo"
          className="w-full h-full object-contain"
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-amber-50 rounded-full border-2 border-amber-500 text-amber-700 font-bold text-[8px] sm:text-[10px] text-center p-1 leading-tight shadow-sm aspect-square">
          ONSV
        </div>
      )}
    </div>
  )
}
