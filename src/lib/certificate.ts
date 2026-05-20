import pb from '@/lib/pocketbase/client'

export const generateCertificate = async (level: string) => {
  const templates = await pb.collection('certificate_templates').getFullList({
    filter: `level = "${level}"`,
  })

  if (!templates.length) {
    throw new Error('Template não encontrado para este nível.')
  }

  const template = templates[0]
  const user = pb.authStore.record
  if (!user) throw new Error('Usuário não autenticado')

  const name = user.full_name || user.name || 'Observador'
  const url = pb.files.getUrl(template, template.file)

  return new Promise<void>((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      if (!ctx) return reject(new Error('Erro no canvas'))

      ctx.drawImage(img, 0, 0)

      const settings = template.settings || {}
      const x = Number(settings.x) || img.width / 2
      const y = Number(settings.y) || img.height / 2
      const fontSize = Number(settings.font_size) || 30
      const color = settings.color || '#000000'

      ctx.font = `bold ${fontSize}px sans-serif`
      ctx.fillStyle = color
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'

      ctx.fillText(name, x, y)

      const dataUrl = canvas.toDataURL('image/png')
      const a = document.createElement('a')
      a.href = dataUrl
      a.download = `Certificado_${level.replace(/\s+/g, '_')}.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      resolve()
    }
    img.onerror = () => reject(new Error('Falha ao carregar imagem do template'))
    img.src = url
  })
}
