/**
 * 🛍️ Hook: useArmacoes
 * 
 * Hook para buscar armações (produtos tipo 'armacao') do CRM_ERP
 * Usa view: vw_estoque_completo
 */

'use client'

import { useQuery } from '@tanstack/react-query'
import { buscarArmacoes, buscarArmacaoPorSKU, type ArmacaoFiltros } from '@/lib/supabase/crm-erp-client'

/**
 * Hook para listar armações com filtros
 */
export function useArmacoes(filtros: ArmacaoFiltros) {
  return useQuery({
    queryKey: ['armacoes', filtros],
    queryFn: () => buscarArmacoes(filtros),
    // ⚠️ Removido enabled: loja_id - CRM_ERP é banco separado, busca em todas as lojas
    staleTime: 2 * 60 * 1000, // 2 minutos (estoque muda com frequência)
    gcTime: 5 * 60 * 1000, // 5 minutos
  })
}

/**
 * Hook para buscar armação específica por SKU
 */
export function useArmacaoPorSKU(sku: string | null, lojaId: string | null) {
  return useQuery({
    queryKey: ['armacao-sku', sku, lojaId],
    queryFn: () => {
      if (!sku || !lojaId) return Promise.resolve(null)
      return buscarArmacaoPorSKU(sku, lojaId)
    },
    enabled: !!sku && !!lojaId,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  })
}
