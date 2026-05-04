migrate(
  (app) => {
    app
      .db()
      .newQuery(`
    UPDATE users 
    SET level = REPLACE(level, 'Observador Não Pleno', 'Observador Pleno') 
    WHERE level LIKE '%Observador Não Pleno%'
  `)
      .execute()

    app
      .db()
      .newQuery(`
    UPDATE submissions 
    SET nivel = REPLACE(nivel, 'Observador Não Pleno', 'Observador Pleno') 
    WHERE nivel LIKE '%Observador Não Pleno%'
  `)
      .execute()
  },
  (app) => {
    app
      .db()
      .newQuery(`
    UPDATE users 
    SET level = REPLACE(level, 'Observador Pleno', 'Observador Não Pleno') 
    WHERE level LIKE '%Observador Pleno%'
  `)
      .execute()

    app
      .db()
      .newQuery(`
    UPDATE submissions 
    SET nivel = REPLACE(nivel, 'Observador Pleno', 'Observador Não Pleno') 
    WHERE nivel LIKE '%Observador Pleno%'
  `)
      .execute()
  },
)
