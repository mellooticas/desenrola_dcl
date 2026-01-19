// src/lib/supabase/crm-erp-client.ts
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const isDev = process.env.NODE_ENV === 'development'

function getCrmErpEnv(): { url: string; anonKey: string } | null {
  const url =
    process.env.CRM_ERP_SUPABASE_URL ??
    process.env.NEXT_PUBLIC_CRM_ERP_SUPABASE_URL ??
    null

  const anonKey =
    process.env.CRM_ERP_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_CRM_ERP_SUPABASE_ANON_KEY ??
    null

  if (!url || !anonKey) return null
  return { url, anonKey }
}

let cachedClient: SupabaseClient | null = null

/**
 * Cliente Supabase para CRM_ERP (Produtos e Estoque)
 *
 * IMPORTANTE:
 * - Não valide env em tempo de import. O `next build`/Netlify pode importar rotas
 *   durante a fase de build sem ter todas as variáveis disponíveis.
 * - Se faltar env em runtime, o handler deve responder 500/503, mas o build não deve falhar.
 */
export function getCrmErpClient(): SupabaseClient {
  if (cachedClient) return cachedClient

  const env = getCrmErpEnv()
  if (!env) {
    throw new Error(
      '❌ ERRO: Configure CRM_ERP_SUPABASE_URL + CRM_ERP_SUPABASE_ANON_KEY (ou NEXT_PUBLIC_CRM_ERP_SUPABASE_URL + NEXT_PUBLIC_CRM_ERP_SUPABASE_ANON_KEY) nas variáveis de ambiente.'
    )
  }

  cachedClient = createClient(env.url, env.anonKey, {
    auth: {
      persistSession: false, // Não precisa auth, apenas consultas
      autoRefreshToken: false,
    },
    db: {
      schema: 'public', // Produtos estão em public schema
    },
  })

  return cachedClient
}

/**
 * IMPORTANTE: Este É O MESMO banco do sis_vendas!
 * - Acesso READ-ONLY para produtos
 * - NÃO dar baixa em estoque (apenas consultar)
 * - Views: vw_estoque_completo, vw_estoque_atual
 */

/**
 * Helper: Buscar produtos por filtros
 */
export async function buscarProdutos({
  tipo,
  sku_visual,
  cod,
  nome,
  loja_id,
  limite = 20,
}: {
  tipo?: 'armacao' | 'acessorio' | 'servico'
  sku_visual?: string
  cod?: string
  nome?: string
  loja_id?: string
  limite?: number
}) {
  const crmErpClient = getCrmErpClient()

  if (isDev) {
    console.log('[CRM_ERP] Buscando produtos com filtros:', {
      tipo,
      sku_visual,
      cod,
      nome,
      loja_id,
      limite,
    })
  }
  
  // Tentar primeiro com a view, se não existir, usar tabela produtos
  let query = crmErpClient
    .from('vw_estoque_completo')
    .select('*')
    .eq('ativo', true)
    .limit(limite)

  if (tipo) query = query.eq('tipo', tipo)
  if (sku_visual) query = query.ilike('sku_visual', `%${sku_visual}%`)
  if (cod) query = query.ilike('cod', `%${cod}%`)
  if (nome) query = query.ilike('descricao', `%${nome}%`)
  if (loja_id) query = query.eq('loja_id', loja_id)

  const { data, error } = await query

  if (error) {
    console.error('[CRM_ERP] Erro ao buscar produtos:', error)
    if (isDev) {
      console.error('[CRM_ERP] Código do erro:', (error as any)?.code)
      console.error('[CRM_ERP] Mensagem:', (error as any)?.message)
    }
    
    // Se view não existe, tentar tabela produtos diretamente
    if (error.code === '42P01' || error.message.includes('does not exist')) {
      if (isDev) console.log('[CRM_ERP] View não encontrada, tentando tabela produtos...')
      
      let fallbackQuery = crmErpClient
        .from('produtos')
        .select('*')
        .eq('ativo', true)
        .limit(limite)
      
      if (tipo) fallbackQuery = fallbackQuery.eq('tipo', tipo)
      if (sku_visual) fallbackQuery = fallbackQuery.ilike('sku_visual', `%${sku_visual}%`)
      if (cod) fallbackQuery = fallbackQuery.ilike('cod', `%${cod}%`)
      if (nome) fallbackQuery = fallbackQuery.ilike('descricao', `%${nome}%`)
      
      const { data: fallbackData, error: fallbackError } = await fallbackQuery
      
      if (fallbackError) {
        console.error('[CRM_ERP] Erro no fallback:', fallbackError)
        throw fallbackError
      }
      
      if (isDev) console.log('[CRM_ERP] Produtos encontrados (fallback):', fallbackData?.length)
      return fallbackData || []
    }
    
    throw error
  }

  if (isDev) console.log('[CRM_ERP] Produtos encontrados:', data?.length)
  return data || []
}

/**
 * Helper: Buscar estoque específico de um produto
 */
export async function buscarEstoqueProduto(
  produto_uuid: string,
  loja_id?: string
) {
  const crmErpClient = getCrmErpClient()

  let query = crmErpClient
    .from('vw_estoque_atual')
    .select('*')
    .eq('produto_id', produto_uuid)

  if (loja_id) query = query.eq('loja_id', loja_id)

  const { data, error } = await query.single()

  if (error) {
    console.error('Erro ao buscar estoque:', error)
    throw error
  }

  return data
}

/**
 * Types baseados na estrutura do crm_erp
 */
export interface ProdutoCrmErp {
  produto_id: string
  sku: string
  sku_visual: string | null
  cod: string | null
  descricao: string
  tipo: string
  categoria: string | null
  marca: string | null
  modelo: string | null
  cor: string | null
  tamanho: string | null
  custo: number | null
  preco_venda: number | null
  codigo_barras: string | null
  loja_id: string
  quantidade_atual: number
  estoque_minimo: number | null
  estoque_maximo: number | null
  ativo: boolean
  status_estoque: 'SEM_ESTOQUE' | 'CRITICO' | 'NORMAL'
}

export interface EstoqueProduto {
  produto_id: string
  loja_id: string
  sku: string
  sku_visual: string | null
  nome: string
  custo: number | null
  preco_venda: number | null
  quantidade_atual: number
  updated_at: string
}
