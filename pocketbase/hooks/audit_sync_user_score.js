routerAdd(
  'POST',
  '/backend/v1/audit/sync-user-score',
  (e) => {
    const body = e.requestInfo().body
    const userId = body.user_id
    const calculatedPoints = body.calculated_points
    const calculatedLevel = body.calculated_level

    if (!userId || typeof calculatedPoints !== 'number') {
      return e.badRequestError('Missing user_id or calculated_points')
    }

    const user = $app.findRecordById('users', userId)
    const oldPoints = user.getInt('points') || 0
    const oldLevel = user.getString('level') || ''

    if (oldPoints === calculatedPoints && oldLevel.startsWith(calculatedLevel)) {
      return e.json(200, { message: 'Score already synchronized' })
    }

    // Update user
    user.set('points', calculatedPoints)
    if (calculatedLevel) {
      let finalLevel = calculatedLevel
      if (calculatedLevel === 'Nível III' && !oldLevel.includes('Mobilizador')) {
        finalLevel = 'Nível III - Observador Certificado Mobilizador'
      } else if (calculatedLevel === 'Nível II' && !oldLevel.includes('Pleno')) {
        finalLevel = 'Nível II - Observador Certificado Pleno'
      } else if (calculatedLevel === 'Nível I' && !oldLevel.includes('Observador Certificado')) {
        finalLevel = 'Nível I - Observador Certificado'
      }
      user.set('level', finalLevel)
    }

    $app.save(user)

    // Log in activity_logs
    try {
      const logCollection = $app.findCollectionByNameOrId('activity_logs')
      const logRecord = new Record(logCollection)
      logRecord.set('actor_id', e.auth?.id || null)
      logRecord.set('action', 'score_audit_sync')
      logRecord.set('entity_type', 'users')
      logRecord.set('entity_id', userId)
      logRecord.set(
        'description',
        `Score adjusted: Titration limit exceeded / Points audit. Changed points from ${oldPoints} to ${calculatedPoints}`,
      )
      $app.save(logRecord)
    } catch (err) {
      // Graceful fallback if activity_logs is not available
      console.error('Failed to create activity log for score sync:', err)
    }

    return e.json(200, { message: 'Score synchronized successfully', points: calculatedPoints })
  },
  $apis.requireAuth(),
)
