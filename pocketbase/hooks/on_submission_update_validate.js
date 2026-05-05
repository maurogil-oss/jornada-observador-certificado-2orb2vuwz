onRecordUpdateRequest((e) => {
  const auth = e.auth
  if (e.hasSuperuserAuth() || (auth && auth.getString('role') === 'admin')) {
    return e.next()
  }

  const original = e.record.original()

  if (e.record.getString('title') !== original.getString('title')) {
    throw new BadRequestError('Você não tem permissão para alterar o título da atividade.')
  }
  if (e.record.getString('nivel') !== original.getString('nivel')) {
    throw new BadRequestError('Você não tem permissão para alterar o nível da atividade.')
  }
  if (e.record.getFloat('score') !== original.getFloat('score')) {
    throw new BadRequestError('Você não tem permissão para alterar a pontuação da atividade.')
  }
  if (e.record.getString('type') !== original.getString('type')) {
    throw new BadRequestError('Você não tem permissão para alterar o tipo da atividade.')
  }

  return e.next()
}, 'submissions')
