import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/hooks/use-toast'
import { UploadCloud, FileSpreadsheet, CheckCircle2, AlertTriangle } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'

interface Props {
  isOpen: boolean
  onClose: () => void
}

interface ImportError {
  row: number
  reason: string
}

interface ImportLog {
  success: number
  errors: ImportError[]
}

export function ImportSpreadsheetDialog({ isOpen, onClose }: Props) {
  const { toast } = useToast()
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [importLog, setImportLog] = useState<ImportLog | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0])
      setImportLog(null)
    }
  }

  const handleUpload = () => {
    if (!selectedFile) return
    setIsUploading(true)
    setProgress(0)

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setTimeout(() => {
            setIsUploading(false)
            // Mock Validation Log Result
            setImportLog({
              success: 795,
              errors: [
                { row: 14, reason: 'E-mail não encontrado na base de dados.' },
                { row: 238, reason: 'Pontuação Nível III excede o limite estabelecido (Máx 600).' },
                { row: 502, reason: 'Formato numérico inválido na coluna "Pontos Nível I".' },
              ],
            })
            // Email Notification Mock
            toast({
              title: 'Notificações Automáticas Enviadas',
              description: 'E-mails enviados aos 795 observadores com seus novos status.',
            })
          }, 500)
          return 100
        }
        return prev + 15
      })
    }, 300)
  }

  const handleClose = () => {
    if (isUploading) return
    setSelectedFile(null)
    setImportLog(null)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-amber-600" />
            Importar Planilha de Observadores
          </DialogTitle>
          <DialogDescription className="mt-2">
            Faça o upload do arquivo contendo as pontuações e status dos Níveis I, II e III para
            atualização em massa.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {!isUploading && !selectedFile && !importLog && (
            <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer bg-muted/20 hover:bg-muted/40 transition-all border-muted-foreground/30 hover:border-amber-500/50 group">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <UploadCloud className="w-12 h-12 mb-3 text-muted-foreground group-hover:text-amber-600 transition-colors" />
                <p className="mb-2 text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">Clique para selecionar</span> ou
                  arraste o arquivo
                </p>
                <p className="text-xs text-muted-foreground/80">CSV, XLSX ou XLS</p>
              </div>
              <input
                type="file"
                className="hidden"
                accept=".csv, .xlsx, .xls"
                onChange={handleFileChange}
              />
            </label>
          )}

          {isUploading && (
            <div className="space-y-4 py-6">
              <div className="flex justify-between text-sm">
                <span className="font-semibold text-foreground">Processando e Validando...</span>
                <span className="text-muted-foreground">{progress}%</span>
              </div>
              <Progress value={progress} className="h-3 [&>div]:bg-amber-600" />
            </div>
          )}

          {selectedFile && !isUploading && !importLog && (
            <div className="flex items-center gap-4 p-4 border border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800 rounded-lg">
              <FileSpreadsheet className="w-8 h-8 text-amber-600" />
              <div className="flex-1 overflow-hidden">
                <p className="font-semibold truncate">{selectedFile.name}</p>
                <p className="text-xs text-muted-foreground">Pronto para processamento</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedFile(null)}>
                Trocar
              </Button>
            </div>
          )}

          {importLog && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center gap-4 p-4 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-400 rounded-lg border border-emerald-200 dark:border-emerald-900/50">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-500 shrink-0" />
                <div>
                  <p className="font-bold">Importação Concluída</p>
                  <p className="text-sm">{importLog.success} registros validados e atualizados.</p>
                </div>
              </div>

              {importLog.errors.length > 0 && (
                <div className="border border-red-200 dark:border-red-900/50 rounded-lg overflow-hidden">
                  <div className="bg-red-50 dark:bg-red-950/30 p-3 border-b border-red-200 dark:border-red-900/50 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-500" />
                    <span className="font-semibold text-red-900 dark:text-red-400 text-sm">
                      Atenção: {importLog.errors.length} erros encontrados
                    </span>
                  </div>
                  <ScrollArea className="h-32 bg-background">
                    <ul className="divide-y divide-border/50 text-sm">
                      {importLog.errors.map((err, idx) => (
                        <li key={idx} className="p-3 flex gap-3 items-start">
                          <span className="font-mono text-xs text-muted-foreground shrink-0 mt-0.5">
                            Linha {err.row}
                          </span>
                          <span className="text-foreground">{err.reason}</span>
                        </li>
                      ))}
                    </ul>
                  </ScrollArea>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          {!importLog ? (
            <>
              <Button variant="outline" onClick={handleClose} disabled={isUploading}>
                Cancelar
              </Button>
              <Button
                onClick={handleUpload}
                disabled={!selectedFile || isUploading}
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                {isUploading ? 'Validando...' : 'Iniciar Importação'}
              </Button>
            </>
          ) : (
            <Button onClick={handleClose} className="w-full sm:w-auto">
              Concluir
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
