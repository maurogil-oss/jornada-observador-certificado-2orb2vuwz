import { useState, useEffect } from 'react'
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
  deleteCertificateTemplate,
} from '@/services/certificates'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Trash2, Image as ImageIcon } from 'lucide-react'
import pb from '@/lib/pocketbase/client'

export default function AdminCertificates() {
  const { toast } = useToast()
  const [templates, setTemplates] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [level, setLevel] = useState<string>('Nível I')
  const [file, setFile] = useState<File | null>(null)
  const [x, setX] = useState<string>('400')
  const [y, setY] = useState<string>('300')
  const [fontSize, setFontSize] = useState<string>('48')
  const [color, setColor] = useState<string>('#000000')

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) {
      toast({
        title: 'Erro',
        description: 'Selecione uma imagem de fundo.',
        variant: 'destructive',
      })
      return
    }

    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('level', level)
      formData.append('file', file)
      formData.append(
        'settings',
        JSON.stringify({
          x: Number(x),
          y: Number(y),
          font_size: Number(fontSize),
          color: color,
        }),
      )

      const existing = templates.find((t) => t.level === level)
      if (existing) {
        await deleteCertificateTemplate(existing.id)
      }

      await createCertificateTemplate(formData)
      toast({ title: 'Sucesso', description: 'Template salvo com sucesso.' })
      setFile(null)
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

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Templates de Certificado</h2>
        <p className="text-muted-foreground">
          Gerencie as imagens de fundo e posicionamento do nome para cada nível.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                <Select value={level} onValueChange={setLevel}>
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Posição X (px)</Label>
                  <Input type="number" value={x} onChange={(e) => setX(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>Posição Y (px, do topo para baixo)</Label>
                  <Input type="number" value={y} onChange={(e) => setY(e.target.value)} required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tamanho da Fonte (px)</Label>
                  <Input
                    type="number"
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
                      className="w-16 p-1 h-10"
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
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <ImageIcon className="w-4 h-4 mr-2" />
                )}
                Salvar Template
              </Button>
            </form>
          </CardContent>
        </Card>

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
            templates.map((tpl) => (
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
                        X: {tpl.settings?.x} | Y: {tpl.settings?.y} | Fonte:{' '}
                        {tpl.settings?.font_size}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(tpl.id)}
                    className="text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
