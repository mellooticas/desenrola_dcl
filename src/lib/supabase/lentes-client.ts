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

// Não lançar erro no build time, apenas logar aviso
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Variáveis de ambiente do banco de lentes não configuradas')
} else {
  // DEBUG: Mostrar qual banco está sendo acessado
  console.log('👓 Lentes Client inicializado com:', {
    url: supabaseUrl,
    keyPrefix: supabaseAnonKey.substring(0, 10) + '...'
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
    db: {
      schema: 'public', // Sempre usa schema public (views)
    },
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
    console.warn('⚠️ LENTES_SUPABASE_SERVICE_ROLE_KEY não configurada')
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
