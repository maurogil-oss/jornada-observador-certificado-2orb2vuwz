// Salvaguarda anti-duplicidade no cadastro de usuários.
//
// 1) BLOQUEIO DURO: se o CPF normalizado (só dígitos) já pertence a outra
//    conta, o cadastro é recusado com mensagem clara orientando a recuperação
//    de senha ou o contato com o administrador.
// 2) ALERTA SUAVE: CPF inédito mas nome + data de nascimento repetindo uma
//    conta existente NÃO bloqueia — grava um alerta `source: 'registration'`
//    em `duplicate_alerts` para o admin revisar no painel.
//
// Roda no validate de create e update, para impedir também que alguém
// "encaixe" um CPF já usado por outra conta. Admin/superuser pode editar
// qualquer registro (correções manuais).
//
// Nota: callbacks executam em VM separada — toda a lógica fica inline nos
// callbacks (sem funções/variáveis de nível superior).

onRecordValidate((e) => {
  const record = e.record
  const normalizeCpf = (v) => String(v || '').replace(/\D/g, '')

  // --- 1) bloqueio duro por CPF normalizado
  const cpf = normalizeCpf(record.getString('cpf_document'))
  if (cpf) {
    if (cpf.length !== 11) {
      throw new BadRequestError('CPF deve ter 11 dígitos. Verifique os números informados.')
    }
    // grava normalizado, para que a comparação sempre seja sem máscara
    record.set('cpf_document', cpf)

    let other = null
    try {
      const found = $app.findRecordsByFilter('users', 'cpf_document = {:cpf}', '', 2, 0, {
        cpf: cpf,
      })
      for (const u of found) {
        if (u.id !== record.id) {
          other = u
          break
        }
      }
    } catch (err) {
      console.log('[dupe-guard] erro buscando CPF: ' + err)
    }

    if (other) {
      const otherEmail = other.getString('emailVisibility')
        ? other.getString('email')
        : 'oculto — fale com o administrador'
      throw new BadRequestError(
        'Este CPF já está cadastrado na conta ' +
          otherEmail +
          '. Se for você, use a opção "Esqueci minha senha" com esse e-mail para recuperar o acesso, ou fale com o administrador da plataforma.',
      )
    }
  }

  // --- 2) alerta suave por nome + data de nascimento (NÃO bloqueia)
  const isCreate = record.original().id === ''
  const name = record.getString('full_name') || record.getString('name')
  const birth = record.getString('birth_date')
  const normalizeName = (n) =>
    String(n || '')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, ' ')

  if (isCreate && name && birth && name.length >= 3) {
    try {
      const candidates = $app.findRecordsByFilter(
        'users',
        "birth_date = {:b} && full_name != ''",
        '',
        200,
        0,
        { b: birth },
      )
      for (const existing of candidates) {
        const otherName = existing.getString('full_name') || existing.getString('name')
        if (otherName && normalizeName(otherName) === normalizeName(name)) {
          try {
            const coll = $app.findCollectionByNameOrId('duplicate_alerts')
            const rec = new Record(coll)
            rec.set('kind', 'name_birth')
            rec.set('key', normalizeName(name) + '|' + birth)
            rec.set('user_id', record.id)
            rec.set('related_user_id', existing.id)
            rec.set('snapshot', [
              {
                email: record.getString('email'),
                name: name,
                birth_date: birth,
                city: record.getString('city'),
                state: record.getString('state'),
                turma: record.getInt('turma'),
              },
              {
                email: existing.getString('email'),
                name: otherName,
                birth_date: existing.getString('birth_date'),
                city: existing.getString('city'),
                state: existing.getString('state'),
                turma: existing.getInt('turma'),
              },
            ])
            rec.set('status', 'open')
            rec.set('source', 'registration')
            $app.saveNoValidate(rec)
          } catch (err2) {
            console.log('[dupe-guard] falha ao gravar alerta de nome+nascimento: ' + err2)
          }
          break
        }
      }
    } catch (err) {
      console.log('[dupe-guard] erro na checagem nome+nascimento: ' + err)
    }
  }

  return e.next()
}, 'users')

// Em updates (ex.: perfil), impedir que um usuário defina um CPF que já
// pertence a outra conta. Admins passam livre (correções manuais).
onRecordUpdateRequest((e) => {
  const auth = e.auth
  const isAdmin = e.hasSuperuserAuth() || (auth && auth.getString('role') === 'admin')
  if (isAdmin) return e.next()

  const record = e.record
  const normalizeCpf = (v) => String(v || '').replace(/\D/g, '')
  const cpf = normalizeCpf(record.getString('cpf_document'))
  const original = record.original()
  const previous = normalizeCpf(original.getString('cpf_document'))

  if (cpf && cpf !== previous) {
    let other = null
    try {
      const found = $app.findRecordsByFilter('users', 'cpf_document = {:cpf}', '', 2, 0, {
        cpf: cpf,
      })
      for (const u of found) {
        if (u.id !== record.id) {
          other = u
          break
        }
      }
    } catch (err) {
      console.log('[dupe-guard] erro buscando CPF no update: ' + err)
    }
    if (other) {
      throw new BadRequestError(
        'Este CPF já pertence a outra conta. Não é possível vinculá-lo ao seu perfil — fale com o administrador se houver algum erro.',
      )
    }
  }

  return e.next()
}, 'users')
