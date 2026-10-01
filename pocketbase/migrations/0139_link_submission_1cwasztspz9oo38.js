migrate(
  (app) => {
    try {
      const sub = app.findFirstRecordByData('submissions', 'id', '1cwasztspz9oo38')
      if (sub) {
        sub.set('activity_id', 'xknedp4t80e4jh1')
        app.save(sub)
      }
    } catch (e) {
      console.log('Error updating submission 1cwasztspz9oo38: ' + e)
    }
  },
  (app) => {
    try {
      const sub = app.findFirstRecordByData('submissions', 'id', '1cwasztspz9oo38')
      if (sub && sub.getString('activity_id') === 'xknedp4t80e4jh1') {
        sub.set('activity_id', '')
        app.save(sub)
      }
    } catch (e) {
      console.log('Error reverting submission 1cwasztspz9oo38: ' + e)
    }
  },
)
