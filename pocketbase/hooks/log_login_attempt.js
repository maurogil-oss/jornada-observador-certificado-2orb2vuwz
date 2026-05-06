routerAdd('POST', '/backend/v1/log-login-attempt', (e) => {
  const body = e.requestInfo().body || {}
  const email = body.email || ''
  const status = body.status || ''
  const reason = body.reason || ''

  let userId = ''
  try {
    const user = $app.findAuthRecordByEmail('users', email)
    userId = user.id
  } catch (_) {}

  try {
    const log = new Record($app.findCollectionByNameOrId('activity_logs'))
    if (userId) {
      log.set('actor_id', userId)
    }
    log.set('action', status === 'success' ? 'login_success' : 'login_failure')
    log.set('entity_type', 'users')
    log.set('entity_id', userId || email)
    log.set('description', reason)

    $app.save(log)
  } catch (err) {
    $app.logger().error('Failed to save login attempt log', 'error', err.message)
  }

  return e.json(200, { logged: true })
})
