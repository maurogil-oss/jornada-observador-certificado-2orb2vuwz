import pb from '@/lib/pocketbase/client'
import { normalizeString } from '@/lib/utils'

export const generateCertificateDataUrl = async (
  level: string,
  customName?: string,
  customFontSize?: number,
): Promise<string> => {
  const templates = await pb.collection('certificate_templates').getFullList()
  const template = templates.find((t) => normalizeString(t.level) === normalizeString(level))

  if (!template) {
    throw new Error(`Modelo de certificado não encontrado para o nível: ${level}`)
  }

  let name = customName
  if (!name) {
    const user = pb.authStore.record
    if (!user) throw new Error('Usuário não autenticado')
    name = user.full_name || user.name || 'Observador'
  }
  const url = pb.files.getUrl(template, template.file)

  return new Promise<string>((resolve, reject) => {
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
      if (Object.keys(settings).length === 0) {
        console.warn(
          'Aviso para Administrador: Configurações de posicionamento ausentes ou malformadas. Usando centralização padrão.',
        )
      }

      const pos = settings.name_position || settings || {}

      const x =
        Number(pos.positionX ?? pos.x ?? settings.name_x_position ?? settings.x) || img.width / 2
      const y =
        Number(pos.positionY ?? pos.y ?? settings.name_y_position ?? settings.y) || img.height / 2
      const fontSize =
        customFontSize ?? (Number(pos.fontSize ?? settings.font_size ?? settings.fontSize) || 30)
      const color = pos.color ?? settings.font_color ?? settings.color ?? '#000000'
      const align = pos.alignment ?? settings.text_align ?? settings.alignment ?? 'center'

      ctx.font = `bold ${fontSize}px sans-serif`
      ctx.fillStyle = color
      ctx.textAlign = align as CanvasTextAlign
      ctx.textBaseline = 'middle'

      ctx.fillText(name, x, y)

      resolve(canvas.toDataURL('image/png'))
    }
    img.onerror = () => reject(new Error('Falha ao carregar imagem do template'))
    img.src = url
  })
}

export const generateCertificate = async (level: string) => {
  return downloadCertificateAsPDF(level)
}

export const downloadCertificateAsPDF = async (level: string) => {
  const dataUrl = await generateCertificateDataUrl(level)

  const win = window.open('', '_blank')
  if (!win) {
    // Fallback caso popups estejam bloqueados
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = `Certificado_${level.replace(/\s+/g, '_')}.png`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    return
  }

  win.document.write(`
    <html>
      <head>
        <title>Certificado - ${level}</title>
        <style>
          body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #fff; }
          img { max-width: 100%; max-height: 100vh; object-fit: contain; }
          @media print {
            @page { margin: 0; size: landscape; }
            body { margin: 0; display: block; }
            img { width: 100%; height: 100%; object-fit: contain; }
          }
        </style>
      </head>
      <body>
        <img src="${dataUrl}" onload="window.print(); window.close();" />
      </body>
    </html>
  `)
  win.document.close()
}

export const emailCertificate = async (level: string) => {
  const dataUrl = await generateCertificateDataUrl(level)

  await pb.send('/backend/v1/certificates/send', {
    method: 'POST',
    body: JSON.stringify({ level, image: dataUrl }),
    headers: { 'Content-Type': 'application/json' },
  })
}
