import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { getUsers } from '@/services/users'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Loader2, MapPin, Globe, Building2 } from 'lucide-react'

export default function AdminStatistics() {
  const [loading, setLoading] = useState(true)

  const [byCity, setByCity] = useState<Record<string, number>>({})
  const [byState, setByState] = useState<Record<string, number>>({})
  const [byCountry, setByCountry] = useState<Record<string, number>>({})

  useEffect(() => {
    async function loadStats() {
      try {
        const users = await getUsers()
        const activeObservers = users.filter(
          (u: any) => u.is_active !== false && u.role === 'observer',
        )

        const cCity: Record<string, number> = {}
        const cState: Record<string, number> = {}
        const cCountry: Record<string, number> = {}

        activeObservers.forEach((u: any) => {
          if (u.city) {
            const c = u.city.trim()
            cCity[c] = (cCity[c] || 0) + 1
          }
          if (u.state) {
            const s = u.state.trim()
            cState[s] = (cState[s] || 0) + 1
          }
          if (u.country) {
            const cnt = u.country.trim()
            cCountry[cnt] = (cCountry[cnt] || 0) + 1
          }
        })

        setByCity(cCity)
        setByState(cState)
        setByCountry(cCountry)
      } catch (err) {
        console.error('Failed to load stats', err)
      } finally {
        setLoading(false)
      }
    }
    loadStats()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
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
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Demografia e Estatísticas</h1>
        <p className="text-muted-foreground">
          Distribuição geográfica dos observadores ativos na plataforma.
        </p>
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
