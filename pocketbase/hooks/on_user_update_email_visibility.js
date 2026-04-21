onRecordUpdate((e) => {
  if (!e.record.getBool('emailVisibility')) {
    e.record.set('emailVisibility', true)
  }
  e.next()
}, 'users')
