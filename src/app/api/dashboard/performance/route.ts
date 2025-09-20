import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase/server'

// Interfaces para tipagem
interface LabPerformance {
  laboratorio_id: string
  laboratorio_nome: string
  total_pedidos: number
  pedidos_entregues: number
  pedidos_atrasados: number
  valor_total: number
  lead_time_medio: number
  taxa_entrega: number
  sla_compliance: number
}

interface LojaPerformance {
  loja_id: string
  loja_nome: string
  total_pedidos: number
  valor_total: number
  pedidos_garantia: number
  taxa_garantia: number
  ticket_medio: number
}

interface PerformanceMetrics {
  [key: string]: LabPerformance | LojaPerformance
}

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabase = getServerSupabase()
    const { searchParams } = new URL(request.url)
    const periodo = searchParams.get('periodo') || '30' // dias
    const lojaId = searchParams.get('loja_id')
    
    console.log('📊 Calculando performance operacional...')
    
    // Data limite para análise
    const dataLimite = new Date()
    dataLimite.setDate(dataLimite.getDate() - parseInt(periodo))
    
    // 1. PERFORMANCE POR LABORATÓRIO
    let queryLabs = supabase
      .from('pedidos')
      .select(`
        laboratorio_id,
        status,
        data_pedido,
        data_prevista_pronto,
        data_entregue,
        lead_time_total_horas,
        valor_pedido,
        laboratorios!inner(nome, ativo)
      `)
      .gte('created_at', dataLimite.toISOString())
      .not('laboratorio_id', 'is', null)
    
    if (lojaId) {
      queryLabs = queryLabs.eq('loja_id', lojaId)
    }
    
    const { data: pedidosLabs } = await queryLabs
    
    // Agrupar por laboratório
    const performanceLabs: { [key: string]: LabPerformance } = {}
    if (pedidosLabs) {
      pedidosLabs.forEach((p: any) => {
        const labId = p.laboratorio_id
        const labNome = (p.laboratorios as any)?.nome || `Lab ${labId}`
        
        if (!performanceLabs[labId]) {
          performanceLabs[labId] = {
            laboratorio_id: labId,
            laboratorio_nome: labNome,
            total_pedidos: 0,
            pedidos_entregues: 0,
            pedidos_atrasados: 0,
            valor_total: 0,
            lead_time_medio: 0,
            taxa_entrega: 0,
            sla_compliance: 0
          }
        }
        
        const lab = performanceLabs[labId]
        lab.total_pedidos++
        lab.valor_total += p.valor_pedido || 0
        
        if (p.status === 'ENTREGUE') {
          lab.pedidos_entregues++
        }
        
        // Verificar atraso
        if (p.data_prevista_pronto && p.status !== 'ENTREGUE' && p.status !== 'CANCELADO') {
          const hoje = new Date()
          if (new Date(p.data_prevista_pronto) < hoje) {
            lab.pedidos_atrasados++
          }
        }
      })
      
      // Calcular métricas finais para cada lab
      Object.values(performanceLabs).forEach((lab: any) => {
        lab.taxa_entrega = lab.total_pedidos > 0 ? (lab.pedidos_entregues / lab.total_pedidos) * 100 : 0
        lab.sla_compliance = lab.total_pedidos > 0 ? ((lab.total_pedidos - lab.pedidos_atrasados) / lab.total_pedidos) * 100 : 0
      })
    }
    
    // 2. PERFORMANCE POR LOJA
    let queryLojas = supabase
      .from('pedidos')
      .select(`
        loja_id,
        status,
        data_pedido,
        valor_pedido,
        eh_garantia,
        lojas!inner(nome, ativo)
      `)
      .gte('created_at', dataLimite.toISOString())
      .not('loja_id', 'is', null)
    
    if (lojaId) {
      queryLojas = queryLojas.eq('loja_id', lojaId)
    }
    
    const { data: pedidosLojas } = await queryLojas
    
    // Agrupar por loja
    const performanceLojas: { [key: string]: LojaPerformance } = {}
    if (pedidosLojas) {
      pedidosLojas.forEach((p: any) => {
        const lojaIdKey = p.loja_id
        const lojaNome = (p.lojas as any)?.nome || `Loja ${lojaIdKey}`
        
        if (!performanceLojas[lojaIdKey]) {
          performanceLojas[lojaIdKey] = {
            loja_id: lojaIdKey,
            loja_nome: lojaNome,
            total_pedidos: 0,
            valor_total: 0,
            pedidos_garantia: 0,
            taxa_garantia: 0,
            ticket_medio: 0
          }
        }
        
        const loja = performanceLojas[lojaIdKey]
        loja.total_pedidos++
        loja.valor_total += p.valor_pedido || 0
        
        if (p.eh_garantia) {
          loja.pedidos_garantia++
        }
      })
      
      // Calcular métricas finais para cada loja
      Object.values(performanceLojas).forEach((loja: any) => {
        loja.ticket_medio = loja.total_pedidos > 0 ? loja.valor_total / loja.total_pedidos : 0
        loja.taxa_garantia = loja.total_pedidos > 0 ? (loja.pedidos_garantia / loja.total_pedidos) * 100 : 0
      })
    }
    
    // 3. ANÁLISE DE CAPACIDADE
    const { data: labsCapacidade } = await supabase
      .from('laboratorios')
      .select('id, nome, ativo, sla_padrao_dias, trabalha_sabado')
      .eq('ativo', true)
    
    // 4. ESTATÍSTICAS GERAIS
    const totalPedidosPeriodo = pedidosLabs?.length || 0
    const mediaLeadTime = pedidosLabs && pedidosLabs.length > 0 
      ? pedidosLabs.reduce((sum, p) => sum + (p.lead_time_total_horas || 0), 0) / pedidosLabs.length / 24
      : 0
    
    const valorTotalPeriodo = pedidosLabs?.reduce((sum, p) => sum + (p.valor_pedido || 0), 0) || 0
    
    // 5. GARGALOS IDENTIFICADOS
    const gargalos: Array<{
      tipo: string
      entidade: string
      impacto: number
      descricao: string
    }> = []
    
    // Labs com muitos pedidos atrasados
    Object.values(performanceLabs).forEach((lab: any) => {
      if (lab.pedidos_atrasados > 0 && lab.sla_compliance < 80) {
        gargalos.push({
          tipo: 'LABORATORIO_LENTO',
          entidade: lab.laboratorio_nome,
          impacto: lab.pedidos_atrasados,
          descricao: `${lab.laboratorio_nome} com ${lab.pedidos_atrasados} pedidos atrasados (${lab.sla_compliance.toFixed(1)}% SLA)`
        })
      }
    })
    
    // Lojas com alta taxa de garantia
    Object.values(performanceLojas).forEach((loja: any) => {
      if (loja.taxa_garantia > 5) { // Mais de 5% de garantia
        gargalos.push({
          tipo: 'ALTA_TAXA_GARANTIA',
          entidade: loja.loja_nome,
          impacto: loja.pedidos_garantia,
          descricao: `${loja.loja_nome} com ${loja.taxa_garantia.toFixed(1)}% de pedidos em garantia`
        })
      }
    })
    
    // 6. RANKINGS
    const rankingLabs = Object.values(performanceLabs)
      .sort((a: any, b: any) => b.sla_compliance - a.sla_compliance)
      .slice(0, 10)
    
    const rankingLojas = Object.values(performanceLojas)
      .sort((a: any, b: any) => b.valor_total - a.valor_total)
      .slice(0, 10)
    
    console.log(`✅ Performance calculada: ${Object.keys(performanceLabs).length} labs, ${Object.keys(performanceLojas).length} lojas`)
    
    return NextResponse.json({
      performance_laboratorios: Object.values(performanceLabs),
      performance_lojas: Object.values(performanceLojas),
      capacidade_labs: labsCapacidade || [],
      estatisticas_gerais: {
        total_pedidos_periodo: totalPedidosPeriodo,
        media_lead_time_dias: mediaLeadTime,
        valor_total_periodo: valorTotalPeriodo,
        labs_ativos: labsCapacidade?.length || 0
      },
      gargalos_identificados: gargalos,
      rankings: {
        melhores_labs_sla: rankingLabs,
        maiores_lojas_volume: rankingLojas
      },
      periodo_analise: periodo,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ Erro na API de performance:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar performance operacional' },
      { status: 500 }
    )
  }
}