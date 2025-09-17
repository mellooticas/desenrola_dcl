'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, X, Filter } from 'lucide-react'
import { Usuario } from '@/lib/types/database'
import { STATUS_LABELS, PRIORITY_LABELS } from '@/lib/utils/constants'
import { useLojas } from '@/lib/hooks/use-lojas'
import { useLaboratorios } from '@/lib/hooks/use-laboratorios'
import { cn } from '@/lib/utils/cn'

interface KanbanFiltersProps {
  filters: {
    loja: string
    laboratorio: string
    status: string
    prioridade: string
    search: string
  }
  onFiltersChange: (filters: any) => void
  userProfile: Usuario
}

export function KanbanFilters({ filters, onFiltersChange, userProfile }: KanbanFiltersProps) {
  const [localSearch, setLocalSearch] = useState(filters.search)
  const { data: lojas } = useLojas()
  const { data: laboratorios } = useLaboratorios()

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      onFiltersChange({ ...filters, search: localSearch })
    }, 300)

    return () => clearTimeout(timer)
  }, [localSearch])

  const handleFilterChange = (key: string, value: string) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const clearFilter = (key: string) => {
    onFiltersChange({ ...filters, [key]: 'all' })
  }

  const clearAllFilters = () => {
    setLocalSearch('')
    onFiltersChange({
      loja: userProfile.loja_id || 'all',
      laboratorio: 'all',
      status: 'all',
      prioridade: 'all',
      search: ''
    })
  }

  const activeFiltersCount = Object.values(filters).filter(v => v !== '' && v !== 'all').length

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Buscar por número, cliente ou laboratório..."
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          className="pl-10 pr-10"
        />
        {localSearch && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocalSearch('')}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Filter Selects */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Loja Filter - Only show if user can see multiple lojas */}
        {!userProfile.loja_id && lojas && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Loja</label>
            <Select value={filters.loja} onValueChange={(value) => handleFilterChange('loja', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Todas as lojas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as lojas</SelectItem>
                {lojas.map((loja) => (
                  <SelectItem key={loja.id} value={loja.id}>
                    {loja.nome} ({loja.codigo})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Laboratório Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Laboratório</label>
          <Select value={filters.laboratorio} onValueChange={(value) => handleFilterChange('laboratorio', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Todos os labs" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os laboratórios</SelectItem>
              {laboratorios?.map((lab) => (
                <SelectItem key={lab.id} value={lab.id}>
                  {lab.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Status Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Status</label>
          <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Todos os status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              {Object.entries(STATUS_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Prioridade Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Prioridade</label>
          <Select value={filters.prioridade} onValueChange={(value) => handleFilterChange('prioridade', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Todas as prioridades" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as prioridades</SelectItem>
              {Object.entries(PRIORITY_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Active Filters & Clear */}
      {activeFiltersCount > 0 && (
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">Filtros ativos:</span>
            
            <div className="flex flex-wrap gap-2">
              {filters.loja && filters.loja !== 'all' && lojas && (
                <Badge variant="outline" className="text-xs">
                  Loja: {lojas.find(l => l.id === filters.loja)?.nome}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => clearFilter('loja')}
                    className="ml-1 h-4 w-4 p-0 hover:bg-transparent"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </Badge>
              )}
              
              {filters.laboratorio && filters.laboratorio !== 'all' && laboratorios && (
                <Badge variant="outline" className="text-xs">
                  Lab: {laboratorios.find(l => l.id === filters.laboratorio)?.nome}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => clearFilter('laboratorio')}
                    className="ml-1 h-4 w-4 p-0 hover:bg-transparent"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </Badge>
              )}
              
              {filters.status && filters.status !== 'all' && (
                <Badge variant="outline" className="text-xs">
                  Status: {STATUS_LABELS[filters.status as keyof typeof STATUS_LABELS]}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => clearFilter('status')}
                    className="ml-1 h-4 w-4 p-0 hover:bg-transparent"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </Badge>
              )}
              
              {filters.prioridade && filters.prioridade !== 'all' && (
                <Badge variant="outline" className="text-xs">
                  Prioridade: {PRIORITY_LABELS[filters.prioridade as keyof typeof PRIORITY_LABELS]}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => clearFilter('prioridade')}
                    className="ml-1 h-4 w-4 p-0 hover:bg-transparent"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </Badge>
              )}
              
              {filters.search && (
                <Badge variant="outline" className="text-xs">
                  Busca: "{filters.search}"
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setLocalSearch('')}
                    className="ml-1 h-4 w-4 p-0 hover:bg-transparent"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </Badge>
              )}
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={clearAllFilters}
            className="text-xs"
          >
            Limpar todos
          </Button>
        </div>
      )}
    </div>
  )
}