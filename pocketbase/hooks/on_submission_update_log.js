onRecordUpdateRequest((e) => {
  const adminId = e.auth?.id
  if (!adminId) return e.next()

  const originalStatus = e.record.original().getString('status')
  const newStatus = e.record.getString('status')
  const originalFeedback = e.record.original().getString('feedback')
  const newFeedback = e.record.getString('feedback')
  const originalScore = e.record.original().getFloat('score')
  const newScore = e.record.getFloat('score')

  if (
    originalStatus !== newStatus ||
    originalFeedback !== newFeedback ||
    originalScore !== newScore
  ) {
    const logs = $app.findCollectionByNameOrId('activity_logs')
    const log = new Record(logs)
    log.set('actor_id', adminId)
    log.set('entity_type', 'submissions')
    log.set('entity_id', e.record.id)
    log.set('action', 'Submission Evaluated')

    let changes = []
    if (originalStatus !== newStatus) changes.push(`Status: ${originalStatus} -> ${newStatus}`)
    if (originalScore !== newScore) changes.push(`Score: ${originalScore} -> ${newScore}`)
    if (originalFeedback !== newFeedback) changes.push(`Feedback updated`)

    log.set('description', changes.join(' | '))
    $app.save(log)
  }

  e.next()
}, 'submissions')
