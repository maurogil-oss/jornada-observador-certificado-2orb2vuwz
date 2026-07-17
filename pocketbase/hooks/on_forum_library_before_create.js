onRecordCreateRequest((e) => {
  const category = e.record.getString('category') || ''
  const existingCode = e.record.getString('code') || ''

  if (existingCode) {
    e.next()
    return
  }

  const prefixMap = {
    'Documento Técnico': 'DT',
    'Nota Técnica': 'NT',
    'Guia Prático': 'GP',
  }

  var prefix = prefixMap[category]
  if (!prefix) {
    e.next()
    return
  }

  var year = new Date().getFullYear().toString()
  var count = 0
  try {
    var existing = $app.findRecordsByFilter('forum_library', 'code ~ {:prefix}', '', 1000, 0, {
      prefix: prefix + '-' + year + '-',
    })
    count = existing.length
  } catch (err) {
    count = 0
  }

  var sequence = String(count + 1)
  while (sequence.length < 3) {
    sequence = '0' + sequence
  }

  var generatedCode = prefix + '-' + year + '-' + sequence
  e.record.set('code', generatedCode)

  e.next()
}, 'forum_library')
