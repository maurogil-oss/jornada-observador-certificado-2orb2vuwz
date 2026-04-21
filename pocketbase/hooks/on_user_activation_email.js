onRecordAfterUpdateSuccess((e) => {
  const isNowActive = e.record.getBool('is_active')
  const wasActive = e.record.original().getBool('is_active')

  if (isNowActive && !wasActive) {
    const name = e.record.getString('name') || e.record.getString('full_name') || 'Observador'
    const email = e.record.getString('email')
    const appUrl =
      $secrets.get('PB_INSTANCE_URL') || 'https://jornada-observador-certificado-1427c.goskip.app'

    try {
      const message = new MailerMessage({
        from: {
          address: $app.settings().meta.senderAddress || 'noreply@onsv.org',
          name: $app.settings().meta.senderName || 'Jornada do Observador Certificado',
        },
        to: [{ address: email }],
        subject: 'Cadastro Aprovado - Jornada Observador Certificado',
        html: `
          <div style="font-family: sans-serif; color: #333; line-height: 1.6; max-w-xl: 600px; margin: 0 auto; padding: 20px;">
            <p>Olá ${name}, temos boas notícias!</p>
            <p>Obrigado por se cadastrar. Sua conta foi validada pelos nossos administradores.</p>
            <p>Agora você já pode acessar a plataforma utilizando seu e-mail e senha cadastrados para visualizar seu progresso e certificados.</p>
            <p style="margin-top: 30px;">
              <a href="${appUrl}/login" style="background-color: #059669; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold;">Acessar a Plataforma</a>
            </p>
            <p style="margin-top: 40px; font-size: 12px; color: #666;">Se você tiver algum problema para acessar, responda a este e-mail.</p>
          </div>
        `,
      })

      $app.newMailClient().send(message)
      $app.logger().info('Activation email sent', 'email', email)
    } catch (err) {
      $app.logger().error('Failed to send activation email', 'error', String(err), 'email', email)
    }
  }

  e.next()
}, 'users')
