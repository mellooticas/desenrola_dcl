// 🎯 Hook para gerenciar controle de OSs

'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/components/providers/AuthProvider'
import { toast } from 'sonner'
import type { 
  OSGap, 
  OSEstatisticas, 
  JustificarOSParams,
  PopularSequenciaParams 
} from '@/lib/types/os-control'

export function useOSControl() {
  const { userProfile } = useAuth()
  const queryClient = useQueryClient()

  // Gestores/DCL podem ver todas as lojas, outros precisam de loja_id
  const isGestorOuDCL = userProfile?.role === 'gestor' || userProfile?.role === 'dcl'
  const canAccess = isGestorOuDCL || !!userProfile?.loja_id

  // Buscar OSs com gaps (não lançadas) - usando nova view limpa
  const { data: osGaps, isLoading: isLoadingGaps } = useQuery({
    queryKey: ['os-gaps', userProfile?.loja_id, userProfile?.role],
    queryFn: async () => {
      let query = supabase
        .from('view_controle_os_gaps') // Nova view sempre sincronizada
        .select('*')
        .eq('precisa_atencao', true)
        .order('numero_os', { ascending: false })

      if (userProfile?.loja_id) {
        query = query.eq('loja_id', userProfile.loja_id)
      }

      const { data, error } = await query
      if (error) throw error
      return data as OSGap[]
    },
    enabled: canAccess,
    staleTime: 1000 * 60 * 5, // 5 minutos
  })

  // Buscar estatísticas
  const { data: estatisticas } = useQuery({
    queryKey: ['os-estatisticas', userProfile?.loja_id, userProfile?.role],
    queryFn: async () => {
      let query = supabase
        .from('view_controle_os_estatisticas')
        .select('*')

      // Se tem loja_id específica, filtra
      if (userProfile?.loja_id) {
        query = query.eq('loja_id', userProfile.loja_id)
      }

      const { data, error } = await query
      if (error) throw error
      
      // Se é gestor sem loja, retorna agregado de todas as lojas
      if (!userProfile?.loja_id && isGestorOuDCL && data && data.length > 0) {
        // Agregar estatísticas de todas as lojas
        const agregado = {
          loja_id: null,
          loja_nome: 'Todas as Lojas',
          total_os_esperadas: data.reduce((sum, l) => sum + l.total_os_esperadas, 0),
          total_lancadas: data.reduce((sum, l) => sum + l.total_lancadas, 0),
          total_nao_lancadas: data.reduce((sum, l) => sum + l.total_nao_lancadas, 0),
          total_justificadas: data.reduce((sum, l) => sum + l.total_justificadas, 0),
          total_pendentes: data.reduce((sum, l) => sum + l.total_pendentes, 0),
          total_precisa_atencao: data.reduce((sum, l) => sum + l.total_precisa_atencao, 0),
          percentual_lancamento: 0
        }
        agregado.percentual_lancamento = (agregado.total_lancadas / agregado.total_os_esperadas) * 100
        return agregado as OSEstatisticas
      }
      
      return data?.[0] as OSEstatisticas | undefined
    },
    enabled: canAccess,
  })

  // Justificar OS não lançada
  const justificarOS = useMutation({
    mutationFn: async (params: JustificarOSParams) => {
      const { data, error } = await supabase.rpc('justificar_os_nao_lancada', {
        p_numero_os: params.numero_os,
        p_loja_id: params.loja_id,
        p_justificativa: params.justificativa,
        p_tipo_justificativa: params.tipo_justificativa,
        p_usuario_id: params.usuario_id,
      })

      if (error) throw error
      return data
    },
    onSuccess: (_, variables) => {
      toast.success(`OS ${variables.numero_os} justificada com sucesso!`)
      queryClient.invalidateQueries({ queryKey: ['os-gaps'] })
      queryClient.invalidateQueries({ queryKey: ['os-estatisticas'] })
    },
    onError: (error: any) => {
      toast.error(`Erro ao justificar OS: ${error.message}`)
    },
  })

  // Popular sequência de OSs
  const popularSequencia = useMutation({
    mutationFn: async (params: PopularSequenciaParams) => {
      const { data, error } = await supabase.rpc('popular_sequencia_os', {
        p_loja_id: params.loja_id,
        p_numero_inicial: params.numero_inicial,
        p_numero_final: params.numero_final,
        p_origem: params.origem || 'importacao',
      })

      if (error) throw error
      return data
    },
    onSuccess: (count) => {
      toast.success(`${count} OSs adicionadas à sequência!`)
      queryClient.invalidateQueries({ queryKey: ['os-gaps'] })
      queryClient.invalidateQueries({ queryKey: ['os-estatisticas'] })
    },
    onError: (error: any) => {
      toast.error(`Erro ao popular sequência: ${error.message}`)
    },
  })

  return {
    osGaps: osGaps || [],
    estatisticas,
    isLoading: isLoadingGaps,
    justificarOS: justificarOS.mutate,
    isJustificando: justificarOS.isPending,
    popularSequencia: popularSequencia.mutate,
    isPopulando: popularSequencia.isPending,
  }
}

// Hook simplificado para verificação rápida
export function useOSPendentes() {
  const { userProfile } = useAuth()
  
  const isGestorOuDCL = userProfile?.role === 'gestor' || userProfile?.role === 'dcl'
  const canAccess = isGestorOuDCL || !!userProfile?.loja_id

  const { data: count } = useQuery({
    queryKey: ['os-pendentes-count', userProfile?.loja_id, userProfile?.role],
    queryFn: async () => {
      let query = supabase
        .from('view_os_gaps')
        .select('*', { count: 'exact', head: true })
        .eq('precisa_atencao', true)

      // Se tem loja_id, filtra. Se não tem mas é gestor, traz tudo
      if (userProfile?.loja_id) {
        query = query.eq('loja_id', userProfile.loja_id)
      }

      const { count, error } = await query
      if (error) throw error
      return count || 0
    },
    enabled: canAccess,
    refetchInterval: 1000 * 60 * 2, // Atualiza a cada 2 minutos
  })

  return { totalPendentes: count || 0 }
}
