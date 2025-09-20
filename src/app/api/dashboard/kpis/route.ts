import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase, hasServerSupabaseEnv } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Verificar se as variáveis de ambiente estão configuradas
    if (!hasServerSupabaseEnv()) {
      console.error('❌ Variáveis de ambiente do Supabase não configuradas')
      return NextResponse.json(
        { error: 'Configuração do Supabase não encontrada' },
        { status: 500 }
      )
    }

    const supabase = getServerSupabase()
    
    // Tentar buscar dados da view v_kpis_dashboard primeiro
    const { data: viewData, error: viewError } = await supabase
      .from('v_kpis_dashboard')
      .select('*')
      .single()
    
    // DEBUG: Verificar view
    console.log('🚨 DEBUG: viewError:', viewError)
    console.log('🚨 DEBUG: viewData:', JSON.stringify(viewData, null, 2))
    
    // ⚠️  PROBLEMA IDENTIFICADO: VIEW DESATUALIZADA
    // View tem 2504 pedidos (dados antigos) mas tabela real tem apenas 3
    // FORÇANDO CÁLCULO MANUAL ATÉ RESOLVER A VIEW
    console.warn('⚠️ VIEW DESATUALIZADA - FORÇANDO CÁLCULO MANUAL')
    const forcarCalculoManual = true
    
    if (!viewError && viewData && !forcarCalculoManual) {
      console.log('✅ Dados carregados da view v_kpis_dashboard:', JSON.stringify(viewData, null, 2))
      return NextResponse.json(viewData)
    }
    
    console.warn('⚠️ View v_kpis_dashboard não encontrada, calculando manualmente...')
    
    // Se a view não existir, calcular manualmente a partir das tabelas
    const { searchParams } = new URL(request.url)
    const dataInicio = searchParams.get('data_inicio') 
    const dataFim = searchParams.get('data_fim')
    const lojaId = searchParams.get('loja_id')
    
    // Buscar dados básicos da tabela pedidos
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
    
    if (dataInicio && dataFim) {
      query = query
        .gte('created_at', dataInicio)
        .lte('created_at', dataFim)
    }
    
    if (lojaId) {
      query = query.eq('loja_id', lojaId)
    }
    
    const { data: pedidos, error: pedidosError } = await query
    
    // Dados encontrados na tabela
    console.log(`✅ Pedidos encontrados: ${pedidos?.length || 0}, Valor total: R$ ${pedidos?.reduce((t, p) => t + (p.valor_pedido || 0), 0) || 0}`)
    
    if (pedidosError) {
      console.error('❌ Erro ao buscar dados da tabela pedidos:', pedidosError)
      return NextResponse.json(
        { error: 'Erro ao buscar dados dos pedidos' },
        { status: 500 }
      )
    }
    
    if (!pedidos || pedidos.length === 0) {
      console.warn('⚠️ Nenhum pedido encontrado')
      return NextResponse.json({
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
      })
    }
    
    // Calcular KPIs manualmente
    const totalPedidos = pedidos.length
    const entregues = pedidos.filter(p => p.status === 'ENTREGUE').length
    const aguardandoPagamento = pedidos.filter(p => p.status === 'AG_PAGAMENTO').length
    const emProducao = pedidos.filter(p => p.status === 'PRODUCAO').length
    const cancelados = pedidos.filter(p => p.status === 'CANCELADO').length
    const pedidosGarantia = pedidos.filter(p => p.eh_garantia).length
    
    // Calcular valores financeiros
    const valorTotalVendas = pedidos.reduce((total, p) => total + (p.valor_pedido || 0), 0)
    const custoTotalLentes = pedidos.reduce((total, p) => total + (p.custo_lentes || 0), 0)
    const ticketMedio = totalPedidos > 0 ? valorTotalVendas / totalPedidos : 0
    const margemPercentual = valorTotalVendas > 0 ? ((valorTotalVendas - custoTotalLentes) / valorTotalVendas) * 100 : 0
    
    // Calcular lead time médio (convertendo horas para dias)
    const pedidosComLeadTime = pedidos.filter(p => p.lead_time_total_horas && p.lead_time_total_horas > 0)
    const leadTimeMedio = pedidosComLeadTime.length > 0 
      ? pedidosComLeadTime.reduce((total, p) => total + (p.lead_time_total_horas || 0), 0) / pedidosComLeadTime.length / 24
      : 0
    
    // SLA compliance simples (pedidos entregues / total)
    const slaCompliance = totalPedidos > 0 ? (entregues / totalPedidos) * 100 : 0
    
    // Contar laboratórios ativos (precisa fazer join se disponível)
    const { data: labsData } = await supabase
      .from('laboratorios')
      .select('id')
      .eq('ativo', true)
    
    const labsAtivos = labsData ? labsData.length : 0
    
    // Pedidos atrasados (simplificado - status não é 'ENTREGUE' e criado há mais de 7 dias)
    const seteDiasAtras = new Date()
    seteDiasAtras.setDate(seteDiasAtras.getDate() - 7)
    const pedidosAtrasados = pedidos.filter(p => 
      p.status !== 'ENTREGUE' && 
      p.status !== 'CANCELADO' &&
      new Date(p.created_at) < seteDiasAtras
    ).length
    
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
    
    console.log('✅ KPIs calculados manualmente:', kpis)
    return NextResponse.json(kpis)
    
  } catch (error) {
    console.error('❌ Erro interno na API KPIs:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}