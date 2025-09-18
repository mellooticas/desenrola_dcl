export type { DashboardFilters } from '@/lib/types/dashboard-bi'
import type { EvolucaoMensal, DashboardFilters, Projecoes, InsightsAutomaticos, AlertaCritico } from '@/lib/types/dashboard-bi'

// Hook para alertas críticos - REABILITADO USANDO API
export function useAlertasCriticos(filters?: DashboardFilters) {
  return useQuery({
    queryKey: ['dashboard', 'alertas_criticos', filters],
    queryFn: async (): Promise<AlertaCritico[]> => {
      try {
        const response = await fetch('/api/dashboard/alertas-criticos')
        if (!response.ok) {
          console.warn('API alertas indisponível, retornando array vazio')
          return []
        }
        const data = await response.json()
        return Array.isArray(data) ? data : []
      } catch (error) {
        console.warn('Erro na API alertas:', error)
        return []
      }
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000
  })
}

// Hook para projeções - REABILITADO COM FALLBACK
export function useProjecoes(filters?: DashboardFilters) {
  return useQuery({
    queryKey: ['dashboard', 'projecoes', filters],
    queryFn: async (): Promise<Projecoes[]> => {
      try {
        const response = await fetch('/api/dashboard/projecoes', {
          signal: AbortSignal.timeout(10000) // timeout de 10s
        })
        if (!response.ok) {
          console.warn('API projeções indisponível, retornando array vazio')
          return []
        }
        const data = await response.json()
        return Array.isArray(data) ? data : []
      } catch (error) {
        console.warn('Erro na API projeções:', error)
        return []
      }
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000
  })
}

// Hook para insights automáticos - REABILITADO COM FALLBACK
export function useInsights(filters?: DashboardFilters) {
  return useQuery({
    queryKey: ['dashboard', 'insights', filters],
    queryFn: async (): Promise<InsightsAutomaticos> => {
      try {
        const response = await fetch('/api/dashboard/insights', {
          signal: AbortSignal.timeout(10000) // timeout de 10s
        })
        if (!response.ok) {
          console.warn('API insights indisponível, usando fallback')
          return { insights: [], score_sistema: 0, recomendacoes: [], alertas_urgentes: 0 }
        }
        const data = await response.json()
        return data || { insights: [], score_sistema: 0, recomendacoes: [], alertas_urgentes: 0 }
      } catch (error) {
        console.warn('Erro na API insights:', error)
        return { insights: [], score_sistema: 0, recomendacoes: [], alertas_urgentes: 0 }
      }
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000
  })
}

// Hook para evolução mensal - REABILITADO USANDO API
export function useEvolucaoMensal(filters?: DashboardFilters) {
  return useQuery({
    queryKey: ['dashboard', 'evolucao_mensal', filters],
    queryFn: async (): Promise<EvolucaoMensal[]> => {
      try {
        const response = await fetch('/api/dashboard/evolucao-mensal')
        if (!response.ok) {
          console.warn('API evolução indisponível, retornando array vazio')
          return []
        }
        const data = await response.json()
        return Array.isArray(data) ? data : []
      } catch (error) {
        console.warn('Erro na API evolução:', error)
        return []
      }
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000
  })
}
import type { RankingLaboratorio } from '@/lib/types/dashboard-bi'
// Hook para ranking de laboratórios - REABILITADO USANDO API
export function useRankingLaboratorios(limite: number = 10, filtroRisco: string = '') {
  return useQuery({
    queryKey: ['dashboard', 'ranking_laboratorios', limite, filtroRisco],
    queryFn: async (): Promise<RankingLaboratorio[]> => {
      try {
        const response = await fetch('/api/dashboard/ranking-laboratorios')
        if (!response.ok) {
          console.warn('API ranking indisponível, retornando array vazio')
          return []
        }
        const data = await response.json()
        return data.ranking_laboratorios || []
      } catch (error) {
        console.warn('Erro na API ranking:', error)
        return []
      }
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000
  })
}
import type { AnaliseFinanceira, DashboardKPIs } from '@/lib/types/dashboard-bi'
// Hook para análise financeira - REABILITADO USANDO API
export function useAnaliseFinanceira() {
  return useQuery({
    queryKey: ['dashboard', 'analise_financeira'],
    queryFn: async (): Promise<AnaliseFinanceira[]> => {
      try {
        const response = await fetch('/api/dashboard/analise-financeira')
        if (!response.ok) {
          console.warn('API análise financeira indisponível, retornando array vazio')
          return []
        }
        const data = await response.json()
        return Array.isArray(data) ? data : []
      } catch (error) {
        console.warn('Erro na API análise financeira:', error)
        return []
      }
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000
  })
}
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'

// ================================================================
// HOOKS QUE USAM DADOS REAIS DO BANCO
// ================================================================

// Hook para KPIs principais - REABILITADO USANDO APIS
export function useDashboardKPIs(filters?: DashboardFilters) {
  return useQuery({
    queryKey: ['dashboard', 'kpis', filters],
    queryFn: async (): Promise<DashboardKPIs> => {
      // Usar API que funciona com as políticas RLS
      const response = await fetch('/api/dashboard/kpis')
      if (!response.ok) {
        throw new Error(`Falha ao carregar KPIs: ${response.status}`)
      }
      return response.json()
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000
  })
}

