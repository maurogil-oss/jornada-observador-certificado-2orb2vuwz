import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/hooks/use-toast'
import {
  UploadCloud,
  FileSpreadsheet,
  Loader2,
  Download,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react'
import { generateCertificateDataUrl } from '@/lib/certificate'
import { generateZip } from '@/lib/zip'

interface CertificateRow {
  nome: string
  nivel: string
}

export function BatchCertificateGenerator() {
  const { toast } = useToast()
  const [file, setFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState<{ success: number; errors: string[] } | null>(null)
  const [zipBlob, setZipBlob] = useState<Blob | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
      setResults(null)
      setZipBlob(null)
      setProgress(0)
    }
  }

  const parseCSV = (text: string): Record<string, string>[] => {
    const sep =
      (text.split('\n')[0].match(/;/g) || []).length >
      (text.split('\n')[0].match(/,/g) || []).length
        ? ';'
        : ','
    const lines: string[][] = []
    let row: string[] = []
    let inQuotes = false
    let val = ''

    for (let i = 0; i < text.length; i++) {
      const char = text[i]
      if (inQuotes) {
        if (char === '"' && text[i + 1] === '"') {
          val += '"'
          i++
        } else if (char === '"') inQuotes = false
        else val += char
      } else {
        if (char === '"') inQuotes = true
        else if (char === sep) {
          row.push(val.trim())
          val = ''
        } else if (char === '\n' || char === '\r') {
          row.push(val.trim())
          if (row.some((r) => r !== '')) lines.push(row)
          row = []
          val = ''
          if (char === '\r' && text[i + 1] === '\n') i++
        } else val += char
      }
    }
    row.push(val.trim())
    if (row.some((r) => r !== '')) lines.push(row)

    if (lines.length < 2) return []

    const headers = lines[0].map((h) =>
      h
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]/g, ''),
    )
    return lines.slice(1).map((r) => {
      const obj: Record<string, string> = {}
      headers.forEach((h, idx) => {
        obj[h] = r[idx] || ''
      })
      return obj
    })
  }

  const dataUrlToUint8Array = (dataUrl: string): Uint8Array => {
    const base64 = dataUrl.split(',')[1]
    const binary_string = window.atob(base64)
    const len = binary_string.length
    const bytes = new Uint8Array(len)
    for (let i = 0; i < len; i++) bytes[i] = binary_string.charCodeAt(i)
    return bytes
  }

  const processBatch = async () => {
    if (!file) return
    if (file.name.endsWith('.xlsx')) {
      toast({
        title: 'Aviso',
        description:
          'A leitura direta de XLSX não é suportada sem processamento no servidor. Por favor, salve a planilha como CSV (Separado por vírgulas) no Excel e tente novamente.',
        variant: 'destructive',
      })
      return
    }

    setIsProcessing(true)
    setProgress(0)
    const reader = new FileReader()

    reader.onload = async (e) => {
      const text = e.target?.result as string
      const parsed = parseCSV(text)

      const nomeKey = Object.keys(parsed[0] || {}).find((k) => k.includes('nome'))
      const nivelKey = Object.keys(parsed[0] || {}).find(
        (k) => k.includes('nvel') || k.includes('nivel'),
      )

      if (!nomeKey || !nivelKey) {
        toast({
          title: 'Erro de Formato',
          description: 'A planilha deve conter as colunas "Nome" e "Nível".',
          variant: 'destructive',
        })
        setIsProcessing(false)
        return
      }

      const rows: CertificateRow[] = parsed
        .filter((r) => r[nomeKey] && r[nivelKey])
        .map((r) => ({ nome: r[nomeKey], nivel: r[nivelKey] }))

      const generatedFiles: { name: string; buffer: Uint8Array }[] = []
      const errors: string[] = []
      let successCount = 0

      for (let i = 0; i < rows.length; i++) {
        try {
          const row = rows[i]
          const dataUrl = await generateCertificateDataUrl(row.nivel, row.nome, 90)
          const buffer = dataUrlToUint8Array(dataUrl)
          const safeName = row.nome.replace(/[^a-z0-9]/gi, '_')
          const safeLevel = row.nivel.replace(/[^a-z0-9]/gi, '_')
          generatedFiles.push({ name: `${safeName}_${safeLevel}.png`, buffer })
          successCount++
        } catch (err: any) {
          errors.push(`Linha ${i + 2} (${rows[i].nome}): ${err.message || 'Erro desconhecido'}`)
        }
        setProgress(Math.round(((i + 1) / rows.length) * 100))
      }

      if (generatedFiles.length > 0) {
        const zip = generateZip(generatedFiles)
        setZipBlob(zip)
      }

      setResults({ success: successCount, errors })
      setIsProcessing(false)
    }

    reader.onerror = () => {
      toast({ title: 'Erro', description: 'Falha ao ler o arquivo.', variant: 'destructive' })
      setIsProcessing(false)
    }

    reader.readAsText(file, 'UTF-8')
  }

  const downloadZip = () => {
    if (!zipBlob) return
    const url = URL.createObjectURL(zipBlob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'certificados_em_lote.zip'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <Card className="animate-fade-in-up">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-primary" />
          Gerador em Lote de Certificados
        </CardTitle>
        <CardDescription>
          Envie uma planilha com as colunas <strong>Nome</strong> e <strong>Nível</strong> para
          gerar certificados em massa e baixar um arquivo ZIP contendo as imagens em alta resolução.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!isProcessing && !results && (
          <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer bg-muted/20 hover:bg-muted/40 transition-all border-muted-foreground/30 hover:border-primary/50 group">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <UploadCloud className="w-12 h-12 mb-3 text-muted-foreground group-hover:text-primary transition-colors" />
              <p className="mb-2 text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">Clique para selecionar</span> ou
                arraste o arquivo
              </p>
              <p className="text-xs text-muted-foreground/80">Arquivos CSV (UTF-8) e XLSX</p>
            </div>
            <input type="file" className="hidden" accept=".csv,.xlsx" onChange={handleFileChange} />
          </label>
        )}

        {file && !isProcessing && !results && (
          <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/10">
            <FileSpreadsheet className="w-8 h-8 text-primary" />
            <div className="flex-1 overflow-hidden">
              <p className="font-semibold truncate">{file.name}</p>
              <p className="text-xs text-muted-foreground">Pronto para processamento</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setFile(null)}>
              Trocar
            </Button>
            <Button onClick={processBatch}>Gerar Certificados</Button>
          </div>
        )}

        {isProcessing && (
          <div className="space-y-4 py-6">
            <div className="flex justify-between text-sm">
              <span className="font-semibold flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Gerando imagens...
              </span>
              <span className="text-muted-foreground">{progress}%</span>
            </div>
            <Progress value={progress} className="h-3" />
          </div>
        )}

        {results && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between p-4 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-400 rounded-lg border border-emerald-200 dark:border-emerald-900/50">
              <div className="flex items-center gap-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-500 shrink-0" />
                <div>
                  <p className="font-bold">Processamento Concluído</p>
                  <p className="text-sm">{results.success} certificados gerados com sucesso.</p>
                </div>
              </div>
              {zipBlob && (
                <Button
                  onClick={downloadZip}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Baixar ZIP
                </Button>
              )}
            </div>

            {results.errors.length > 0 && (
              <div className="border border-red-200 dark:border-red-900/50 rounded-lg overflow-hidden">
                <div className="bg-red-50 dark:bg-red-950/30 p-3 border-b border-red-200 dark:border-red-900/50 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-500" />
                  <span className="font-semibold text-red-900 dark:text-red-400 text-sm">
                    Atenção: {results.errors.length} erros encontrados
                  </span>
                </div>
                <div className="max-h-32 overflow-auto bg-background p-3 text-sm">
                  <ul className="space-y-1">
                    {results.errors.map((err, idx) => (
                      <li key={idx} className="text-foreground">
                        {err}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setFile(null)
                  setResults(null)
                  setZipBlob(null)
                }}
              >
                Processar Nova Planilha
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
