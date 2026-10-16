migrate(
  (app) => {
    const submissionsCol = app.findCollectionByNameOrId('submissions')

    // 1. Atualizar SelectField 'status' para incluir os novos status:
    // 'Em Análise', 'Aprovado', 'Ajuste Necessário', 'Aguardando Complemento', 'Renunciada'
    const statusField = submissionsCol.fields.getByName('status')
    if (statusField) {
      statusField.values = [
        'Em Análise',
        'Aprovado',
        'Ajuste Necessário',
        'Aguardando Complemento',
        'Renunciada',
      ]
    }

    // 2. Adicionar campo 'divergence_reason' (TextField) se não existir
    if (!submissionsCol.fields.getByName('divergence_reason')) {
      submissionsCol.fields.add(
        new TextField({
          name: 'divergence_reason',
          required: false,
        }),
      )
    }

    // 3. Adicionar campo 'rules_accepted' (BoolField) se não existir
    if (!submissionsCol.fields.getByName('rules_accepted')) {
      submissionsCol.fields.add(
        new BoolField({
          name: 'rules_accepted',
          required: false,
        }),
      )
    }

    // 4. Adicionar campo 'auto_evaluated' (BoolField) para rastreabilidade de automação
    if (!submissionsCol.fields.getByName('auto_evaluated')) {
      submissionsCol.fields.add(
        new BoolField({
          name: 'auto_evaluated',
          required: false,
        }),
      )
    }

    app.save(submissionsCol)
    console.log(
      '[Migration 0141] submissions collection updated with new status values and divergence fields',
    )
  },
  (app) => {
    const submissionsCol = app.findCollectionByNameOrId('submissions')
    const statusField = submissionsCol.fields.getByName('status')
    if (statusField) {
      statusField.values = ['Em Análise', 'Aprovado', 'Ajuste Necessário']
    }
    app.save(submissionsCol)
  },
)
