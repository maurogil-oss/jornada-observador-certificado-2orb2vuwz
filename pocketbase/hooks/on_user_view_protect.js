onRecordViewRequest((e) => {
  const isOwner = e.auth && e.auth.id === e.record.id
  const isAdmin = e.auth && e.auth.getString('role') === 'admin'

  if (!isOwner && !isAdmin && !e.hasSuperuserAuth()) {
    // Scrub sensitive fields for public view
    e.record.set('email', '')
    e.record.set('cpf_document', '')
    e.record.set('rg', '')
    e.record.set('rg_issuer', '')
    e.record.set('rg_state', '')
    e.record.set('birth_date', '')
    // Keep only safe fields: name, avatar, level, points, full_name, nickname, city, state, workplace, turma
  }
  e.next()
}, 'users')
