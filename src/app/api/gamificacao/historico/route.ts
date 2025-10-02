// src/app/api/gamificacao/historico/route.ts
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const lojaId = searchParams.get('loja_id')
    const periodo = searchParams.get('periodo') || '30d'

    if (!lojaId) {
      return NextResponse.json({ error: 'loja_id é obrigatório' }, { status: 400 })
    }

    // Calcular range de datas baseado no período
    const dias = periodo === '7d' ? 7 : periodo === '30d' ? 30 : 90
    const dataFim = new Date()
    const dataInicio = new Date()
    dataInicio.setDate(dataInicio.getDate() - dias)

    // Buscar ou calcular dados diários
    const historico = await buscarOuCalcularHistorico(lojaId, dataInicio, dataFim)

    return NextResponse.json({
      historico,
      periodo,
      total_dias: historico.length
    })
  } catch (error) {
    console.error('Erro ao buscar histórico:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

async function buscarOuCalcularHistorico(lojaId: string, dataInicio: Date, dataFim: Date) {
  // Primeiro, tentar buscar dados já calculados
  const { data: historicoExistente, error: errorHistorico } = await supabaseAdmin
    .from('pontuacao_diaria')
    .select('*')
    .eq('loja_id', lojaId)
    .gte('data', dataInicio.toISOString().split('T')[0])
    .lte('data', dataFim.toISOString().split('T')[0])
    .order('data', { ascending: false })

  if (errorHistorico) {
    console.error('Erro ao buscar histórico existente:', errorHistorico)
    // Se não conseguir buscar da tabela, calcular em tempo real
    return await calcularHistoricoTempReal(lojaId, dataInicio, dataFim)
  }

  // Se não há dados na tabela, calcular e salvar
  if (!historicoExistente || historicoExistente.length === 0) {
    return await calcularEPopularHistorico(lojaId, dataInicio, dataFim)
  }

  return historicoExistente
}

async function calcularHistoricoTempReal(lojaId: string, dataInicio: Date, dataFim: Date) {
  const historico = []
  const dataAtual = new Date(dataInicio)

  while (dataAtual <= dataFim) {
    const dataStr = dataAtual.toISOString().split('T')[0]
    
    // Buscar missões do dia
    const { data: missoes, error } = await supabaseAdmin
      .from('v_missoes_timeline')
      .select('status, pontos_total')
      .eq('loja_id', lojaId)
      .eq('data_missao', dataStr)

    if (!error && missoes) {
      const missoesTotais = missoes.length
      const missoesCompletadas = missoes.filter(m => m.status === 'concluida').length
      const pontosPossiveis = missoesTotais * 50 // 50 pontos por missão
      const pontosConquistados = missoes
        .filter(m => m.status === 'concluida')
        .reduce((sum, m) => sum + (m.pontos_total || 50), 0)
      
      const percentualEficiencia = pontosPossiveis > 0 ? 
        (pontosConquistados / pontosPossiveis) * 100 : 0

      // Determinar liga do dia
      let ligaNoDia = 'BRONZE'
      if (percentualEficiencia >= 80) ligaNoDia = 'OURO'
      else if (percentualEficiencia >= 60) ligaNoDia = 'PRATA'

      historico.push({
        id: `${lojaId}-${dataStr}`,
        loja_id: lojaId,
        data: dataStr,
        pontos_possiveis: pontosPossiveis,
        pontos_conquistados: pontosConquistados,
        missoes_totais: missoesTotais,
        missoes_completadas: missoesCompletadas,
        percentual_eficiencia: percentualEficiencia,
        liga_no_dia: ligaNoDia,
        streak_dias: 0, // TODO: calcular streak real
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
    }

    dataAtual.setDate(dataAtual.getDate() + 1)
  }

  return historico.reverse() // Mais recente primeiro
}

async function calcularEPopularHistorico(lojaId: string, dataInicio: Date, dataFim: Date) {
  const historico = await calcularHistoricoTempReal(lojaId, dataInicio, dataFim)
  
  // Tentar salvar na tabela (se existir)
  try {
    for (const dia of historico) {
      await supabaseAdmin
        .from('pontuacao_diaria')
        .upsert({
          loja_id: dia.loja_id,
          data: dia.data,
          pontos_possiveis: dia.pontos_possiveis,
          pontos_conquistados: dia.pontos_conquistados,
          missoes_totais: dia.missoes_totais,
          missoes_completadas: dia.missoes_completadas,
          percentual_eficiencia: dia.percentual_eficiencia,
          liga_no_dia: dia.liga_no_dia,
          streak_dias: dia.streak_dias
        })
    }
  } catch (error) {
    console.warn('Não foi possível salvar histórico (tabela pode não existir):', error)
    // Continuar normalmente mesmo se não conseguir salvar
  }

  return historico
}