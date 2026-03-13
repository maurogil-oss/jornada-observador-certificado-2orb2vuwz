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
import { UploadCloud, FileSpreadsheet } from 'lucide-react'

interface Props {
  isOpen: boolean
  onClose: () => void
}

export function ImportSpreadsheetDialog({ isOpen, onClose }: Props) {
  const { toast } = useToast()
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0])
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
            toast({
              title: 'Importação Concluída',
              description: 'Os dados de ~800 observadores foram atualizados com sucesso.',
            })
            onClose()
            setSelectedFile(null)
          }, 500)
          return 100
        }
        return prev + 15
      })
    }, 400)
  }

  const handleClose = () => {
    if (isUploading) return
    setSelectedFile(null)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-amber-600" />
            Importar Planilha de Observadores
          </DialogTitle>
          <DialogDescription className="mt-2">
            Faça o upload do arquivo contendo as pontuações e status dos Eixos I, II e III para os
            ~800 observadores.
          </DialogDescription>
        </DialogHeader>

        <div className="py-6">
          {!isUploading && !selectedFile ? (
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
          ) : isUploading ? (
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="font-semibold text-foreground">Processando dados...</span>
                <span className="text-muted-foreground">{progress}%</span>
              </div>
              <Progress value={progress} className="h-3 [&>div]:bg-amber-600" />
              <p className="text-xs text-muted-foreground text-center animate-pulse">
                Sincronizando Matriz Evolutiva e Eixos...
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-4 p-4 border border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800 rounded-lg">
              <FileSpreadsheet className="w-8 h-8 text-amber-600" />
              <div className="flex-1 overflow-hidden">
                <p className="font-semibold truncate">{selectedFile?.name}</p>
                <p className="text-xs text-muted-foreground">Pronto para importação</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedFile(null)}>
                Trocar
              </Button>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isUploading}>
            Cancelar
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
            className="bg-amber-600 hover:bg-amber-700 text-white"
          >
            {isUploading ? 'Importando...' : 'Iniciar Importação'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
