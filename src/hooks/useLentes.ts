/**
 * Hooks React Query para o Catálogo de Lentes
 * 
 * Consultas otimizadas às views do banco best_lens:
 * - Grupos canônicos por receita
 * - Segmentação por faixa de preço
 * - Sugestões de upgrade
 * - Fornecedores para compras (DCL)
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import { lentesClient, type GrupoCanonicoView, type FornecedorPorLenteView } from '@/lib/supabase/lentes-client'

// ============================================
// HOOKS PARA PDV / VENDAS
// ============================================

/**
 * Busca grupos canônicos compatíveis com a receita do cliente
 * VIEW: v_grupos_por_receita_cliente
 */
export function useGruposPorReceita(
  receita: {
    grauEsferico?: number
    grauCilindrico?: number
    adicao?: number
  },
  options?: Omit<UseQueryOptions<GrupoCanonicoView[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['grupos-por-receita', receita],
    queryFn: async () => {
      let query = lentesClient
        .from('v_grupos_por_receita_cliente')
        .select('*')

      // Filtrar por grau esférico
      if (receita.grauEsferico !== undefined) {
        query = query
          .gte('grau_esferico_min', receita.grauEsferico)
          .lte('grau_esferico_max', receita.grauEsferico)
      }

      // Filtrar por grau cilíndrico
      if (receita.grauCilindrico !== undefined) {
        query = query
          .gte('grau_cilindrico_min', receita.grauCilindrico)
          .lte('grau_cilindrico_max', receita.grauCilindrico)
      }

      // Filtrar por adição (multifocais)
      if (receita.adicao !== undefined) {
        query = query
          .gte('adicao_min', receita.adicao)
          .lte('adicao_max', receita.adicao)
      }

      const { data, error } = await query.order('preco_medio')

      if (error) throw error
      return data as GrupoCanonicoView[]
    },
    enabled: Boolean(receita.grauEsferico || receita.grauCilindrico),
    staleTime: 5 * 60 * 1000, // 5 minutos
    ...options,
  })
}

/**
 * Busca grupos por faixa de preço
 * VIEW: v_grupos_por_faixa_preco
 */
export function useGruposPorFaixaPreco(
  faixaPreco: '< R$150' | 'R$150-300' | 'R$300-500' | 'R$500-800' | 'R$800+',
  tipoLente?: string,
  options?: Omit<UseQueryOptions<GrupoCanonicoView[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['grupos-por-faixa-preco', faixaPreco, tipoLente],
    queryFn: async () => {
      let query = lentesClient
        .from('v_grupos_por_faixa_preco')
        .select('*')
        .eq('faixa_preco', faixaPreco)

      if (tipoLente) {
        query = query.eq('tipo_lente', tipoLente)
      }

      const { data, error } = await query.order('preco_medio')

      if (error) throw error
      return data as GrupoCanonicoView[]
    },
    staleTime: 10 * 60 * 1000, // 10 minutos
    ...options,
  })
}

/**
 * Busca sugestões de upgrade para um grupo
 * VIEW: v_sugestoes_upgrade
 */
export function useSugestoesUpgrade(
  grupoBaseId: string,
  options?: Omit<UseQueryOptions<any[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['sugestoes-upgrade', grupoBaseId],
    queryFn: async () => {
      const { data, error } = await lentesClient
        .from('v_sugestoes_upgrade')
        .select('*')
        .eq('grupo_base_id', grupoBaseId)
        .order('diferenca_preco')
        .limit(3)

      if (error) throw error
      return data
    },
    enabled: Boolean(grupoBaseId),
    staleTime: 15 * 60 * 1000, // 15 minutos
    ...options,
  })
}

/**
 * Busca grupos com melhor margem (gamificação)
 * VIEW: v_grupos_melhor_margem
 */
export function useGruposMelhorMargem(
  tipoLente?: string,
  limit = 20,
  options?: Omit<UseQueryOptions<any[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['grupos-melhor-margem', tipoLente, limit],
    queryFn: async () => {
      let query = lentesClient
        .from('v_grupos_melhor_margem')
        .select('*')
        .order('ranking_margem')
        .limit(limit)

      if (tipoLente) {
        query = query.eq('tipo_lente', tipoLente)
      }

      const { data, error } = await query

      if (error) throw error
      return data
    },
    staleTime: 30 * 60 * 1000, // 30 minutos
    ...options,
  })
}

/**
 * Busca todos os grupos canônicos com filtros
 * VIEW: v_grupos_canonicos
 */
export function useGruposCanonicos(
  filtros?: {
    tipoLente?: string
    material?: string
    indiceRefracao?: string
    categoria?: string
    isPremium?: boolean
  },
  options?: Omit<UseQueryOptions<GrupoCanonicoView[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['grupos-canonicos', filtros],
    queryFn: async () => {
      let query = lentesClient
        .from('v_grupos_canonicos')
        .select('*')

      if (filtros?.tipoLente) {
        query = query.eq('tipo_lente', filtros.tipoLente)
      }
      if (filtros?.material) {
        query = query.eq('material', filtros.material)
      }
      if (filtros?.indiceRefracao) {
        query = query.eq('indice_refracao', filtros.indiceRefracao)
      }
      if (filtros?.categoria) {
        query = query.eq('categoria', filtros.categoria)
      }
      if (filtros?.isPremium !== undefined) {
        query = query.eq('is_premium', filtros.isPremium)
      }

      const { data, error } = await query.order('preco_medio')

      if (error) throw error
      return data as GrupoCanonicoView[]
    },
    staleTime: 10 * 60 * 1000,
    ...options,
  })
}

// ============================================
// HOOKS PARA SISTEMA DE COMPRAS (DCL)
// ============================================

/**
 * Busca fornecedores disponíveis para uma lente específica
 * VIEW: v_fornecedores_por_lente
 */
export function useFornecedoresPorLente(
  lenteId: string,
  options?: Omit<UseQueryOptions<FornecedorPorLenteView[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['fornecedores-por-lente', lenteId],
    queryFn: async () => {
      const { data, error } = await lentesClient
        .from('v_fornecedores_por_lente')
        .select('*')
        .eq('lente_id', lenteId)
        .order('ranking_fornecedor') // Melhor fornecedor primeiro (prazo + custo)

      if (error) throw error
      return data as FornecedorPorLenteView[]
    },
    enabled: Boolean(lenteId),
    staleTime: 5 * 60 * 1000,
    ...options,
  })
}

/**
 * Busca melhor fornecedor para uma lente (ranking 1)
 * VIEW: v_fornecedores_por_lente
 */
export function useMelhorFornecedor(
  lenteId: string,
  options?: Omit<UseQueryOptions<FornecedorPorLenteView>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['melhor-fornecedor', lenteId],
    queryFn: async () => {
      const { data, error } = await lentesClient
        .from('v_fornecedores_por_lente')
        .select('*')
        .eq('lente_id', lenteId)
        .eq('ranking_fornecedor', 1)
        .single()

      if (error) throw error
      return data as FornecedorPorLenteView
    },
    enabled: Boolean(lenteId),
    staleTime: 5 * 60 * 1000,
    ...options,
  })
}

/**
 * Cotação rápida de múltiplas lentes
 * VIEW: v_lentes_cotacao_compra
 */
export function useCotacaoLentes(
  lenteIds: string[],
  options?: Omit<UseQueryOptions<any[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['cotacao-lentes', lenteIds],
    queryFn: async () => {
      const { data, error } = await lentesClient
        .from('v_lentes_cotacao_compra')
        .select('*')
        .in('lente_id', lenteIds)

      if (error) throw error
      return data
    },
    enabled: lenteIds.length > 0,
    staleTime: 3 * 60 * 1000, // 3 minutos (mais curto para compras)
    ...options,
  })
}

// ============================================
// HOOKS AUXILIARES
// ============================================

/**
 * Calcula preço com desconto validando margem mínima
 * RPC: calcular_preco_com_desconto
 */
export function useCalcularPrecoComDesconto(
  grupoId: string,
  nivelUsuario: 'vendedor' | 'gerente' | 'admin',
  descontoPercentual = 0
) {
  return useQuery({
    queryKey: ['calcular-preco', grupoId, nivelUsuario, descontoPercentual],
    queryFn: async () => {
      const { data, error } = await lentesClient.rpc('calcular_preco_com_desconto', {
        p_grupo_id: grupoId,
        p_nivel_usuario: nivelUsuario,
        p_desconto_percentual: descontoPercentual,
      })

      if (error) throw error
      return data
    },
    enabled: Boolean(grupoId),
    staleTime: 1 * 60 * 1000, // 1 minuto (recalcula frequentemente)
  })
}

/**
 * Busca filtros disponíveis para o catálogo
 * VIEW: v_filtros_grupos_canonicos
 */
export function useFiltrosDisponiveis(
  options?: Omit<UseQueryOptions<any[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['filtros-disponiveis'],
    queryFn: async () => {
      const { data, error } = await lentesClient
        .from('v_filtros_grupos_canonicos')
        .select('*')
        .order('total_grupos', { ascending: false })

      if (error) throw error
      return data
    },
    staleTime: 60 * 60 * 1000, // 1 hora (filtros mudam raramente)
    ...options,
  })
}
