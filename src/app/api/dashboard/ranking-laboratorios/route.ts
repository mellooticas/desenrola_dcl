// ================================================================
// src/app/api/dashboard/ranking-laboratorios/route.ts
// ================================================================

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import type { RankingLaboratorio, DashboardCompleto } from '@/lib/types/dashboard-bi'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
  const supabase = createRouteHandlerClient({ cookies })
    
    // Executar todas as queries em paralelo para melhor performance
    const [kpisRes, evolucaoRes, rankingRes, alertasRes, financeiroRes] = await Promise.allSettled([
      supabase.from('v_kpis_dashboard').select('*').single(),
      supabase.from('v_evolucao_mensal').select('*').order('ano_mes').limit(12),
      supabase.from('v_ranking_laboratorios').select('*').order('posicao').limit(10),
      supabase.from('v_alertas_criticos').select('*').order('ordem_prioridade').limit(20),
      supabase.from('v_analise_financeira').select('*').order('faturamento_total', { ascending: false })
    ])
    
    const response: DashboardCompleto = {
      kpis: kpisRes.status === 'fulfilled' && kpisRes.value.data ? kpisRes.value.data : null,
      evolucao: evolucaoRes.status === 'fulfilled' ? (evolucaoRes.value.data || []) : [],
      ranking_laboratorios: rankingRes.status === 'fulfilled' ? (rankingRes.value.data || []) : [],
      alertas_criticos: alertasRes.status === 'fulfilled' ? (alertasRes.value.data || []) : [],
      analise_financeira: financeiroRes.status === 'fulfilled' ? (financeiroRes.value.data || []) : [],
      last_updated: new Date().toISOString(),
      data_freshness: 'real-time'
    }
    
    return NextResponse.json(response)
    
  } catch (error) {
    console.error('Erro interno:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}