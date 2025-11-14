// components/dashboard/FiltrosPeriodo.tsx
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Calendar, ChevronDown } from 'lucide-react'

export interface DashboardFilters {
  dataInicio: string
  dataFim: string
  laboratorio: string
  classe: string
  loja: string
}

interface FiltrosPeriodoProps {
  filters: DashboardFilters
  onFiltersChange: (filters: DashboardFilters) => void
} 

interface SelectOption {
  id: string
  nome: string
}

export function FiltrosPeriodo({ filters, onFiltersChange }: FiltrosPeriodoProps) {
  const [laboratorios, setLaboratorios] = useState<SelectOption[]>([])
  const [classes, setClasses] = useState<SelectOption[]>([])
  const [lojas, setLojas] = useState<SelectOption[]>([])
  const [loading, setLoading] = useState(true)

  // Buscar dados para os filtros
  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        const [labResponse, classResponse, lojaResponse] = await Promise.all([
          fetch('/api/laboratorios?ativo=true'),
          fetch('/api/classes?ativo=true'),
          fetch('/api/lojas?ativo=true')
        ])

        const [labData, classData, lojaData] = await Promise.all([
          labResponse.json(),
          classResponse.json(),
          lojaResponse.json()
        ])

        setLaboratorios(labData || [])
        setClasses(classData || [])
        setLojas(lojaData || [])
        setLoading(false)
      } catch (error) {
        console.error('Erro ao carregar dados dos filtros:', error)
        setLoading(false)
      }
    }


    fetchFilterData()
  }, [])

  const handleFilterChange = (key: keyof DashboardFilters, value: string) => {
    const newFilters = { ...filters, [key]: value }
    onFiltersChange(newFilters)
  }

  const presetPeriods = [
    { label: 'Últimos 7 dias', days: 7 },
    { label: 'Mês Atual', days: 'month' as const },
    { label: 'Últimos 30 dias', days: 30 },
    { label: 'Últimos 90 dias', days: 90 },
    { label: 'Este ano', days: 365 }
  ]

  const setPresetPeriod = (days: number | 'month') => {
    let dataInicio: string
    const dataFim = new Date().toISOString().split('T')[0]
    
    if (days === 'month') {
      // Mês atual: do dia 1 até hoje
      const hoje = new Date()
      dataInicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
        .toISOString().split('T')[0]
    } else {
      dataInicio = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
        .toISOString().split('T')[0]
    }
    
    const newFilters = { ...filters, dataInicio, dataFim }
    onFiltersChange(newFilters)
  }

  const isActivePeriod = (days: number | 'month') => {
    const expectedDataFim = new Date().toISOString().split('T')[0]
    let expectedDataInicio: string
    
    if (days === 'month') {
      const hoje = new Date()
      expectedDataInicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
        .toISOString().split('T')[0]
    } else {
      expectedDataInicio = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
        .toISOString().split('T')[0]
    }
    
    return filters.dataInicio === expectedDataInicio && filters.dataFim === expectedDataFim
  }

  return (
    <div className="space-y-4 p-4">
      {/* Filtros de período */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex gap-2">
          {presetPeriods.map((preset) => {
            const isActive = isActivePeriod(preset.days)
            return (
              <Button
                key={preset.days}
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() => setPresetPeriod(preset.days)}
                className={
                  isActive 
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-md' 
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300'
                }
              >
                {preset.label}
              </Button>
            )
          })}
        </div>
        <div className="flex gap-4 items-center">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            <input
              type="date"
              value={filters.dataInicio}
              onChange={(e) => handleFilterChange('dataInicio', e.target.value)}
              className="px-3 py-1.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white transition-colors"
            />
            <span className="text-gray-500 dark:text-gray-400 font-medium">até</span>
            <input
              type="date"
              value={filters.dataFim}
              onChange={(e) => handleFilterChange('dataFim', e.target.value)}
              className="px-3 py-1.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white transition-colors"
            />
          </div>
        </div>
      </div>
      {/* Filtros de segmentação */}
      <div className="flex flex-wrap gap-4 items-center">
        {/* Laboratório */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Laboratório:</label>
          <select
            value={filters.laboratorio}
            onChange={(e) => handleFilterChange('laboratorio', e.target.value)}
            className="px-3 py-1.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[140px] bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white transition-colors"
            disabled={loading}
          >
            <option value="">Todos</option>
            {laboratorios.map((lab) => (
              <option key={lab.id} value={lab.nome}>
                {lab.nome}
              </option>
            ))}
          </select>
        </div>
        {/* Classe */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Classe:</label>
          <select
            value={filters.classe}
            onChange={(e) => handleFilterChange('classe', e.target.value)}
            className="px-3 py-1.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[140px] bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white transition-colors"
            disabled={loading}
          >
            <option value="">Todas</option>
            {classes.map((classe) => (
              <option key={classe.id} value={classe.nome}>
                {classe.nome}
              </option>
            ))}
          </select>
        </div>
        {/* Loja */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Loja:</label>
          <select
            value={filters.loja}
            onChange={(e) => handleFilterChange('loja', e.target.value)}
            className="px-3 py-1.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[140px] bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white transition-colors"
            disabled={loading}
          >
            <option value="">Todas</option>
            {lojas.map((loja) => (
              <option key={loja.id} value={loja.nome}>
                {loja.nome}
              </option>
            ))}
          </select>
        </div>
        {/* Botão de limpar filtros */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onFiltersChange({
            ...filters,
            laboratorio: '',
            classe: '',
            loja: ''
          })}
          className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          Limpar Filtros
        </Button>
      </div>
      {/* Indicador de filtros ativos */}
      {(filters.laboratorio || filters.classe || filters.loja) && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Filtros ativos:</span>
          {filters.laboratorio && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              Lab: {filters.laboratorio}
              <button
                onClick={() => handleFilterChange('laboratorio', '')}
                className="ml-1 text-blue-600 hover:text-blue-800"
              >
                ×
              </button>
            </span>
          )}
          {filters.classe && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800">
              Classe: {filters.classe}
              <button
                onClick={() => handleFilterChange('classe', '')}
                className="ml-1 text-green-600 hover:text-green-800"
              >
                ×
              </button>
            </span>
          )}
          {filters.loja && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
              Loja: {filters.loja}
              <button
                onClick={() => handleFilterChange('loja', '')}
                className="ml-1 text-purple-600 hover:text-purple-800"
              >
                ×
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  )
}