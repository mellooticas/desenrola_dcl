// ============================================
// SIMULAÇÃO EXATA DA API /dashboard/kpis
// COM LOGS DETALHADOS EM ARQUIVO
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

function log(message) {
  console.log(message)
  fs.appendFileSync('debug-api-kpis.log', message + '\n')
}

async function simularAPIKPIs() {
  // Limpar log anterior
  if (fs.existsSync('debug-api-kpis.log')) {
    fs.unlinkSync('debug-api-kpis.log')
  }
  
  log('🚨 SIMULAÇÃO EXATA DA API /dashboard/kpis')
  log('='.repeat(50))
  
  const env = carregarEnv()
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY
  
  log(`🔑 Usando SERVICE_ROLE_KEY: ${supabaseServiceRoleKey ? 'SIM' : 'NÃO'}`)
  
  // Simular hasServerSupabaseEnv()
  const hasEnv = supabaseUrl && supabaseServiceRoleKey
  if (!hasEnv) {
    log('❌ Variáveis de ambiente não configuradas')
    return
  }
  
  // Simular getServerSupabase()
  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
  
  try {
    log('\n1️⃣ TENTANDO BUSCAR v_kpis_dashboard...')
    
    // Tentar buscar dados da view v_kpis_dashboard primeiro
    const { data: viewData, error: viewError } = await supabase
      .from('v_kpis_dashboard')
      .select('*')
      .single()
    
    log(`   viewError: ${JSON.stringify(viewError, null, 2)}`)
    log(`   viewData: ${JSON.stringify(viewData, null, 2)}`)
    
    // FORÇAR CÁLCULO MANUAL (como a API faz)
    const forcarCalculoManual = true
    log(`   Forçando cálculo manual: ${forcarCalculoManual}`)
    
    if (!viewError && viewData && !forcarCalculoManual) {
      log('✅ Usando dados da view')
      return viewData
    }
    
    log('\n2️⃣ CALCULANDO MANUALMENTE...')
    
    // Simular parâmetros de URL (vazios por padrão)
    const dataInicio = null  // searchParams.get('data_inicio')
    const dataFim = null     // searchParams.get('data_fim')
    const lojaId = null      // searchParams.get('loja_id')
    
    log(`   Filtros: dataInicio=${dataInicio}, dataFim=${dataFim}, lojaId=${lojaId}`)
    
    // Buscar dados básicos da tabela pedidos (EXATAMENTE como a API)
    let query = supabase
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
    
    // Aplicar filtros se existirem
    if (dataInicio && dataFim) {
      query = query
        .gte('created_at', dataInicio)
        .lte('created_at', dataFim)
    }
    
    if (lojaId) {
      query = query.eq('loja_id', lojaId)
    }
    
    log('\n   Executando query...')
    const { data: pedidos, error: pedidosError } = await query
    
    log(`   Pedidos encontrados: ${pedidos?.length || 0}`)
    
    if (pedidosError) {
      log(`❌ Erro na query: ${JSON.stringify(pedidosError, null, 2)}`)
      return null
    }
    
    if (!pedidos || pedidos.length === 0) {
      log('⚠️ Nenhum pedido encontrado - retornando zeros')
      return {
        total_pedidos: 0,
        entregues: 0,
        lead_time_medio: 0,
        pedidos_atrasados: 0,
        ticket_medio: 0,
        sla_compliance: 0,
        labs_ativos: 0,
        valor_total_vendas: 0,
        custo_total_lentes: 0,
        margem_percentual: 0
      }
    }
    
    log('\n   📋 Dados detalhados dos pedidos:')
    pedidos.forEach((p, i) => {
      log(`     ${i+1}. ID: ${p.id}`)
      log(`        Valor: R$ ${p.valor_pedido}`)
      log(`        Status: ${p.status}`)
      log(`        Created: ${p.created_at}`)
      log(`        Lead Time: ${p.lead_time_total_horas || 'NULL'}`)
    })
    
    log('\n3️⃣ CALCULANDO KPIs...')
    
    // Calcular KPIs manualmente (EXATAMENTE como a API)
    const totalPedidos = pedidos.length
    const entregues = pedidos.filter(p => p.status === 'ENTREGUE').length
    const aguardandoPagamento = pedidos.filter(p => p.status === 'AG_PAGAMENTO').length
    const emProducao = pedidos.filter(p => p.status === 'PRODUCAO').length
    const cancelados = pedidos.filter(p => p.status === 'CANCELADO').length
    const pedidosGarantia = pedidos.filter(p => p.eh_garantia).length
    
    log(`   Total pedidos: ${totalPedidos}`)
    log(`   Entregues: ${entregues}`)
    log(`   AG_PAGAMENTO: ${aguardandoPagamento}`)
    
    // Calcular valores financeiros
    const valorTotalVendas = pedidos.reduce((total, p) => total + (p.valor_pedido || 0), 0)
    const custoTotalLentes = pedidos.reduce((total, p) => total + (p.custo_lentes || 0), 0)
    const ticketMedio = totalPedidos > 0 ? valorTotalVendas / totalPedidos : 0
    const margemPercentual = valorTotalVendas > 0 ? ((valorTotalVendas - custoTotalLentes) / valorTotalVendas) * 100 : 0
    
    log(`   Valor total vendas: R$ ${valorTotalVendas}`)
    log(`   Custo total lentes: R$ ${custoTotalLentes}`)
    log(`   Ticket médio: R$ ${ticketMedio.toFixed(2)}`)
    
    // Calcular lead time médio
    const pedidosComLeadTime = pedidos.filter(p => p.lead_time_total_horas && p.lead_time_total_horas > 0)
    const leadTimeMedio = pedidosComLeadTime.length > 0 
      ? pedidosComLeadTime.reduce((total, p) => total + (p.lead_time_total_horas || 0), 0) / pedidosComLeadTime.length / 24
      : 0
      
    log(`   Lead time médio: ${leadTimeMedio.toFixed(2)} dias`)
    
    // SLA compliance
    const slaCompliance = totalPedidos > 0 ? (entregues / totalPedidos) * 100 : 0
    
    // Labs ativos
    const { data: labsData } = await supabase
      .from('laboratorios')
      .select('id')
      .eq('ativo', true)
    
    const labsAtivos = labsData ? labsData.length : 0
    log(`   Labs ativos: ${labsAtivos}`)
    
    // Pedidos atrasados
    const seteDiasAtras = new Date()
    seteDiasAtras.setDate(seteDiasAtras.getDate() - 7)
    const pedidosAtrasados = pedidos.filter(p => 
      p.status !== 'ENTREGUE' && 
      p.status !== 'CANCELADO' &&
      new Date(p.created_at) < seteDiasAtras
    ).length
    
    log(`   Pedidos atrasados: ${pedidosAtrasados}`)
    
    const kpis = {
      total_pedidos: totalPedidos,
      entregues: entregues,
      lead_time_medio: leadTimeMedio,
      pedidos_atrasados: pedidosAtrasados,
      ticket_medio: ticketMedio,
      sla_compliance: slaCompliance,
      labs_ativos: labsAtivos,
      valor_total_vendas: valorTotalVendas,
      custo_total_lentes: custoTotalLentes,
      margem_percentual: margemPercentual
    }
    
    log('\n✅ KPIs FINAIS:')
    log(JSON.stringify(kpis, null, 2))
    
    return kpis
    
  } catch (error) {
    log(`❌ Erro geral: ${error.message}`)
    log(`   Stack: ${error.stack}`)
    return null
  }
}

simularAPIKPIs()
  .then(result => {
    console.log('\n🎯 RESULTADO FINAL:')
    console.log('Verifique o arquivo debug-api-kpis.log para logs detalhados')
  })
  .catch(error => {
    console.error('Erro na simulação:', error)
  })