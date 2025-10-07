// src/app/api/dashboard/evolucao-temporal/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface Pedido {
  id: string
  status: string
  valor_pedido: number
  custo_lentes: number
  data_pedido: string
  data_prevista_pronto: string
  data_entregue: string
  lead_time_total_horas: number
  created_at: string
  laboratorio_id: string
  loja_id: string
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { searchParams } = new URL(request.url)
    
    const dataInicio = searchParams.get('data_inicio') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    const dataFim = searchParams.get('data_fim') || new Date().toISOString().split('T')[0]
    const agrupamento = searchParams.get('agrupamento') || 'mes' // dia, semana, mes, ano
    const laboratorioId = searchParams.get('laboratorio_id')
    const lojaId = searchParams.get('loja_id')
    const classe = searchParams.get('classe')

    console.log('🔍 Evolução Temporal - Parâmetros:', { 
      dataInicio, 
      dataFim, 
      agrupamento, 
      laboratorioId, 
      lojaId, 
      classe 
    })

    // Construir query base
    let query = supabase
      .from('pedidos')
      .select(`
        id,
        status,
        valor_pedido,
        custo_lentes,
        data_pedido,
        data_prevista_pronto,
        data_entregue,
        lead_time_total_horas,
        created_at,
        laboratorio_id,
        loja_id
      `)
      .gte('created_at', dataInicio + 'T00:00:00')
      .lte('created_at', dataFim + 'T23:59:59')

    // Aplicar filtros opcionais
    if (laboratorioId) {
      query = query.eq('laboratorio_id', laboratorioId)
    }
    if (lojaId) {
      query = query.eq('loja_id', lojaId)
    }

    const { data: pedidos, error } = await query

    if (error) {
      console.error('Erro ao buscar pedidos:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Agrupar dados conforme o tipo de período
    const dadosAgrupados = agruparPorPeriodo(pedidos || [], agrupamento)

    return NextResponse.json({
      evolucao: dadosAgrupados,
      periodo: { dataInicio, dataFim },
      agrupamento,
      total_registros: pedidos?.length || 0
    })

  } catch (error) {
    console.error('Erro interno na evolução temporal:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

function agruparPorPeriodo(pedidos: Pedido[], agrupamento: string) {
  const grupos: { [key: string]: Pedido[] } = {}

  // Agrupar pedidos por período
  pedidos.forEach(pedido => {
    const data = new Date(pedido.created_at)
    let chave: string

    switch (agrupamento) {
      case 'dia':
        chave = data.toISOString().split('T')[0] // YYYY-MM-DD
        break
      case 'semana':
        // Calcular semana do ano
        const inicioAno = new Date(data.getFullYear(), 0, 1)
        const diasPassados = Math.floor((data.getTime() - inicioAno.getTime()) / (24 * 60 * 60 * 1000))
        const semana = Math.ceil((diasPassados + inicioAno.getDay() + 1) / 7)
        const semanaStr = semana < 10 ? `0${semana}` : semana.toString()
        chave = `${data.getFullYear()}-S${semanaStr}`
        break
      case 'mes':
        const mesStr = data.getMonth() + 1 < 10 ? `0${data.getMonth() + 1}` : (data.getMonth() + 1).toString()
        chave = `${data.getFullYear()}-${mesStr}`
        break
      case 'ano':
        chave = data.getFullYear().toString()
        break
      default:
        const mesDefaultStr = data.getMonth() + 1 < 10 ? `0${data.getMonth() + 1}` : (data.getMonth() + 1).toString()
        chave = `${data.getFullYear()}-${mesDefaultStr}`
    }

    if (!grupos[chave]) {
      grupos[chave] = []
    }
    grupos[chave].push(pedido)
  })

  // Calcular métricas para cada período
  const resultado = Object.keys(grupos).map((periodo: string) => {
    const pedidosPeriodo = grupos[periodo]
    const totalPedidos = pedidosPeriodo.length
    const pedidosEntregues = pedidosPeriodo.filter((p: Pedido) => p.status === 'entregue').length
    const pedidosComValor = pedidosPeriodo.filter((p: Pedido) => p.valor_pedido > 0)
    
    const receita = pedidosComValor.reduce((sum: number, p: Pedido) => sum + (p.valor_pedido || 0), 0)
    const custos = pedidosComValor.reduce((sum: number, p: Pedido) => sum + (p.custo_lentes || 0), 0)
    const margem = receita - custos

    // Calcular SLA (pedidos entregues no prazo)
    const pedidosComPrazo = pedidosPeriodo.filter((p: Pedido) => 
      p.data_entregue && p.data_prevista_pronto
    )
    const pedidosNoPrazo = pedidosComPrazo.filter((p: Pedido) => 
      new Date(p.data_entregue) <= new Date(p.data_prevista_pronto)
    )
    const sla = pedidosComPrazo.length > 0 ? 
      (pedidosNoPrazo.length / pedidosComPrazo.length) * 100 : 0

    // Calcular lead time médio
    const pedidosComLeadTime = pedidosPeriodo.filter((p: Pedido) => p.lead_time_total_horas > 0)
    const leadTimeMedia = pedidosComLeadTime.length > 0 ?
      pedidosComLeadTime.reduce((sum: number, p: Pedido) => sum + p.lead_time_total_horas, 0) / pedidosComLeadTime.length / 24 :
      0

    return {
      periodo,
      receita,
      pedidos: totalPedidos,
      margem,
      sla,
      leadTime: leadTimeMedia,
      custos,
      entregues: pedidosEntregues,
      ticketMedio: pedidosComValor.length > 0 ? receita / pedidosComValor.length : 0
    }
  })

  // Ordenar por período
  return resultado.sort((a: any, b: any) => a.periodo.localeCompare(b.periodo))
}