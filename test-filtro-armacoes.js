/**
 * Teste: Verificar se busca funciona sem loja_id ou com OR
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_CRM_ERP_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_CRM_ERP_SUPABASE_ANON_KEY

const crmErpClient = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false, autoRefreshToken: false },
  db: { schema: 'public' }
})

async function testarFiltroLojaOpcional() {
  const loja_id_teste = 'e5915ba4-fdb4-4fa7-b9d5-c71d3c704c55' // Loja do wizard

  console.log('\n=== TESTE 1: Buscar com OR (loja OU null) ===')
  console.log(`Loja: ${loja_id_teste}`)
  
  try {
    const { data, error, count } = await crmErpClient
      .from('vw_estoque_completo')
      .select('produto_id, sku, descricao, loja_id, quantidade_atual', { count: 'exact' })
      .eq('tipo_produto', 'armacao')
      .or(`loja_id.eq.${loja_id_teste},loja_id.is.null`)
      .limit(10)
    
    if (error) {
      console.error('❌ Erro:', error.message)
    } else {
      console.log(`✅ Encontradas: ${count || 0} armações`)
      console.log('   Primeiras 10:')
      data?.forEach(a => {
        console.log(`   - ${a.descricao.substring(0, 50)} (Loja: ${a.loja_id || 'null'}, Qtd: ${a.quantidade_atual})`)
      })
    }
  } catch (err) {
    console.error('❌ Exceção:', err.message)
  }

  console.log('\n=== TESTE 2: Buscar SEM filtro de loja (todas) ===')
  
  try {
    const { data, error, count } = await crmErpClient
      .from('vw_estoque_completo')
      .select('produto_id, sku, descricao, loja_id, quantidade_atual', { count: 'exact' })
      .eq('tipo_produto', 'armacao')
      .gt('quantidade_atual', 0) // Apenas com estoque
      .limit(10)
    
    if (error) {
      console.error('❌ Erro:', error.message)
    } else {
      console.log(`✅ Total com estoque: ${count || 0}`)
      console.log('   Primeiras 10:')
      data?.forEach(a => {
        console.log(`   - ${a.descricao.substring(0, 50)} (Loja: ${a.loja_id?.substring(0, 8)}..., Qtd: ${a.quantidade_atual})`)
      })
    }
  } catch (err) {
    console.error('❌ Exceção:', err.message)
  }

  console.log('\n=== FIM ===\n')
}

testarFiltroLojaOpcional().catch(console.error)
