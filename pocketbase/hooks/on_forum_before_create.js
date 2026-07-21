onRecordCreateRequest((e) => {
  const existingCode = e.record.getString('code') || ''

  if (existingCode) {
    e.next()
    return
  }

  var year = new Date().getFullYear().toString()
  var prefix = 'FT-' + year + '-'
  var maxSeq = 0

  try {
    var existing = $app.findRecordsByFilter('forums', 'code ~ {:prefix}', 'code', 1000, 0, {
      prefix: prefix,
    })
    for (var i = 0; i < existing.length; i++) {
      var code = existing[i].getString('code')
      var parts = code.split('-')
      var seq = parseInt(parts[2] || '0', 10)
      if (!isNaN(seq) && seq > maxSeq) {
        maxSeq = seq
      }
    }
  } catch (err) {
    maxSeq = 0
  }

  var sequence = String(maxSeq + 1)
  while (sequence.length < 3) {
    sequence = '0' + sequence
  }

  var generatedCode = prefix + sequence
  e.record.set('code', generatedCode)

  e.next()
}, 'forums')
