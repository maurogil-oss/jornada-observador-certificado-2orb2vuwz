migrate(
  (app) => {
    // Delete invalid users
    app
      .db()
      .newQuery(`
    DELETE FROM users 
    WHERE LOWER(full_name) LIKE '%balantinis%' 
       OR LOWER(nickname) LIKE '%balantinis%' 
       OR LOWER(state) LIKE '%balantinis%' 
       OR LOWER(country) LIKE '%balantinis%'
       OR LOWER(full_name) LIKE '%sssv%' 
       OR LOWER(nickname) LIKE '%sssv%' 
       OR LOWER(state) LIKE '%sssv%' 
       OR LOWER(country) LIKE '%sssv%'
       OR LOWER(full_name) LIKE '%waltdisney%' 
       OR LOWER(nickname) LIKE '%waltdisney%' 
       OR LOWER(state) LIKE '%waltdisney%' 
       OR LOWER(country) LIKE '%waltdisney%'
       OR LOWER(full_name) LIKE '%ssv%' 
       OR LOWER(nickname) LIKE '%ssv%' 
       OR LOWER(state) LIKE '%ssv%' 
       OR LOWER(country) LIKE '%ssv%'
       OR LOWER(full_name) LIKE '%waltdieney%' 
       OR LOWER(nickname) LIKE '%waltdieney%' 
       OR LOWER(state) LIKE '%waltdieney%' 
       OR LOWER(country) LIKE '%waltdieney%'
  `)
      .execute()

    // Normalize city names
    app
      .db()
      .newQuery(`
    UPDATE users 
    SET city = 'São José dos Campos' 
    WHERE LOWER(city) IN ('sao jose dos campos', 'são josé dos campos')
  `)
      .execute()
  },
  (app) => {
    // Irreversible operation
  },
)
