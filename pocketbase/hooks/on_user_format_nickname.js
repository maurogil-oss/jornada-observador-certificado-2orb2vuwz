onRecordCreate((e) => {
  const nickname = e.record.getString('nickname')
  if (nickname) {
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
    e.record.set('nickname', formatTitleCase(nickname))
  }
  e.next()
}, 'users')

onRecordUpdate((e) => {
  const nickname = e.record.getString('nickname')
  if (nickname) {
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
    e.record.set('nickname', formatTitleCase(nickname))
  }
  e.next()
}, 'users')
