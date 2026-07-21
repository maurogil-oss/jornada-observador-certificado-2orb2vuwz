migrate(
  (app) => {
    var forums = app.findRecordsByFilter('forums', '1=1', 'created', 1000, 0)

    for (var t = 0; t < forums.length; t++) {
      forums[t].set('code', 'TEMP-FORUM-' + t)
      app.save(forums[t])
    }

    var byYear = {}
    for (var i = 0; i < forums.length; i++) {
      var createdStr = forums[i].getString('created')
      var year = new Date().getFullYear().toString()
      if (createdStr) {
        var d = new Date(createdStr.replace(' ', 'T'))
        if (!isNaN(d.getTime())) {
          year = d.getFullYear().toString()
        }
      }
      if (!byYear[year]) byYear[year] = []
      byYear[year].push(forums[i])
    }

    for (var year in byYear) {
      var yearForums = byYear[year]
      for (var j = 0; j < yearForums.length; j++) {
        var seq = String(j + 1)
        while (seq.length < 3) seq = '0' + seq
        var newCode = 'FT-' + year + '-' + seq
        yearForums[j].set('code', newCode)
        app.save(yearForums[j])
      }
    }
  },
  (app) => {
    var forums = app.findRecordsByFilter('forums', '1=1', 'created', 1000, 0)
    for (var i = 0; i < forums.length; i++) {
      forums[i].set('code', 'FOR-RESTORED-' + i)
      app.save(forums[i])
    }
  },
)
