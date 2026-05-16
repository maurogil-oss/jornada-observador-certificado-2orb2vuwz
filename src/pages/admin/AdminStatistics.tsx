import { useEffect, useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getUsers } from '@/services/users'
import { exportToCSV } from '@/lib/utils'
import { LocationSelector } from '@/components/LocationSelector'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Loader2, MapPin, Globe, Building2, FileSpreadsheet, FileText } from 'lucide-react'

export default function AdminStatistics() {
  const [loading, setLoading] = useState(true)
  const [allUsers, setAllUsers] = useState<any[]>([])

  const [filterCountry, setFilterCountry] = useState<string>('all')
  const [filterState, setFilterState] = useState<string>('all')
  const [filterCity, setFilterCity] = useState<string>('all')

  useEffect(() => {
    async function loadStats() {
      try {
        const users = await getUsers()
        const invalidNames = ['balantinis', 'sssv', 'ssv', 'waltdisney']

        const activeObservers = users.filter(
          (u: any) =>
            u.is_active !== false &&
            u.role === 'observer' &&
            !invalidNames.includes((u.name || '').toLowerCase()) &&
            !invalidNames.includes((u.full_name || '').toLowerCase()),
        )

        setAllUsers(activeObservers)
      } catch (err) {
        console.error('Failed to load stats', err)
      } finally {
        setLoading(false)
      }
    }
    loadStats()
  }, [])

  const filteredUsers = useMemo(() => {
    return allUsers.filter((u) => {
      if (filterCountry !== 'all' && u.country !== filterCountry) return false
      if (filterState !== 'all' && u.state !== filterState) return false
      if (filterCity !== 'all' && u.city !== filterCity) return false
      return true
    })
  }, [allUsers, filterCountry, filterState, filterCity])

  const { byCity, byState, byCountry } = useMemo(() => {
    const cCity: Record<string, number> = {}
    const cState: Record<string, number> = {}
    const cCountry: Record<string, number> = {}

    filteredUsers.forEach((u) => {
      if (u.city) cCity[u.city] = (cCity[u.city] || 0) + 1
      if (u.state) cState[u.state] = (cState[u.state] || 0) + 1
      if (u.country) cCountry[u.country] = (cCountry[u.country] || 0) + 1
    })

    return { byCity: cCity, byState: cState, byCountry: cCountry }
  }, [filteredUsers])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  const handleExportCSV = () => {
    const exportData = filteredUsers.map((u) => ({
      'Nome Completo': u.full_name || u.name || '-',
      'E-mail': u.email || '-',
      País: u.country || '-',
      Estado: u.state || '-',
      Cidade: u.city || '-',
      Pontos: u.points || 0,
    }))
    exportToCSV(exportData, `usuarios_geografia_${new Date().toISOString().split('T')[0]}.csv`)
  }

  const handleExportPDF = () => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Relatório Demográfico - Jornada Observador Certificado</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 30px; color: #111; margin: 0; }
            h1 { text-align: center; color: #1e3a8a; margin-bottom: 5px; font-size: 24px; }
            .date { text-align: center; color: #64748b; margin-bottom: 10px; font-size: 13px; }
            .filters { text-align: center; color: #475569; margin-bottom: 30px; font-size: 12px; }
            .summary { display: flex; justify-content: space-around; margin-bottom: 30px; background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; }
            .summary-item { text-align: center; }
            .summary-value { font-size: 20px; font-weight: bold; color: #0f172a; }
            .summary-label { font-size: 12px; color: #64748b; text-transform: uppercase; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 11px; }
            th, td { border: 1px solid #cbd5e1; padding: 6px 8px; text-align: left; }
            th { background-color: #f1f5f9; font-weight: bold; color: #334155; text-transform: uppercase; }
            tr:nth-child(even) { background-color: #f8fafc; }
            .right { text-align: right; }
            @media print {
              body { padding: 0; }
              @page { margin: 1cm; }
            }
          </style>
        </head>
        <body>
          <h1>Jornada Observador Certificado</h1>
          <div class="date">Relatório Demográfico gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</div>
          <div class="filters">Filtros: País (${filterCountry === 'all' ? 'Todos' : filterCountry}) | Estado (${filterState === 'all' ? 'Todos' : filterState}) | Cidade (${filterCity === 'all' ? 'Todas' : filterCity})</div>
          
          <div class="summary">
            <div class="summary-item">
              <div class="summary-value">${Object.keys(byCity).length}</div>
              <div class="summary-label">Cidades Distintas</div>
            </div>
            <div class="summary-item">
              <div class="summary-value">${Object.keys(byState).length}</div>
              <div class="summary-label">Estados (UF)</div>
            </div>
            <div class="summary-item">
              <div class="summary-value">${Object.keys(byCountry).length}</div>
              <div class="summary-label">Países</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Nome Completo</th>
                <th>E-mail</th>
                <th>País</th>
                <th>Estado</th>
                <th>Cidade</th>
                <th class="right">Pontos</th>
              </tr>
            </thead>
            <tbody>
              ${filteredUsers
                .sort((a, b) => (b.points || 0) - (a.points || 0))
                .map(
                  (u) => `
                <tr>
                  <td>${u.full_name || u.name || '-'}</td>
                  <td>${u.email || '-'}</td>
                  <td>${u.country || '-'}</td>
                  <td>${u.state || '-'}</td>
                  <td>${u.city || '-'}</td>
                  <td class="right">${u.points || 0}</td>
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

  const renderTable = (data: Record<string, number>, emptyMsg: string) => {
    const entries = Object.entries(data).sort((a, b) => b[1] - a[1])

    if (entries.length === 0) {
      return (
        <div className="p-8 text-center text-muted-foreground border border-dashed rounded-md bg-muted/20">
          {emptyMsg}
        </div>
      )
    }

    return (
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Localização</TableHead>
              <TableHead className="text-right">Total de Observadores</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map(([key, count]) => (
              <TableRow key={key}>
                <TableCell className="font-medium">{key}</TableCell>
                <TableCell className="text-right">{count}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-8 max-w-6xl mx-auto animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Demografia e Estatísticas</h1>
          <p className="text-muted-foreground">
            Distribuição geográfica dos observadores ativos na plataforma.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={handleExportCSV}
            variant="outline"
            className="bg-white hover:bg-slate-50 text-slate-700"
          >
            <FileSpreadsheet className="w-4 h-4 mr-2 text-green-600" />
            Exportar CSV
          </Button>
          <Button
            onClick={handleExportPDF}
            variant="outline"
            className="bg-white hover:bg-slate-50 text-slate-700"
          >
            <FileText className="w-4 h-4 mr-2 text-red-500" />
            Exportar PDF
          </Button>
        </div>
      </div>

      <div className="bg-card border rounded-lg p-4 mb-8">
        <LocationSelector
          layout="horizontal"
          showAllOption
          country={filterCountry}
          state={filterState}
          city={filterCity}
          onCountryChange={setFilterCountry}
          onStateChange={setFilterState}
          onCityChange={setFilterCity}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Cidades Distintas</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Object.keys(byCity).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Estados (UF)</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Object.keys(byState).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Países</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Object.keys(byCountry).length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Por Cidade</CardTitle>
            <CardDescription>Quantidade de observadores por município</CardDescription>
          </CardHeader>
          <CardContent>
            {renderTable(byCity, 'Nenhum dado geográfico de cidade disponível')}
          </CardContent>
        </Card>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Por Estado</CardTitle>
              <CardDescription>Quantidade de observadores por unidade federativa</CardDescription>
            </CardHeader>
            <CardContent>
              {renderTable(byState, 'Nenhum dado geográfico de estado disponível')}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Por País</CardTitle>
              <CardDescription>Quantidade de observadores por país</CardDescription>
            </CardHeader>
            <CardContent>
              {renderTable(byCountry, 'Nenhum dado geográfico de país disponível')}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
