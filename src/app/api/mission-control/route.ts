// app/api/mission-control/route.ts - VERSÃO CORRIGIDA
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
    console.log('🚀 Iniciando API Mission Control...')
    
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || 'missions'
    const data = searchParams.get('data') || new Date().toISOString().split('T')[0]
    const lojaId = searchParams.get('loja_id')
    
    console.log('📋 Parâmetros:', { action, data, lojaId })

    switch (action) {
      case 'missions':
        return await getMissions(supabaseAdmin, data, lojaId)
      case 'dashboard':
        return await getDashboard(supabaseAdmin, data, lojaId)
      case 'stats':
        return await getStats(supabaseAdmin, data, lojaId)
      default:
        return NextResponse.json({ error: 'Ação não reconhecida' }, { status: 400 })
    }
  } catch (error) {
    console.error('💥 Erro na API Mission Control:', error)
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      }, 
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body
    
    console.log('📝 POST action:', action, 'data:', body)

    switch (action) {
      case 'start_mission':
        return await startMission(supabaseAdmin, body)
      case 'execute_mission':
        return await executeMission(supabaseAdmin, body)
      case 'pause_mission':
        return await pauseMission(supabaseAdmin, body)
      default:
        return NextResponse.json({ error: 'Ação não reconhecida' }, { status: 400 })
    }
  } catch (error) {
    console.error('Erro na API Mission Control POST:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' }, 
      { status: 500 }
    )
  }
}

// ========================================
// FUNÇÃO CORRIGIDA: getMissions
// ========================================
async function getMissions(supabase: any, data: string, lojaId?: string | null) {
  try {
    console.log('🔍 Buscando missões REAIS para data:', data, 'loja:', lojaId)
    
    if (!lojaId) {
      throw new Error('LojaId é obrigatório para buscar missões')
    }
    
    // USAR A VIEW REAL v_missoes_timeline
    const { data: missions, error } = await supabase
      .from('v_missoes_timeline')
      .select('*')
      .eq('data_missao', data)
      .eq('loja_id', lojaId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Erro na query da view v_missoes_timeline:', error)
      throw new Error(`Erro ao buscar missões: ${error.message}`)
    }

    console.log(`✅ Query executada com sucesso. Encontradas ${missions?.length || 0} missões`)

    if (!missions || missions.length === 0) {
      console.warn(`⚠️ Nenhuma missão encontrada para loja ${lojaId} na data ${data}`)
      return NextResponse.json({
        missions: [],
        source: 'v_missoes_timeline',
        debug: {
          data_consultada: data,
          loja_filtro: lojaId,
          total_encontradas: 0,
          motivo: 'Nenhuma missão encontrada para esta loja/data'
        }
      })
    }

    // Transformar dados para o formato esperado pelo frontend
    const missionsFormatted = missions.map((mission: any) => ({
      // IDs e referências
      id: mission.id,
      loja_id: mission.loja_id,
      loja_nome: mission.loja_nome,
      
      // Dados da missão (já vem direto da view)
      missao_nome: mission.missao_nome,
      descricao: mission.descricao,
      tipo: mission.tipo,
      categoria: mission.categoria,
      icone: mission.icone,
      cor_primary: mission.cor_primary,
      
      // Status e controle
      status: mission.status,
      urgencia_status: mission.urgencia_status, // Calculado automaticamente na view
      
      // Tempos e prazos
      data_missao: mission.data_missao,
      data_vencimento: mission.data_vencimento,
      concluida_em: mission.concluida_em,
      tempo_estimado_min: mission.tempo_estimado_min,
      tempo_total_execucao_segundos: mission.tempo_total_execucao_segundos,
      progresso_tempo: mission.progresso_tempo, // Calculado automaticamente na view
      
      // Horários
      horario_inicio: mission.horario_inicio,
      horario_limite: mission.horario_limite,
      
      // Execução
      executada_por: mission.executada_por,
      qualidade_execucao: mission.qualidade_execucao,
      
      // Pontos e evidência
      pontos_total: mission.pontos_total,
      requer_evidencia: mission.requer_evidencia,
      
      // Flags calculadas
      requer_atencao: mission.urgencia_status === 'urgente' || mission.urgencia_status === 'vencida',
      
      // Metadados
      created_at: mission.created_at,
      updated_at: mission.updated_at
    }))

    return NextResponse.json({
      missions: missionsFormatted,
      source: 'v_missoes_timeline',
      debug: {
        data_consultada: data,
        loja_filtro: lojaId,
        total_encontradas: missionsFormatted.length,
        motivo: 'Dados carregados da view v_missoes_timeline'
      }
    })
    
  } catch (error) {
    console.error('💥 Erro geral ao buscar missões:', error)
    throw error
  }
}

// ========================================
// NOVA FUNÇÃO: getDashboard
// ========================================
async function getDashboard(supabase: any, data: string, lojaId?: string | null) {
  try {
    console.log('📊 Buscando dados do dashboard para:', data, 'loja:', lojaId)
    
    // USAR A VIEW REAL v_mission_control_dashboard
    let query = supabase
      .from('v_mission_control_dashboard')
      .select('*')
      .eq('data_missao', data)
      .order('loja_nome')

    if (lojaId && lojaId !== 'all') {
      query = query.eq('loja_id', lojaId)
    }

    const { data: dashboard, error } = await query

    if (error) {
      console.error('❌ Erro na query do dashboard:', error)
      throw new Error(`Erro ao buscar dashboard: ${error.message}`)
    }

    // Agregar dados se múltiplas lojas
    const aggregatedData = {
      total_missoes: dashboard.reduce((sum: number, d: any) => sum + (d.total_missoes || 0), 0),
      pendentes: dashboard.reduce((sum: number, d: any) => sum + (d.pendentes || 0), 0),
      ativas: dashboard.reduce((sum: number, d: any) => sum + (d.ativas || 0), 0),
      concluidas: dashboard.reduce((sum: number, d: any) => sum + (d.concluidas || 0), 0),
      falhadas: dashboard.reduce((sum: number, d: any) => sum + (d.falhadas || 0), 0),
      criticas: dashboard.reduce((sum: number, d: any) => sum + (d.criticas || 0), 0),
      rapidas: dashboard.reduce((sum: number, d: any) => sum + (d.rapidas || 0), 0),
      especiais: dashboard.reduce((sum: number, d: any) => sum + (d.especiais || 0), 0),
      bonus: dashboard.reduce((sum: number, d: any) => sum + (d.bonus || 0), 0),
      qualidade_media: dashboard.length > 0 
        ? dashboard.reduce((sum: number, d: any) => sum + (d.qualidade_media || 0), 0) / dashboard.length 
        : 0,
      tempo_medio: dashboard.length > 0 
        ? dashboard.reduce((sum: number, d: any) => sum + (d.tempo_medio || 0), 0) / dashboard.length 
        : 0,
      pontos_total_dia: dashboard.reduce((sum: number, d: any) => sum + (d.pontos_total_dia || 0), 0),
      percentual_conclusao: dashboard.length > 0 
        ? dashboard.reduce((sum: number, d: any) => sum + (d.percentual_conclusao || 0), 0) / dashboard.length 
        : 0,
      status_sistemas: dashboard.some((d: any) => d.status_sistemas === 'critico') 
        ? 'critico' 
        : dashboard.some((d: any) => d.status_sistemas === 'atencao') 
        ? 'atencao' 
        : 'ok',
      lojas_detalhes: dashboard
    }

    return NextResponse.json({
      dashboard: aggregatedData,
      source: 'v_mission_control_dashboard',
      debug: {
        data_consultada: data,
        loja_filtro: lojaId,
        lojas_analisadas: dashboard.length
      }
    })
    
  } catch (error) {
    console.error('💥 Erro ao buscar dashboard:', error)
    throw error
  }
}

// ========================================
// FUNÇÕES DE AÇÃO CORRIGIDAS
// ========================================
async function startMission(supabase: any, body: any) {
  try {
    const { missaoId, usuario } = body
    const agora = new Date().toISOString()

    console.log('🚀 Iniciando missão:', missaoId, 'por', usuario)

    const { data: updatedMission, error } = await supabase
      .from('missoes_diarias')
      .update({
        status: 'ativa',
        iniciada_em: agora,
        executada_por: usuario,
        updated_at: agora
      })
      .eq('id', missaoId)
      .select()
      .single()

    if (error) {
      console.error('❌ Erro ao iniciar missão:', error)
      throw new Error(`Erro ao iniciar missão: ${error.message}`)
    }

    console.log('✅ Missão iniciada com sucesso')
    return NextResponse.json({ 
      success: true,
      mission: updatedMission,
      message: 'Missão iniciada com sucesso!'
    })
  } catch (error) {
    console.error('💥 Erro na função startMission:', error)
    throw error
  }
}

async function executeMission(supabase: any, body: any) {
  try {
    const { missaoId, usuario, evidencias, observacoes, qualidade } = body
    const agora = new Date().toISOString()

    console.log('✅ Executando missão:', missaoId, 'por', usuario)

    // Buscar dados da missão para calcular pontos
    const { data: currentMission, error: fetchError } = await supabase
      .from('v_missoes_timeline')
      .select('pontos_total, tempo_total_execucao_segundos, iniciada_em')
      .eq('id', missaoId)
      .single()

    if (fetchError) {
      throw new Error(`Erro ao buscar missão: ${fetchError.message}`)
    }

    // Calcular tempo de execução se foi iniciada
    let tempoExecucao = null
    if (currentMission.iniciada_em) {
      const inicio = new Date(currentMission.iniciada_em)
      const fim = new Date(agora)
      tempoExecucao = Math.floor((fim.getTime() - inicio.getTime()) / 1000)
    }

    const { data: updatedMission, error } = await supabase
      .from('missoes_diarias')
      .update({
        status: 'concluida',
        concluida_em: agora,
        executada_por: usuario,
        evidencia_urls: evidencias || [],
        observacoes_execucao: observacoes || null,
        qualidade_execucao: qualidade || 5,
        tempo_total_execucao_segundos: tempoExecucao,
        pontos_total: currentMission.pontos_total, // Manter pontos da view
        updated_at: agora
      })
      .eq('id', missaoId)
      .select()
      .single()

    if (error) {
      console.error('❌ Erro ao executar missão:', error)
      throw new Error(`Erro ao executar missão: ${error.message}`)
    }

    console.log('✅ Missão executada com sucesso')
    return NextResponse.json({ 
      success: true,
      mission: updatedMission,
      pontos_ganhos: currentMission.pontos_total || 0,
      tempo_execucao: tempoExecucao,
      message: 'Missão executada com sucesso!'
    })
  } catch (error) {
    console.error('💥 Erro na função executeMission:', error)
    throw error
  }
}

async function pauseMission(supabase: any, body: any) {
  try {
    const { missaoId } = body
    const agora = new Date().toISOString()

    console.log('⏸️ Pausando missão:', missaoId)

    const { data: updatedMission, error } = await supabase
      .from('missoes_diarias')
      .update({
        status: 'pendente',
        pausada_em: agora,
        updated_at: agora
      })
      .eq('id', missaoId)
      .select()
      .single()

    if (error) {
      console.error('❌ Erro ao pausar missão:', error)
      throw new Error(`Erro ao pausar missão: ${error.message}`)
    }

    console.log('✅ Missão pausada com sucesso')
    return NextResponse.json({ 
      success: true,
      mission: updatedMission,
      message: 'Missão pausada com sucesso!'
    })
  } catch (error) {
    console.error('💥 Erro na função pauseMission:', error)
    throw error
  }
}

// Função adicional para buscar estatísticas gerais
async function getStats(supabase: any, data: string, lojaId?: string | null) {
  try {
    // Buscar dados dos últimos 7 dias para tendências
    const { data: weekData, error } = await supabase
      .from('v_mission_control_dashboard')
      .select('*')
      .gte('data_missao', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .order('data_missao', { ascending: false })

    if (error) {
      throw new Error(`Erro ao buscar estatísticas: ${error.message}`)
    }

    // Processar tendências e estatísticas
    const stats = {
      ultimos_7_dias: weekData,
      tendencia_conclusao: calculateTrend(weekData, 'percentual_conclusao'),
      tendencia_qualidade: calculateTrend(weekData, 'qualidade_media'),
      total_pontos_semana: weekData.reduce((sum: number, d: any) => sum + (d.pontos_total_dia || 0), 0),
      media_missoes_dia: weekData.length > 0 
        ? weekData.reduce((sum: number, d: any) => sum + (d.total_missoes || 0), 0) / weekData.length 
        : 0
    }

    return NextResponse.json({
      stats,
      source: 'v_mission_control_dashboard',
      debug: {
        dias_analisados: weekData.length,
        periodo: '7 dias'
      }
    })

  } catch (error) {
    console.error('💥 Erro ao buscar estatísticas:', error)
    throw error
  }
}

// Função auxiliar para calcular tendências
function calculateTrend(data: any[], field: string) {
  if (data.length < 2) return 0
  
  const recent = data.slice(0, 3).reduce((sum, d) => sum + (d[field] || 0), 0) / Math.min(3, data.length)
  const older = data.slice(-3).reduce((sum, d) => sum + (d[field] || 0), 0) / Math.min(3, data.length)
  
  return recent - older
}