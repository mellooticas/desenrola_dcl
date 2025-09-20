// ============================================
// INVESTIGAÇÃO COMPLETA DOS DADOS DISPONÍVEIS
// Para criar o Dashboard Centro de Comando
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

async function investigarDadosCompletos() {
  console.log('🔍 INVESTIGAÇÃO COMPLETA DOS DADOS')
  console.log('Para criar Dashboard Centro de Comando')
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

  const log = (message) => {
    console.log(message)
    fs.appendFileSync('investigacao-dashboard.log', message + '\n')
  }

  // Limpar log anterior
  if (fs.existsSync('investigacao-dashboard.log')) {
    fs.unlinkSync('investigacao-dashboard.log')
  }

  try {
    log('\n📊 1. PEDIDOS - Dados principais')
    log('-'.repeat(40))
    
    // Investigar pedidos
    const { data: pedidos, error: pedidosError } = await supabase
      .from('pedidos')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5)
    
    if (pedidosError) {
      log(`❌ Erro pedidos: ${pedidosError.message}`)
    } else {
      log(`✅ Total pedidos: ${pedidos.length} (amostra)`)
      log(`   Campos disponíveis: ${Object.keys(pedidos[0] || {}).length}`)
      log(`   Status encontrados: ${[...new Set(pedidos.map(p => p.status))].join(', ')}`)
      
      // Análise de status
      const statusCount = {}
      pedidos.forEach(p => {
        statusCount[p.status] = (statusCount[p.status] || 0) + 1
      })
      log(`   Distribuição status (amostra): ${JSON.stringify(statusCount)}`)
    }

    log('\n🏪 2. LOJAS - Pontos de venda')
    log('-'.repeat(40))
    
    const { data: lojas, error: lojasError } = await supabase
      .from('lojas')
      .select('*')
    
    if (!lojasError && lojas) {
      log(`✅ Total lojas: ${lojas.length}`)
      const lojasAtivas = lojas.filter(l => l.ativo)
      log(`   Lojas ativas: ${lojasAtivas.length}`)
      log(`   Nomes: ${lojasAtivas.map(l => l.nome).join(', ')}`)
    }

    log('\n🔬 3. LABORATÓRIOS - Parceiros')
    log('-'.repeat(40))
    
    const { data: labs, error: labsError } = await supabase
      .from('laboratorios')
      .select('*')
    
    if (!labsError && labs) {
      log(`✅ Total laboratórios: ${labs.length}`)
      const labsAtivos = labs.filter(l => l.ativo)
      log(`   Labs ativos: ${labsAtivos.length}`)
      log(`   Nomes: ${labsAtivos.map(l => l.nome).join(', ')}`)
    }

    log('\n👓 4. CLASSES DE LENTE - Produtos')
    log('-'.repeat(40))
    
    const { data: classes, error: classesError } = await supabase
      .from('classes_lente')
      .select('*')
    
    if (!classesError && classes) {
      log(`✅ Total classes: ${classes.length}`)
      const classesAtivas = classes.filter(c => c.ativa)
      log(`   Classes ativas: ${classesAtivas.length}`)
      log(`   Nomes: ${classesAtivas.map(c => c.nome).join(', ')}`)
    }

    log('\n🔔 5. ALERTAS - Notificações')
    log('-'.repeat(40))
    
    const { data: alertas, error: alertasError } = await supabase
      .from('alertas')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)
    
    if (!alertasError && alertas) {
      log(`✅ Alertas encontrados: ${alertas.length}`)
      const alertasNaoLidos = alertas.filter(a => !a.lido)
      log(`   Não lidos: ${alertasNaoLidos.length}`)
      log(`   Tipos: ${[...new Set(alertas.map(a => a.tipo))].join(', ')}`)
    }

    log('\n👥 6. USUÁRIOS - Time')
    log('-'.repeat(40))
    
    const { data: usuarios, error: usuariosError } = await supabase
      .from('usuarios')
      .select('id, email, nome, role, ativo')
    
    if (!usuariosError && usuarios) {
      log(`✅ Total usuários: ${usuarios.length}`)
      const usuariosAtivos = usuarios.filter(u => u.ativo)
      log(`   Usuários ativos: ${usuariosAtivos.length}`)
      log(`   Roles: ${[...new Set(usuarios.map(u => u.role))].join(', ')}`)
    }

    log('\n📅 7. TIMELINE - Histórico')
    log('-'.repeat(40))
    
    const { data: timeline, error: timelineError } = await supabase
      .from('pedidos_timeline')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)
    
    if (!timelineError && timeline) {
      log(`✅ Eventos timeline: ${timeline.length}`)
      log(`   Status mais comuns: ${[...new Set(timeline.map(t => t.status_novo))].join(', ')}`)
    }

    log('\n💊 8. TRATAMENTOS - Serviços adicionais')
    log('-'.repeat(40))
    
    const { data: tratamentos, error: tratamentosError } = await supabase
      .from('tratamentos')
      .select('*')
    
    if (!tratamentosError && tratamentos) {
      log(`✅ Total tratamentos: ${tratamentos.length}`)
      const tratamentosAtivos = tratamentos.filter(t => t.ativo)
      log(`   Tratamentos ativos: ${tratamentosAtivos.length}`)
    }

    log('\n🧑‍💼 9. COLABORADORES - Vendedores')
    log('-'.repeat(40))
    
    const { data: colaboradores, error: colaboradoresError } = await supabase
      .from('colaboradores')
      .select('*')
    
    if (!colaboradoresError && colaboradores) {
      log(`✅ Total colaboradores: ${colaboradores.length}`)
    }

    log('\n📋 10. VIEWS DISPONÍVEIS')
    log('-'.repeat(40))
    
    // Testar views importantes
    const views = [
      'v_pedidos_kanban',
      'v_kpis_dashboard',
      'v_dashboard_resumo',
      'v_lead_time_comparativo',
      'v_pedido_timeline_completo'
    ]

    for (const viewName of views) {
      try {
        const { data, error } = await supabase
          .from(viewName)
          .select('*')
          .limit(1)
        
        if (error) {
          log(`❌ ${viewName}: ${error.message}`)
        } else {
          log(`✅ ${viewName}: Disponível (${data ? Object.keys(data[0] || {}).length : 0} campos)`)
        }
      } catch (e) {
        log(`❌ ${viewName}: Erro ao testar`)
      }
    }

    log('\n💰 11. ANÁLISE FINANCEIRA')
    log('-'.repeat(40))
    
    // Buscar dados financeiros dos pedidos
    const { data: pedidosFinanceiros, error: financeiroError } = await supabase
      .from('pedidos')
      .select('valor_pedido, custo_lentes, status, forma_pagamento, data_pagamento')
      .not('valor_pedido', 'is', null)
    
    if (!financeiroError && pedidosFinanceiros) {
      const valorTotal = pedidosFinanceiros.reduce((sum, p) => sum + (p.valor_pedido || 0), 0)
      const custoTotal = pedidosFinanceiros.reduce((sum, p) => sum + (p.custo_lentes || 0), 0)
      const pedidosPagos = pedidosFinanceiros.filter(p => p.data_pagamento).length
      
      log(`✅ Análise financeira:`)
      log(`   Valor total em pedidos: R$ ${valorTotal.toFixed(2)}`)
      log(`   Custo total lentes: R$ ${custoTotal.toFixed(2)}`)
      log(`   Margem bruta: R$ ${(valorTotal - custoTotal).toFixed(2)}`)
      log(`   Pedidos pagos: ${pedidosPagos}/${pedidosFinanceiros.length}`)
      
      const formasPagamento = {}
      pedidosFinanceiros.forEach(p => {
        if (p.forma_pagamento) {
          formasPagamento[p.forma_pagamento] = (formasPagamento[p.forma_pagamento] || 0) + 1
        }
      })
      log(`   Formas de pagamento: ${JSON.stringify(formasPagamento)}`)
    }

    log('\n⏱️ 12. ANÁLISE TEMPORAL')
    log('-'.repeat(40))
    
    // Análise de datas e SLAs
    const { data: pedidosTempo, error: tempoError } = await supabase
      .from('pedidos')
      .select('data_pedido, data_prevista_pronto, data_entregue, status, lead_time_total_horas')
    
    if (!tempoError && pedidosTempo) {
      const hoje = new Date()
      const pedidosAtrasados = pedidosTempo.filter(p => {
        return p.data_prevista_pronto && 
               new Date(p.data_prevista_pronto) < hoje &&
               !['ENTREGUE', 'CANCELADO'].includes(p.status)
      }).length
      
      const pedidosEntregues = pedidosTempo.filter(p => p.status === 'ENTREGUE').length
      const comLeadTime = pedidosTempo.filter(p => p.lead_time_total_horas).length
      
      log(`✅ Análise temporal:`)
      log(`   Pedidos atrasados: ${pedidosAtrasados}`)
      log(`   Pedidos entregues: ${pedidosEntregues}`)
      log(`   Com lead time calculado: ${comLeadTime}`)
    }

    log('\n🎯 RESUMO PARA DASHBOARD CENTRO DE COMANDO')
    log('='.repeat(50))
    log('✅ DADOS DISPONÍVEIS:')
    log('   - Pedidos com status completo')
    log('   - Lojas e laboratórios ativos')
    log('   - Classes de lente e tratamentos')
    log('   - Sistema de alertas')
    log('   - Timeline de mudanças')
    log('   - Dados financeiros completos')
    log('   - Análise temporal e SLAs')
    log('   - Usuários e permissões')
    log('')
    log('🚀 PRÓXIMOS PASSOS:')
    log('   1. Criar KPIs em tempo real')
    log('   2. Implementar alertas críticos')
    log('   3. Dashboard de performance por loja/lab')
    log('   4. Análise financeira detalhada')
    log('   5. Monitoramento de SLA')
    log('   6. Previsões e tendências')

  } catch (error) {
    log(`❌ Erro geral: ${error.message}`)
  }
}

investigarDadosCompletos()
  .then(() => {
    console.log('\n✅ INVESTIGAÇÃO CONCLUÍDA!')
    console.log('📋 Verifique o arquivo investigacao-dashboard.log para detalhes completos')
  })
  .catch(error => {
    console.error('❌ Erro na investigação:', error)
  })