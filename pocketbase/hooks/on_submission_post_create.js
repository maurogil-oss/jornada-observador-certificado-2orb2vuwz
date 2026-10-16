/**
 * Hook disparado após a criação da submissão.
 * Se Aprovado:
 *   - Credita pontos do usuário
 *   - Recalcula nível canônico
 *   - Registra no activity_logs
 *   - Cria notificação na plataforma
 *
 * Se Aguardando Complemento (Divergência):
 *   - Registra no activity_logs com o motivo
 *   - Cria notificação de divergência na plataforma
 *   - Tenta enviar e-mail explicativo via $app.newMailClient()
 */

onRecordAfterCreateSuccess((e) => {
  const recalculateCanonicalLevel = (points) => {
    if (points >= 1000) return 'Nível III'
    if (points >= 500) return 'Nível II'
    return 'Nível I'
  }

  const record = e.record
  const status = record.getString('status')
  const score = record.getFloat('score') || 0
  const userId = record.getString('user_id')
  const subTitle = record.getString('title') || 'Atividade'
  const divergenceReason = record.getString('divergence_reason') || ''

  let user = null
  let userEmail = ''
  let userName = 'Observador'

  if (userId) {
    try {
      user = e.app.findFirstRecordByData('users', 'id', userId)
      if (user) {
        userEmail = user.getString('email') || ''
        userName = user.getString('name') || 'Observador'
      }
    } catch (err) {
      console.log(`[Submission Post-Create] User not found: ${err}`)
    }
  }

  // 1. Se APROVADO:
  if (status === 'Aprovado' && userId && user) {
    try {
      const currentPoints = user.getFloat('points') || 0
      const newPoints = currentPoints + score
      const newLevel = recalculateCanonicalLevel(newPoints)

      user.set('points', newPoints)
      user.set('level', newLevel)
      e.app.save(user)
      console.log(
        `[Submission Post-Create] User ${userId} credited +${score} points (total: ${newPoints}, level: ${newLevel})`,
      )

      // Registrar activity_logs
      try {
        const logCol = e.app.findCollectionByNameOrId('activity_logs')
        const log = new Record(logCol)
        log.set('actor_id', userId)
        log.set('action', 'submission_auto_approved')
        log.set('entity_type', 'submissions')
        log.set('entity_id', record.id)
        log.set(
          'description',
          `Submissão "${subTitle}" aprovada automaticamente com +${score} pontos creditados. Nível: ${newLevel}.`,
        )
        e.app.save(log)
      } catch (logErr) {
        console.log(`[Submission Post-Create] Log error: ${logErr}`)
      }

      // Notificação na plataforma
      try {
        const notifCol = e.app.findCollectionByNameOrId('notifications')
        const notif = new Record(notifCol)
        notif.set('user_id', userId)
        notif.set('title', 'Submissão Aprovada com Sucesso!')
        notif.set(
          'message',
          `Sua comprovação de "${subTitle}" foi validada e aprovada automaticamente (+${score} pontos)!`,
        )
        notif.set('type', 'success')
        notif.set('read', false)
        e.app.save(notif)
      } catch (notifErr) {
        console.log(`[Submission Post-Create] Notification error: ${notifErr}`)
      }
    } catch (userErr) {
      console.log(`[Submission Post-Create] Error updating user on approval: ${userErr}`)
    }
  }

  // 2. Se AGUARDANDO COMPLEMENTO (DIVERGÊNCIA):
  if (status === 'Aguardando Complemento' && userId) {
    // Registrar activity_logs
    try {
      const logCol = e.app.findCollectionByNameOrId('activity_logs')
      const log = new Record(logCol)
      log.set('actor_id', userId)
      log.set('action', 'submission_divergence_flagged')
      log.set('entity_type', 'submissions')
      log.set('entity_id', record.id)
      log.set('description', `Submissão "${subTitle}" marcada com divergência: ${divergenceReason}`)
      e.app.save(log)
    } catch (logErr) {
      console.log(`[Submission Post-Create] Log error: ${logErr}`)
    }

    // Notificação na plataforma
    try {
      const notifCol = e.app.findCollectionByNameOrId('notifications')
      const notif = new Record(notifCol)
      notif.set('user_id', userId)
      notif.set('title', 'Ação Necessária: Divergência na Submissão')
      notif.set(
        'message',
        `A submissão "${subTitle}" apresentou divergência: ${divergenceReason}. Você pode Complementar enviando um novo documento ou Renunciar.`,
      )
      notif.set('type', 'warning')
      notif.set('read', false)
      e.app.save(notif)
    } catch (notifErr) {
      console.log(`[Submission Post-Create] Notification error: ${notifErr}`)
    }

    // Tentativa de Envio de E-mail Transacional ao Observador
    if (userEmail) {
      try {
        const mailClient = e.app.newMailClient()
        const emailBody = `
<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
  <h2 style="color: #1e293b;">Jornada Observador Certificado - Notificação de Submissão</h2>
  <p>Olá, <strong>${userName}</strong>,</p>
  <p>Sua comprovação para a atividade <strong>"${subTitle}"</strong> foi analisada automaticamente pelo sistema e apresentou a seguinte divergência:</p>
  <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 12px; margin: 16px 0; color: #991b1b;">
    <strong>Motivo da Divergência:</strong><br/>
    ${divergenceReason}
  </div>
  <p>Para prosseguir, acesse a plataforma e escolha uma das opções:</p>
  <ul>
    <li><strong>Complementar:</strong> envie um documento comprobatório legível e adequado para nova análise automática.</li>
    <li><strong>Renunciar:</strong> encerre esta submissão sem pontuação caso não deseje prosseguir.</li>
  </ul>
  <p style="margin-top: 24px; color: #64748b; font-size: 13px;">Mensagem automática gerada pela plataforma Jornada Observador Certificado - ONSV.</p>
</div>
        `.trim()

        mailClient.send({
          from: {
            address: e.app.settings().meta.senderAddress || 'noreply@onsv.org.br',
            name: e.app.settings().meta.senderName || 'Jornada Observador Certificado',
          },
          to: [{ address: userEmail, name: userName }],
          subject: `Divergência na submissão: ${subTitle}`,
          html: emailBody,
        })
        console.log(`[Submission Post-Create] Divergence notification email sent to ${userEmail}`)
      } catch (mailErr) {
        console.log(`[Submission Post-Create] Transactional email attempt: ${mailErr}`)
      }
    }
  }

  e.next()
}, 'submissions')
