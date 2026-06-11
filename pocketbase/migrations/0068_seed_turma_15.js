migrate(
  (app) => {
    const usersCol = app.findCollectionByNameOrId('_pb_users_auth_')

    // Placeholder array: O desenvolvedor ou administrador do banco
    // deverá substituir esta lista com a relação real de 63 alunos.
    const turma15Students = Array.from(
      { length: 63 },
      (_, i) => `Estudante ${i + 1} da Turma Quinze`,
    )

    const removeAccents = (str) => {
      return str
        .replace(/[áàãâä]/g, 'a')
        .replace(/[éèêë]/g, 'e')
        .replace(/[íìîï]/g, 'i')
        .replace(/[óòõôö]/g, 'o')
        .replace(/[úùûü]/g, 'u')
        .replace(/[ç]/g, 'c')
        .replace(/[ñ]/g, 'n')
        .replace(/[ÁÀÃÂÄ]/g, 'a')
        .replace(/[ÉÈÊË]/g, 'e')
        .replace(/[ÍÌÎÏ]/g, 'i')
        .replace(/[ÓÒÕÔÖ]/g, 'o')
        .replace(/[ÚÙÛÜ]/g, 'u')
        .replace(/[Ç]/g, 'c')
        .replace(/[Ñ]/g, 'n')
    }

    let count = 0
    for (const fullName of turma15Students) {
      try {
        const normalized = removeAccents(fullName).toLowerCase()
        const username = normalized
          .replace(/[^a-z0-9]/g, '.')
          .replace(/\.+/g, '.')
          .replace(/^\.+|\.+$/g, '')

        try {
          app.findFirstRecordByData('_pb_users_auth_', 'username', username)
          // O usuário já existe
          continue
        } catch (_) {
          // Usuário não existe, seguimos com a criação
        }

        const record = new Record(usersCol)
        record.set('username', username)

        record.setPassword('OCT152026')
        record.set('full_name', fullName)
        record.set('name', fullName.split(' ')[0])
        record.set('turma', 15)
        record.set('onboarding_completed', false)
        record.set('is_active', true)
        record.set('points', 0)
        record.set('level', 'Nível I - Observador Certificado (Iniciante)')
        record.set('role', 'observer')

        app.save(record)
        count++
      } catch (e) {
        console.log('Erro ao criar o usuário: ' + fullName)
      }
    }
    console.log(`Migração 0068: Inseridos com sucesso ${count} alunos da Turma 15.`)
  },
  (app) => {
    try {
      const records = app.findRecordsByFilter(
        '_pb_users_auth_',
        'turma = 15 && onboarding_completed = false',
        '',
        100,
        0,
      )
      for (const record of records) {
        app.delete(record)
      }
    } catch (e) {
      console.log('Erro ao reverter migração 0068')
    }
  },
)
