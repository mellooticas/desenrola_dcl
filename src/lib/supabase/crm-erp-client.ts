// src/lib/supabase/crm-erp-client.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_CRM_ERP_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_CRM_ERP_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    '❌ ERRO: Configure CRM_ERP_SUPABASE_URL e CRM_ERP_SUPABASE_ANON_KEY no .env.local'
  )
}

/**
 * Cliente Supabase para CRM_ERP (Produtos e Estoque)
 * 
 * IMPORTANTE: Este É O MESMO banco do sis_vendas!
 * - Acesso READ-ONLY para produtos
 * - NÃO dar baixa em estoque (apenas consultar)
 * - Views: vw_estoque_completo, vw_estoque_atual
 */
export const crmErpClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // Não precisa auth, apenas consultas
    autoRefreshToken: false,
  },
  db: {
    schema: 'public', // Produtos estão em public schema
  },
})

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
  console.log('[CRM_ERP] Buscando produtos com filtros:', { tipo, sku_visual, cod, nome, loja_id, limite })
  
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
    console.error('[CRM_ERP] Código do erro:', error.code)
    console.error('[CRM_ERP] Mensagem:', error.message)
    
    // Se view não existe, tentar tabela produtos diretamente
    if (error.code === '42P01' || error.message.includes('does not exist')) {
      console.log('[CRM_ERP] View não encontrada, tentando tabela produtos...')
      
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
      
      console.log('[CRM_ERP] Produtos encontrados (fallback):', fallbackData?.length)
      return fallbackData || []
    }
    
    throw error
  }

  console.log('[CRM_ERP] Produtos encontrados:', data?.length)
  return data || []
}

/**
 * Helper: Buscar estoque específico de um produto
 */
export async function buscarEstoqueProduto(
  produto_uuid: string,
  loja_id?: string
) {
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
