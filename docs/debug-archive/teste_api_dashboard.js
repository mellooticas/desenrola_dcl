// ============================================
// TESTE DIRETO DA API DASHBOARD
// ============================================

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')

// Ler .env.local manualmente
function carregarEnv() {
  try {
    const envContent = fs.readFileSync('.env.local', 'utf8')
    const envVars = {}
    
    envContent.split('\n').forEach(line => {
      if (line.trim() && !line.startsWith('#')) {
        const [key, ...valueParts] = line.split('=')
        envVars[key.trim()] = valueParts.join('=').trim()
      }
    })
    
    return envVars
  } catch (error) {
    console.error('❌ Erro ao ler .env.local:', error.message)
    return {}
  }
}

async function testarAPIDashboard() {
  console.log('🧪 TESTE DA API DASHBOARD')
  console.log('='.repeat(40))
  
  const env = carregarEnv()
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Variáveis Supabase não encontradas')
    return
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey)
  
  try {
    console.log('\n1️⃣ Verificando view v_dashboard_resumo...')
    
    // Tentar acessar v_dashboard_resumo
    const { data: dashboardResumo, error: resumoError } = await supabase
      .from('v_dashboard_resumo')
      .select('*')
      .single()
    
    if (resumoError) {
      console.log('❌ v_dashboard_resumo não existe:', resumoError.message)
    } else {
      console.log('✅ v_dashboard_resumo existe:')
      console.log('   Total pedidos:', dashboardResumo.total_pedidos)
      console.log('   Dados completos:', JSON.stringify(dashboardResumo, null, 2))
      return // Se a view existe, a API usa ela
    }
    
    console.log('\n2️⃣ Simulando cálculo manual da API...')
    
    // Fazer a mesma query que a API faz
    const { data: pedidos, error } = await supabase
      .from('pedidos')
      .select(`
        id,
        status,
        eh_garantia,
        valor_pedido,
        custo_lentes,
        created_at,
        data_pedido,
        data_prevista_pronto
      `)
    
    if (error) {
      console.error('❌ Erro ao buscar pedidos:', error.message)
      return
    }
    
    console.log(`\n✅ Pedidos encontrados: ${pedidos.length}`)
    
    // Calcular métricas como a API faz
    const metricas = {
      total_pedidos: pedidos.length,
      registrados: pedidos.filter(p => p.status === 'REGISTRADO').length,
      aguardando_pagamento: pedidos.filter(p => p.status === 'AG_PAGAMENTO').length,
      em_producao: pedidos.filter(p => p.status === 'PRODUCAO').length,
      entregues: pedidos.filter(p => p.status === 'ENTREGUE').length,
      cancelados: pedidos.filter(p => p.status === 'CANCELADO').length,
      pedidos_garantia: pedidos.filter(p => p.eh_garantia).length,
      valor_total_vendas: pedidos.reduce((total, p) => total + (p.valor_pedido || 0), 0),
      custo_total_lentes: pedidos.reduce((total, p) => total + (p.custo_lentes || 0), 0)
    }
    
    console.log('\n📊 Métricas calculadas:')
    console.log('   Total pedidos:', metricas.total_pedidos)
    console.log('   AG_PAGAMENTO:', metricas.aguardando_pagamento)
    console.log('   Valor total:', `R$ ${metricas.valor_total_vendas}`)
    
    console.log('\n📋 Detalhes dos pedidos:')
    pedidos.forEach((p, i) => {
      console.log(`   ${i+1}. ${p.id} - ${p.status} - R$ ${p.valor_pedido}`)
    })
    
    // Verificar alertas
    console.log('\n3️⃣ Verificando alertas...')
    const { data: alertas } = await supabase
      .from('alertas')
      .select('id')
      .eq('lido', false)
    
    console.log(`   Alertas não lidos: ${alertas ? alertas.length : 0}`)
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message)
  }
}

testarAPIDashboard()