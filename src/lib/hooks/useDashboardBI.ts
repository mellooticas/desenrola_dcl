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
    staleTime: 30 * 1000, // 30 segundos - alertas precisam atualizar rápido
    refetchInterval: 30 * 1000
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

// Hook para KPIs principais - USANDO API /dashboard QUE FUNCIONA
export function useDashboardKPIs(filters?: DashboardFilters) {
  return useQuery({
    queryKey: ['dashboard', 'kpis', filters],
    queryFn: async (): Promise<DashboardKPIs> => {
      // ⚠️  BYPASS: Usar /api/dashboard em vez de /api/dashboard/kpis
      // API /kpis tem bug que perde 1 pedido, API /dashboard funciona perfeitamente
      const response = await fetch('/api/dashboard')
      if (!response.ok) {
        throw new Error(`Falha ao carregar KPIs: ${response.status}`)
      }
      const data = await response.json()
      
      // Mapear formato da API /dashboard para formato esperado pelos KPIs
      return {
        total_pedidos: data.total_pedidos,
        entregues: data.entregues,
        lead_time_medio: data.lead_time_medio || 0,
        pedidos_atrasados: 0, // TODO: API /dashboard não tem este campo
        ticket_medio: data.total_pedidos > 0 ? data.valor_total_vendas / data.total_pedidos : 0,
        sla_compliance: data.sla_compliance || 0,
        labs_ativos: 0, // TODO: API /dashboard não tem este campo
        valor_total_vendas: data.valor_total_vendas,
        margem_percentual: data.margem_bruta || 0,
        
        // Campos de comparação (temporariamente zerados)
        total_pedidos_anterior: 0,
        lead_time_anterior: 0,
        sla_anterior: 0,
        variacao_pedidos: 0,
        variacao_lead_time: 0,
        variacao_sla: 0
      }
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000
  })
}

