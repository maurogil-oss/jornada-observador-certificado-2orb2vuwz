routerAdd(
  'POST',
  '/backend/v1/certificates/send',
  (e) => {
    const body = e.requestInfo().body || {}
    const record = e.auth

    if (!record) {
      throw new UnauthorizedError('Usuário não autenticado')
    }

    const email = record.getString('email')
    const level = body.level || 'Certificado'
    const dataUrl = body.image || ''

    if (!dataUrl) {
      throw new BadRequestError('Imagem do certificado não fornecida')
    }

    try {
      const message = new MailerMessage({
        from: {
          address: $app.settings().meta.senderAddress || 'no-reply@observadorcertificado.com.br',
          name: $app.settings().meta.senderName || 'Jornada Observador Certificado',
        },
        to: [{ address: email }],
        subject: `Seu Certificado - ${level}`,
        html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <h2 style="color: #d97706;">Parabéns por sua conquista!</h2>
          <p>Você emitiu com sucesso o seu certificado para o <strong>${level}</strong>.</p>
          <p>O seu certificado está anexado a este email em formato de imagem (PNG).</p>
          <p>Você também pode baixá-lo a qualquer momento acessando a plataforma da Jornada do Observador Certificado, onde é possível exportá-lo diretamente como PDF.</p>
          <p style="margin-top: 40px; font-size: 12px; color: #777;">
            Este é um email automático, por favor não responda.
          </p>
        </div>
      `,
      })

      try {
        const b64 = dataUrl.replace(/^data:image\/\w+;base64,/, '')
        const binaryString = atob(b64)
        const bytes = new Uint8Array(binaryString.length)
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i)
        }

        message.attachments = {
          'certificado.png': $filesystem.fileFromBytes(bytes.buffer, 'certificado.png'),
        }
      } catch (errAttachment) {
        $app
          .logger()
          .warn('Nao foi possivel anexar imagem do certificado', 'error', errAttachment.toString())
      }

      $app.newMailClient().send(message)
    } catch (err) {
      $app
        .logger()
        .error('Erro ao enviar email de certificado', 'error', err.toString(), 'user', email)
    }

    return e.json(200, { success: true })
  },
  $apis.requireAuth(),
)
