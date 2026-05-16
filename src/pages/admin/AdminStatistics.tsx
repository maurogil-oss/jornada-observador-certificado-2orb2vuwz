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
          (u: any) =>
            u.is_active !== false &&
            u.role === 'observer' &&
            u.state !== 'SSV' &&
            u.country !== 'waltdieney',
        )

        const cCityMap: Record<string, string> = {}
        const cCityCount: Record<string, number> = {}
        const cState: Record<string, number> = {}
        const cCountry: Record<string, number> = {}

        activeObservers.forEach((u: any) => {
          if (u.city) {
            const raw = u.city.trim()
            let lower = raw.toLowerCase()
            let display = raw

            // Specific normalization for São José dos Campos as per requirements
            if (lower === 'sao jose dos campos' || lower === 'são josé dos campos') {
              lower = 'são josé dos campos'
              display = 'São José dos Campos'
            }

            cCityCount[lower] = (cCityCount[lower] || 0) + 1

            // Prefer version with uppercase/accents for display
            if (
              !cCityMap[lower] ||
              (raw !== raw.toLowerCase() && cCityMap[lower] === cCityMap[lower].toLowerCase())
            ) {
              cCityMap[lower] = display
            }
          }
          if (u.state) {
            let s = u.state.trim()
            if (s.length === 2) {
              s = s.toUpperCase()
            } else if (
              u.country &&
              (u.country.trim().toLowerCase() === 'brasil' ||
                u.country.trim().toLowerCase() === 'brazil')
            ) {
              // Runtime grouping fallback to prevent duplicate segments
              const stateMap: Record<string, string> = {
                acre: 'AC',
                alagoas: 'AL',
                amapá: 'AP',
                amapa: 'AP',
                amazonas: 'AM',
                bahia: 'BA',
                ceará: 'CE',
                ceara: 'CE',
                'distrito federal': 'DF',
                'espírito santo': 'ES',
                'espirito santo': 'ES',
                goiás: 'GO',
                goias: 'GO',
                maranhão: 'MA',
                maranhao: 'MA',
                'mato grosso': 'MT',
                'mato grosso do sul': 'MS',
                'minas gerais': 'MG',
                pará: 'PA',
                para: 'PA',
                paraíba: 'PB',
                paraiba: 'PB',
                paraná: 'PR',
                parana: 'PR',
                pernambuco: 'PE',
                piauí: 'PI',
                piaui: 'PI',
                'rio de janeiro': 'RJ',
                'rio grande do norte': 'RN',
                'rio grande do sul': 'RS',
                rondônia: 'RO',
                rondonia: 'RO',
                roraima: 'RR',
                'santa catarina': 'SC',
                'são paulo': 'SP',
                'sao paulo': 'SP',
                sergipe: 'SE',
                tocantins: 'TO',
              }
              const lower = s.toLowerCase()
              if (stateMap[lower]) s = stateMap[lower]
            }
            cState[s] = (cState[s] || 0) + 1
          }
          if (u.country) {
            const cnt = u.country.trim()
            cCountry[cnt] = (cCountry[cnt] || 0) + 1
          }
        })

        const cCityFinal: Record<string, number> = {}
        for (const [lower, count] of Object.entries(cCityCount)) {
          cCityFinal[cCityMap[lower]] = count
        }

        setByCity(cCityFinal)
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
