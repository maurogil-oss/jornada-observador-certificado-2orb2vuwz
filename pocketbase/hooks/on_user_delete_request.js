onRecordDeleteRequest((e) => {
  const userId = e.record.id

  // Cascade delete submissions
  try {
    const submissions = $app.findRecordsByFilter('submissions', `user_id = '${userId}'`, '', 0, 0)
    for (const sub of submissions) {
      $app.delete(sub)
    }
  } catch (_) {}

  // Cascade delete import logs
  try {
    const importLogs = $app.findRecordsByFilter('import_logs', `user_id = '${userId}'`, '', 0, 0)
    for (const log of importLogs) {
      $app.delete(log)
    }
  } catch (_) {}

  // Nullify actor references in activity logs instead of deleting the logs
  try {
    const activityLogs = $app.findRecordsByFilter(
      'activity_logs',
      `actor_id = '${userId}'`,
      '',
      0,
      0,
    )
    for (const log of activityLogs) {
      log.set('actor_id', null)
      $app.saveNoValidate(log)
    }
  } catch (_) {}

  // Proceed with user deletion
  e.next()

  // Audit Log - executed only if e.next() succeeds
  try {
    const adminId = e.auth ? e.auth.id : null
    const auditLog = new Record($app.findCollectionByNameOrId('activity_logs'))

    if (adminId) {
      auditLog.set('actor_id', adminId)
    }

    auditLog.set('action', 'DELETE')
    auditLog.set('entity_type', 'users')
    auditLog.set('entity_id', userId)

    const name = e.record.getString('email') || e.record.getString('name') || userId
    auditLog.set('description', `User ${name} deleted by admin`)

    $app.saveNoValidate(auditLog)
  } catch (err) {
    $app.logger().error('Failed to create audit log for user deletion', 'error', err.message)
  }
}, 'users')
