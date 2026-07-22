onRecordAfterUpdateSuccess((e) => {
  const oldIsActive = e.record.original().getBool('is_active')
  const newIsActive = e.record.getBool('is_active')

  if (oldIsActive === newIsActive) {
    return e.next()
  }

  try {
    const allForums = $app.findRecordsByFilter('forums', '1=1', 'opening_date,created', 1000, 0)

    var activeByYear = {}
    var inactiveForums = []

    for (var i = 0; i < allForums.length; i++) {
      var forum = allForums[i]
      var isActive = forum.getBool('is_active')
      if (isActive) {
        var openingDateStr = forum.getString('opening_date') || ''
        var year = new Date().getFullYear().toString()
        if (openingDateStr) {
          var d = new Date(openingDateStr.replace(' ', 'T'))
          if (!isNaN(d.getTime())) {
            year = d.getFullYear().toString()
          }
        }
        if (!activeByYear[year]) activeByYear[year] = []
        activeByYear[year].push(forum)
      } else {
        inactiveForums.push(forum)
      }
    }

    for (var y in activeByYear) {
      var yearForums = activeByYear[y]
      for (var j = 0; j < yearForums.length; j++) {
        var tempCode = 'TEMP-ACTIVE-' + y + '-' + j
        yearForums[j].set('code', tempCode)
        $app.save(yearForums[j])
      }
    }

    for (var k = 0; k < inactiveForums.length; k++) {
      var currentCode = inactiveForums[k].getString('code') || ''
      if (currentCode.indexOf('INATIVO-') !== 0) {
        inactiveForums[k].set('code', 'INATIVO-' + currentCode)
        $app.save(inactiveForums[k])
      }
    }

    for (var y2 in activeByYear) {
      var yearForums2 = activeByYear[y2]
      for (var m = 0; m < yearForums2.length; m++) {
        var seq = String(m + 1)
        while (seq.length < 3) seq = '0' + seq
        var finalCode = 'FT-' + y2 + '-' + seq
        yearForums2[m].set('code', finalCode)
        $app.save(yearForums2[m])
      }
    }
  } catch (err) {
    $app.logger().error('Forum renumbering failed', 'error', err.message || String(err))
  }

  return e.next()
}, 'forums')
