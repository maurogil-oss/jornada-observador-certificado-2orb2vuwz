onRecordCreateRequest((e) => {
  e.record.set('role', 'observer')
  e.record.set('is_active', false)
  e.next()
}, 'users')

onRecordAfterCreateSuccess((e) => {
  try {
    const logCollection = $app.findCollectionByNameOrId('import_logs')
    const log = new Record(logCollection)
    log.set('file_name', 'System')
    log.set('status', 'Success')
    log.set('details', 'New user registration pending approval')
    log.set('user_id', e.record.id)
    $app.save(log)
  } catch (err) {
    console.log('Error logging registration:', err)
  }
  e.next()
}, 'users')
