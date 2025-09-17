import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
  const supabase = getServerSupabase()
    const { searchParams } = new URL(request.url)
    
    const lojaId = searchParams.get('loja_id')
    const laboratorioId = searchParams.get('laboratorio_id')
    const periodo = searchParams.get('periodo') || '30' // dias
    
    // Data de início baseada no período
    const dataInicio = new Date()
    dataInicio.setDate(dataInicio.getDate() - parseInt(periodo))
    
    let baseQuery = supabase
      .from('v_pedidos_kanban')
      .select('*')
      .gte('created_at', dataInicio.toISOString())
    
    if (lojaId) {
      baseQuery = baseQuery.eq('loja_id', lojaId)
    }
    
    if (laboratorioId) {
      baseQuery = baseQuery.eq('laboratorio_id', laboratorioId)
    }
    
    const { data: pedidos, error } = await baseQuery
    
    if (error) {
      console.error('Erro ao buscar dados:', error)
      return NextResponse.json(
        { error: 'Erro ao buscar dados do dashboard' },
        { status: 500 }
      )
    }
    
    // Calcular estatísticas
    const agora = new Date()
    const estatisticas = {
      // Totais por status
      total_pedidos: pedidos.length,
      por_status: pedidos.reduce((acc, p) => {
        acc[p.status] = (acc[p.status] || 0) + 1
        return acc
      }, {} as Record<string, number>),
      
      // Pedidos por laboratório
      por_laboratorio: pedidos.reduce((acc, p) => {
        const key = p.laboratorio_nome
        if (!acc[key]) {
          acc[key] = { total: 0, no_prazo: 0, atrasados: 0 }
        }
        acc[key].total++
        
        if (p.dias_para_vencer_sla !== null) {
          if (p.dias_para_vencer_sla < 0) {
            acc[key].atrasados++
          } else {
            acc[key].no_prazo++
          }
        }
        
        return acc
      }, {} as Record<string, any>),
      
      // Pedidos por loja
      por_loja: pedidos.reduce((acc, p) => {
        const key = p.loja_nome
        acc[key] = (acc[key] || 0) + 1
        return acc
      }, {} as Record<string, number>),
      
      // SLA compliance
      sla_compliance: {
        total_com_sla: pedidos.filter(p => p.dias_para_vencer_sla !== null).length,
        no_prazo: pedidos.filter(p => p.dias_para_vencer_sla !== null && p.dias_para_vencer_sla >= 0).length,
        atrasados: pedidos.filter(p => p.dias_para_vencer_sla !== null && p.dias_para_vencer_sla < 0).length,
        em_risco: pedidos.filter(p => p.dias_para_vencer_sla !== null && p.dias_para_vencer_sla <= 1 && p.dias_para_vencer_sla >= 0).length,
        percentual: 0 // será calculado abaixo
      },
      
      // Financeiro
      financeiro: {
        valor_total: pedidos.reduce((sum, p) => sum + (p.valor_pedido || 0), 0),
        valor_entregue: pedidos
          .filter(p => p.status === 'ENTREGUE')
          .reduce((sum, p) => sum + (p.valor_pedido || 0), 0),
        valor_pendente: pedidos
          .filter(p => !['ENTREGUE', 'CANCELADO'].includes(p.status))
          .reduce((sum, p) => sum + (p.valor_pedido || 0), 0)
      },
      
      // Tendências (últimos 7 dias vs 7 dias anteriores)
      tendencia: {
        pedidos_ultimos_7_dias: pedidos.filter(p => {
          const dataPedido = new Date(p.created_at)
          const sete_dias_atras = new Date()
          sete_dias_atras.setDate(sete_dias_atras.getDate() - 7)
          return dataPedido >= sete_dias_atras
        }).length,
        
        pedidos_7_14_dias_atras: pedidos.filter(p => {
          const dataPedido = new Date(p.created_at)
          const sete_dias_atras = new Date()
          sete_dias_atras.setDate(sete_dias_atras.getDate() - 7)
          const quatorze_dias_atras = new Date()
          quatorze_dias_atras.setDate(quatorze_dias_atras.getDate() - 14)
          return dataPedido >= quatorze_dias_atras && dataPedido < sete_dias_atras
        }).length,
        variacao_percentual: 0 // Será calculado abaixo
      }
    }
    
    // Calcular percentual de compliance
    if (estatisticas.sla_compliance.total_com_sla > 0) {
      estatisticas.sla_compliance.percentual = Math.round(
        (estatisticas.sla_compliance.no_prazo / estatisticas.sla_compliance.total_com_sla) * 100
      )
    } else {
      estatisticas.sla_compliance.percentual = 100
    }
    
    // Calcular tendência percentual
    if (estatisticas.tendencia.pedidos_7_14_dias_atras > 0) {
      estatisticas.tendencia.variacao_percentual = Math.round(
        ((estatisticas.tendencia.pedidos_ultimos_7_dias - estatisticas.tendencia.pedidos_7_14_dias_atras) / 
         estatisticas.tendencia.pedidos_7_14_dias_atras) * 100
      )
    } else {
      estatisticas.tendencia.variacao_percentual = 0
    }
    
    return NextResponse.json(estatisticas)
  } catch (error) {
    console.error('Erro interno:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}