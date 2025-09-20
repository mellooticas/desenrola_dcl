// ============================================
// TESTE RLS - SERVICE_ROLE vs ANON_KEY
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

async function testarRLS() {
  console.log('🔐 TESTE RLS - ROW LEVEL SECURITY')
  console.log('='.repeat(50))
  
  const env = carregarEnv()
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY
  const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !serviceRoleKey || !anonKey) {
    console.error('❌ Variáveis não encontradas')
    console.log('URL:', supabaseUrl ? '✅' : '❌')
    console.log('SERVICE_ROLE:', serviceRoleKey ? '✅' : '❌')
    console.log('ANON_KEY:', anonKey ? '✅' : '❌')
    return
  }
  
  try {
    console.log('\n1️⃣ TESTE COM SERVICE_ROLE_KEY (bypassa RLS)...')
    
    const supabaseService = createClient(supabaseUrl, serviceRoleKey)
    
    const { data: pedidosService, error: errorService } = await supabaseService
      .from('pedidos')
      .select('id, valor_pedido, status, created_at, loja_id')
      .order('created_at', { ascending: false })
    
    console.log(`   Pedidos encontrados: ${pedidosService?.length || 0}`)
    console.log(`   Valor total: R$ ${pedidosService?.reduce((t, p) => t + (p.valor_pedido || 0), 0) || 0}`)
    
    if (pedidosService?.length > 0) {
      console.log('   Listagem:')
      pedidosService.forEach((p, i) => {
        console.log(`     ${i+1}. ${p.id.substring(0, 8)}... - R$ ${p.valor_pedido} - Loja: ${p.loja_id || 'NULL'}`)
      })
    }
    
    console.log('\n2️⃣ TESTE COM ANON_KEY (sujeito a RLS)...')
    
    const supabaseAnon = createClient(supabaseUrl, anonKey)
    
    const { data: pedidosAnon, error: errorAnon } = await supabaseAnon
      .from('pedidos')
      .select('id, valor_pedido, status, created_at, loja_id')
      .order('created_at', { ascending: false })
    
    console.log(`   Pedidos encontrados: ${pedidosAnon?.length || 0}`)
    console.log(`   Valor total: R$ ${pedidosAnon?.reduce((t, p) => t + (p.valor_pedido || 0), 0) || 0}`)
    
    if (errorAnon) {
      console.log(`   ❌ Erro: ${errorAnon.message}`)
    } else if (pedidosAnon?.length > 0) {
      console.log('   Listagem:')
      pedidosAnon.forEach((p, i) => {
        console.log(`     ${i+1}. ${p.id.substring(0, 8)}... - R$ ${p.valor_pedido} - Loja: ${p.loja_id || 'NULL'}`)
      })
    }
    
    console.log('\n3️⃣ COMPARAÇÃO E ANÁLISE...')
    
    const countService = pedidosService?.length || 0
    const countAnon = pedidosAnon?.length || 0
    
    if (countService !== countAnon) {
      console.log(`❌ DIFERENÇA ENCONTRADA!`)
      console.log(`   SERVICE_ROLE: ${countService} pedidos`)
      console.log(`   ANON_KEY: ${countAnon} pedidos`)
      console.log(`   🚨 RLS está filtrando ${countService - countAnon} pedido(s)`)
      
      // Identificar quais pedidos estão sendo filtrados
      const idsService = new Set(pedidosService?.map(p => p.id) || [])
      const idsAnon = new Set(pedidosAnon?.map(p => p.id) || [])
      
      const filtrados = [...idsService].filter(id => !idsAnon.has(id))
      
      if (filtrados.length > 0) {
        console.log('\n   📋 Pedidos filtrados pelo RLS:')
        filtrados.forEach(id => {
          const pedido = pedidosService.find(p => p.id === id)
          console.log(`     - ${id.substring(0, 8)}... - R$ ${pedido.valor_pedido} - Loja: ${pedido.loja_id || 'NULL'}`)
        })
      }
      
    } else {
      console.log('✅ Mesmo resultado. RLS não está filtrando.')
    }
    
    console.log('\n4️⃣ VERIFICANDO POLÍTICAS RLS...')
    
    // Tentar verificar se RLS está habilitado
    const { data: rlsInfo } = await supabaseService
      .rpc('check_rls_policies', { table_name: 'pedidos' })
      .single()
    
    if (rlsInfo) {
      console.log('   RLS Info:', rlsInfo)
    } else {
      console.log('   ⚠️  Não foi possível verificar políticas RLS')
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message)
  }
}

testarRLS()