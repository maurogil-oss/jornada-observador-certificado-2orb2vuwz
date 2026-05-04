onRecordUpdateRequest((e) => {
  const adminId = e.auth?.id
  if (!adminId) return e.next()

  const originalIsActive = e.record.original().getBool('is_active')
  const newIsActive = e.record.getBool('is_active')
  const originalRole = e.record.original().getString('role')
  const newRole = e.record.getString('role')

  if (originalIsActive !== newIsActive || originalRole !== newRole) {
    const logs = $app.findCollectionByNameOrId('activity_logs')
    const log = new Record(logs)
    log.set('actor_id', adminId)
    log.set('entity_type', 'users')
    log.set('entity_id', e.record.id)
    log.set('action', 'User Access Updated')

    let changes = []
    if (originalIsActive !== newIsActive)
      changes.push(`Active: ${originalIsActive} -> ${newIsActive}`)
    if (originalRole !== newRole) changes.push(`Role: ${originalRole} -> ${newRole}`)

    log.set('description', changes.join(' | '))
    $app.save(log)
  }

  e.next()
}, 'users')
