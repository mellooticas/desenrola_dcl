// ============================================
// INVESTIGAÇÃO: DADOS REAIS DOS PEDIDOS
// ============================================
// Arquivo: investigacao_pedidos_dashboard.js
// Objetivo: Verificar dados reais da tabela pedidos vs dashboard
// Data: 19/09/2025

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function investigarPedidos() {
  console.log('🔍 INVESTIGAÇÃO DOS PEDIDOS NO BANCO DE DADOS')
  console.log('='.repeat(60))
  
  try {
    // 1. CONTAGEM TOTAL DE PEDIDOS
    console.log('\n📊 1. CONTAGEM TOTAL DE PEDIDOS POR STATUS:')
    const { data: todosPedidos, error: erroTodos } = await supabase
      .from('pedidos')
      .select('*')
    
    if (erroTodos) {
      console.error('❌ Erro ao buscar todos os pedidos:', erroTodos)
      return
    }
    
    console.log(`Total de pedidos na tabela: ${todosPedidos.length}`)
    
    // Agrupar por status
    const porStatus = {}
    todosPedidos.forEach(pedido => {
      const status = pedido.status || 'SEM_STATUS'
      porStatus[status] = (porStatus[status] || 0) + 1
    })
    
    console.log('Por status:')
    Object.entries(porStatus).forEach(([status, count]) => {
      console.log(`  ${status}: ${count}`)
    })
    
    // 2. PEDIDOS MAIS RECENTES
    console.log('\n📅 2. PEDIDOS MAIS RECENTES (últimos 10):')
    const pedidosRecentes = todosPedidos
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 10)
    
    pedidosRecentes.forEach(pedido => {
      console.log(`  ID: ${pedido.id}`)
      console.log(`  Status: ${pedido.status}`)
      console.log(`  Valor: R$ ${pedido.valor_pedido}`)
      console.log(`  Cliente: ${pedido.cliente_nome || 'N/A'}`)
      console.log(`  Criado em: ${pedido.created_at}`)
      console.log(`  Data pedido: ${pedido.data_pedido}`)
      console.log('  ---')
    })
    
    // 3. PEDIDOS DE HOJE
    console.log('\n📋 3. PEDIDOS CRIADOS HOJE:')
    const hoje = new Date().toISOString().split('T')[0]
    const pedidosHoje = todosPedidos.filter(p => 
      p.created_at && p.created_at.startsWith(hoje)
    )
    
    console.log(`Pedidos criados hoje (${hoje}): ${pedidosHoje.length}`)
    pedidosHoje.forEach(pedido => {
      console.log(`  - ${pedido.id} | ${pedido.status} | R$ ${pedido.valor_pedido} | ${pedido.created_at}`)
    })
    
    // 4. PEDIDOS DE ONTEM
    console.log('\n📋 4. PEDIDOS CRIADOS ONTEM:')
    const ontem = new Date()
    ontem.setDate(ontem.getDate() - 1)
    const ontemStr = ontem.toISOString().split('T')[0]
    
    const pedidosOntem = todosPedidos.filter(p => 
      p.created_at && p.created_at.startsWith(ontemStr)
    )
    
    console.log(`Pedidos criados ontem (${ontemStr}): ${pedidosOntem.length}`)
    pedidosOntem.forEach(pedido => {
      console.log(`  - ${pedido.id} | ${pedido.status} | R$ ${pedido.valor_pedido} | ${pedido.created_at}`)
    })
    
    // 5. CÁLCULOS MANUAIS PARA DASHBOARD
    console.log('\n🧮 5. CÁLCULOS PARA DASHBOARD:')
    const totalPedidos = todosPedidos.length
    const entregues = todosPedidos.filter(p => p.status === 'ENTREGUE').length
    const valorTotal = todosPedidos.reduce((sum, p) => sum + (p.valor_pedido || 0), 0)
    const ticketMedio = totalPedidos > 0 ? valorTotal / totalPedidos : 0
    
    console.log(`  Total de pedidos: ${totalPedidos}`)
    console.log(`  Pedidos entregues: ${entregues}`)
    console.log(`  Valor total: R$ ${valorTotal.toFixed(2)}`)
    console.log(`  Ticket médio: R$ ${ticketMedio.toFixed(2)}`)
    console.log(`  Taxa de entrega: ${totalPedidos > 0 ? ((entregues / totalPedidos) * 100).toFixed(2) : 0}%`)
    
    // 6. VERIFICAR SE HÁ VIEWS OU DADOS CACHED
    console.log('\n🔍 6. VERIFICANDO VIEW v_kpis_dashboard:')
    const { data: viewData, error: viewError } = await supabase
      .from('v_kpis_dashboard')
      .select('*')
      .single()
    
    if (viewError) {
      console.log('❌ View v_kpis_dashboard não existe ou tem erro:', viewError.message)
    } else {
      console.log('✅ View v_kpis_dashboard existe com dados:')
      console.log('   Total pedidos na view:', viewData.total_pedidos)
      console.log('   Entregues na view:', viewData.entregues)
      console.log('   Valor total na view:', viewData.valor_total_vendas)
      console.log('\n⚠️  DISCREPÂNCIA IDENTIFICADA!')
      console.log(`   Tabela real: ${totalPedidos} pedidos`)
      console.log(`   View: ${viewData.total_pedidos} pedidos`)
      console.log(`   Diferença: ${Math.abs(totalPedidos - viewData.total_pedidos)} pedidos`)
    }
    
    // 7. INFORMAÇÕES ADICIONAIS
    console.log('\n📊 7. INFORMAÇÕES ADICIONAIS:')
    console.log(`  Primeiro pedido: ${todosPedidos.length > 0 ? new Date(Math.min(...todosPedidos.map(p => new Date(p.created_at)))).toISOString() : 'N/A'}`)
    console.log(`  Último pedido: ${todosPedidos.length > 0 ? new Date(Math.max(...todosPedidos.map(p => new Date(p.created_at)))).toISOString() : 'N/A'}`)
    
    const lojas = [...new Set(todosPedidos.map(p => p.loja_id).filter(Boolean))]
    console.log(`  Lojas com pedidos: ${lojas.length}`)
    
    console.log('\n✅ Investigação concluída!')
    
  } catch (error) {
    console.error('❌ Erro durante a investigação:', error)
  }
}

investigarPedidos()