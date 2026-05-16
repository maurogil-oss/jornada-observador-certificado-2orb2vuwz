migrate((app) => {
  // 1. Delete users with names 'balantinis', 'SSSV', 'SSV', 'waltdisney'
  // Also delete their submissions to avoid orphaned records
  app
    .db()
    .newQuery(`
    DELETE FROM submissions WHERE user_id IN (
      SELECT id FROM users WHERE LOWER(name) IN ('balantinis', 'sssv', 'ssv', 'waltdisney') 
      OR LOWER(full_name) IN ('balantinis', 'sssv', 'ssv', 'waltdisney')
    )
  `)
    .execute()

  app
    .db()
    .newQuery(`
    DELETE FROM users WHERE LOWER(name) IN ('balantinis', 'sssv', 'ssv', 'waltdisney') 
    OR LOWER(full_name) IN ('balantinis', 'sssv', 'ssv', 'waltdisney')
  `)
    .execute()

  // 2. Normalize city name 'sao jose dos campos' -> 'São José dos Campos'
  app
    .db()
    .newQuery(`
    UPDATE users SET city = 'São José dos Campos' 
    WHERE LOWER(city) = 'são josé dos campos' OR LOWER(city) = 'sao jose dos campos'
  `)
    .execute()
})
