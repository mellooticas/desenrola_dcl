// lib/hooks/use-mission-control.ts - VERSÃO FINAL CORRIGIDA
'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

// ========================================
// INTERFACES BASEADAS NAS VIEWS REAIS
// ========================================

export interface MissaoDiaria {
  id: string
  loja_id: string
  loja_nome: string
  missao_nome: string
  descricao: string
  tipo: 'critica' | 'rapida' | 'especial' | 'bonus' | 'operacional'
  categoria: string
  icone: string
  cor_primary: string
  status: 'pendente' | 'ativa' | 'pausada' | 'concluida' | 'falhada'
  urgencia_status: 'concluida' | 'vencida' | 'urgente' | 'no_prazo'
  data_missao: string
  data_vencimento: string | null
  concluida_em: string | null
  tempo_estimado_min: number
  tempo_total_execucao_segundos: number | null
  progresso_tempo: number
  horario_inicio: string | null
  horario_limite: string | null
  executada_por: string | null
  qualidade_execucao: number | null
  pontos_total: number | null
  requer_evidencia: boolean
  requer_atencao: boolean
  created_at: string
  updated_at: string
}

export interface DashboardData {
  data_missao: string
  total_missoes: number
  pendentes: number
  ativas: number
  concluidas: number
  falhadas: number
  criticas: number
  rapidas: number
  especiais: number
  bonus: number
  qualidade_media: number
  tempo_medio: number
  pontos_total_dia: number
  percentual_conclusao: number
  status_sistemas: 'ok' | 'atencao' | 'critico'
}

// ========================================
// DADOS MOCK PARA FALLBACK
// ========================================

function getMockMissions(): MissaoDiaria[] {
  const hoje = new Date().toISOString().split('T')[0]
  return [
    {
      id: 'mock-mission-1',
      loja_id: 'mock-loja-1',
      loja_nome: 'DCL Matriz (Mock)',
      missao_nome: 'Abertura da Loja',
      descricao: 'Verificar equipamentos e preparar ambiente para o dia',
      tipo: 'critica',
      categoria: 'operacional',
      icone: '🔓',
      cor_primary: '#EF4444',
      status: 'pendente',
      urgencia_status: 'urgente',
      data_missao: hoje,
      data_vencimento: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      concluida_em: null,
      tempo_estimado_min: 15,
      tempo_total_execucao_segundos: null,
      progresso_tempo: 25,
      horario_inicio: '08:00',
      horario_limite: '09:00',
      executada_por: null,
      qualidade_execucao: null,
      pontos_total: 25,
      requer_evidencia: true,
      requer_atencao: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'mock-mission-2',
      loja_id: 'mock-loja-1',
      loja_nome: 'DCL Matriz (Mock)',
      missao_nome: 'Verificação de Estoque',
      descricao: 'Conferir produtos em falta e atualizar sistema',
      tipo: 'operacional',
      categoria: 'estoque',
      icone: '📦',
      cor_primary: '#8B5CF6',
      status: 'ativa',
      urgencia_status: 'no_prazo',
      data_missao: hoje,
      data_vencimento: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
      concluida_em: null,
      tempo_estimado_min: 30,
      tempo_total_execucao_segundos: null,
      progresso_tempo: 60,
      horario_inicio: '10:00',
      horario_limite: '11:00',
      executada_por: 'João Silva',
      qualidade_execucao: null,
      pontos_total: 35,
      requer_evidencia: false,
      requer_atencao: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'mock-mission-3',
      loja_id: 'mock-loja-1',
      loja_nome: 'DCL Matriz (Mock)',
      missao_nome: 'Atendimento Premium',
      descricao: 'Protocolo especial para clientes VIP',
      tipo: 'especial',
      categoria: 'atendimento',
      icone: '👑',
      cor_primary: '#F59E0B',
      status: 'concluida',
      urgencia_status: 'concluida',
      data_missao: hoje,
      data_vencimento: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      concluida_em: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      tempo_estimado_min: 45,
      tempo_total_execucao_segundos: 2400,
      progresso_tempo: 100,
      horario_inicio: '14:00',
      horario_limite: '15:00',
      executada_por: 'Ana Costa',
      qualidade_execucao: 5,
      pontos_total: 75,
      requer_evidencia: false,
      requer_atencao: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ]
}

function getMockDashboard(): DashboardData {
  return {
    data_missao: new Date().toISOString().split('T')[0],
    total_missoes: 3,
    pendentes: 1,
    ativas: 1,
    concluidas: 1,
    falhadas: 0,
    criticas: 1,
    rapidas: 0,
    especiais: 1,
    bonus: 0,
    qualidade_media: 5.0,
    tempo_medio: 2400,
    pontos_total_dia: 135,
    percentual_conclusao: 33.3,
    status_sistemas: 'atencao'
  }
}

// ========================================
// HOOKS CORRIGIDOS
// ========================================

/**
 * Hook para buscar missões - SOMENTE DADOS REAIS
 */
export function useMissions(lojaId?: string) {
  const today = new Date().toISOString().split('T')[0]
  
  return useQuery({
    queryKey: ['missions', today, lojaId],
    queryFn: async (): Promise<MissaoDiaria[]> => {
      if (!lojaId || lojaId === 'all') {
        console.warn('LojaId não fornecido para buscar missões')
        return []
      }

      try {
        const params = new URLSearchParams({
          action: 'missions',
          data: today,
          loja_id: lojaId
        })

        console.log(`🔍 Buscando missões reais para loja ${lojaId}...`)
        const response = await fetch(`/api/mission-control?${params.toString()}`)
        
        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(`API retornou ${response.status}: ${errorText}`)
        }
        
        const result = await response.json()
        
        if (result.error) {
          throw new Error(result.error)
        }
        
        if (!result.missions) {
          console.warn('API não retornou campo missions')
          return []
        }
        
        console.log(`✅ Encontradas ${result.missions.length} missões reais`)
        return result.missions
        
      } catch (err) {
        console.error('❌ Erro ao buscar missões:', err)
        throw err // Não usar fallback, deixar o React Query mostrar o erro
      }
    },
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
    refetchOnWindowFocus: true,
    retry: 2,
    enabled: !!lojaId && lojaId !== 'all' // Só executar se tiver lojaId válido
  })
}

/**
 * Hook para buscar dashboard - SOMENTE DADOS REAIS
 */
export function useDashboard(lojaId?: string) {
  const today = new Date().toISOString().split('T')[0]
  
  return useQuery({
    queryKey: ['dashboard', today, lojaId],
    queryFn: async (): Promise<DashboardData> => {
      if (!lojaId || lojaId === 'all') {
        console.warn('LojaId não fornecido para buscar dashboard')
        throw new Error('LojaId é obrigatório para buscar dashboard')
      }

      try {
        const params = new URLSearchParams({
          action: 'dashboard',
          data: today,
          loja_id: lojaId
        })

        console.log(`📊 Buscando dashboard real para loja ${lojaId}...`)
        const response = await fetch(`/api/mission-control?${params.toString()}`)
        
        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(`API retornou ${response.status}: ${errorText}`)
        }
        
        const result = await response.json()
        
        if (result.error) {
          throw new Error(result.error)
        }
        
        if (!result.dashboard) {
          throw new Error('API não retornou dados de dashboard')
        }
        
        console.log('✅ Dashboard real carregado')
        return result.dashboard
        
      } catch (err) {
        console.error('❌ Erro ao buscar dashboard:', err)
        throw err // Não usar fallback
      }
    },
    staleTime: 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    retry: 2,
    enabled: !!lojaId && lojaId !== 'all' // Só executar se tiver lojaId válido
  })
}

/**
 * Hook para iniciar missão
 */
export function useStartMission() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ missaoId, usuario }: {
      missaoId: string
      usuario: string
    }) => {
      const response = await fetch('/api/mission-control', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'start_mission',
          missaoId,
          usuario
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Erro HTTP ${response.status}`)
      }

      return await response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['missions'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Missão iniciada!')
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      console.error('Erro ao iniciar missão:', errorMessage)
      toast.error(`Erro: ${errorMessage}`)
    },
  })
}

/**
 * Hook para completar missão
 */
export function useCompleteMission() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ 
      missaoId, 
      userId, 
      observacoes, 
      qualidade, 
      evidencias 
    }: {
      missaoId: string
      userId: string
      observacoes?: string
      qualidade?: number
      evidencias?: string[]
    }) => {
      const response = await fetch('/api/mission-control', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'execute_mission',
          missaoId,
          usuario: userId,
          evidencias: evidencias || [],
          observacoes,
          qualidade
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Erro HTTP ${response.status}`)
      }

      return await response.json()
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['missions'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      
      const pontos = data.pontos_ganhos || 0
      toast.success(`Missão concluída! ${pontos > 0 ? `+${pontos} pontos` : ''}`)
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      console.error('Erro ao completar missão:', errorMessage)
      toast.error(`Erro: ${errorMessage}`)
    },
  })
}

/**
 * Hook para pausar missão
 */
export function usePauseMission() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ missaoId }: { missaoId: string }) => {
      const response = await fetch('/api/mission-control', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'pause_mission',
          missaoId
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Erro HTTP ${response.status}`)
      }

      return await response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['missions'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Missão pausada')
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      console.error('Erro ao pausar missão:', errorMessage)
      toast.error(`Erro: ${errorMessage}`)
    },
  })
}

// ========================================
// HOOK PRINCIPAL INTEGRADO
// ========================================

export function useMissionControl(userId: string, lojaId?: string) {
  const missionsQuery = useMissions(lojaId)
  const dashboardQuery = useDashboard(lojaId)

  return {
    missions: missionsQuery.data || [],
    dashboard: dashboardQuery.data,
    isLoading: missionsQuery.isLoading || dashboardQuery.isLoading,
    isError: missionsQuery.isError || dashboardQuery.isError,
    refetchAll: () => {
      missionsQuery.refetch()
      dashboardQuery.refetch()
    }
  }
}

// ========================================
// FUNÇÕES UTILITÁRIAS
// ========================================

export function calculateMissionMetrics(missions: MissaoDiaria[]) {
  const total = missions.length
  const concluidas = missions.filter(m => m.status === 'concluida').length
  const ativas = missions.filter(m => m.status === 'ativa').length
  const pendentes = missions.filter(m => m.status === 'pendente').length
  const falhadas = missions.filter(m => m.status === 'falhada').length
  const criticas = missions.filter(m => m.tipo === 'critica').length
  
  return { total, concluidas, ativas, pendentes, falhadas, criticas }
}

export function getCriticalMissions(missions: MissaoDiaria[]) {
  return missions.filter(mission => {
    return mission.tipo === 'critica' || 
           mission.urgencia_status === 'urgente' || 
           mission.urgencia_status === 'vencida' ||
           mission.requer_atencao
  })
}

export function calculateGamificationStats(dashboard?: DashboardData, gamification?: any) {
  return {
    total_missoes_hoje: dashboard?.total_missoes || 0,
    concluidas_hoje: dashboard?.concluidas || 0,
    percentual_conclusao: dashboard?.percentual_conclusao || 0,
    pontos_total_dia: dashboard?.pontos_total_dia || 0,
    qualidade_media_dia: dashboard?.qualidade_media || 0,
    tempo_medio_dia: dashboard?.tempo_medio || 0,
    status_sistemas: dashboard?.status_sistemas || 'ok',
    nivel_atual: gamification?.level_atual || 1,
    xp_atual: gamification?.xp_atual || 0,
    xp_proximo_nivel: gamification?.xp_proximo_level || 100,
    streak_atual: gamification?.streak_dias_consecutivos || 0,
    titulo_atual: gamification?.titulo_atual || 'Novato',
    eficiencia_score: dashboard ? Math.round(dashboard.percentual_conclusao) : 0
  }
}

export function calculateTimeToDeadline(mission: MissaoDiaria) {
  if (!mission.data_vencimento) {
    return { isExpired: false, timeLeft: Infinity, urgencyLevel: 'normal' as const }
  }
  
  const now = new Date()
  const deadline = new Date(mission.data_vencimento)
  const diffMs = deadline.getTime() - now.getTime()
  const secondsLeft = Math.floor(diffMs / 1000)
  
  if (secondsLeft <= 0) {
    return { isExpired: true, timeLeft: 0, urgencyLevel: 'expired' as const }
  }
  
  const hoursLeft = secondsLeft / 3600
  let urgencyLevel: 'normal' | 'warning' | 'critical' | 'expired' = 'normal'
  
  if (hoursLeft < 0.5) {
    urgencyLevel = 'critical'
  } else if (hoursLeft < 2) {
    urgencyLevel = 'warning'
  }
  
  return { isExpired: false, timeLeft: secondsLeft, urgencyLevel }
}

export function formatTimeRemaining(seconds: number): string {
  if (seconds <= 0) return 'Expirado'
  
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${hours}h ${minutes}m`
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`
  } else {
    return `${secs}s`
  }
}

export function canExecuteMission(mission: MissaoDiaria) {
  return { canExecute: true, reason: '', suggestion: '' }
}

export function getRecommendedAction(missions: MissaoDiaria[]) {
  const criticalOverdue = missions.find(m => 
    m.tipo === 'critica' && m.urgencia_status === 'vencida'
  )
  
  if (criticalOverdue) {
    return {
      action: 'start_critical' as const,
      mission: criticalOverdue,
      reason: 'Missão crítica vencida precisa de atenção imediata'
    }
  }

  const activeToComplete = missions.find(m => m.status === 'ativa')
  
  if (activeToComplete) {
    return {
      action: 'complete_active' as const,
      mission: activeToComplete,
      reason: 'Termine a missão que já está em andamento'
    }
  }

  const nextToStart = missions.find(m => m.status === 'pendente')
  
  if (nextToStart) {
    return {
      action: 'start_next' as const,
      mission: nextToStart,
      reason: 'Próxima missão disponível para iniciar'
    }
  }

  return {
    action: 'all_done' as const,
    reason: 'Todas as missões do dia foram concluídas'
  }
}

export default useMissionControl