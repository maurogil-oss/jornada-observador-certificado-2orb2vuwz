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
      {/*
        Official Laurel Crown Logo ("Coroa de Louros")
        Fully vectorized to ensure zero rendering delays, fix broken image links,
        and maintain perfect responsive scaling across all devices and pages.
      */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 500 500"
        className="w-full h-full object-contain drop-shadow-md text-amber-500 dark:text-amber-400"
        fill="none"
      >
        <g fill="currentColor" stroke="currentColor">
          {/* Left Branch */}
          <path
            d="M250,470 C100,470 40,320 60,170 C70,120 100,70 150,40"
            fill="none"
            strokeWidth="10"
            strokeLinecap="round"
          />
          {/* Right Branch */}
          <path
            d="M250,470 C400,470 460,320 440,170 C430,120 400,70 350,40"
            fill="none"
            strokeWidth="10"
            strokeLinecap="round"
          />

          {/* Leaves Left */}
          <path d="M60,170 Q40,150 50,130 Q70,140 60,170 Z" stroke="none" />
          <path d="M45,230 Q20,210 30,180 Q55,200 45,230 Z" stroke="none" />
          <path d="M45,290 Q20,280 35,240 Q65,260 45,290 Z" stroke="none" />
          <path d="M65,350 Q40,340 60,300 Q90,320 65,350 Z" stroke="none" />
          <path d="M105,410 Q80,410 105,370 Q135,390 105,410 Z" stroke="none" />
          <path d="M165,455 Q140,465 170,430 Q195,445 165,455 Z" stroke="none" />

          {/* Leaves Left Inside */}
          <path d="M75,150 Q100,140 105,115 Q80,125 75,150 Z" stroke="none" />
          <path d="M65,210 Q95,205 105,175 Q75,185 65,210 Z" stroke="none" />
          <path d="M70,270 Q105,270 120,240 Q85,245 70,270 Z" stroke="none" />
          <path d="M95,330 Q135,335 150,305 Q115,305 95,330 Z" stroke="none" />
          <path d="M140,385 Q180,395 195,365 Q155,360 140,385 Z" stroke="none" />

          {/* Leaves Right */}
          <path d="M440,170 Q460,150 450,130 Q430,140 440,170 Z" stroke="none" />
          <path d="M455,230 Q480,210 470,180 Q445,200 455,230 Z" stroke="none" />
          <path d="M455,290 Q480,280 465,240 Q435,260 455,290 Z" stroke="none" />
          <path d="M435,350 Q460,340 440,300 Q410,320 435,350 Z" stroke="none" />
          <path d="M395,410 Q420,410 395,370 Q365,390 395,410 Z" stroke="none" />
          <path d="M335,455 Q360,465 330,430 Q305,445 335,455 Z" stroke="none" />

          {/* Leaves Right Inside */}
          <path d="M425,150 Q400,140 395,115 Q420,125 425,150 Z" stroke="none" />
          <path d="M435,210 Q405,205 395,175 Q425,185 435,210 Z" stroke="none" />
          <path d="M430,270 Q395,270 380,240 Q415,245 430,270 Z" stroke="none" />
          <path d="M405,330 Q365,335 350,305 Q385,305 405,330 Z" stroke="none" />
          <path d="M360,385 Q320,395 305,365 Q345,360 360,385 Z" stroke="none" />

          {/* Wreath Tie at Bottom */}
          <path d="M230,460 L270,460 L260,490 L240,490 Z" stroke="none" />

          {/* Center Symbol (The "O" with an arc) */}
          <circle cx="250" cy="140" r="35" fill="none" strokeWidth="20" />
          <path d="M 195 90 Q 250 50 305 90" fill="none" strokeWidth="18" strokeLinecap="round" />

          {/* Text */}
          <text
            x="250"
            y="260"
            fontFamily="ui-sans-serif, system-ui, sans-serif"
            fontSize="60"
            fontWeight="900"
            textAnchor="middle"
            stroke="none"
            letterSpacing="1"
          >
            OBSERVADOR
          </text>
          <text
            x="250"
            y="325"
            fontFamily="ui-sans-serif, system-ui, sans-serif"
            fontSize="52"
            fontWeight="400"
            textAnchor="middle"
            stroke="none"
            letterSpacing="1"
          >
            CERTIFICADO
          </text>

          {/* Horizontal Line under CERTIFICADO */}
          <line x1="100" y1="350" x2="400" y2="350" strokeWidth="4" />
        </g>
      </svg>
    </div>
  )
}
