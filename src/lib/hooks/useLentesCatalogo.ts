/**
 * 🔍 Hook: useLentesCatalogo
 * 
 * Hook para buscar lentes do catálogo Best Lens
 * View: v_grupos_canonicos_completos (461 grupos, 1.411 lentes)
 */

'use client'

import { useQuery } from '@tanstack/react-query'
import { lentesClient } from '@/lib/supabase/lentes-client'

// ============================================================
// TIPOS
// ============================================================

export interface GrupoCanonicoCompleto {
  id: string
  slug: string
  nome_grupo: string
  tipo_lente: 'visao_simples' | 'multifocal' | 'bifocal'
  material: string
  indice_refracao: string
  
  // Tratamentos
  tratamento_antirreflexo: boolean
  tratamento_antirrisco: boolean
  tratamento_uv: boolean
  tratamento_blue_light: boolean
  tratamento_fotossensiveis: 'nenhum' | 'fotocromático' | 'polarizado' | null
  
  // Preços
  preco_minimo: number
  preco_medio: number
  preco_maximo: number
  
  // Metadados
  total_lentes: number
  is_premium: boolean
  fornecedores_disponiveis: Array<{
    id: string
    nome: string
    prazo: number
  }>
  
  // Graus
  grau_esferico_min?: number
  grau_esferico_max?: number
  grau_cilindrico_min?: number
  grau_cilindrico_max?: number
  adicao_min?: number
  adicao_max?: number
  
  categoria_predominante: 'economica' | 'intermediaria' | 'premium'
  total_marcas: number
}

export interface LenteDetalhada {
  id: string
  fornecedor_id: string
  marca_id: string | null
  grupo_canonico_id: string | null
  nome_lente: string
  tipo_lente: 'visao_simples' | 'multifocal' | 'bifocal'
  material: string
  indice_refracao: string
  preco_venda_sugerido: number
  preco_custo: number
  ativo: boolean
}

export interface LenteComLaboratorio {
  lente_id: string
  lente_nome: string
  lente_slug: string
  nome_canonizado: string
  
  // Grupo
  grupo_canonico_id: string
  
  // Especificações
  tipo_lente: 'visao_simples' | 'multifocal' | 'bifocal' | 'leitura' | 'ocupacional'
  material: string
  indice_refracao: string
  
  // Laboratório (fornecedor)
  fornecedor_id: string
  fornecedor_nome: string
  
  // Marca
  marca_id: string | null
  marca_nome: string | null
  
  // Financeiro
  preco_custo: number
  prazo_dias: number
  
  // Status
  ativo: boolean
  categoria: string
}

export interface FiltrosLente {
  tipo_lente?: 'visao_simples' | 'multifocal' | 'bifocal'
  material?: string
  indice_refracao?: string
  preco_min?: number
  preco_max?: number
  is_premium?: boolean
  busca?: string // Busca por nome
  
  // ⚡ NOVOS FILTROS: Tratamentos
  tratamento_antirreflexo?: boolean
  tratamento_antirrisco?: boolean
  tratamento_uv?: boolean
  tratamento_blue_light?: boolean
  tratamento_fotossensiveis?: 'nenhum' | 'fotocromático' | 'polarizado' | null
  
  // ⚡ NOVO FILTRO: Marca
  marca_id?: string
}

// ============================================================
// HOOK: Listar Grupos Canônicos
// ============================================================

export function useGruposCanonicos(filtros?: FiltrosLente) {
  return useQuery({
    queryKey: ['grupos-canonicos', filtros],
    queryFn: async () => {
      // ⚡ Usar v_grupos_canonicos (view pública no schema public)
      let query = lentesClient
        .from('v_grupos_canonicos')
        .select('*')
        .order('preco_medio', { ascending: true })

      // ⚡ APLICAR FILTROS COM NORMALIZAÇÃO DE VALORES
      
      // Filtro: Tipo de Lente
      if (filtros?.tipo_lente) {
        query = query.eq('tipo_lente', filtros.tipo_lente)
      }

      // Filtro: Material (normalizar para uppercase sem hífen)
      // Ex: "CR-39" → "CR39", "policarbonato" → "POLICARBONATO"
      if (filtros?.material) {
        const materialNormalizado = filtros.material.replace(/-/g, '').toUpperCase()
        query = query.eq('material', materialNormalizado)
      }

      // Filtro: Índice de Refração (forçar string com formato "1.XX")
      // Ex: 1.5 → "1.50", 1.61 → "1.61"
      if (filtros?.indice_refracao) {
        const indiceNormalizado = typeof filtros.indice_refracao === 'number'
          ? filtros.indice_refracao.toFixed(2)
          : filtros.indice_refracao
        query = query.eq('indice_refracao', indiceNormalizado)
      }

      // Filtro: Faixa de Preço
      if (filtros?.preco_min !== undefined) {
        query = query.gte('preco_medio', filtros.preco_min)
      }

      if (filtros?.preco_max !== undefined) {
        query = query.lte('preco_medio', filtros.preco_max)
      }

      // Filtro: Premium
      if (filtros?.is_premium !== undefined) {
        query = query.eq('is_premium', filtros.is_premium)
      }

      // Filtro: Busca por Nome
      if (filtros?.busca) {
        query = query.ilike('nome_grupo', `%${filtros.busca}%`)
      }

      // ⚡ FILTROS DE TRATAMENTOS (booleanos diretos)
      if (filtros?.tratamento_antirreflexo !== undefined) {
        query = query.eq('tratamento_antirreflexo', filtros.tratamento_antirreflexo)
      }

      if (filtros?.tratamento_antirrisco !== undefined) {
        query = query.eq('tratamento_antirrisco', filtros.tratamento_antirrisco)
      }

      if (filtros?.tratamento_uv !== undefined) {
        query = query.eq('tratamento_uv', filtros.tratamento_uv)
      }

      if (filtros?.tratamento_blue_light !== undefined) {
        query = query.eq('tratamento_blue_light', filtros.tratamento_blue_light)
      }

      // Filtro: Tratamentos Fotossensíveis (enum: 'nenhum' | 'fotocromático' | 'polarizado')
      if (filtros?.tratamento_fotossensiveis) {
        query = query.eq('tratamento_fotossensiveis', filtros.tratamento_fotossensiveis)
      }

      // ⚡ NOVO FILTRO: Marca (buscar lentes da marca e depois agrupar - complexo, fazer server-side depois)
      // Por enquanto, vamos ignorar filtro de marca no hook (fazer no componente após receber dados)

      const { data, error } = await query

      if (error) {
        console.error('Erro ao buscar grupos canônicos:', error)
        throw error
      }

      // A view pública pode não ter todos os campos esperados pelo tipo
      // (ex: fornecedores_disponiveis). Garantir defaults para não quebrar o UI.
      const rows = (data ?? []) as Array<Partial<GrupoCanonicoCompleto> & { id: string }>
      return rows.map((row) => ({
        ...row,
        fornecedores_disponiveis: Array.isArray(row.fornecedores_disponiveis)
          ? row.fornecedores_disponiveis
          : [],
      })) as GrupoCanonicoCompleto[]
    },
    staleTime: 10 * 60 * 1000, // 10 minutos
    gcTime: 30 * 60 * 1000, // 30 minutos
  })
}

// ============================================================
// HOOK: Buscar Lentes de um Grupo
// ============================================================

export function useLentesDoGrupo(grupoCanonicoId: string | null) {
  return useQuery({
    queryKey: ['lentes-grupo', grupoCanonicoId],
    queryFn: async () => {
      if (!grupoCanonicoId) return []

      console.log('[useLentesDoGrupo] Buscando lentes do grupo:', grupoCanonicoId)

      // ⚠️ WORKAROUND: v_lentes_cotacao_compra precisa de RLS configurado no sis_lens
      // Por enquanto, retornamos um mock baseado no grupo
      // TODO: Pedir ao admin do sis_lens para configurar RLS public na view
      
      const { data: grupo, error: grupoError } = await lentesClient
        .from('v_grupos_canonicos')
        .select('*')
        .eq('id', grupoCanonicoId)
        .single()

      if (grupoError) {
        console.error('[useLentesDoGrupo] Erro ao buscar grupo:', grupoError)
        throw grupoError
      }

      if (!grupo) return []

      // Mock: Criar lentes fictícias baseadas no grupo
      // (Na produção, virá da view v_lentes_cotacao_compra quando o RLS for configurado)
      const lentesMock: LenteComLaboratorio[] = [
        {
          lente_id: `${grupoCanonicoId}-mock-1`,
          lente_nome: `${grupo.material} ${grupo.indice_refracao} ${grupo.tipo_lente}`,
          lente_slug: grupo.slug,
          nome_canonizado: grupo.nome_grupo,
          
          grupo_canonico_id: grupoCanonicoId,
          
          tipo_lente: grupo.tipo_lente as 'visao_simples' | 'multifocal' | 'bifocal' | 'leitura' | 'ocupacional',
          material: grupo.material,
          indice_refracao: grupo.indice_refracao,
          
          // Mock de fornecedor (Best Lens Express)
          fornecedor_id: 'mock-fornecedor-express',
          fornecedor_nome: 'Best Lens Express',
          
          marca_id: null,
          marca_nome: grupo.material === 'POLICARBONATO' ? 'POLYCARBONATE' : 'EXPRESS',
          
          preco_custo: grupo.preco_minimo,
          prazo_dias: 7,
          
          ativo: true,
          categoria: grupo.categoria_predominante || (grupo.is_premium ? 'premium' : 'economica')
        }
      ]

      // Se houver range de preços, criar mais opções
      if (grupo.preco_maximo > grupo.preco_minimo + 50) {
        lentesMock.push({
          ...lentesMock[0],
          lente_id: `${grupoCanonicoId}-mock-2`,
          fornecedor_id: 'mock-fornecedor-premium',
          fornecedor_nome: 'Best Lens Premium',
          marca_nome: 'PREMIUM',
          preco_custo: grupo.preco_medio,
          prazo_dias: 5,
          categoria: 'intermediaria'
        })
      }

      if (grupo.preco_maximo > grupo.preco_medio + 50) {
        lentesMock.push({
          ...lentesMock[0],
          lente_id: `${grupoCanonicoId}-mock-3`,
          fornecedor_id: 'mock-fornecedor-top',
          fornecedor_nome: 'Best Lens TOP',
          marca_nome: 'TOP LINE',
          preco_custo: grupo.preco_maximo,
          prazo_dias: 3,
          categoria: 'premium'
        })
      }

      console.log(`[useLentesDoGrupo] ✅ ${lentesMock.length} lentes mockadas (TEMPORÁRIO - aguardando RLS no sis_lens)`)
      return lentesMock
    },
    enabled: !!grupoCanonicoId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

// ============================================================
// HOOK: Detalhes de uma Lente Específica
// ============================================================

export function useLenteDetalhes(lenteId: string | null) {
  return useQuery({
    queryKey: ['lente-detalhes', lenteId],
    queryFn: async () => {
      if (!lenteId) return null

      // ⚡ Usar v_lentes_cotacao_compra que já tem todos os joins
      const { data, error } = await lentesClient
        .from('v_lentes_cotacao_compra')
        .select('*')
        .eq('lente_id', lenteId)
        .single()

      if (error) {
        console.error('Erro ao buscar detalhes da lente:', error)
        throw error
      }

      return data
    },
    enabled: !!lenteId,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  })
}

// ============================================================
// HOOK: Buscar Fornecedor da Lente (para preencher laboratorio_id)
// ============================================================

export function useFornecedorDaLente(lenteId: string | null) {
  return useQuery({
    queryKey: ['fornecedor-lente', lenteId],
    queryFn: async () => {
      if (!lenteId) return null

      const { data, error } = await lentesClient
        .from('lentes')
        .select('fornecedor_id, fornecedor:fornecedor_id(id, nome, prazo_visao_simples, prazo_multifocal)')
        .eq('id', lenteId)
        .single()

      if (error) {
        console.error('Erro ao buscar fornecedor da lente:', error)
        throw error
      }

      // Supabase retorna array se não usar .single(), mas já usamos .single(). O TS as vezes se perde.
      const fornecedor = data?.fornecedor
      if (Array.isArray(fornecedor)) {
         return fornecedor[0] as unknown as { id: string; nome: string; prazo_visao_simples: number; prazo_multifocal: number }
      }
      return fornecedor as unknown as { id: string; nome: string; prazo_visao_simples: number; prazo_multifocal: number } | null
    },
    enabled: !!lenteId,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  })
}

// ============================================================
// HOOK: Opções de Filtros (materiais, índices disponíveis)
// ============================================================

export function useOpcoesFiltragem() {
  return useQuery({
    queryKey: ['opcoes-filtragem-lentes'],
    queryFn: async () => {
      // Buscar materiais únicos
      const { data: materiais } = await lentesClient
        .from('v_grupos_canonicos_completos')
        .select('material')
        .not('material', 'is', null)

      // Buscar índices únicos
      const { data: indices } = await lentesClient
        .from('v_grupos_canonicos_completos')
        .select('indice_refracao')
        .not('indice_refracao', 'is', null)

      // Remover duplicatas
      const materiaisUnicos = Array.from(new Set(materiais?.map(m => m.material) || []))
      const indicesUnicos = Array.from(new Set(indices?.map(i => i.indice_refracao) || []))

      return {
        materiais: materiaisUnicos.filter(Boolean).sort(),
        indices: indicesUnicos.filter(Boolean).sort(),
        tipos: ['visao_simples', 'multifocal', 'bifocal'] as const
      }
    },
    staleTime: 60 * 60 * 1000, // 1 hora (dados estáticos)
    gcTime: 2 * 60 * 60 * 1000, // 2 horas
  })
}
