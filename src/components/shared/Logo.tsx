import { cn } from '@/lib/utils'
import { useState, useEffect } from 'react'

interface LogoProps {
  className?: string
}

export function Logo({ className }: LogoProps) {
  const [imgStatus, setImgStatus] = useState<'loading' | 'error' | 'loaded'>('loading')

  useEffect(() => {
    // Attempt to load the official "Coroa de Louros" image asset.
    const img = new Image()
    img.src = '/coroa-de-louros.png'
    img.onload = () => setImgStatus('loaded')
    img.onerror = () => setImgStatus('error')
  }, [])

  return (
    <div
      className={cn('relative flex items-center justify-center shrink-0', className)}
      title="Coroa de Louros - ONSV"
    >
      {imgStatus === 'loaded' ? (
        <img
          src="/coroa-de-louros.png"
          alt="Coroa de Louros - Observador Certificado"
          className="w-full h-full object-contain drop-shadow-md animate-in fade-in duration-300"
        />
      ) : (
        /* Instant vector fallback to guarantee zero rendering delays or broken image icons */
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 120 120"
          className="w-full h-full object-contain drop-shadow-md text-amber-500 dark:text-amber-400"
          fill="none"
          stroke="currentColor"
          stroke-width="3"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          {/* Ramos Principais */}
          <path d="M 60 105 C 25 105 15 65 20 35 C 25 15 45 10 55 15" stroke-width="4" />
          <path d="M 60 105 C 95 105 105 65 100 35 C 95 15 75 10 65 15" stroke-width="4" />

          {/* Folhas da Esquerda */}
          <g fill="currentColor">
            <path d="M 20 35 C 10 30 10 15 20 10 C 35 10 40 25 20 35 Z" />
            <path d="M 18 55 C 5 50 5 35 18 30 C 32 35 32 50 18 55 Z" />
            <path d="M 22 75 C 10 70 10 55 25 50 C 38 55 38 70 22 75 Z" />
            <path d="M 35 95 C 20 90 20 75 35 70 C 48 75 48 90 35 95 Z" />
            <path d="M 50 105 C 40 100 40 85 50 80 C 60 85 60 100 50 105 Z" />
          </g>

          {/* Folhas da Direita */}
          <g fill="currentColor">
            <path d="M 100 35 C 110 30 110 15 100 10 C 85 10 80 25 100 35 Z" />
            <path d="M 102 55 C 115 50 115 35 102 30 C 88 35 88 50 102 55 Z" />
            <path d="M 98 75 C 110 70 110 55 95 50 C 82 55 82 70 98 75 Z" />
            <path d="M 85 95 C 100 90 100 75 85 70 C 72 75 72 90 85 95 Z" />
            <path d="M 70 105 C 80 100 80 85 70 80 C 60 85 60 100 70 105 Z" />
          </g>

          {/* Estrela de Liderança Central */}
          <polygon
            points="60,40 66,52 80,52 69,60 73,73 60,65 47,73 51,60 40,52 54,52"
            fill="currentColor"
            stroke="none"
          />
        </svg>
      )}
    </div>
  )
}
