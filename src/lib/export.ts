import pb from '@/lib/pocketbase/client'

export const exportRanking = async (format: 'excel' | 'pdf') => {
  try {
    if (pb.authStore.record?.id) {
      await pb.collection('activity_logs').create({
        actor_id: pb.authStore.record.id,
        action: 'export_report',
        entity_type: 'ranking',
        description: `Exported ranking report in ${format.toUpperCase()} format`,
      })
    }
  } catch (logErr) {
    console.error('Failed to log export activity:', logErr)
  }

  // Fetch observers sorted by points DESC for the report
  const records = await pb.collection('users').getFullList({
    filter: "role != 'admin'",
    sort: '-points',
  })

  if (format === 'excel') {
    const headers = ['Posição', 'Nome Completo', 'E-mail', 'Pontos', 'Nível', 'Turma', 'Status']
    const rows = records.map((u, index) => [
      index + 1,
      `"${(u.full_name || u.name || '').replace(/"/g, '""')}"`,
      `"${(u.email || '').replace(/"/g, '""')}"`,
      u.points || 0,
      `"${(u.level || '').replace(/"/g, '""')}"`,
      u.turma || '',
      u.is_active !== false ? 'Ativo' : 'Inativo',
    ])
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')

    // Add BOM for proper UTF-8 parsing in Excel
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `ranking_observadores_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } else {
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      throw new Error(
        'O bloqueador de pop-ups impediu a geração do PDF. Por favor, permita pop-ups para este site.',
      )
    }

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Jornada Observador Certificado - Ranking</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 30px; color: #111; margin: 0; }
            h1 { text-align: center; color: #1e3a8a; margin-bottom: 5px; font-size: 24px; }
            .date { text-align: center; color: #64748b; margin-bottom: 30px; font-size: 13px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
            th, td { border: 1px solid #cbd5e1; padding: 8px 10px; text-align: left; }
            th { background-color: #f1f5f9; font-weight: bold; color: #334155; text-transform: uppercase; }
            tr:nth-child(even) { background-color: #f8fafc; }
            .points { font-weight: bold; color: #0f172a; text-align: right; }
            .center { text-align: center; }
            @media print {
              body { padding: 0; }
              @page { margin: 1cm; }
            }
          </style>
        </head>
        <body>
          <h1>Jornada Observador Certificado</h1>
          <div class="date">Relatório de Ranking gerado em: ${new Date().toLocaleDateString('pt-BR', { dateStyle: 'long' })} às ${new Date().toLocaleTimeString('pt-BR')}</div>
          <table>
            <thead>
              <tr>
                <th class="center" style="width: 50px;">Posição</th>
                <th>Nome Completo</th>
                <th>E-mail</th>
                <th>Nível</th>
                <th class="center" style="width: 50px;">Turma</th>
                <th class="center" style="width: 60px;">Status</th>
                <th style="text-align: right; width: 60px;">Pontos</th>
              </tr>
            </thead>
            <tbody>
              ${records
                .map(
                  (u, index) => `
                <tr>
                  <td class="center">${index + 1}º</td>
                  <td>${u.full_name || u.name || '-'}</td>
                  <td>${u.email || '-'}</td>
                  <td>${u.level || '-'}</td>
                  <td class="center">${u.turma || '-'}</td>
                  <td class="center">${u.is_active !== false ? 'Ativo' : 'Inativo'}</td>
                  <td class="points">${u.points || 0}</td>
                </tr>
              `,
                )
                .join('')}
            </tbody>
          </table>
          <script>
            window.onload = () => {
              setTimeout(() => {
                window.print();
                setTimeout(() => window.close(), 500);
              }, 500);
            };
          </script>
        </body>
      </html>
    `
    printWindow.document.write(html)
    printWindow.document.close()
  }
}
