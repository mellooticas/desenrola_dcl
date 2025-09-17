// ================================================================
// src/app/api/dashboard/projecoes/route.ts
// ================================================================

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import type { Projecoes } from '@/lib/types/dashboard-bi'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Buscar dados dos últimos 6 meses para calcular projeções
    const { data: evolucao, error } = await supabase
      .from('v_evolucao_mensal')
      .select('*')
      .order('ano_mes', { ascending: false })
      .limit(6)
    
    if (error) {
      console.error('Erro ao buscar dados para projeção:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    if (!evolucao || evolucao.length < 3) {
      return NextResponse.json({ 
        error: 'Dados insuficientes para projeção' 
      }, { status: 400 })
    }
    
    // Calcular tendências simples (média dos últimos 3 meses vs 3 anteriores)
    const recentes = evolucao.slice(0, 3)
    const anteriores = evolucao.slice(3, 6)
    
    const mediaRecentePedidos = recentes.reduce((acc, m) => acc + m.total_pedidos, 0) / 3
    const mediaAnteriorPedidos = anteriores.reduce((acc, m) => acc + m.total_pedidos, 0) / 3
    
    const mediaRecenteTicket = recentes.reduce((acc, m) => acc + m.ticket_medio, 0) / 3
    const mediaAnteriorTicket = anteriores.reduce((acc, m) => acc + m.ticket_medio, 0) / 3
    
    const mediaRecenteLead = recentes.reduce((acc, m) => acc + m.lead_time_medio, 0) / 3
    const mediaAnteriorLead = anteriores.reduce((acc, m) => acc + m.lead_time_medio, 0) / 3
    
    const crescimentoPedidos = ((mediaRecentePedidos - mediaAnteriorPedidos) / mediaAnteriorPedidos) * 100
    const crescimentoTicket = ((mediaRecenteTicket - mediaAnteriorTicket) / mediaAnteriorTicket) * 100
    const variacaoLead = ((mediaRecenteLead - mediaAnteriorLead) / mediaAnteriorLead) * 100
    
    // Projeção para próximo mês
    const proximoMes = new Date()
    proximoMes.setMonth(proximoMes.getMonth() + 1)
    
    const projecoes: Projecoes = {
      periodo: `${proximoMes.getFullYear()}-${String(proximoMes.getMonth() + 1).padStart(2, '0')}`,
      pedidos_projetados: Math.round(mediaRecentePedidos * (1 + crescimentoPedidos / 100)),
      ticket_projetado: mediaRecenteTicket * (1 + crescimentoTicket / 100),
      lead_time_projetado: mediaRecenteLead * (1 + variacaoLead / 100),
      faturamento_projetado: (mediaRecentePedidos * (1 + crescimentoPedidos / 100)) * 
                             (mediaRecenteTicket * (1 + crescimentoTicket / 100)),
      crescimento_percentual_mensal: crescimentoPedidos
    }
    
    return NextResponse.json(projecoes)
    
  } catch (error) {
    console.error('Erro interno:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}