import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase/server'

// Interfaces para tipagem financeira
interface StatusFinanceiro {
  [key: string]: {
    quantidade: number
    valor_total: number
    valor_medio: number
  }
}

interface AnaliseFormaPagamento {
  [key: string]: {
    quantidade: number
    valor_total: number
    participacao: number
  }
}

interface TendenciaTemporal {
  periodo: string
  receita: number
  custos: number
  margem: number
  pedidos: number
}

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabase = getServerSupabase()
    const { searchParams } = new URL(request.url)
    const periodo = searchParams.get('periodo') || '30' // dias
    const lojaId = searchParams.get('loja_id')
    
    console.log('💰 Calculando métricas financeiras...')
    
    // Data limite para análise
    const dataLimite = new Date()
    dataLimite.setDate(dataLimite.getDate() - parseInt(periodo))
    
    // 1. RECEITA E CUSTOS - Incluindo pedidos sem valor (garantias)
    let queryFinanceiro = supabase
      .from('pedidos')
      .select(`
        id, status, valor_pedido, custo_lentes,
        forma_pagamento, data_pedido, data_pagamento,
        eh_garantia, loja_id, laboratorio_id,
        created_at
      `)
      .gte('created_at', dataLimite.toISOString())
    
    if (lojaId) {
      queryFinanceiro = queryFinanceiro.eq('loja_id', lojaId)
    }
    
    const { data: pedidosCompletos } = await queryFinanceiro
    
    if (!pedidosCompletos) {
      return NextResponse.json({
        error: 'Nenhum dado encontrado'
      }, { status: 404 })
    }
    
    // Separar pedidos com valor (para cálculos financeiros) e sem valor (garantias)
    const pedidosComValor = pedidosCompletos.filter(p => p.valor_pedido !== null && p.valor_pedido > 0)
    const pedidosSemValor = pedidosCompletos.filter(p => p.valor_pedido === null || p.valor_pedido === 0)
    
    // 2. CÁLCULOS PRINCIPAIS (apenas pedidos com valor)
    const totalReceita = pedidosComValor.reduce((sum: number, p: any) => sum + (p.valor_pedido || 0), 0)
    const totalCustos = pedidosComValor.reduce((sum: number, p: any) => sum + (p.custo_lentes || 0), 0)
    const margemBruta = totalReceita - totalCustos
    const percentualMargem = totalReceita > 0 ? (margemBruta / totalReceita) * 100 : 0
    
    // 3. ANÁLISE POR STATUS (todos os pedidos)
    const receitaPorStatus: StatusFinanceiro = {}
    pedidosCompletos.forEach((p: any) => {
      if (!receitaPorStatus[p.status]) {
        receitaPorStatus[p.status] = {
          quantidade: 0,
          valor_total: 0,
          valor_medio: 0
        }
      }
      receitaPorStatus[p.status].quantidade++
      receitaPorStatus[p.status].valor_total += p.valor_pedido || 0
    })
    
    // Calcular valores médios
    Object.values(receitaPorStatus).forEach((status) => {
      status.valor_medio = status.quantidade > 0 ? status.valor_total / status.quantidade : 0
    })
    
    // 4. FORMAS DE PAGAMENTO (apenas pedidos com valor e pagamento)
    const formasPagamento: AnaliseFormaPagamento = {}
    const pedidosComPagamento = pedidosComValor.filter((p: any) => p.forma_pagamento)
    
    pedidosComPagamento.forEach(p => {
      const forma = p.forma_pagamento!
      if (!formasPagamento[forma]) {
        formasPagamento[forma] = {
          quantidade: 0,
          valor_total: 0,
          participacao: 0
        }
      }
      formasPagamento[forma].quantidade++
      formasPagamento[forma].valor_total += p.valor_pedido || 0
    })
    
    Object.values(formasPagamento).forEach((forma) => {
      forma.participacao = totalReceita > 0 ? (forma.valor_total / totalReceita) * 100 : 0
    })
    
    // 5. EVOLUÇÃO TEMPORAL (últimos 7 dias)
    const evolucaoTemporal: TendenciaTemporal[] = []
    for (let i = 6; i >= 0; i--) {
      const data = new Date()
      data.setDate(data.getDate() - i)
      const dataStr = data.toISOString().split('T')[0]
      
      const pedidosDia = pedidosComValor.filter((p: any) => 
        p.created_at.split('T')[0] === dataStr
      )
      
      const receitaDia = pedidosDia.reduce((sum: number, p: any) => sum + (p.valor_pedido || 0), 0)
      const quantidadeDia = pedidosDia.length
      
      evolucaoTemporal.push({
        periodo: dataStr,
        receita: receitaDia,
        custos: 0, // Não temos custos por dia específico
        margem: receitaDia,
        pedidos: quantidadeDia
      })
    }
    
    // 6. ANÁLISE DE GARANTIAS (todos os pedidos - incluindo sem valor)
    const pedidosGarantia = pedidosCompletos.filter((p: any) => p.eh_garantia)
    const custoGarantias = pedidosGarantia.reduce((sum: number, p: any) => sum + (p.valor_pedido || 0), 0)
    const taxaGarantia = pedidosCompletos.length > 0 ? (pedidosGarantia.length / pedidosCompletos.length) * 100 : 0
    
    // 7. PAGAMENTOS (apenas pedidos com valor)
    const pedidosPagos = pedidosComValor.filter((p: any) => p.data_pagamento)
    const pedidosPendentes = pedidosComValor.filter((p: any) => p.status === 'AG_PAGAMENTO')
    const valorPendente = pedidosPendentes.reduce((sum: number, p: any) => sum + (p.valor_pedido || 0), 0)
    
    const taxaPagamento = pedidosComValor.length > 0 ? (pedidosPagos.length / pedidosComValor.length) * 100 : 0
    
    // 8. MÉTRICAS DE DESEMPENHO
    const ticketMedio = pedidosComValor.length > 0 ? totalReceita / pedidosComValor.length : 0
    const receitaPorDia = totalReceita / parseInt(periodo)
    
    // 9. ANÁLISE POR LOJA (se não filtrado por loja específica)
    const receitaPorLoja: { [key: string]: any } = {}
    if (!lojaId) {
      pedidosComValor.forEach((p: any) => {
        const loja = p.loja_id || 'SEM_LOJA'
        if (!receitaPorLoja[loja]) {
          receitaPorLoja[loja] = {
            loja_id: loja,
            quantidade_pedidos: 0,
            receita_total: 0,
            ticket_medio: 0,
            percentual_receita: 0
          }
        }
        receitaPorLoja[loja].quantidade_pedidos++
        receitaPorLoja[loja].receita_total += p.valor_pedido || 0
      })
      
      Object.values(receitaPorLoja).forEach((loja: any) => {
        loja.ticket_medio = loja.quantidade_pedidos > 0 ? loja.receita_total / loja.quantidade_pedidos : 0
        loja.percentual_receita = totalReceita > 0 ? (loja.receita_total / totalReceita) * 100 : 0
      })
    }
    
    console.log(`✅ Análise financeira: R$ ${totalReceita.toFixed(2)} em receita, ${pedidosCompletos.length} pedidos (${pedidosComValor.length} com valor, ${pedidosSemValor.length} sem valor)`)
    
    return NextResponse.json({
      // Métricas principais
      metricas_principais: {
        receita_total: totalReceita,
        custo_total: totalCustos,
        margem_bruta: margemBruta,
        percentual_margem: percentualMargem,
        quantidade_pedidos: pedidosComValor.length, // Pedidos com valor para cálculos financeiros
        quantidade_total: pedidosCompletos.length, // Total incluindo garantias sem valor
        quantidade_sem_valor: pedidosSemValor.length, // Pedidos sem valor (garantias, orçamentos)
        ticket_medio: ticketMedio,
        receita_por_dia: receitaPorDia
      },
      
      // Análises detalhadas
      receita_por_status: receitaPorStatus,
      formas_pagamento: formasPagamento,
      evolucao_temporal: evolucaoTemporal,
      
      // Garantias e pagamentos
      analise_garantias: {
        quantidade_garantias: pedidosGarantia.length,
        custo_garantias: custoGarantias,
        taxa_garantia_percent: taxaGarantia
      },
      
      analise_pagamentos: {
        pedidos_pagos: pedidosPagos.length,
        pedidos_pendentes: pedidosPendentes.length,
        valor_pendente: valorPendente,
        taxa_pagamento_percent: taxaPagamento
      },
      
      // Análise por loja (se aplicável)
      receita_por_loja: !lojaId ? Object.values(receitaPorLoja) : null,
      
      // Metadados
      periodo_analise: periodo,
      data_inicio: dataLimite.toISOString().split('T')[0],
      data_fim: new Date().toISOString().split('T')[0],
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ Erro na API financeira:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar dados financeiros' },
      { status: 500 }
    )
  }
}