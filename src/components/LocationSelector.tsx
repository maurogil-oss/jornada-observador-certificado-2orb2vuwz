import { useEffect, useState } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getCountries, getStates, getCities, type GeoRecord } from '@/services/geography'
import { cn } from '@/lib/utils'
import { Keyboard, ChevronDown } from 'lucide-react'

interface LocationSelectorProps {
  country?: string
  state?: string
  city?: string
  onCountryChange: (val: string) => void
  onStateChange: (val: string) => void
  onCityChange: (val: string) => void
  disabled?: boolean
  layout?: 'grid' | 'horizontal'
  showAllOption?: boolean
  className?: string
  countryError?: string
  stateError?: string
  cityError?: string
}

export function LocationSelector({
  country,
  state,
  city,
  onCountryChange,
  onStateChange,
  onCityChange,
  disabled = false,
  layout = 'grid',
  showAllOption = false,
  className,
  countryError,
  stateError,
  cityError,
}: LocationSelectorProps) {
  const [countries, setCountries] = useState<GeoRecord[]>([])
  const [states, setStates] = useState<GeoRecord[]>([])
  const [cities, setCities] = useState<GeoRecord[]>([])
  const [manualCity, setManualCity] = useState(false)

  useEffect(() => {
    getCountries().then(setCountries).catch(console.error)
  }, [])

  useEffect(() => {
    const c = countries.find((x) => x.name === country)
    if (c || country === 'all') {
      getStates(c?.id || '')
        .then(setStates)
        .catch(console.error)
    } else {
      setStates([])
    }
  }, [country, countries])

  useEffect(() => {
    const s = states.find((x) => x.name === state)
    if (s || state === 'all') {
      getCities(s?.id || '')
        .then(setCities)
        .catch(console.error)
    } else {
      setCities([])
    }
  }, [state, states])

  useEffect(() => {
    if (cities.length === 0 && !showAllOption && state) {
      setManualCity(true)
    }
  }, [cities.length, state, showAllOption])

  const containerClass =
    layout === 'horizontal'
      ? 'flex flex-col md:flex-row gap-4 w-full'
      : 'grid grid-cols-1 md:grid-cols-3 gap-4 w-full'

  return (
    <div className={cn(containerClass, className)}>
      <div className="space-y-2 flex-1">
        <Label className={countryError ? 'text-destructive' : ''}>
          País {showAllOption ? '' : '*'}
        </Label>
        <Select
          disabled={disabled}
          value={country === 'all' ? 'all' : country || undefined}
          onValueChange={(val) => {
            onCountryChange(val)
            onStateChange(showAllOption ? 'all' : '')
            onCityChange(showAllOption ? 'all' : '')
          }}
        >
          <SelectTrigger className="h-11 bg-background">
            <SelectValue placeholder="Selecione um país" />
          </SelectTrigger>
          <SelectContent>
            {showAllOption && <SelectItem value="all">Todos os Países</SelectItem>}
            {countries.map((c) => (
              <SelectItem key={c.id} value={c.name}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {countryError && (
          <p className="text-[0.8rem] font-medium text-destructive">{countryError}</p>
        )}
      </div>

      <div className="space-y-2 flex-1">
        <Label className={stateError ? 'text-destructive' : ''}>
          Estado / Província {showAllOption ? '' : '*'}
        </Label>
        <Select
          disabled={disabled || (!showAllOption && !country) || states.length === 0}
          value={state === 'all' ? 'all' : state || undefined}
          onValueChange={(val) => {
            onStateChange(val)
            onCityChange(showAllOption ? 'all' : '')
          }}
        >
          <SelectTrigger className="h-11 bg-background">
            <SelectValue placeholder="Selecione o estado" />
          </SelectTrigger>
          <SelectContent>
            {showAllOption && <SelectItem value="all">Todos os Estados</SelectItem>}
            {states.map((s) => (
              <SelectItem key={s.id} value={s.name}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {stateError && <p className="text-[0.8rem] font-medium text-destructive">{stateError}</p>}
      </div>

      <div className="space-y-2 flex-1">
        <div className="flex items-center justify-between">
          <Label className={cityError ? 'text-destructive' : ''}>
            Cidade {showAllOption ? '' : '*'}
          </Label>
          {cities.length > 0 && !showAllOption && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => setManualCity(!manualCity)}
            >
              {manualCity ? (
                <>
                  <ChevronDown className="w-3 h-3 mr-1" />
                  Ver lista
                </>
              ) : (
                <>
                  <Keyboard className="w-3 h-3 mr-1" />
                  Digitar manualmente
                </>
              )}
            </Button>
          )}
        </div>
        {manualCity && !showAllOption ? (
          <Input
            disabled={disabled}
            value={city === 'all' ? '' : city || ''}
            onChange={(e) => onCityChange(e.target.value)}
            placeholder="Digite o nome da sua cidade"
            className="h-11 bg-background"
          />
        ) : (
          <Select
            disabled={disabled || (!showAllOption && !state) || cities.length === 0}
            value={city === 'all' ? 'all' : city || undefined}
            onValueChange={onCityChange}
          >
            <SelectTrigger className="h-11 bg-background">
              <SelectValue placeholder="Selecione a cidade" />
            </SelectTrigger>
            <SelectContent>
              {showAllOption && <SelectItem value="all">Todas as Cidades</SelectItem>}
              {cities.map((c) => (
                <SelectItem key={c.id} value={c.name}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        {cities.length === 0 && !showAllOption && !manualCity && (
          <p className="text-xs text-muted-foreground">
            Cidade não encontrada?{' '}
            <button
              type="button"
              className="text-primary hover:underline font-medium"
              onClick={() => setManualCity(true)}
            >
              Digite manualmente
            </button>
          </p>
        )}
        {manualCity && !showAllOption && (
          <p className="text-xs text-muted-foreground">
            Digite o nome completo da sua cidade. Ela será registrada automaticamente.
          </p>
        )}
        {cityError && <p className="text-[0.8rem] font-medium text-destructive">{cityError}</p>}
      </div>
    </div>
  )
}
