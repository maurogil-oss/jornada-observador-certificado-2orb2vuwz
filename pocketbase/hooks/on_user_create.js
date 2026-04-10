onRecordCreateRequest((e) => {
  // Enforce default is_active = true on backend for newly registered users if missing
  const body = e.requestInfo().body
  if (body.is_active === undefined) {
    e.record.set('is_active', true)
  }
  e.next()
}, 'users')
