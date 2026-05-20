// @deps pdf-lib@1.17.1, nodemailer@6.9.14, buffer@6.0.3
routerAdd(
  'POST',
  '/backend/v1/certificates/generate',
  async (e) => {
    const { PDFDocument, rgb } = require('pdf-lib')

    const body = e.requestInfo().body
    const level = body.level
    const userId = e.auth?.id
    if (!userId) return e.unauthorizedError('Not authenticated')

    const user = $app.findRecordById('users', userId)

    const templates = $app.findRecordsByFilter(
      'certificate_templates',
      `level = {:level}`,
      '-created',
      1,
      0,
      { level },
    )
    if (!templates.length) return e.badRequestError('Template not found')
    const template = templates[0]

    const appUrl = $secrets.get('PB_INSTANCE_URL') || 'http://127.0.0.1:8090'
    const url = `${appUrl}/api/files/${template.collectionId}/${template.id}/${template.getString('file')}`
    const res = $http.send({ url, method: 'GET' })
    if (res.statusCode !== 200) return e.internalServerError('Failed to fetch template image')

    const pdfDoc = await PDFDocument.create()
    let image
    try {
      image = await pdfDoc.embedJpg(res.body)
    } catch (err) {
      try {
        image = await pdfDoc.embedPng(res.body)
      } catch (err2) {
        return e.internalServerError('Invalid image format')
      }
    }

    const page = pdfDoc.addPage([image.width, image.height])
    page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height })

    const settings = template.get('settings') || {}
    const x = Number(settings.x) || image.width / 2
    const yFromTop = Number(settings.y) || image.height / 2
    const fontSize = Number(settings.font_size) || 30

    let r = 0,
      g = 0,
      b = 0
    if (settings.color && settings.color.startsWith('#')) {
      const hex = settings.color.replace('#', '')
      r = parseInt(hex.substring(0, 2), 16) / 255
      g = parseInt(hex.substring(2, 4), 16) / 255
      b = parseInt(hex.substring(4, 6), 16) / 255
    }

    const name = user.getString('full_name') || user.getString('name') || 'Observador'

    page.drawText(name, {
      x: x,
      y: image.height - yFromTop,
      size: fontSize,
      color: rgb(r, g, b),
    })

    const pdfBytes = await pdfDoc.save()
    return e.blob(200, 'application/pdf', pdfBytes)
  },
  $apis.requireAuth(),
)

routerAdd(
  'POST',
  '/backend/v1/certificates/email',
  async (e) => {
    const { PDFDocument, rgb } = require('pdf-lib')
    const nodemailer = require('nodemailer')
    const { Buffer } = require('buffer')

    const body = e.requestInfo().body
    const level = body.level
    const userId = e.auth?.id
    if (!userId) return e.unauthorizedError('Not authenticated')

    const user = $app.findRecordById('users', userId)

    const templates = $app.findRecordsByFilter(
      'certificate_templates',
      `level = {:level}`,
      '-created',
      1,
      0,
      { level },
    )
    if (!templates.length) return e.badRequestError('Template not found')
    const template = templates[0]

    const appUrl = $secrets.get('PB_INSTANCE_URL') || 'http://127.0.0.1:8090'
    const url = `${appUrl}/api/files/${template.collectionId}/${template.id}/${template.getString('file')}`
    const res = $http.send({ url, method: 'GET' })
    if (res.statusCode !== 200) return e.internalServerError('Failed to fetch template image')

    const pdfDoc = await PDFDocument.create()
    let image
    try {
      image = await pdfDoc.embedJpg(res.body)
    } catch (err) {
      try {
        image = await pdfDoc.embedPng(res.body)
      } catch (err2) {
        return e.internalServerError('Invalid image format')
      }
    }

    const page = pdfDoc.addPage([image.width, image.height])
    page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height })

    const settings = template.get('settings') || {}
    const x = Number(settings.x) || image.width / 2
    const yFromTop = Number(settings.y) || image.height / 2
    const fontSize = Number(settings.font_size) || 30

    let r = 0,
      g = 0,
      b = 0
    if (settings.color && settings.color.startsWith('#')) {
      const hex = settings.color.replace('#', '')
      r = parseInt(hex.substring(0, 2), 16) / 255
      g = parseInt(hex.substring(2, 4), 16) / 255
      b = parseInt(hex.substring(4, 6), 16) / 255
    }

    const name = user.getString('full_name') || user.getString('name') || 'Observador'

    page.drawText(name, {
      x: x,
      y: image.height - yFromTop,
      size: fontSize,
      color: rgb(r, g, b),
    })

    const pdfBytes = await pdfDoc.save()

    const smtp = $app.settings().smtp
    let transporter
    if (smtp && smtp.enabled) {
      transporter = nodemailer.createTransport({
        host: smtp.host,
        port: smtp.port,
        secure: smtp.port === 465,
        auth: { user: smtp.username, pass: smtp.password },
        tls: { rejectUnauthorized: false },
      })
    } else {
      transporter = {
        sendMail: async () => {
          $app.logger().info('Mocking email send, smtp disabled.')
        },
      }
    }

    const mailOptions = {
      from:
        smtp && smtp.enabled
          ? `"${$app.settings().meta.senderName}" <${$app.settings().meta.senderAddress}>`
          : '"Jornada Observador" <noreply@goskip.app>',
      to: user.getString('email'),
      subject: `Seu Certificado - ${level}`,
      text: `Olá ${name},\n\nParabéns por alcançar o ${level}! Segue em anexo o seu certificado.\n\nAtenciosamente,\nEquipe Jornada`,
      attachments: [
        {
          filename: `Certificado_${level.replace(/\s+/g, '_')}.pdf`,
          content: Buffer.from(pdfBytes),
          contentType: 'application/pdf',
        },
      ],
    }

    try {
      await transporter.sendMail(mailOptions)
    } catch (err) {
      $app.logger().error('Email send failed', 'error', err.message)
      return e.internalServerError('Failed to send email')
    }

    return e.json(200, { success: true })
  },
  $apis.requireAuth(),
)
