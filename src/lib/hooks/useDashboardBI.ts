export type { DashboardFilters } from '@/lib/types/dashboard-bi'
import type { EvolucaoMensal, DashboardFilters, Projecoes, InsightsAutomaticos, AlertaCritico } from '@/lib/types/dashboard-bi'

// Hook para alertas críticos - busca dados da view v_alertas_criticos
export function useAlertasCriticos(filters?: DashboardFilters) {
  return useQuery({
    queryKey: ['dashboard', 'alertas_criticos', filters],
    queryFn: async (): Promise<AlertaCritico[]> => {
      let query = supabase
        .from('v_alertas_criticos')
        .select('*')
        .order('ordem_prioridade', { ascending: true })
      if (filters?.prioridade_alerta?.length) {
        query = query.in('prioridade', filters.prioridade_alerta)
      }
      const { data, error } = await query
      if (error) throw error
      return data || []
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000
  })
}

// Hook para projeções - busca dados da view v_projecoes
export function useProjecoes(filters?: DashboardFilters) {
  return useQuery({
    queryKey: ['dashboard', 'projecoes', filters],
    queryFn: async (): Promise<Projecoes[]> => {
      let query = supabase
        .from('v_projecoes')
        .select('*')
        .order('periodo', { ascending: true })
      if (filters?.data_inicio) {
        query = query.gte('periodo', filters.data_inicio)
      }
      if (filters?.data_fim) {
        query = query.lte('periodo', filters.data_fim)
      }
      const { data, error } = await query
      if (error) throw error
      return data || []
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000
  })
}

// Hook para insights automáticos - busca dados da view v_insights
export function useInsights(filters?: DashboardFilters) {
  return useQuery({
    queryKey: ['dashboard', 'insights', filters],
    queryFn: async (): Promise<InsightsAutomaticos> => {
      let query = supabase
        .from('v_insights')
        .select('*')
        .single()
      const { data, error } = await query
      if (error) throw error
      return data || { insights: [], score_sistema: 0, recomendacoes: [], alertas_urgentes: 0 }
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000
  })
}

// Hook para evolução mensal - busca dados da view v_evolucao_mensal
export function useEvolucaoMensal(filters?: DashboardFilters) {
  return useQuery({
    queryKey: ['dashboard', 'evolucao_mensal', filters],
    queryFn: async (): Promise<EvolucaoMensal[]> => {
      let query = supabase
        .from('v_evolucao_mensal')
        .select('*')
        .order('ano_mes', { ascending: true })
      if (filters?.data_inicio) {
        query = query.gte('ano_mes', filters.data_inicio)
      }
      if (filters?.data_fim) {
        query = query.lte('ano_mes', filters.data_fim)
      }
      const { data, error } = await query
      if (error) throw error
      return data || []
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000
  })
}
// Hook para ranking de laboratórios - busca dados da view v_ranking_laboratorios
import type { RankingLaboratorio } from '@/lib/types/dashboard-bi'
export function useRankingLaboratorios(limite: number = 10, filtroRisco: string = '') {
  return useQuery({
    queryKey: ['dashboard', 'ranking_laboratorios', limite, filtroRisco],
    queryFn: async (): Promise<RankingLaboratorio[]> => {
      let query = supabase
        .from('v_ranking_laboratorios')
        .select('*')
        .order('posicao', { ascending: true })
        .limit(limite)
      if (filtroRisco) {
        query = query.eq('status_risco', filtroRisco)
      }
      const { data, error } = await query
      if (error) throw error
      return data || []
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000
  })
}
import type { AnaliseFinanceira, DashboardKPIs } from '@/lib/types/dashboard-bi'
// Hook para análise financeira - busca dados da view v_analise_financeira
export function useAnaliseFinanceira() {
  return useQuery({
    queryKey: ['dashboard', 'analise_financeira'],
    queryFn: async (): Promise<AnaliseFinanceira[]> => {
      const { data, error } = await supabase
        .from('v_analise_financeira')
        .select('*')
        .order('faturamento_total', { ascending: false })
      if (error) throw error
      return data || []
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

// Hook para KPIs principais - USA DADOS REAIS
export function useDashboardKPIs(filters?: DashboardFilters) {
  return useQuery({
    queryKey: ['dashboard', 'kpis', filters],
    queryFn: async (): Promise<DashboardKPIs> => {
      try {
        let query = supabase
          .from('v_kpis_dashboard')
          .select('*')
        if (filters?.data_inicio) {
          query = query.gte('data', filters.data_inicio)
        }
        if (filters?.data_fim) {
          query = query.lte('data', filters.data_fim)
        }
        const { data: viewData, error: viewError } = await query.single()
        if (!viewError && viewData) {
          return viewData
        }
        console.warn('View v_kpis_dashboard não encontrada, usando API...')
        // Se view não existir, usar API
        const response = await fetch('/api/dashboard/kpis')
        if (!response.ok) throw new Error('Falha ao carregar KPIs')
        return response.json()
      } catch (error) {
        console.error('Erro ao buscar KPIs:', error)
        throw error
      }
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000
  })
}

