import { DonutChart } from '@/components/shared/DonutChart'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import useGameStore from '@/stores/useGameStore'
import { ArrowRight, Trophy, Download, Clock } from 'lucide-react'
import { Link } from 'react-router-dom'
import useAuthStore from '@/stores/useAuthStore'

export function HeroProgress() {
  const { points, level } = useGameStore()
  const { user } = useAuthStore()

  const isProbationary = (() => {
    if (!user || (user.turma || 15) < 15 || !user.created) return false
    const createdDate = new Date(user.created.replace(' ', 'T'))
    const oneYearAgo = new Date()
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
    return createdDate > oneYearAgo
  })()

  const levelName =
    level === 3
      ? 'Nível III - Observador Certificado Mobilizador'
      : level === 2
        ? 'Nível II - Observador Certificado Pleno'
        : 'Nível I - Observador Certificado'

  const nextLevelPoints = level === 1 ? 500 : level === 2 ? 1000 : 1000
  const progressToNext = Math.min(100, Math.round((points / nextLevelPoints) * 100))

  const downloadCertificate = () => {
    if (!user || !user.is_active) return
    const date = new Date().toLocaleDateString('pt-BR')
    const userName = user.full_name || user.name || 'Observador'
    const win = window.open('', '_blank')
    if (!win) return
    win.document.write(`
      <html>
        <head>
          <title>Certificado - ${userName}</title>
          <style>
            @media print {
              @page { size: A4 landscape; margin: 0; }
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background: white; }
              .certificate {
                box-shadow: none !important;
                margin: 0 auto;
                page-break-inside: avoid;
                break-inside: avoid;
                width: 297mm;
                height: 210mm;
              }
            }
            body {
              margin: 0; padding: 0; display: flex; align-items: center; justify-content: center;
              height: 100vh; font-family: 'Arial', sans-serif; background: #f0f0f0;
            }
            .certificate {
              width: 297mm; height: 210mm; max-width: 100%; max-height: 100%; background: white; padding: 40px; box-sizing: border-box;
              border: 20px solid #059669; position: relative; text-align: center;
              box-shadow: 0 0 20px rgba(0,0,0,0.2);
            }
            .inner {
              border: 2px solid #059669; height: 100%; padding: 40px; box-sizing: border-box;
              display: flex; flex-direction: column; justify-content: center;
            }
            h1 { color: #059669; font-size: 50px; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 4px; }
            h2 { color: #333; font-size: 24px; margin-bottom: 40px; font-weight: normal; }
            .name { font-size: 48px; color: #111; border-bottom: 2px solid #ccc; display: inline-block; padding-bottom: 10px; margin-bottom: 30px; min-width: 600px; }
            .text { font-size: 20px; color: #555; max-width: 700px; margin: 0 auto 40px; line-height: 1.5; }
            .level { font-size: 32px; color: #059669; font-weight: bold; margin-bottom: 40px; }
            .footer { display: flex; justify-content: space-between; margin-top: auto; padding: 0 40px; }
            .signature { border-top: 1px solid #333; padding-top: 10px; width: 250px; font-size: 18px; color: #333; }
          </style>
        </head>
        <body>
          <div class="certificate">
            <div class="inner">
              <h1>Certificado de Reconhecimento</h1>
              <h2>Jornada de Evolução do Observador Certificado</h2>
              <p class="text">Certificamos que</p>
              <div class="name">${userName}</div>
              <p class="text">atingiu os requisitos necessários e obteve a titulação de</p>
              <div class="level">${levelName}</div>
              <div class="footer">
                <div class="signature">
                  <strong>Data de Emissão</strong><br/>
                  ${date}
                </div>
                <div class="signature">
                  <strong>Diretoria ONSV</strong><br/>
                  Observatório Nacional de Segurança Viária
                </div>
              </div>
            </div>
          </div>
          <script>
            window.onload = () => {
              setTimeout(() => { window.print(); window.close(); }, 500);
            }
          </script>
        </body>
      </html>
    `)
    win.document.close()
  }

  return (
    <Card className="bg-secondary text-secondary-foreground overflow-hidden relative border-none shadow-elevation">
      <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
        <Trophy size={200} />
      </div>
      <CardContent className="p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 relative z-10">
        <DonutChart
          progress={progressToNext}
          size={160}
          strokeWidth={12}
          className="text-primary-foreground drop-shadow-lg shrink-0"
        />
        <div className="space-y-4 text-center md:text-left flex-1 min-w-0">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight break-words">
            Maturidade:{' '}
            <span className="text-accent block mt-1 leading-tight text-2xl md:text-3xl lg:text-4xl">
              {levelName}
            </span>
          </h2>
          <div className="space-y-2">
            <p className="text-secondary-foreground/80 text-lg max-w-xl">
              Você possui{' '}
              <strong>
                {points} / {nextLevelPoints} pts
              </strong>{' '}
              de impacto institucional no nível atual. Faltam{' '}
              {Math.max(0, nextLevelPoints - points)} pontos para avançar.
            </p>
            {isProbationary && points >= nextLevelPoints && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 text-amber-700 dark:text-amber-500 rounded-md text-sm font-medium border border-amber-500/20">
                <Clock className="w-4 h-4" />
                No período probatório (1 ano). Seu nível será liberado ao fim do prazo.
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-4 mt-4 justify-center md:justify-start">
            <Button
              asChild
              variant="secondary"
              className="bg-background text-foreground hover:bg-background/90 font-bold h-11 px-6 shadow-sm"
            >
              <Link to="/niveis">
                Ver Missões e Evoluir <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
            <Button
              onClick={downloadCertificate}
              disabled={!user?.is_active}
              className="bg-primary hover:bg-primary/90 text-white font-bold h-11 px-6 shadow-sm disabled:opacity-50"
            >
              <Download className="mr-2 w-4 h-4" /> Baixar Certificado
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
