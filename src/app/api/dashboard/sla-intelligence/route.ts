import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase, hasServerSupabaseEnv } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    if (!hasServerSupabaseEnv()) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }
    
    const supabase = getServerSupabase()
    const { searchParams } = new URL(request.url)
    
    // Filtros opcionais
    const lojaId = searchParams.get('loja_id')
    const dataInicio = searchParams.get('data_inicio')
    const dataFim = searchParams.get('data_fim')

    // 🎯 MÉTRICAS PRINCIPAIS SLA
    const { data: metricas, error: errorMetricas } = await supabase.rpc('get_sla_metricas', {
      p_loja_id: lojaId,
      p_data_inicio: dataInicio,
      p_data_fim: dataFim
    })

    if (errorMetricas) {
      console.error('Erro ao buscar métricas SLA:', errorMetricas)
    }

    // 🏭 PERFORMANCE POR LABORATÓRIO  
    const { data: performanceLabs, error: errorPerformance } = await supabase.rpc('get_performance_laboratorios', {
      p_loja_id: lojaId,
      p_data_inicio: dataInicio,
      p_data_fim: dataFim
    })

    if (errorPerformance) {
      console.error('Erro ao buscar performance labs:', errorPerformance)
    }

    // 🚨 ALERTAS CRÍTICOS SLA
    const { data: alertasSLA, error: errorAlertas } = await supabase.rpc('get_alertas_sla_criticos', {
      p_loja_id: lojaId
    })

    if (errorAlertas) {
      console.error('Erro ao buscar alertas SLA:', errorAlertas)
    }

    // 📅 TIMELINE PRÓXIMOS 7 DIAS
    const { data: timelineSLA, error: errorTimeline } = await supabase.rpc('get_timeline_sla_7_dias', {
      p_loja_id: lojaId
    })

    if (errorTimeline) {
      console.error('Erro ao buscar timeline SLA:', errorTimeline)
    }

    // 🤖 INSIGHTS AUTOMÁTICOS (baseados nos dados reais)
    const insights = await gerarInsightsIA(metricas?.[0], performanceLabs)

    return NextResponse.json({
      success: true,
      metricas: metricas?.[0] || null,
      performance_laboratorios: performanceLabs || [],
      alertas_sla: alertasSLA || [],
      timeline_proximos_dias: timelineSLA || [],
      insights_ia: insights
    })

  } catch (error) {
    console.error('Erro na API SLA Intelligence:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// 🤖 Função para gerar insights baseados em dados reais
async function gerarInsightsIA(metricas: any, performanceLabs: any[]) {
  const insights: any[] = []

  if (!metricas || !performanceLabs) return insights

  // Insight 1: Labs com performance acima da média
  const labsRapidos = performanceLabs.filter(lab => 
    lab.dias_medio_real < lab.dias_sla_prometido && lab.total_pedidos > 5
  )
  
  if (labsRapidos.length > 0) {
    const economiaPotencial = labsRapidos.reduce((acc, lab) => 
      acc + (lab.total_pedidos * 50), 0 // R$ 50 por pedido otimizado
    )
    
    insights.push({
      tipo: 'economia',
      titulo: `Economia de R$ ${economiaPotencial.toLocaleString()} identificada`,
      descricao: `${labsRapidos.length} laboratório(s) entregam antes do SLA prometido. Reduza margem de segurança para acelerar promessas.`,
      impacto_estimado: `+R$ ${economiaPotencial}/mês`,
      acao_recomendada: `Ajustar margem: ${labsRapidos.map(l => l.laboratorio_nome).join(', ')}`,
      icone: '💰'
    })
  }

  // Insight 2: Labs com atrasos recorrentes  
  const labsLentos = performanceLabs.filter(lab => 
    lab.taxa_sla < 90 && lab.total_pedidos > 3
  )
  
  if (labsLentos.length > 0) {
    const custoRisco = labsLentos.reduce((acc, lab) => 
      acc + (lab.pedidos_atrasados * 100), 0 // R$ 100 por atraso
    )
    
    insights.push({
      tipo: 'risco',
      titulo: `Risco de R$ ${custoRisco.toLocaleString()} em compensações`,
      descricao: `${labsLentos.length} laboratório(s) com alta taxa de atraso. Aumente margem temporariamente.`,
      impacto_estimado: `Risco: R$ ${custoRisco}`,
      acao_recomendada: `Aumentar margem: ${labsLentos.map(l => l.laboratorio_nome).join(', ')}`,
      icone: '⚠️'
    })
  }

  // Insight 3: Oportunidade competitiva
  if (metricas.taxa_promessa_cliente > 95) {
    insights.push({
      tipo: 'oportunidade',
      titulo: 'Oportunidade de diferenciação competitiva',
      descricao: `Com ${metricas.taxa_promessa_cliente.toFixed(1)}% de cumprimento, vocês podem oferecer prazos menores que a concorrência.`,
      impacto_estimado: '+10-15% conversão estimada',
      acao_recomendada: 'Implementar prazos dinâmicos por classe de lente',
      icone: '🚀'
    })
  }

  return insights
}