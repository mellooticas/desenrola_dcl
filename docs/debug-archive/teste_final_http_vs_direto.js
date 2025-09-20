// ============================================
// TESTE FINAL: HTTP vs DIRETO
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

async function testeFinal() {
  console.log('🔬 TESTE FINAL: HTTP vs DIRETO')
  console.log('='.repeat(50))
  
  const env = carregarEnv()
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY
  
  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
  
  try {
    console.log('\n1️⃣ TESTE DIRETO (mesmo que API deveria fazer)...')
    
    const { data: pedidosDireto, error } = await supabase
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
    
    const valorDireto = pedidosDireto?.reduce((t, p) => t + (p.valor_pedido || 0), 0) || 0
    console.log(`   Resultado direto: ${pedidosDireto?.length} pedidos, R$ ${valorDireto}`)
    
    console.log('\n2️⃣ TESTE VIA HTTP (fetch para API)...')
    
    // Simular fetch HTTP como o frontend faz
    const response = await fetch('http://localhost:3000/api/dashboard/kpis')
    if (!response.ok) {
      console.log(`❌ HTTP Error: ${response.status}`)
      return
    }
    
    const dadosHTTP = await response.json()
    console.log(`   Resultado HTTP: ${dadosHTTP.total_pedidos} pedidos, R$ ${dadosHTTP.valor_total_vendas}`)
    
    console.log('\n3️⃣ COMPARAÇÃO...')
    
    if (pedidosDireto?.length !== dadosHTTP.total_pedidos) {
      console.log('❌ DIFERENÇA CONFIRMADA!')
      console.log(`   Direto: ${pedidosDireto?.length} pedidos`)
      console.log(`   HTTP: ${dadosHTTP.total_pedidos} pedidos`)
      console.log(`   💡 Diferença de ${Math.abs(pedidosDireto?.length - dadosHTTP.total_pedidos)} pedidos`)
      
      console.log('\n4️⃣ ANÁLISE DOS DADOS DIRETOS...')
      if (pedidosDireto && pedidosDireto.length > 0) {
        console.log('   Todos os pedidos encontrados:')
        pedidosDireto.forEach((p, i) => {
          console.log(`     ${i+1}. ${p.id} - R$ ${p.valor_pedido} - ${p.status}`)
        })
        
        // Verificar se há algum campo que possa causar filtro
        const comLeadTime = pedidosDireto.filter(p => p.lead_time_total_horas != null)
        const semLeadTime = pedidosDireto.filter(p => p.lead_time_total_horas == null)
        
        console.log(`\n   📊 Lead time analysis:`)
        console.log(`     Com lead_time_total_horas: ${comLeadTime.length}`)
        console.log(`     Sem lead_time_total_horas: ${semLeadTime.length}`)
        
        if (comLeadTime.length !== dadosHTTP.total_pedidos && semLeadTime.length !== dadosHTTP.total_pedidos) {
          console.log('     ⚠️  Lead time não explica a diferença')
        } else {
          console.log('     💡 Lead time pode ser o filtro!')
        }
      }
    } else {
      console.log('✅ Ambos retornam o mesmo resultado')
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message)
  }
}

// Garantir que fetch está disponível (Node 18+)
if (typeof fetch === 'undefined') {
  global.fetch = require('node-fetch')
}

testeFinal()