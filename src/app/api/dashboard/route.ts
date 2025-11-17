import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase/server'
import type { DashboardMetricas } from '@/lib/types/database'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
  const supabase = getServerSupabase()
    const { searchParams } = new URL(request.url)
    
    // Parâmetros de período (opcional) 
    const dataInicio = searchParams.get('data_inicio') 
    const dataFim = searchParams.get('data_fim')
    const lojaId = searchParams.get('loja_id')
    
    // Verificar se existe a view de dashboard
    const { data: dashboardData, error: dashboardError } = await supabase
      .from('v_dashboard_resumo')
      .select('*')
      .single()
    
    if (!dashboardError && dashboardData) {
      // Se a view existe, usar ela
      return NextResponse.json(dashboardData)
    }
    
    // Caso contrário, calcular manualmente
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
        data_prevista_pronto
      `)
      .neq('status', 'CANCELADO')
    
    if (dataInicio && dataFim) {
      query = query
        .gte('created_at', dataInicio)
        .lte('created_at', dataFim)
    }
    
    if (lojaId) {
      query = query.eq('loja_id', lojaId)
    }
    
    // Buscar métricas básicas
    const { data: pedidos, error } = await query
    
    if (error) {
      console.error('Erro ao buscar dados do dashboard:', error)
      return NextResponse.json(
        { error: 'Erro ao buscar métricas' },
        { status: 500 }
      )
    }
    
    // Calcular métricas
    const metricas: DashboardMetricas = {
      total_pedidos: pedidos.length,
      registrados: pedidos.filter(p => p.status === 'REGISTRADO').length,
      aguardando_pagamento: pedidos.filter(p => p.status === 'AG_PAGAMENTO').length,
      em_producao: pedidos.filter(p => p.status === 'PRODUCAO').length,
      entregues: pedidos.filter(p => p.status === 'ENTREGUE').length,
      cancelados: pedidos.filter(p => p.status === 'CANCELADO').length,
      pedidos_garantia: pedidos.filter(p => p.eh_garantia).length,
      lead_time_medio: 0, // TODO: calcular baseado nas datas
      alertas_ativos: 0, // TODO: buscar da tabela de alertas
      valor_total_vendas: pedidos.reduce((total, p) => total + (p.valor_pedido || 0), 0),
      custo_total_lentes: pedidos.reduce((total, p) => total + (p.custo_lentes || 0), 0),
      margem_bruta: 0, // Será calculado abaixo
      sla_compliance: 95 // TODO: calcular baseado nos SLAs
    }
    
    // Calcular margem bruta
    if (metricas.valor_total_vendas > 0) {
      metricas.margem_bruta = ((metricas.valor_total_vendas - metricas.custo_total_lentes) / metricas.valor_total_vendas) * 100
    }
    
    // Buscar alertas ativos
    const { data: alertas } = await supabase
      .from('alertas')
      .select('id')
      .eq('lido', false)
    
    if (alertas) {
      metricas.alertas_ativos = alertas.length
    }
    
    return NextResponse.json(metricas)
  } catch (error) {
    console.error('Erro interno:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}