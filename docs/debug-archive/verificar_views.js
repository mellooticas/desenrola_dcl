// ================================================================
// SCRIPT PARA VERIFICAR VIEW v_kpis_dashboard - DESENROLA DCL  
// ================================================================

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente não configuradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function verificarViewKPIs() {
  console.log('🔍 VERIFICAÇÃO DA VIEW v_kpis_dashboard')
  console.log('=' .repeat(60))
  
  try {
    // 1. VERIFICAR SE A VIEW EXISTE
    console.log('\n📊 VERIFICANDO VIEW v_kpis_dashboard:')
    const { data: kpisView, error: kpisError } = await supabase
      .from('v_kpis_dashboard')
      .select('*')
      .limit(1)
      .single()
    
    if (kpisError) {
      console.log('❌ Erro ou view não existe:', kpisError.message)
      
      // Tentar buscar views existentes
      console.log('\n🔎 VERIFICANDO VIEWS EXISTENTES:')
      const { data: views, error: viewsError } = await supabase
        .from('information_schema.views')
        .select('table_name')
        .eq('table_schema', 'public')
        .like('table_name', '%kpi%')
      
      if (views && views.length > 0) {
        console.log('   Views encontradas com "kpi":')
        views.forEach(view => console.log(`     - ${view.table_name}`))
      } else {
        console.log('   Nenhuma view com "kpi" encontrada')
      }
      
    } else {
      console.log('✅ View encontrada com dados:')
      console.log('   Dados da view v_kpis_dashboard:')
      Object.entries(kpisView).forEach(([key, value]) => {
        console.log(`     ${key}: ${value}`)
      })
      
      // Comparar com dados reais da tabela pedidos
      console.log('\n🔍 COMPARAÇÃO COM DADOS REAIS:')
      const { data: pedidosReais } = await supabase
        .from('pedidos')
        .select('id, status, valor_pedido')
      
      console.log(`   Pedidos na view: ${kpisView.total_pedidos}`)
      console.log(`   Pedidos reais na tabela: ${pedidosReais?.length || 0}`)
      
      if (kpisView.total_pedidos !== (pedidosReais?.length || 0)) {
        console.log('   ⚠️  INCONSISTÊNCIA DETECTADA!')
        console.log('   A view está retornando dados diferentes da tabela real')
      }
    }
    
    // 2. VERIFICAR OUTRAS VIEWS SUSPEITAS
    const viewsParaVerificar = [
      'v_evolucao_mensal',
      'v_ranking_laboratorios', 
      'v_analise_financeira',
      'v_alertas_criticos'
    ]
    
    for (const viewName of viewsParaVerificar) {
      console.log(`\n📊 VERIFICANDO VIEW ${viewName}:`)
      
      const { data, error } = await supabase
        .from(viewName)
        .select('*')
        .limit(3)
      
      if (error) {
        console.log(`   ❌ Erro ou não existe: ${error.message}`)
      } else {
        console.log(`   ✅ Encontrada com ${data?.length || 0} registros`)
        if (data && data.length > 0) {
          console.log(`   Primeiro registro:`, JSON.stringify(data[0], null, 4))
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message)
  }
}

verificarViewKPIs()