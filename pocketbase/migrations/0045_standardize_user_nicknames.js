migrate(
  (app) => {
    const formatTitleCase = (str) => {
      if (!str) return ''
      const lowercaseWords = ['da', 'de', 'di', 'do', 'du', 'das', 'dos', 'e']
      return str
        .trim()
        .replace(/\s+/g, ' ')
        .toLowerCase()
        .split(' ')
        .map((word, index) => {
          if (index > 0 && lowercaseWords.includes(word)) return word
          return word.charAt(0).toUpperCase() + word.slice(1)
        })
        .join(' ')
    }

    const users = app.findRecordsByFilter('users', "nickname != ''", '', 10000, 0)
    for (const user of users) {
      const original = user.getString('nickname')
      const formatted = formatTitleCase(original)

      if (original !== formatted) {
        user.set('nickname', formatted)
        app.saveNoValidate(user)
      }
    }
  },
  (app) => {
    // Reverting standardization is not feasible since original casing is permanently lost
  },
)
