// ============================================
// COMPARAÇÃO ENTRE APIs - DASHBOARD vs KPIs
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

async function compararAPIs() {
  console.log('🔍 COMPARAÇÃO ENTRE APIs')
  console.log('='.repeat(50))
  
  const env = carregarEnv()
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Variáveis Supabase não encontradas')
    return
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey)
  
  try {
    console.log('\n1️⃣ QUERY DA API /dashboard (simples)...')
    
    // Query da API /dashboard/route.ts (simples)
    const { data: pedidosDashboard, error: errorDashboard } = await supabase
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
    
    console.log(`   Pedidos encontrados: ${pedidosDashboard?.length || 0}`)
    console.log(`   Valor total: R$ ${pedidosDashboard?.reduce((t, p) => t + (p.valor_pedido || 0), 0) || 0}`)
    
    if (pedidosDashboard?.length > 0) {
      console.log('   Primeiros 3:')
      pedidosDashboard.slice(0, 3).forEach((p, i) => {
        console.log(`     ${i+1}. ${p.id} - R$ ${p.valor_pedido} - ${p.status}`)
      })
    }
    
    console.log('\n2️⃣ QUERY DA API /dashboard/kpis (completa)...')
    
    // Query da API /dashboard/kpis/route.ts (completa)
    const { data: pedidosKPIs, error: errorKPIs } = await supabase
      .from('pedidos')
      .select(`
        id,
        status,
        eh_garantia,
        valor_pedido,
        custo_lentes,
        created_at,
        data_pedido,
        data_prevista_pronto,
        lead_time_total_horas
      `)
    
    console.log(`   Pedidos encontrados: ${pedidosKPIs?.length || 0}`)
    console.log(`   Valor total: R$ ${pedidosKPIs?.reduce((t, p) => t + (p.valor_pedido || 0), 0) || 0}`)
    
    if (pedidosKPIs?.length > 0) {
      console.log('   Primeiros 3:')
      pedidosKPIs.slice(0, 3).forEach((p, i) => {
        console.log(`     ${i+1}. ${p.id} - R$ ${p.valor_pedido} - ${p.status}`)
      })
    }
    
    console.log('\n3️⃣ ANÁLISE DA DIFERENÇA...')
    
    if (pedidosDashboard?.length !== pedidosKPIs?.length) {
      console.log(`❌ DIFERENTES! Dashboard: ${pedidosDashboard?.length}, KPIs: ${pedidosKPIs?.length}`)
      
      // Verificar IDs únicos
      const idsDashboard = new Set(pedidosDashboard?.map(p => p.id) || [])
      const idsKPIs = new Set(pedidosKPIs?.map(p => p.id) || [])
      
      const soDashboard = [...idsDashboard].filter(id => !idsKPIs.has(id))
      const soKPIs = [...idsKPIs].filter(id => !idsDashboard.has(id))
      
      if (soDashboard.length > 0) {
        console.log('   📋 Só no Dashboard:', soDashboard)
      }
      if (soKPIs.length > 0) {
        console.log('   📋 Só no KPIs:', soKPIs)
      }
      
    } else {
      console.log('✅ Mesmo número de registros')
    }
    
    // Verificar se a diferença está na coluna lead_time_total_horas
    console.log('\n4️⃣ VERIFICANDO CAMPO lead_time_total_horas...')
    
    const { data: comLeadTime, error: leadError } = await supabase
      .from('pedidos')
      .select('id, valor_pedido, lead_time_total_horas')
      .not('lead_time_total_horas', 'is', null)
    
    console.log(`   Pedidos com lead_time_total_horas: ${comLeadTime?.length || 0}`)
    
    const { data: semLeadTime, error: semLeadError } = await supabase
      .from('pedidos')
      .select('id, valor_pedido, lead_time_total_horas')
      .is('lead_time_total_horas', null)
    
    console.log(`   Pedidos sem lead_time_total_horas: ${semLeadTime?.length || 0}`)
    
    if (comLeadTime?.length > 0) {
      console.log('   Com lead time:')
      comLeadTime.forEach(p => {
        console.log(`     ${p.id}: ${p.lead_time_total_horas}h - R$ ${p.valor_pedido}`)
      })
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message)
  }
}

compararAPIs()