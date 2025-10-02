// app/api/mission-control/route.ts - VERSÃO CORRIGIDA V2.0
// 🚀 Sistema Motivacional Implementado - 2025-10-01
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
  } catch (error: any) {
    console.error('❌ Erro na API Mission Control POST:', error)
    console.error('❌ Stack trace completo:', error.stack)
    console.error('❌ Mensagem:', error.message)
    console.error('❌ Tipo do erro:', typeof error)
    
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: error.message || 'Erro desconhecido',
        timestamp: new Date().toISOString()
      }, 
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
// SISTEMA DE MOTIVAÇÃO E PONTUAÇÃO
// ========================================
function generateMotivationalMessage(action: string, usuario: string, points?: number, quality?: number, timeSeconds?: number): string {
  const messages = {
    start: [
      `🚀 Vamos ${usuario}! É hora de brilhar!`,
      `💪 ${usuario}, você consegue! Foco na missão!`,
      `⭐ Chegou a sua vez ${usuario}! Mostre seu talento!`,
      `🎯 ${usuario}, missão aceita! Vamos para a vitória!`
    ],
    complete: [
      `🎉 Parabéns ${usuario}! Missão concluída com sucesso!`,
      `🏆 Excelente trabalho ${usuario}! Você é incrível!`,
      `✨ ${usuario}, você arrasou! Missão finalizada!`,
      `🎊 Fantástico ${usuario}! Mais uma conquista!`
    ],
    perfectQuality: [
      `👏 ${usuario}, qualidade PERFEITA! Você é um exemplo!`,
      `🌟 WOW ${usuario}! Execução impecável!`,
      `🔥 ${usuario}, isso é ser PROFISSIONAL! Parabéns!`
    ],
    fastCompletion: [
      `⚡ ${usuario}, velocidade impressionante! Eficiência total!`,
      `🏃‍♂️ ${usuario}, você é RÁPIDO! Ótima gestão de tempo!`,
      `💨 ${usuario}, missão express! Produtividade máxima!`
    ],
    bonus: [
      `💰 ${usuario} ganhou BÔNUS! ${points} pontos extras!`,
      `🎁 Surprise ${usuario}! Pontos de bônus conquistados!`,
      `💎 ${usuario}, execução premium! Bônus merecido!`
    ]
  }

  // Mensagem especial para conclusão com qualidade e tempo
  if (action === 'complete' && quality && timeSeconds) {
    let specialMessage = ''
    
    if (quality === 5) {
      specialMessage = messages.perfectQuality[Math.floor(Math.random() * messages.perfectQuality.length)]
    }
    
    if (timeSeconds < 300) { // Menos de 5 minutos
      specialMessage += ' ' + messages.fastCompletion[Math.floor(Math.random() * messages.fastCompletion.length)]
    }
    
    if (points && points > 50) {
      specialMessage += ' ' + messages.bonus[Math.floor(Math.random() * messages.bonus.length)]
    }
    
    return specialMessage || messages.complete[Math.floor(Math.random() * messages.complete.length)]
  }

  return messages[action as keyof typeof messages][Math.floor(Math.random() * messages[action as keyof typeof messages].length)]
}

function calculateDynamicPoints(basePoints: number, quality: number, timeSeconds: number | null, isExtraMission: boolean = false): number {
  let totalPoints = basePoints

  // Multiplicador de qualidade (1x a 2x)
  const qualityMultiplier = 0.6 + (quality * 0.28) // 0.6 para qual 1, 2.0 para qual 5
  totalPoints *= qualityMultiplier

  // Bônus de velocidade
  if (timeSeconds) {
    if (timeSeconds < 180) totalPoints += 30      // Menos de 3 min: +30 pontos
    else if (timeSeconds < 300) totalPoints += 20 // Menos de 5 min: +20 pontos
    else if (timeSeconds < 600) totalPoints += 10 // Menos de 10 min: +10 pontos
  }

  // Bônus para missão extra
  if (isExtraMission) {
    totalPoints *= 1.5
  }

  // Arredondar para inteiro
  return Math.round(totalPoints)
}

function generateAchievementBadges(quality: number, timeSeconds: number | null, isFirstMission: boolean = false): string[] {
  const badges = []

  if (quality === 5) badges.push('🌟 Qualidade Perfeita')
  if (quality >= 4) badges.push('⭐ Alta Qualidade')
  
  if (timeSeconds) {
    if (timeSeconds < 120) badges.push('⚡ Velocidade da Luz')
    else if (timeSeconds < 300) badges.push('🏃‍♂️ Execução Rápida')
    else if (timeSeconds < 600) badges.push('⏱️ Boa Gestão de Tempo')
  }

  if (isFirstMission) badges.push('🎯 Primeira Missão')

  return badges
}

// ========================================
// FUNÇÕES DE AÇÃO CORRIGIDAS
// ========================================
async function startMission(supabase: any, body: any) {
  try {
    const { missaoId, usuario } = body
    const agora = new Date().toISOString()

    console.log('🚀 Iniciando missão:', missaoId, 'por', usuario)

    // Buscar dados atuais da missão primeiro
    const { data: currentMission, error: fetchError } = await supabase
      .from('missoes_diarias')
      .select('*')
      .eq('id', missaoId)
      .single()

    if (fetchError) {
      console.error('❌ Erro ao buscar missão:', fetchError)
      throw new Error(`Erro ao buscar missão: ${fetchError.message}`)
    }

    console.log('📋 Estrutura da missão:', Object.keys(currentMission))

    // Dados básicos para iniciar
    const updateData: any = {
      status: 'ativa',
      updated_at: agora
    }

    // Adicionar campos se existirem na estrutura
    if ('iniciada_em' in currentMission) updateData.iniciada_em = agora
    if ('executada_por' in currentMission) updateData.executada_por = usuario

    console.log('📝 Campos a serem atualizados:', Object.keys(updateData))

    const { data: updatedMission, error } = await supabase
      .from('missoes_diarias')
      .update(updateData)
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
      message: '🎯 Missão iniciada! Boa sorte na execução!',
      motivationalMessage: generateMotivationalMessage('start', usuario)
    })
  } catch (error) {
    console.error('💥 Erro na função startMission:', error)
    throw error
  }
}

async function executeMission(supabase: any, body: any) {
  try {
    console.log('[DEBUG] executeMission iniciada com body:', JSON.stringify(body, null, 2))
    
    const { missaoId, usuario, evidencias, observacoes, qualidade } = body
    const agora = new Date().toISOString()

    console.log('[DEBUG] Dados extraídos:', { missaoId, usuario, evidencias, observacoes, qualidade, agora })
    
    // Validar se missaoId é um UUID válido
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!missaoId || !uuidRegex.test(missaoId)) {
      throw new Error(`ID da missão inválido. Esperado UUID, recebido: ${missaoId}`)
    }
    
    console.log('✅ Executando missão:', missaoId, 'por', usuario)

    // Buscar dados básicos da missão
    const { data: currentMission, error: fetchError } = await supabase
      .from('missoes_diarias')
      .select('*')
      .eq('id', missaoId)
      .single()

    if (fetchError) {
      console.error('❌ Erro ao buscar missão:', fetchError)
      throw new Error(`Erro ao buscar missão: ${fetchError.message}`)
    }

    console.log('📋 Dados da missão encontrada:', Object.keys(currentMission))

    // Calcular tempo de execução se foi iniciada
    let tempoExecucao = null
    if (currentMission.iniciada_em) {
      const inicio = new Date(currentMission.iniciada_em)
      const fim = new Date(agora)
      tempoExecucao = Math.floor((fim.getTime() - inicio.getTime()) / 1000)
    }

    // Calcular pontuação dinâmica
    const pontosBase = currentMission.pontos_base || currentMission.pontos_total || currentMission.pontos || 50
    const pontosFinais = calculateDynamicPoints(
      pontosBase, 
      qualidade || 5, 
      tempoExecucao, 
      currentMission.eh_missao_extra || false
    )

    // Gerar badges de conquista
    const badges = generateAchievementBadges(
      qualidade || 5, 
      tempoExecucao,
      false // TODO: Verificar se é primeira missão do usuário
    )

    // Dados básicos para update - usando apenas campos obrigatórios
    const updateData: any = {
      status: 'concluida',
      executada_por: usuario,
      updated_at: agora
    }

    // Adicionar campos opcionais se existirem na estrutura
    if ('concluida_em' in currentMission) updateData.concluida_em = agora
    if ('evidencia_urls' in currentMission) updateData.evidencia_urls = evidencias || []
    if ('observacoes_execucao' in currentMission) updateData.observacoes_execucao = observacoes || null
    if ('qualidade_execucao' in currentMission) updateData.qualidade_execucao = qualidade || 5
    if ('tempo_total_execucao_segundos' in currentMission) updateData.tempo_total_execucao_segundos = tempoExecucao
    // pontos_total appears to be a computed column - removing direct update
    // if ('pontos_total' in currentMission) updateData.pontos_total = pontosFinais
    if ('pontos_ganhos' in currentMission) updateData.pontos_ganhos = pontosFinais
    if ('badges_ganhas' in currentMission) updateData.badges_ganhas = badges

    console.log('📝 Campos que serão atualizados:', Object.keys(updateData))
    console.log('🎯 Pontos calculados:', pontosBase, '→', pontosFinais)
    console.log('🏆 Badges conquistadas:', badges)

    const { data: updatedMission, error } = await supabase
      .from('missoes_diarias')
      .update(updateData)
      .eq('id', missaoId)
      .select()
      .single()

    if (error) {
      console.error('❌ Erro ao executar missão:', error)
      throw new Error(`Erro ao executar missão: ${error.message}`)
    }

    console.log('✅ Missão executada com sucesso')
    
    // Gerar mensagem motivacional personalizada
    const mensagemMotivacional = generateMotivationalMessage(
      'complete', 
      usuario, 
      pontosFinais, 
      qualidade || 5, 
      tempoExecucao || undefined
    )
    
    return NextResponse.json({ 
      success: true,
      mission: updatedMission,
      pontos_ganhos: pontosFinais,
      pontos_base: pontosBase,
      bonus_pontos: pontosFinais - pontosBase,
      tempo_execucao: tempoExecucao,
      badges_conquistadas: badges,
      qualidade: qualidade || 5,
      message: mensagemMotivacional,
      detalhes: {
        tempo_formatado: tempoExecucao ? `${Math.floor(tempoExecucao / 60)}m ${tempoExecucao % 60}s` : null,
        eficiencia: tempoExecucao && tempoExecucao < 300 ? 'Alta' : tempoExecucao && tempoExecucao < 600 ? 'Média' : 'Normal',
        qualidade_texto: qualidade === 5 ? 'Perfeita' : qualidade >= 4 ? 'Excelente' : qualidade >= 3 ? 'Boa' : 'Regular'
      }
    })
  } catch (error: any) {
    console.error('💥 Erro na função executeMission:', error)
    console.error('💥 Stack trace:', error.stack)
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
    const { searchParams } = new URL(`http://localhost:3000?${data}`)
    const dataInicio = searchParams.get('data_inicio') || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    const dataFim = searchParams.get('data_fim') || new Date().toISOString().split('T')[0]
    
    // Se lojaId fornecido, buscar dados específicos da loja
    if (lojaId) {
      const { data: missionsData, error } = await supabase
        .from('v_missoes_timeline')
        .select('status, pontos_total, qualidade, data_missao')
        .eq('loja_id', lojaId)
        .gte('data_missao', dataInicio)
        .lte('data_missao', dataFim)

      if (error) {
        throw new Error(`Erro ao buscar dados da loja: ${error.message}`)
      }

      // Calcular estatísticas da loja para gamificação
      const missoesTotais = missionsData.length
      const missoesCompletadas = missionsData.filter((m: any) => m.status === 'concluida').length
      const pontosConquistados = missionsData
        .filter((m: any) => m.status === 'concluida')
        .reduce((sum: number, m: any) => sum + (m.pontos_total || 50), 0)
      const pontosPossiveis = missoesTotais * 50 // 50 pontos por missão
      
      // Calcular streak (dias consecutivos com atividade)
      const diasComAtividade = Array.from(new Set(missionsData
        .filter((m: any) => m.status === 'concluida')
        .map((m: any) => m.data_missao)))
      
      let streakAtual = 0
      const hoje = new Date()
      for (let i = 0; i < 30; i++) {
        const dataCheck = new Date(hoje)
        dataCheck.setDate(dataCheck.getDate() - i)
        const dataStr = dataCheck.toISOString().split('T')[0]
        
        if (diasComAtividade.includes(dataStr)) {
          streakAtual++
        } else {
          break
        }
      }

      // Buscar nome da loja
      const { data: lojaInfo } = await supabase
        .from('lojas')
        .select('nome')
        .eq('id', lojaId)
        .single()

      return NextResponse.json({
        loja_id: lojaId,
        loja_nome: lojaInfo?.nome || 'Loja',
        missoes_totais: missoesTotais,
        missoes_completadas: missoesCompletadas,
        pontos_conquistados: pontosConquistados,
        pontos_possiveis: pontosPossiveis,
        pontos_total: pontosConquistados, // Total acumulado
        percentual_eficiencia: pontosPossiveis > 0 ? (pontosConquistados / pontosPossiveis) * 100 : 0,
        streak_atual: streakAtual,
        maior_streak: streakAtual, // TODO: calcular histórico real
        periodo: {
          inicio: dataInicio,
          fim: dataFim
        }
      })
    }

    // Buscar dados gerais (código original mantido)
    const { data: weekData, error } = await supabase
      .from('v_mission_control_dashboard')
      .select('*')
      .gte('data_missao', dataInicio)
      .lte('data_missao', dataFim)
      .order('data_missao', { ascending: false })

    if (error) {
      throw new Error(`Erro ao buscar estatísticas: ${error.message}`)
    }

    // Processar tendências e estatísticas
    const stats = {
      ultimos_dias: weekData,
      tendencia_conclusao: calculateTrend(weekData, 'percentual_conclusao'),
      tendencia_qualidade: calculateTrend(weekData, 'qualidade_media'),
      total_pontos_periodo: weekData.reduce((sum: number, d: any) => sum + (d.pontos_total_dia || 0), 0),
      media_missoes_dia: weekData.length > 0 
        ? weekData.reduce((sum: number, d: any) => sum + (d.total_missoes || 0), 0) / weekData.length 
        : 0
    }

    return NextResponse.json({
      stats,
      source: 'v_mission_control_dashboard',
      debug: {
        dias_analisados: weekData.length,
        periodo: `${dataInicio} a ${dataFim}`
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