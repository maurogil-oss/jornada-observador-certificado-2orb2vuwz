/**
 * Regra canônica de nível do observador baseada na pontuação aprovada:
 * - Nível I: 0 a 499 pontos
 * - Nível II: 500 a 999 pontos
 * - Nível III: 1000+ pontos
 *
 * Sempre que 'points' for modificado em um registro da coleção 'users' (especialmente observadores),
 * este hook recalcula o 'level' correspondente e grava log em 'activity_logs' caso haja alteração de nível.
 */

onRecordUpdate((e) => {
  const originalPoints = e.record.original().getFloat('points') || 0
  const newPoints = e.record.getFloat('points') || 0
  const originalLevel = e.record.original().getString('level') || ''
  const currentLevel = e.record.getString('level') || ''

  // Função canônica de cálculo de nível por pontuação
  const calculateCanonicalLevel = (pts) => {
    if (pts >= 1000) return 'Nível III'
    if (pts >= 500) return 'Nível II'
    return 'Nível I'
  }

  const canonicalLevel = calculateCanonicalLevel(newPoints)

  // Se os pontos mudaram, ou se o nível gravado não está consistente com a pontuação
  if (originalPoints !== newPoints || currentLevel !== canonicalLevel) {
    e.record.set('level', canonicalLevel)
  }

  e.next()
}, 'users')

onRecordAfterUpdateSuccess((e) => {
  const originalLevel = e.record.original().getString('level') || ''
  const newLevel = e.record.getString('level') || ''
  const originalPoints = e.record.original().getFloat('points') || 0
  const newPoints = e.record.getFloat('points') || 0

  // Se o nível mudou em decorrência da alteração de pontos ou sincronização de nível
  if (originalLevel !== newLevel) {
    try {
      const logCollection = $app.findCollectionByNameOrId('activity_logs')
      const logRecord = new Record(logCollection)
      logRecord.set('actor_id', null)
      logRecord.set('action', 'observer_level_auto_recalculated')
      logRecord.set('entity_type', 'users')
      logRecord.set('entity_id', e.record.id)
      logRecord.set(
        'description',
        `Nível do observador recalculado automaticamente: '${originalLevel}' -> '${newLevel}' (Pontos: ${originalPoints} -> ${newPoints})`,
      )
      $app.save(logRecord)
    } catch (err) {
      console.log('Erro ao salvar log de recálculo de nível:', err)
    }
  }

  e.next()
}, 'users')
