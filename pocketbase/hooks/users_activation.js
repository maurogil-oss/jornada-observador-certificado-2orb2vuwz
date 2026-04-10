onRecordCreateRequest((e) => {
  // Backend logic to ensure every newly registered user is initialized with an "Active" status,
  // preventing immediate "Account Suspended" errors.
  e.record.set('is_active', true)
  e.next()
}, 'users')
