/**
 * Script de teste: Verificar armações no CRM_ERP
 */

const { createClient } = require('@supabase/supabase-js')

// Carrega .env.local
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_CRM_ERP_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_CRM_ERP_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis CRM_ERP não encontradas no .env.local')
  process.exit(1)
}

console.log('✅ Conectando ao CRM_ERP:', supabaseUrl)

const crmErpClient = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false, autoRefreshToken: false },
  db: { schema: 'public' }
})

async function testarArmacoes() {
  console.log('\n=== TESTE 1: Verificar view vw_estoque_completo ===')
  
  try {
    const { data, error } = await crmErpClient
      .from('vw_estoque_completo')
      .select('*')
      .limit(1)
    
    if (error) {
      console.error('❌ Erro na view vw_estoque_completo:', error.message)
      console.log('   Código:', error.code)
    } else {
      console.log('✅ View acessível!')
      console.log('   Estrutura da view:', data && data[0] ? Object.keys(data[0]) : 'vazio')
    }
  } catch (err) {
    console.error('❌ Exceção:', err.message)
  }

  console.log('\n=== TESTE 2: Buscar TODAS as armações (sem filtro de loja) ===')
  
  try {
    const { data, error, count } = await crmErpClient
      .from('vw_estoque_completo')
      .select('produto_id, sku, sku_visual, descricao, tipo_produto, quantidade_atual, loja_id', { count: 'exact' })
      .eq('tipo_produto', 'armacao')
      .limit(5)
    
    if (error) {
      console.error('❌ Erro ao buscar armações:', error.message)
    } else {
      console.log(`✅ Total de armações: ${count || 0}`)
      console.log('   Primeiras 5:')
      data?.forEach(a => {
        console.log(`   - ${a.descricao} (SKU: ${a.sku}, Estoque: ${a.quantidade_atual}, Loja: ${a.loja_id})`)
      })
    }
  } catch (err) {
    console.error('❌ Exceção:', err.message)
  }

  console.log('\n=== TESTE 3: Listar todas as lojas disponíveis ===')
  
  try {
    const { data, error } = await crmErpClient
      .from('vw_estoque_completo')
      .select('loja_id')
      .not('loja_id', 'is', null)
    
    if (error) {
      console.error('❌ Erro:', error.message)
    } else {
      const lojasUnicas = [...new Set(data?.map(d => d.loja_id))]
      console.log(`✅ ${lojasUnicas.length} lojas encontradas:`)
      lojasUnicas.forEach(loja => console.log(`   - ${loja}`))
    }
  } catch (err) {
    console.error('❌ Exceção:', err.message)
  }

  console.log('\n=== TESTE 4: Tentar buscar da tabela produtos (fallback) ===')
  
  try {
    const { data, error, count } = await crmErpClient
      .from('produtos')
      .select('produto_id, sku, descricao, tipo', { count: 'exact' })
      .eq('tipo', 'armacao')
      .eq('ativo', true)
      .limit(5)
    
    if (error) {
      console.error('❌ Erro na tabela produtos:', error.message)
      console.log('   Código:', error.code)
    } else {
      console.log(`✅ Total na tabela produtos: ${count || 0}`)
      console.log('   Primeiras 5:')
      data?.forEach(p => {
        console.log(`   - ${p.descricao} (SKU: ${p.sku})`)
      })
    }
  } catch (err) {
    console.error('❌ Exceção:', err.message)
  }

  console.log('\n=== TESTE 5: Verificar campo tipo_produto vs tipo ===')
  
  try {
    const { data: viewData } = await crmErpClient
      .from('vw_estoque_completo')
      .select('*')
      .limit(1)
      .single()
    
    console.log('✅ Campos disponíveis na view:')
    if (viewData) {
      console.log('   - Tem campo "tipo"?', 'tipo' in viewData)
      console.log('   - Tem campo "tipo_produto"?', 'tipo_produto' in viewData)
      console.log('   - Todos os campos:', Object.keys(viewData).join(', '))
    }
  } catch (err) {
    console.error('❌ Exceção:', err.message)
  }

  console.log('\n=== FIM DOS TESTES ===\n')
}

testarArmacoes().catch(console.error)
