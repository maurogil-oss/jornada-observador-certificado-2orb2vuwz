onRecordCreateRequest((e) => {
  const title = e.record.getString('title')
  if (title === 'Curso geral na área de trânsito/mobilidade (Mínimo 8h)') {
    const userId = e.record.getString('user_id')
    if (userId) {
      const records = $app.findRecordsByFilter(
        'submissions',
        'user_id = {:userId} && title = {:title}',
        '',
        10,
        0,
        { userId: userId, title: title },
      )
      if (records.length >= 5) {
        throw new BadRequestError('Limite de 5 registros atingido para este curso.', {
          title: new ValidationError(
            'limit_reached',
            'Limite de 5 registros atingido para este curso.',
          ),
        })
      }
    }
  }
  return e.next()
}, 'submissions')
