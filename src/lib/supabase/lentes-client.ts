/**
 * Cliente Supabase para o Banco de Lentes (Best Lens Catalog)
 * 
 * Este cliente acessa um banco de dados separado que contém:
 * - Catálogo de lentes (1.411 produtos)
 * - Fornecedores e marcas
 * - Grupos canônicos
 * - Sistema de compras
 * 
 * Schemas disponíveis:
 * - lens_catalog: lentes, marcas, grupos_canonicos
 * - core: fornecedores
 * - compras: pedidos, estoque
 * 
 * Views públicas (acesso via public schema):
 * - v_grupos_por_receita_cliente (busca por graus)
 * - v_grupos_por_faixa_preco (segmentação)
 * - v_grupos_melhor_margem (gamificação)
 * - v_sugestoes_upgrade (upselling)
 * - v_fornecedores_por_lente (DCL compras)
 * - v_lentes_cotacao_compra (cotação otimizada)
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_LENTES_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_LENTES_SUPABASE_ANON_KEY

const isDev = process.env.NODE_ENV === 'development'

// Não lançar erro no build time, apenas logar aviso
if (!supabaseUrl || !supabaseAnonKey) {
  if (isDev) {
    console.warn('⚠️ Variáveis de ambiente do banco de lentes não configuradas')
  }
} else if (isDev) {
  console.log('👓 Lentes Client inicializado com:', {
    url: supabaseUrl,
  })
}

/**
 * Cliente público para frontend (usa anon key)
 * Acessa apenas views do schema public
 */
export const lentesClient = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder', 
  {
    auth: {
      persistSession: false, // Não precisa de sessão (banco read-only)
    },
    // ⚡ Schema public é o padrão - views públicas estão lá
  }
)

/**
 * Cliente administrativo para backend (usa service role key)
 * Acesso completo a todos os schemas
 * ATENÇÃO: Use apenas em API routes server-side!
 */
export const lentesAdminClient = (() => {
  const serviceRoleKey = process.env.LENTES_SUPABASE_SERVICE_ROLE_KEY
  
  if (!serviceRoleKey) {
    if (isDev) {
      console.warn('⚠️ LENTES_SUPABASE_SERVICE_ROLE_KEY não configurada')
    }
    return null
  }

  return createClient(supabaseUrl || '', serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
})()

/**
 * Helper: Verifica se o cliente de lentes está configurado
 */
export const isLentesClientReady = () => {
  return Boolean(supabaseUrl && supabaseAnonKey)
}

/**
 * Helper: Testa conexão com o banco de lentes
 */
export const testLentesConnection = async () => {
  try {
    const { data, error } = await lentesClient
      .from('v_grupos_canonicos')
      .select('count')
      .limit(1)

    if (error) {
      console.error('❌ Erro ao conectar no banco de lentes:', error)
      return false
    }

    console.log('✅ Conexão com banco de lentes OK')
    return true
  } catch (err) {
    console.error('❌ Erro ao testar conexão:', err)
    return false
  }
}

// Tipos TypeScript para as views principais
export type GrupoCanonicoView = {
  id: string // ✅ Campo correto da view v_grupos_canonicos
  nome_grupo: string
  slug: string
  tipo_lente: 'visao_simples' | 'multifocal' | 'bifocal' | 'leitura' | 'ocupacional'
  material: string
  indice_refracao: string
  categoria_predominante: string // ✅ Nome correto no banco
  preco_minimo: number
  preco_medio: number
  preco_maximo: number
  total_lentes: number
  total_marcas: number
  is_premium: boolean
  tratamento_antirreflexo: boolean // ✅ Nome correto
  tratamento_blue_light: boolean // ✅ Nome correto
  tratamento_fotossensiveis: string // ✅ Nome correto
  peso: number
}

export type FornecedorPorLenteView = {
  lente_id: string
  lente_nome: string
  fornecedor_id: string
  fornecedor_nome: string
  fornecedor_razao_social: string
  cnpj: string
  preco_custo: number
  prazo_entrega_dias: number
  marca_nome: string
  marca_premium: boolean
  ranking_fornecedor: number
}

export type LenteCotacaoView = {
  lente_id: string
  lente_slug: string
  lente_nome: string
  nome_canonizado: string
  tipo_lente: string
  material: string
  indice_refracao: string
  fornecedor_id: string
  fornecedor_nome: string
  marca_id: string
  marca_nome: string
  preco_custo: number
  prazo_dias: number
  ativo: boolean
  categoria: string
  grupo_canonico_id: string
}

// ============================================================
// HELPERS: Filtros e Marcas
// ============================================================

/**
 * Tipo para resposta de filtros disponíveis
 */
export type FiltroDisponivel = {
  valor: string
  total: number
  preco_min: number
  preco_max: number
}

export type FiltrosAgrupados = {
  tipo_lente?: FiltroDisponivel[]
  material?: FiltroDisponivel[]
  indice_refracao?: FiltroDisponivel[]
  [key: string]: FiltroDisponivel[] | undefined
}

/**
 * Tipo para marcas de lentes
 */
export type MarcaLente = {
  id: string
  nome: string
  slug: string
  is_premium: boolean
  logo_url?: string | null
}

/**
 * Helper: Buscar filtros disponíveis dinamicamente
 * Usa a view v_filtros_disponiveis que agrega tipo_lente, material, indice_refracao
 * 
 * @returns Filtros agrupados por categoria com contagens e faixas de preço
 */
export async function buscarFiltrosDisponiveis(): Promise<FiltrosAgrupados> {
  try {
    const { data, error } = await lentesClient
      .from('v_filtros_disponiveis')
      .select('*')
      .order('filtro_nome', { ascending: true })
      .order('total', { ascending: false })

    if (error) {
      console.error('[LENTES_CLIENT] Erro ao buscar filtros:', error)
      throw error
    }

    // Agrupar por tipo de filtro
    const agrupado = (data || []).reduce((acc, item) => {
      if (!acc[item.filtro_nome]) {
        acc[item.filtro_nome] = []
      }
      acc[item.filtro_nome].push({
        valor: item.valor,
        total: item.total,
        preco_min: item.preco_min,
        preco_max: item.preco_max
      })
      return acc
    }, {} as FiltrosAgrupados)

    console.log('[LENTES_CLIENT] ✅ Filtros carregados:', Object.keys(agrupado))
    return agrupado

  } catch (error) {
    console.error('[LENTES_CLIENT] Erro crítico ao buscar filtros:', error)
    return {}
  }
}

/**
 * Helper: Buscar marcas ativas
 * 
 * @returns Lista de marcas ordenadas por nome
 */
export async function buscarMarcas(): Promise<MarcaLente[]> {
  try {
    const { data, error } = await lentesClient
      .from('marcas')
      .select('id, nome, slug, is_premium, logo_url')
      .eq('ativo', true)
      .order('nome', { ascending: true })

    if (error) {
      console.error('[LENTES_CLIENT] Erro ao buscar marcas:', error)
      throw error
    }

    console.log(`[LENTES_CLIENT] ✅ ${data?.length || 0} marcas carregadas`)
    return data || []

  } catch (error) {
    console.error('[LENTES_CLIENT] Erro crítico ao buscar marcas:', error)
    return []
  }
}

/**
 * Helper: Buscar grupos canônicos por receita do cliente
 * Usa a view v_grupos_por_receita_cliente (quando disponível)
 * 
 * @param receita - Graus esférico, cilíndrico e adição
 * @returns Grupos compatíveis com a receita
 */
export async function buscarGruposPorReceita({
  esferico_od,
  cilindrico_od,
  adicao_od
}: {
  esferico_od: number
  cilindrico_od: number
  adicao_od?: number | null
}): Promise<GrupoCanonicoView[]> {
  try {
    // TODO: Implementar quando view v_grupos_por_receita_cliente estiver disponível
    // Por enquanto, buscar todos os grupos e filtrar no backend
    
    let query = lentesClient
      .from('v_grupos_canonicos')
      .select('*')
      .eq('ativo', true)

    // Se tem adição, filtrar apenas multifocais
    if (adicao_od && adicao_od > 0) {
      query = query.eq('tipo_lente', 'multifocal')
    }

    const { data, error } = await query
      .order('peso', { ascending: false })
      .limit(50)

    if (error) {
      console.error('[LENTES_CLIENT] Erro ao buscar grupos por receita:', error)
      throw error
    }

    console.log(`[LENTES_CLIENT] ✅ ${data?.length || 0} grupos compatíveis com receita`)
    return data || []

  } catch (error) {
    console.error('[LENTES_CLIENT] Erro crítico ao buscar grupos por receita:', error)
    return []
  }
}
