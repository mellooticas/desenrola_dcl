// lib/hooks/use-gamification.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

// ========================================
// TIPOS BASEADOS NA ESTRUTURA REAL DO BANCO
// ========================================

interface UserGamification {
  id: string
  usuario_id: string
  loja_id: string
  
  // Sistema de pontos
  pontos_totais_historico: number
  pontos_disponiveis: number
  pontos_hoje: number
  pontos_semana: number
  pontos_mes: number
  
  // Sistema de levels
  level_atual: number
  xp_atual: number
  xp_proximo_level: number
  titulo_atual: string
  
  // Streaks
  streak_dias_consecutivos: number
  streak_missoes_perfeitas: number
  maior_streak_historico: number
  data_ultimo_streak: string | null
  
  // Badges e conquistas
  badges_coletadas: string[]
  conquistas_desbloqueadas: string[]
  titulos_desbloqueados: string[]
  
  // Estatísticas
  total_missoes_executadas: number
  total_missoes_perfeitas: number
  total_missoes_no_prazo: number
  total_missoes_antecipadas: number
  total_missoes_criticas_resolvidas: number
  
  // Médias
  tempo_medio_execucao_segundos: number | null
  qualidade_media: number | null
  taxa_sucesso: number | null
  
  // Ranking
  posicao_ranking_loja: number | null
  posicao_ranking_rede: number | null
  posicao_ranking_categoria: number | null
  
  // Metas
  meta_pontos_diaria: number
  meta_missoes_diarias: number
  meta_qualidade_minima: number
  
  // Controle
  data_inicio_sistema: string
  data_ultima_atividade: string | null
  data_ultima_missao_completa: string | null
  
  // Timestamps
  created_at: string
  updated_at: string
}

interface Badge {
  id: string
  nome: string
  descricao: string
  icone: string
  cor: string
  pontos_bonus: number
  raridade: 'comum' | 'raro' | 'epico' | 'lendario'
  categoria: string
  requisitos: any
  ativa: boolean
}

interface SystemConfig {
  pontos_por_nivel: { [key: string]: number }
  badges_sistema: { [key: string]: Badge }
  titulos_por_level: { [key: string]: string }
  multiplicador_streak: number
  multiplicador_weekend: number
}

interface RankingData {
  usuario_id: string
  nome: string
  titulo: string
  pontos_totais: number
  pontos_hoje: number
  level_atual: number
  streak_dias: number
  posicao: number
  badges_count: number
  qualidade_media: number
}

// ========================================
// 1. HOOK PARA DADOS DE GAMIFICAÇÃO DO USUÁRIO
// ========================================
export function useUserGamification(userId: string, lojaId?: string) {
  return useQuery({
    queryKey: ['user-gamification', userId, lojaId],
    queryFn: async (): Promise<UserGamification | null> => {
      try {
        const params = new URLSearchParams({
          action: 'user_gamification',
          userId
        })
        
        if (lojaId) {
          params.append('lojaId', lojaId)
        }

        const response = await fetch(`/api/gamification?${params.toString()}`)
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const result = await response.json()
        return result.gamification || null
        
      } catch (err) {
        console.error('Erro ao buscar gamificação do usuário:', err)
        
        // Fallback: dados básicos se não encontrar no banco
        return {
          id: 'mock-gamif-1',
          usuario_id: userId,
          loja_id: lojaId || 'loja-1',
          pontos_totais_historico: 0,
          pontos_disponiveis: 0,
          pontos_hoje: 0,
          pontos_semana: 0,
          pontos_mes: 0,
          level_atual: 1,
          xp_atual: 0,
          xp_proximo_level: 100,
          titulo_atual: 'Novato',
          streak_dias_consecutivos: 0,
          streak_missoes_perfeitas: 0,
          maior_streak_historico: 0,
          data_ultimo_streak: null,
          badges_coletadas: [],
          conquistas_desbloqueadas: [],
          titulos_desbloqueados: ['Novato'],
          total_missoes_executadas: 0,
          total_missoes_perfeitas: 0,
          total_missoes_no_prazo: 0,
          total_missoes_antecipadas: 0,
          total_missoes_criticas_resolvidas: 0,
          tempo_medio_execucao_segundos: null,
          qualidade_media: null,
          taxa_sucesso: null,
          posicao_ranking_loja: null,
          posicao_ranking_rede: null,
          posicao_ranking_categoria: null,
          meta_pontos_diaria: 300,
          meta_missoes_diarias: 8,
          meta_qualidade_minima: 4.0,
          data_inicio_sistema: new Date().toISOString().split('T')[0],
          data_ultima_atividade: null,
          data_ultima_missao_completa: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        } as UserGamification
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: true,
    retry: 1
  })
}

// ========================================
// 2. HOOK PARA CONFIGURAÇÕES DO SISTEMA
// ========================================
export function useSystemConfig() {
  return useQuery({
    queryKey: ['system-config'],
    queryFn: async (): Promise<SystemConfig> => {
      try {
        const response = await fetch('/api/gamification?action=system_config')
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const result = await response.json()
        return result.config
        
      } catch (err) {
        console.error('Erro ao buscar configurações do sistema:', err)
        
        // Fallback: configurações padrão
        return {
          pontos_por_nivel: {
            '1': 100,
            '2': 200,
            '3': 400,
            '4': 800,
            '5': 1600,
            '6': 3200,
            '7': 6400,
            '8': 12800,
            '9': 25600,
            '10': 51200
          },
          badges_sistema: {
            'early_bird': {
              id: 'early_bird',
              nome: 'Early Bird',
              descricao: 'Primeira missão antes das 8h',
              icone: '🌅',
              cor: '#F59E0B',
              pontos_bonus: 50,
              raridade: 'comum',
              categoria: 'timing',
              requisitos: { horario_limite: '08:00' },
              ativa: true
            },
            'speed_demon': {
              id: 'speed_demon',
              nome: 'Speed Demon',
              descricao: '5 missões em menos de 15min cada',
              icone: '⚡',
              cor: '#EF4444',
              pontos_bonus: 100,
              raridade: 'raro',
              categoria: 'velocidade',
              requisitos: { missoes_rapidas: 5, tempo_max: 900 },
              ativa: true
            },
            'perfectionist': {
              id: 'perfectionist',
              nome: 'Perfectionist',
              descricao: '10 missões com 5 estrelas seguidas',
              icone: '💎',
              cor: '#8B5CF6',
              pontos_bonus: 200,
              raridade: 'epico',
              categoria: 'qualidade',
              requisitos: { qualidade_perfeita: 10, consecutivas: true },
              ativa: true
            },
            'crisis_master': {
              id: 'crisis_master',
              nome: 'Crisis Master',
              descricao: 'Resolver missão crítica perfeitamente',
              icone: '🚨',
              cor: '#DC2626',
              pontos_bonus: 300,
              raridade: 'epico',
              categoria: 'critica',
              requisitos: { tipo_missao: 'critica', qualidade_min: 5 },
              ativa: true
            },
            'streak_legend': {
              id: 'streak_legend',
              nome: 'Streak Legend',
              descricao: '30 dias consecutivos',
              icone: '🔥',
              cor: '#F97316',
              pontos_bonus: 500,
              raridade: 'lendario',
              categoria: 'consistencia',
              requisitos: { streak_min: 30 },
              ativa: true
            }
          },
          titulos_por_level: {
            '1': 'Novato',
            '3': 'Aprendiz',
            '5': 'Especialista',
            '8': 'Veterano',
            '10': 'Commander',
            '15': 'Expert',
            '20': 'Mission Master',
            '30': 'Elite',
            '50': 'Legend'
          },
          multiplicador_streak: 1.5,
          multiplicador_weekend: 1.2
        }
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutos
    gcTime: 30 * 60 * 1000, // 30 minutos
    retry: 1
  })
}

// ========================================
// 3. HOOK PARA RANKING
// ========================================
export function useRanking(lojaId?: string, periodo: string = 'semanal', limit: number = 10) {
  return useQuery({
    queryKey: ['ranking', lojaId, periodo, limit],
    queryFn: async (): Promise<RankingData[]> => {
      try {
        const params = new URLSearchParams({
          action: 'ranking',
          periodo,
          limit: limit.toString()
        })
        
        if (lojaId) {
          params.append('lojaId', lojaId)
        }

        const response = await fetch(`/api/gamification?${params.toString()}`)
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const result = await response.json()
        return result.ranking || []
        
      } catch (err) {
        console.error('Erro ao buscar ranking:', err)
        return []
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 15 * 60 * 1000, // 15 minutos
    retry: 1
  })
}

// ========================================
// 4. MUTATION PARA ATUALIZAR PONTOS
// ========================================
export function useUpdatePoints() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      userId,
      lojaId,
      pontos,
      missaoId,
      qualidade,
      badges
    }: {
      userId: string
      lojaId: string
      pontos: number
      missaoId: string
      qualidade?: number
      badges?: string[]
    }) => {
      const response = await fetch('/api/gamification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'update_points',
          userId,
          lojaId,
          pontos,
          missaoId,
          qualidade,
          badges
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      return await response.json()
    },
    onSuccess: (data, variables) => {
      // Invalidar cache da gamificação do usuário
      queryClient.invalidateQueries({ queryKey: ['user-gamification', variables.userId] })
      
      // Invalidar ranking
      queryClient.invalidateQueries({ queryKey: ['ranking', variables.lojaId] })
      
      // Mostrar notificação de pontos ganhos
      toast.success(`+${variables.pontos} pontos conquistados!`)
      
      // Se ganhou badges, mostrar notificação especial
      if (variables.badges && variables.badges.length > 0) {
        toast.success(`🏆 Nova(s) badge(s) conquistada(s): ${variables.badges.join(', ')}`)
      }
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      console.error('Erro ao atualizar pontos:', errorMessage)
      toast.error('Erro ao atualizar pontos: ' + errorMessage)
    },
  })
}

// ========================================
// 5. MUTATION PARA ATUALIZAR STREAK
// ========================================
export function useUpdateStreak() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      userId,
      lojaId,
      incrementar = true
    }: {
      userId: string
      lojaId: string
      incrementar?: boolean
    }) => {
      const response = await fetch('/api/gamification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'update_streak',
          userId,
          lojaId,
          incrementar
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      return await response.json()
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['user-gamification', variables.userId] })
      
      if (variables.incrementar) {
        toast.success(`🔥 Streak mantido! ${data.streak_dias} dias consecutivos`)
      }
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      console.error('Erro ao atualizar streak:', errorMessage)
    },
  })
}

// ========================================
// 6. FUNÇÕES UTILITÁRIAS
// ========================================

// Calcular o nível baseado no XP
export function calculateLevel(xp: number, pontosPerLevel: { [key: string]: number }): number {
  let level = 1
  let xpAcumulado = 0
  
  for (const [levelStr, xpNecessario] of Object.entries(pontosPerLevel)) {
    if (xp >= xpAcumulado + xpNecessario) {
      xpAcumulado += xpNecessario
      level = parseInt(levelStr) + 1
    } else {
      break
    }
  }
  
  return Math.max(1, level - 1)
}

// Calcular XP necessário para próximo nível
export function calculateXPForNextLevel(currentLevel: number, pontosPerLevel: { [key: string]: number }): number {
  return pontosPerLevel[String(currentLevel + 1)] || 999999
}

// Verificar se ganhou badges
export function checkBadges(
  userStats: UserGamification, 
  missaoExecutada: any, 
  badgesConfig: { [key: string]: Badge }
): string[] {
  const newBadges: string[] = []
  
  for (const [badgeId, badge] of Object.entries(badgesConfig)) {
    // Verificar se já tem a badge
    if (userStats.badges_coletadas.includes(badgeId)) continue
    
    // Verificar requisitos específicos
    let qualifica = false
    
    switch (badgeId) {
      case 'early_bird':
        const horario = new Date().getHours()
        if (horario < 8) qualifica = true
        break
        
      case 'perfectionist':
        if (userStats.streak_missoes_perfeitas >= 10) qualifica = true
        break
        
      case 'crisis_master':
        if (missaoExecutada.tipo === 'critica' && missaoExecutada.qualidade_execucao === 5) {
          qualifica = true
        }
        break
        
      case 'streak_legend':
        if (userStats.streak_dias_consecutivos >= 30) qualifica = true
        break
    }
    
    if (qualifica) {
      newBadges.push(badgeId)
    }
  }
  
  return newBadges
}

// Calcular multiplicadores de pontos
export function calculatePointMultiplier(
  userStats: UserGamification,
  missao: any,
  config: SystemConfig
): number {
  let multiplier = 1.0
  
  // Multiplicador de streak
  if (userStats.streak_dias_consecutivos >= 7) {
    multiplier *= config.multiplicador_streak
  }
  
  // Multiplicador de weekend
  const isWeekend = [0, 6].includes(new Date().getDay())
  if (isWeekend) {
    multiplier *= config.multiplicador_weekend
  }
  
  // Multiplicador de qualidade
  if (missao.qualidade_execucao) {
    multiplier *= (missao.qualidade_execucao / 5)
  }
  
  // Multiplicador de tipo de missão
  if (missao.tipo === 'critica') {
    multiplier *= 2.0
  }
  
  return multiplier
} 