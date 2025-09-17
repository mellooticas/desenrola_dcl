// lib/hooks/useFiltersDebug.ts
'use client'

import { useEffect } from 'react'
import type { DashboardFilters } from '@/components/dashboard/FiltrosPeriodo'

export function useFiltersDebug(filters: DashboardFilters) {
  useEffect(() => {
    console.log('🎯 [DEBUG] Filtros mudaram:', {
      período: `${filters.dataInicio} até ${filters.dataFim}`,
      laboratorio: filters.laboratorio || 'Todos',
      classe: filters.classe || 'Todas', 
      loja: filters.loja || 'Todas',
      dias: Math.ceil((new Date(filters.dataFim).getTime() - new Date(filters.dataInicio).getTime()) / (1000 * 60 * 60 * 24))
    })
  }, [filters])

  const hasActiveFilters = !!(filters.laboratorio || filters.classe || filters.loja)
  
  return {
    hasActiveFilters,
    filterSummary: {
      período: `${filters.dataInicio} até ${filters.dataFim}`,
      segmentação: [
        filters.laboratorio && `Lab: ${filters.laboratorio}`,
        filters.classe && `Classe: ${filters.classe}`,
        filters.loja && `Loja: ${filters.loja}`
      ].filter(Boolean).join(', ') || 'Nenhum filtro de segmentação'
    }
  }
}