import { NextResponse } from 'next/server'
import { getServerSupabase, hasServerSupabaseEnv } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    if (!hasServerSupabaseEnv()) {
      return NextResponse.json({
        kpis: null,
        evolucao: [],
        ranking_laboratorios: [],
        alertas_criticos: [],
        analise_financeira: [],
        last_updated: new Date().toISOString(),
        data_freshness: 'desconhecido'
      })
    }

    const supabase = getServerSupabase()
    // Buscar dados em paralelo para melhor performance
    const [
      kpisResult,
      evolucaoResult,
      rankingResult,
      alertasResult, 
      financeiroResult
    ] = await Promise.allSettled([
      supabase.from('v_kpis_dashboard').select('*').single(),
      supabase.from('v_evolucao_mensal').select('*').order('periodo'),
      supabase.from('v_ranking_laboratorios').select('*').order('score_geral', { ascending: false }).limit(10),
      supabase.from('v_alertas_criticos').select('*').limit(10),
      supabase.from('v_analise_financeira').select('*').order('faturamento_total', { ascending: false })
    ])

    const dashboardData = {
      kpis: kpisResult.status === 'fulfilled' ? kpisResult.value.data : null,
      evolucao: evolucaoResult.status === 'fulfilled' ? evolucaoResult.value.data : [],
      ranking_laboratorios: rankingResult.status === 'fulfilled' ? rankingResult.value.data : [],
      alertas_criticos: alertasResult.status === 'fulfilled' ? alertasResult.value.data : [],
      analise_financeira: financeiroResult.status === 'fulfilled' ? financeiroResult.value.data : [],
      
      // Metadata
      last_updated: new Date().toISOString(),
      data_freshness: '5 minutos'
    }

    return NextResponse.json(dashboardData)
  } catch (error) {
    console.error('Erro ao carregar dashboard completo:', error)
    return NextResponse.json({ error: 'Erro ao carregar dashboard' }, { status: 500 })
  }
}