migrate(
  (app) => {
    const submissions = app.findRecordsByFilter('submissions', "activity_id = ''", '', 10000, 0)
    const metadata = app.findRecordsByFilter('activities_metadata', '', '', 1000, 0)

    const metaMap = {}
    for (let i = 0; i < metadata.length; i++) {
      const meta = metadata[i]
      const title = meta.getString('title').trim().toLowerCase()
      metaMap[title] = meta.id
    }

    for (let i = 0; i < submissions.length; i++) {
      const sub = submissions[i]
      const title = sub.getString('title').trim().toLowerCase()
      if (metaMap[title]) {
        sub.set('activity_id', metaMap[title])
        app.saveNoValidate(sub)
      }
    }
  },
  (app) => {
    // No robust automatic revert path without risking deletion of intentional activity_ids
  },
)
