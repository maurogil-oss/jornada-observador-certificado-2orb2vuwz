// 0143 — Salvaguarda anti-duplicidade de cadastros.
//
// 1. Cria a coleção `duplicate_alerts` para registrar possíveis duplicatas
//    (CPF normalizado repetido OU nome + data de nascimento iguais) para
//    revisão manual do admin — nada é fundido ou excluído automaticamente.
// 2. Varredura idempotente da base atual: no-op em base vazia; em execução
//    nova, grava apenas alertas que ainda não existem (dedup por chave).
// 3. Reescreve `cpf_document` de todos os usuários na forma normalizada
//    (só dígitos, 11), preservando os valores atuais em `cpf_raw`.

migrate(
  (app) => {
    const col = new Collection({
      name: 'duplicate_alerts',
      type: 'base',
      listRule: "@request.auth.role = 'admin'",
      viewRule: "@request.auth.role = 'admin'",
      createRule: null,
      updateRule: "@request.auth.role = 'admin'",
      deleteRule: "@request.auth.role = 'admin'",
      fields: [
        {
          name: 'kind',
          type: 'select',
          required: true,
          values: ['cpf', 'name_birth'],
          maxSelect: 1,
        },
        { name: 'key', type: 'text', required: true, max: 300 },
        {
          name: 'user_id',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          maxSelect: 1,
          cascadeDelete: true,
        },
        {
          name: 'related_user_id',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          maxSelect: 1,
          cascadeDelete: true,
        },
        { name: 'snapshot', type: 'json', maxSize: 1000000 },
        {
          name: 'status',
          type: 'select',
          required: false,
          values: ['open', 'reviewed', 'dismissed'],
          maxSelect: 1,
        },
        { name: 'review_note', type: 'text', max: 2000 },
        {
          name: 'source',
          type: 'select',
          required: true,
          values: ['sweep', 'registration'],
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE UNIQUE INDEX idx_duplicate_alerts_key_pair ON duplicate_alerts (key, user_id, related_user_id)',
        'CREATE INDEX idx_duplicate_alerts_status ON duplicate_alerts (status, kind)',
      ],
    })
    app.save(col)

    // --- normaliza CPF: só dígitos, mantém "11.222.333-44" -> "1122233344"
    app.db().newQuery("ALTER TABLE users ADD COLUMN cpf_raw TEXT DEFAULT ''").execute()
    app.db().newQuery("UPDATE users SET cpf_raw = cpf_document WHERE cpf_document != ''").execute()
    app
      .db()
      .newQuery(
        "UPDATE users SET cpf_document = REPLACE(REPLACE(REPLACE(REPLACE(cpf_document, '.', ''), '-', ''), ' ', ''), '/', '') WHERE cpf_document != ''",
      )
      .execute()

    // --- varredura idempotente (no-op em base vazia)
    const users = app.findRecordsByFilter('users', '', '', 10000, 0)
    const byCpf = {}
    const byNameBirth = {}
    const normalizeName = (n) => n.toLowerCase().trim().replace(/\s+/g, ' ')
    const alertColl = app.findCollectionByNameOrId('duplicate_alerts')

    const seenKey = (key, a, b) => {
      try {
        app.findFirstRecordByFilter('duplicate_alerts', 'key = {:k}', { k: key })
        return true
      } catch (err) {
        return false
      }
    }

    for (const u of users) {
      const cpf = u.getString('cpf_document')
      if (cpf) {
        byCpf[cpf] = byCpf[cpf] || []
        byCpf[cpf].push(u)
      }
      const n = u.getString('full_name') || u.getString('name')
      const b = u.getString('birth_date')
      if (n && b && n.length >= 3) {
        const k = normalizeName(n) + '|' + b
        byNameBirth[k] = byNameBirth[k] || []
        byNameBirth[k].push(u)
      }
    }

    const snapshotOf = (u) => {
      const fn = u.getString('full_name')
      return {
        email: u.getString('email'),
        name: fn || u.getString('name'),
        birth_date: u.getString('birth_date'),
        city: u.getString('city'),
        state: u.getString('state'),
        turma: u.getInt('turma'),
      }
    }

    let createdCpf = 0
    let createdNameBirth = 0

    const createAlert = (kind, key, a, b) => {
      if (seenKey(key, a, b)) return false
      const rec = new Record(alertColl)
      rec.set('kind', kind)
      rec.set('key', key)
      rec.set('user_id', a.id)
      rec.set('related_user_id', b.id)
      rec.set('snapshot', [snapshotOf(a), snapshotOf(b)])
      rec.set('status', 'open')
      rec.set('source', 'sweep')
      try {
        app.save(rec)
      } catch (err) {
        console.log('duplicate_alerts: falha ao gravar alerta ' + key + ': ' + err)
        return false
      }
      return true
    }

    const pairsFor = (groups) => {
      const pairs = []
      for (const k in groups) {
        const list = groups[k]
        if (list.length < 2) continue
        for (let i = 0; i < list.length; i++)
          for (let j = i + 1; j < list.length; j++) pairs.push([k, list[i], list[j]])
      }
      return pairs
    }

    for (const pair of pairsFor(byCpf)) {
      if (createAlert('cpf', pair[0], pair[1], pair[2])) createdCpf++
    }
    for (const pair of pairsFor(byNameBirth)) {
      if (createAlert('name_birth', pair[0], pair[1], pair[2])) createdNameBirth++
    }

    console.log(
      '[0143] varredura concluída: ' +
        createdCpf +
        ' alerta(s) por CPF, ' +
        createdNameBirth +
        ' por nome+nascimento (de ' +
        users.length +
        ' usuários).',
    )
  },
  (app) => {
    const col = app.findCollectionByNameOrId('duplicate_alerts')
    app.delete(col)
    app.db().newQuery('ALTER TABLE users DROP COLUMN cpf_raw').execute()
  },
)
