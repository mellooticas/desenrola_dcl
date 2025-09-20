// ============================================
// INVESTIGAÇÃO SIMPLES: DADOS DOS PEDIDOS
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

async function investigarPedidos() {
  console.log('🔍 INVESTIGAÇÃO DOS PEDIDOS')
  console.log('='.repeat(40))
  
  const env = carregarEnv()
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Variáveis Supabase não encontradas')
    console.log('URL:', supabaseUrl ? '✅' : '❌')
    console.log('Key:', supabaseKey ? '✅' : '❌')
    return
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey)
  
  try {
    // 1. Buscar todos os pedidos
    console.log('\n📊 Buscando todos os pedidos...')
    const { data: pedidos, error } = await supabase
      .from('pedidos')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('❌ Erro:', error.message)
      return
    }
    
    console.log(`\n✅ Total de pedidos encontrados: ${pedidos.length}`)
    
    // 2. Agrupar por status
    const porStatus = {}
    pedidos.forEach(p => {
      const status = p.status || 'SEM_STATUS'
      porStatus[status] = (porStatus[status] || 0) + 1
    })
    
    console.log('\n📋 Por status:')
    Object.entries(porStatus).forEach(([status, count]) => {
      console.log(`  ${status}: ${count}`)
    })
    
    // 3. Últimos 5 pedidos
    console.log('\n🕒 Últimos 5 pedidos:')
    pedidos.slice(0, 5).forEach((p, i) => {
      console.log(`${i+1}. ID: ${p.id}`)
      console.log(`   Status: ${p.status}`)
      console.log(`   Valor: R$ ${p.valor_pedido || 0}`)
      console.log(`   Cliente: ${p.cliente_nome || 'N/A'}`)
      console.log(`   Criado: ${p.created_at}`)
      console.log('')
    })
    
    // 4. Estatísticas
    const valorTotal = pedidos.reduce((sum, p) => sum + (p.valor_pedido || 0), 0)
    const entregues = pedidos.filter(p => p.status === 'ENTREGUE').length
    
    console.log('📊 Estatísticas:')
    console.log(`  Total: ${pedidos.length} pedidos`)
    console.log(`  Entregues: ${entregues}`)
    console.log(`  Valor total: R$ ${valorTotal.toFixed(2)}`)
    console.log(`  Ticket médio: R$ ${pedidos.length > 0 ? (valorTotal / pedidos.length).toFixed(2) : 0}`)
    
    // 5. Verificar view dashboard
    console.log('\n🔍 Verificando view dashboard...')
    const { data: viewData, error: viewError } = await supabase
      .from('v_kpis_dashboard')
      .select('*')
      .single()
    
    if (viewError) {
      console.log('❌ View não existe:', viewError.message)
    } else {
      console.log('✅ View existe:')
      console.log(`  View diz: ${viewData.total_pedidos} pedidos`)
      console.log(`  Tabela tem: ${pedidos.length} pedidos`)
      console.log(`  📊 DIFERENÇA: ${Math.abs(viewData.total_pedidos - pedidos.length)} pedidos`)
      
      if (viewData.total_pedidos !== pedidos.length) {
        console.log('\n⚠️  PROBLEMA IDENTIFICADO: View desatualizada!')
      }
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message)
  }
}

investigarPedidos()