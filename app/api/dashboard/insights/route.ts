// ================================================================
// src/app/api/dashboard/insights/route.ts
// ================================================================

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import type { InsightsAutomaticos } from '@/lib/types/dashboard-bi'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Buscar dados para gerar insights
    const [kpisRes, rankingRes, alertasRes] = await Promise.allSettled([
      supabase.from('v_kpis_dashboard').select('*').single(),
      supabase.from('v_ranking_laboratorios').select('*').order('posicao').limit(5),
      supabase.from('v_alertas_criticos').select('*').order('ordem_prioridade').limit(10)
    ])
    
    const insights: string[] = []
    const recomendacoes: string[] = []
    let scoreGeral = 100
    let alertasUrgentes = 0
    
    // Analisar KPIs
    if (kpisRes.status === 'fulfilled' && kpisRes.value.data) {
      const kpis = kpisRes.value.data
      
      if (kpis.sla_compliance >= 95) {
        insights.push(`Excelente SLA de ${kpis.sla_compliance.toFixed(1)}% - acima da meta de 95%`)
      } else if (kpis.sla_compliance >= 90) {
        insights.push(`SLA de ${kpis.sla_compliance.toFixed(1)}% próximo da meta - atenção necessária`)
        recomendacoes.push('Revisar laboratórios com maior atraso')
        scoreGeral -= 10
      } else {
        insights.push(`SLA crítico de ${kpis.sla_compliance.toFixed(1)}% - muito abaixo da meta`)
        recomendacoes.push('Ação imediata: revisar processos e parcerias')
        scoreGeral -= 25
      }
      
      if (kpis.variacao_pedidos > 10) {
        insights.push(`Crescimento expressivo de ${kpis.variacao_pedidos.toFixed(1)}% no volume`)
        recomendacoes.push('Considerar ampliar capacidade de produção')
      } else if (kpis.variacao_pedidos < -10) {
        insights.push(`Queda significativa de ${Math.abs(kpis.variacao_pedidos).toFixed(1)}% no volume`)
        recomendacoes.push('Investigar causas da redução de demanda')
        scoreGeral -= 15
      }
      
      if (kpis.lead_time_medio > 5) {
        insights.push(`Lead time elevado de ${kpis.lead_time_medio.toFixed(1)} dias`)
        recomendacoes.push('Otimizar processos e logística')
        scoreGeral -= 10
      }
    }
    
    // Analisar ranking de laboratórios
    if (rankingRes.status === 'fulfilled' && rankingRes.value.data) {
      const topLabs = rankingRes.value.data
      const labsComProblema = topLabs.filter(lab => lab.status_risco === 'ALTO')
      
      if (labsComProblema.length === 0) {
        insights.push('Todos os principais laboratórios com baixo risco')
      } else {
        insights.push(`${labsComProblema.length} laboratório(s) principais com alto risco`)
        recomendacoes.push('Diversificar parcerias para reduzir dependência')
        scoreGeral -= labsComProblema.length * 5
      }
    }
    
    // Analisar alertas críticos
    if (alertasRes.status === 'fulfilled' && alertasRes.value.data) {
      const alertas = alertasRes.value.data
      alertasUrgentes = alertas.filter(a => a.prioridade === 'CRÍTICA').length
      
      if (alertasUrgentes > 0) {
        insights.push(`${alertasUrgentes} alerta(s) crítico(s) requerem ação imediata`)
        recomendacoes.push('Priorizar resolução de alertas críticos')
        scoreGeral -= alertasUrgentes * 10
      } else {
        insights.push('Nenhum alerta crítico no momento')
      }
    }
    
    // Insights adicionais baseados em padrões
    const agora = new Date()
    const diaSemana = agora.getDay()
    const hora = agora.getHours()
    
    if (diaSemana === 1 && hora < 10) {
      insights.push('Segunda-feira: pico típico de novos pedidos esperado')
      recomendacoes.push('Monitorar capacidade dos laboratórios')
    }
    
    if (agora.getMonth() === 11) { // Dezembro
      insights.push('Dezembro: período de alta demanda sazonal')
      recomendacoes.push('Comunicar prazos especiais aos clientes')
    }
    
    const response: InsightsAutomaticos = {
      insights,
      recomendacoes,
      score_sistema: Math.max(0, scoreGeral),
      alertas_urgentes: alertasUrgentes
    }
    
    return NextResponse.json(response)
    
  } catch (error) {
    console.error('Erro interno:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}