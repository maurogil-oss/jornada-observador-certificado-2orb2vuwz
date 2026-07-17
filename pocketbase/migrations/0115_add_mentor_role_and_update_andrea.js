migrate(
  (app) => {
    const usersCol = app.findCollectionByNameOrId('users')

    const roleField = usersCol.fields.getByName('role')
    var roleIdx = usersCol.fields.indexOf(roleField)
    if (roleIdx >= 0) usersCol.fields.splice(roleIdx, 1)

    usersCol.fields.add(
      new SelectField({
        name: 'role',
        values: ['admin', 'observer', 'mentor'],
        maxSelect: 1,
      }),
    )
    app.save(usersCol)

    try {
      var record = app.findFirstRecordByFilter(
        'users',
        "full_name = 'ANDREA GABRIELA GÁLVEZ BETETA' || full_name = 'Andrea Gabriela Gálvez Beteta'",
      )
      if (record) {
        record.set('role', 'observer')
        record.set('level', 'Nível I')
        app.saveNoValidate(record)
      }
    } catch (_) {}
  },
  (app) => {
    const usersCol = app.findCollectionByNameOrId('users')

    const roleField = usersCol.fields.getByName('role')
    var roleIdx = usersCol.fields.indexOf(roleField)
    if (roleIdx >= 0) usersCol.fields.splice(roleIdx, 1)

    usersCol.fields.add(
      new SelectField({
        name: 'role',
        values: ['admin', 'observer'],
        maxSelect: 1,
      }),
    )
    app.save(usersCol)

    try {
      var record = app.findFirstRecordByFilter(
        'users',
        "full_name = 'ANDREA GABRIELA GÁLVEZ BETETA' || full_name = 'Andrea Gabriela Gálvez Beteta'",
      )
      if (record) {
        record.set('role', 'admin')
        app.saveNoValidate(record)
      }
    } catch (_) {}
  },
)
