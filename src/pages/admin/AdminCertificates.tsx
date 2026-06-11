import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  getCertificateTemplates,
  createCertificateTemplate,
  updateCertificateTemplate,
  deleteCertificateTemplate,
} from '@/services/certificates'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Trash2, Image as ImageIcon, Eye, Edit, AlertCircle } from 'lucide-react'
import pb from '@/lib/pocketbase/client'
import { normalizeString } from '@/lib/utils'

const EXPECTED_LEVELS = ['Nível I', 'Nível II', 'Nível III']

export default function AdminCertificates() {
  const { toast } = useToast()
  const [templates, setTemplates] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [level, setLevel] = useState<string>('Nível I')
  const [file, setFile] = useState<File | null>(null)
  const [x, setX] = useState<string>('500')
  const [y, setY] = useState<string>('400')
  const [fontSize, setFontSize] = useState<string>('48')
  const [color, setColor] = useState<string>('#000000')
  const [textAlign, setTextAlign] = useState<string>('center')

  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const loadTemplates = async () => {
    try {
      const data = await getCertificateTemplates()
      setTemplates(data)
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao carregar templates.', variant: 'destructive' })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadTemplates()
  }, [])

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
      return () => URL.revokeObjectURL(url)
    }
  }, [file])

  const handlePreview = () => {
    if (!previewUrl) {
      toast({
        title: 'Aviso',
        description: 'Selecione uma imagem de fundo ou edite um template existente.',
        variant: 'destructive',
      })
      return
    }
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)

      ctx.font = `bold ${fontSize}px sans-serif`
      ctx.fillStyle = color
      ctx.textAlign = textAlign as CanvasTextAlign
      ctx.textBaseline = 'middle'

      ctx.fillText('Nome Sobrenome', Number(x), Number(y))
    }
    img.src = previewUrl
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const existing = templates.find((t) => t.level === level)

    if (!existing && !file) {
      toast({
        title: 'Erro',
        description: 'Selecione uma imagem de fundo para o novo template.',
        variant: 'destructive',
      })
      return
    }

    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('level', level)
      if (file) {
        formData.append('file', file)
      }

      formData.append(
        'settings',
        JSON.stringify({
          positionX: Number(x),
          positionY: Number(y),
          x: Number(x),
          y: Number(y),
          fontSize: Number(fontSize),
          color: color,
          alignment: textAlign,
        }),
      )

      if (existing) {
        await updateCertificateTemplate(existing.id, formData)
        toast({ title: 'Sucesso', description: 'Template atualizado com sucesso.' })
      } else {
        await createCertificateTemplate(formData)
        toast({ title: 'Sucesso', description: 'Template salvo com sucesso.' })
      }

      setFile(null)
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d')
        if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
      }
      loadTemplates()
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao salvar template.', variant: 'destructive' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir este template?')) return
    try {
      await deleteCertificateTemplate(id)
      toast({ title: 'Sucesso', description: 'Template excluído.' })
      loadTemplates()
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao excluir template.', variant: 'destructive' })
    }
  }

  const handleEdit = (tpl: any) => {
    setLevel(tpl.level)
    const pos = tpl.settings?.name_position || tpl.settings || {}
    setX(
      String(pos.positionX ?? pos.x ?? tpl.settings?.name_x_position ?? tpl.settings?.x ?? '500'),
    )
    setY(
      String(pos.positionY ?? pos.y ?? tpl.settings?.name_y_position ?? tpl.settings?.y ?? '400'),
    )
    setFontSize(String(pos.fontSize ?? tpl.settings?.font_size ?? tpl.settings?.fontSize ?? '48'))
    setColor(pos.color ?? tpl.settings?.font_color ?? tpl.settings?.color ?? '#000000')
    setTextAlign(pos.alignment ?? tpl.settings?.text_align ?? tpl.settings?.alignment ?? 'center')

    setPreviewUrl(pb.files.getUrl(tpl, tpl.file))
    setFile(null)

    toast({
      title: 'Modo de Edição',
      description: 'Configurações carregadas. Ajuste os valores e clique em Salvar.',
    })

    setTimeout(() => {
      handlePreview()
    }, 100)
  }

  const missingLevels = EXPECTED_LEVELS.filter(
    (l) => !templates.some((t) => normalizeString(t.level) === normalizeString(l)),
  )

  const handleLevelChange = (newLevel: string) => {
    setLevel(newLevel)
    const existing = templates.find((t) => t.level === newLevel)
    if (existing) {
      handleEdit(existing)
    } else {
      setX('500')
      setY('400')
      setFontSize('48')
      setColor('#000000')
      setTextAlign('center')
      setPreviewUrl(null)
      setFile(null)
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d')
        if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
      }
    }
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Templates de Certificado</h2>
        <p className="text-muted-foreground">
          Gerencie as imagens de fundo e posicionamento do nome para cada nível.
        </p>
      </div>

      {!isLoading && missingLevels.length > 0 && (
        <div className="bg-destructive/15 text-destructive border-destructive/20 border p-4 rounded-lg flex items-start gap-3 animate-fade-in">
          <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-semibold mb-1">Templates Ausentes</h4>
            <p className="text-sm">
              Os seguintes níveis ainda não possuem templates configurados:{' '}
              <strong>{missingLevels.join(', ')}</strong>. Os usuários desses níveis não conseguirão
              gerar seus certificados.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Adicionar / Atualizar Template</CardTitle>
              <CardDescription>
                O novo template substituirá o existente para o mesmo nível.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Nível</Label>
                  <Select value={level} onValueChange={handleLevelChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o nível" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Nível I">Nível I</SelectItem>
                      <SelectItem value="Nível II">Nível II</SelectItem>
                      <SelectItem value="Nível III">Nível III</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Imagem de Fundo (JPG/PNG)</Label>
                  <Input
                    type="file"
                    accept="image/jpeg,image/png"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Deixe em branco para manter a imagem atual.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Posição X (px)</Label>
                    <Input
                      type="number"
                      step="any"
                      value={x}
                      onChange={(e) => setX(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Posição Y (px, do topo para baixo)</Label>
                    <Input
                      type="number"
                      step="any"
                      value={y}
                      onChange={(e) => setY(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Tamanho da Fonte (px)</Label>
                    <Input
                      type="number"
                      step="any"
                      value={fontSize}
                      onChange={(e) => setFontSize(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Cor do Texto</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        className="w-12 p-1 h-10"
                      />
                      <Input
                        type="text"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        className="flex-1"
                        pattern="^#[0-9A-Fa-f]{6}$"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Alinhamento</Label>
                    <Select value={textAlign} onValueChange={setTextAlign}>
                      <SelectTrigger>
                        <SelectValue placeholder="Alinhamento" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="left">Esquerda</SelectItem>
                        <SelectItem value="center">Centro</SelectItem>
                        <SelectItem value="right">Direita</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex gap-4 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={handlePreview}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Pré-visualizar
                  </Button>
                  <Button type="submit" className="flex-1" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <ImageIcon className="w-4 h-4 mr-2" />
                    )}
                    Salvar Template
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {previewUrl && (
            <Card>
              <CardHeader>
                <CardTitle>Pré-visualização</CardTitle>
                <CardDescription>
                  Assim o certificado será gerado. Ajuste os valores ou clique na imagem para
                  definir a posição do texto, e clique em "Pré-visualizar" para atualizar.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center overflow-auto bg-muted/30 p-4 rounded-b-lg">
                <canvas
                  ref={canvasRef}
                  className="max-w-full h-auto border shadow-sm bg-white cursor-crosshair"
                  onClick={(e) => {
                    const canvas = canvasRef.current
                    if (!canvas) return
                    const rect = canvas.getBoundingClientRect()
                    const scaleX = canvas.width / rect.width
                    const scaleY = canvas.height / rect.height
                    const clickX = (e.clientX - rect.left) * scaleX
                    const clickY = (e.clientY - rect.top) * scaleY
                    setX(Math.round(clickX).toString())
                    setY(Math.round(clickY).toString())
                    setTimeout(handlePreview, 50)
                  }}
                />
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Templates Ativos</h3>
          {isLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : templates.length === 0 ? (
            <Card className="bg-muted/50 border-dashed">
              <CardContent className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
                <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                <p>Nenhum template configurado.</p>
              </CardContent>
            </Card>
          ) : (
            templates.map((tpl) => {
              const pos = tpl.settings?.name_position || tpl.settings || {}
              const px = pos.positionX ?? pos.x ?? tpl.settings?.name_x_position ?? tpl.settings?.x
              const py = pos.positionY ?? pos.y ?? tpl.settings?.name_y_position ?? tpl.settings?.y
              const fs = pos.fontSize ?? tpl.settings?.font_size ?? tpl.settings?.fontSize
              const alg =
                pos.alignment ?? tpl.settings?.text_align ?? tpl.settings?.alignment ?? 'center'

              return (
                <Card key={tpl.id}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-24 h-16 bg-muted rounded overflow-hidden relative border flex-shrink-0">
                        <img
                          src={pb.files.getUrl(tpl, tpl.file)}
                          alt={tpl.level}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <div>
                        <h4 className="font-semibold">{tpl.level}</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          X: {px} | Y: {py} | Fonte: {fs} | Alinhamento: {alg}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(tpl)}
                        className="text-primary hover:bg-primary/10"
                        title="Editar Template"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(tpl.id)}
                        className="text-destructive hover:bg-destructive/10"
                        title="Excluir Template"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
