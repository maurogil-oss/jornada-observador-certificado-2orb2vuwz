// Intercepts the creation of new users to ensure they are inactive by default
onRecordCreateRequest((e) => {
  e.record.set('is_active', false)
  e.next()
}, 'users')
