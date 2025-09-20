// app/api/gamification/route.ts
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Cliente Supabase com service role
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

// Função auxiliar para atualizar nível
async function updateUserLevel(userId: string) {
  const { data: userData } = await supabaseAdmin
    .from('user_gamification')
    .select('total_xp')
    .eq('user_id', userId)
    .single()

  if (!userData) return

  // Lógica de níveis (cada 1000 XP = 1 nível)
  const novoNivel = Math.floor(userData.total_xp / 1000) + 1

  await supabaseAdmin
    .from('user_gamification')
    .update({ nivel_atual: novoNivel })
    .eq('user_id', userId)
}

export async function GET(request: NextRequest) {
  try {
    console.log('🎮 Iniciando API Gamification...')
    
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || 'user_gamification'
    const userId = searchParams.get('userId')
    const lojaId = searchParams.get('lojaId')
    const periodo = searchParams.get('periodo') || 'semanal'
    const limit = parseInt(searchParams.get('limit') || '10')
    
    console.log('🎯 Parâmetros:', { action, userId, lojaId, periodo, limit })

    switch (action) {
      case 'user_gamification':
        return await getUserGamification(supabaseAdmin, userId!, lojaId)
      case 'system_config':
        return await getSystemConfig(supabaseAdmin)
      case 'ranking':
        return await getRanking(supabaseAdmin, lojaId, periodo, limit)
      case 'badges':
        return await getUserBadges(supabaseAdmin, userId!)
      case 'stats':
        return await getGamificationStats(supabaseAdmin, userId!, lojaId)
      default:
        return NextResponse.json({ error: 'Ação não reconhecida' }, { status: 400 })
    }
  } catch (error) {
    console.error('💥 Erro na API Gamification:', error)
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
      case 'update_points':
        return await updatePoints(supabaseAdmin, body)
      case 'update_streak':
        return await updateStreak(supabaseAdmin, body)
      case 'award_badge':
        return await awardBadge(supabaseAdmin, body)
      case 'update_level':
        return await updateUserLevel(body.userId)
      case 'create_user_gamification':
        return await createUserGamification(supabaseAdmin, body)
      default:
        return NextResponse.json({ error: 'Ação não reconhecida' }, { status: 400 })
    }
  } catch (error) {
    console.error('💥 Erro na API Gamification POST:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' }, 
      { status: 500 }
    )
  }
}

// ========================================
// FUNÇÕES GET
// ========================================

// Buscar dados de gamificação do usuário
async function getUserGamification(supabase: any, userId: string, lojaId?: string | null) {
  try {
    console.log('🔍 Buscando gamificação para usuário:', userId, 'loja:', lojaId)
    
    let query = supabase
      .from('usuario_gamificacao')
      .select('*')
      .eq('usuario_id', userId)

    if (lojaId) {
      query = query.eq('loja_id', lojaId)
    }

    const { data: gamification, error } = await query.single()

    if (error) {
      console.log('⚠️ Usuário não encontrado na gamificação, criando entrada...')
      
      // Se não existe, criar entrada inicial
      const newGamification = {
        usuario_id: userId,
        loja_id: lojaId || 'loja-default',
        pontos_totais_historico: 0,
        pontos_disponiveis: 0,
        pontos_hoje: 0,
        pontos_semana: 0,
        pontos_mes: 0,
        level_atual: 1,
        xp_atual: 0,
        xp_proximo_level: 100,
        titulo_atual: 'Novato',
        streak_dias_consecutivos: 0,
        streak_missoes_perfeitas: 0,
        maior_streak_historico: 0,
        badges_coletadas: [],
        conquistas_desbloqueadas: [],
        titulos_desbloqueados: ['Novato'],
        total_missoes_executadas: 0,
        total_missoes_perfeitas: 0,
        total_missoes_no_prazo: 0,
        total_missoes_antecipadas: 0,
        total_missoes_criticas_resolvidas: 0,
        posicao_ranking_loja: null,
        posicao_ranking_rede: null,
        posicao_ranking_categoria: null,
        meta_pontos_diaria: 300,
        meta_missoes_diarias: 8,
        meta_qualidade_minima: 4.0,
        data_inicio_sistema: new Date().toISOString().split('T')[0],
        data_ultima_atividade: new Date().toISOString().split('T')[0]
      }

      const { data: created, error: createError } = await supabase
        .from('usuario_gamificacao')
        .insert(newGamification)
        .select()
        .single()

      if (createError) {
        console.error('❌ Erro ao criar gamificação:', createError)
        throw new Error(`Erro ao criar gamificação: ${createError.message}`)
      }

      return NextResponse.json({
        gamification: created,
        source: 'created',
        debug: {
          usuario_id: userId,
          loja_id: lojaId,
          motivo: 'Entrada criada automaticamente'
        }
      })
    }

    return NextResponse.json({
      gamification,
      source: 'database',
      debug: {
        usuario_id: userId,
        loja_id: lojaId,
        nivel_atual: gamification.level_atual,
        pontos_hoje: gamification.pontos_hoje,
        streak: gamification.streak_dias_consecutivos
      }
    })
    
  } catch (error) {
    console.error('💥 Erro ao buscar gamificação:', error)
    throw error
  }
}

// Buscar configurações do sistema
async function getSystemConfig(supabase: any) {
  try {
    console.log('⚙️ Buscando configurações do sistema...')
    
    const { data: configs, error } = await supabase
      .from('mission_control_config')
      .select('*')
      .eq('categoria', 'gamificacao')
      .eq('ativo', true)

    if (error) {
      console.error('❌ Erro ao buscar configs:', error)
      throw new Error(`Erro ao buscar configurações: ${error.message}`)
    }

    // Transformar array de configs em objeto estruturado
    const systemConfig = {
      pontos_por_nivel: {},
      badges_sistema: {},
      titulos_por_level: {},
      multiplicador_streak: 1.5,
      multiplicador_weekend: 1.2
    }

    configs?.forEach((config: any) => {
      switch (config.chave) {
        case 'pontos_por_nivel':
        case 'badges_sistema':
        case 'titulos_por_level':
          (systemConfig as any)[config.chave] = config.valor
          break
        case 'multiplicador_streak':
        case 'multiplicador_weekend':
          (systemConfig as any)[config.chave] = parseFloat(config.valor)
          break
      }
    })

    return NextResponse.json({
      config: systemConfig,
      source: 'database',
      debug: {
        configs_carregadas: configs?.length || 0,
        badges_disponiveis: Object.keys(systemConfig.badges_sistema).length,
        levels_configurados: Object.keys(systemConfig.pontos_por_nivel).length
      }
    })
    
  } catch (error) {
    console.error('💥 Erro ao buscar configurações:', error)
    throw error
  }
}

// Buscar ranking
async function getRanking(supabase: any, lojaId?: string | null, periodo: string = 'semanal', limit: number = 10) {
  try {
    console.log('🏆 Buscando ranking:', { lojaId, periodo, limit })
    
    // Query base para ranking
    let query = supabase
      .from('usuario_gamificacao')
      .select(`
        usuario_id,
        pontos_totais_historico,
        pontos_hoje,
        pontos_semana,
        pontos_mes,
        level_atual,
        titulo_atual,
        streak_dias_consecutivos,
        badges_coletadas,
        qualidade_media,
        total_missoes_executadas,
        usuarios!inner(nome)
      `)

    if (lojaId) {
      query = query.eq('loja_id', lojaId)
    }

    // Ordenar por pontos baseado no período
    const orderField = periodo === 'diario' ? 'pontos_hoje' : 
                      periodo === 'semanal' ? 'pontos_semana' : 
                      periodo === 'mensal' ? 'pontos_mes' : 
                      'pontos_totais_historico'

    query = query.order(orderField, { ascending: false }).limit(limit)

    const { data: ranking, error } = await query

    if (error) {
      console.error('❌ Erro ao buscar ranking:', error)
      throw new Error(`Erro ao buscar ranking: ${error.message}`)
    }

    // Transformar dados para o formato esperado
    const rankingFormatted = ranking?.map((user: any, index: number) => ({
      usuario_id: user.usuario_id,
      nome: user.usuarios?.nome || 'Usuário Desconhecido',
      titulo: user.titulo_atual,
      pontos_totais: user.pontos_totais_historico,
      pontos_hoje: user.pontos_hoje,
      pontos_periodo: periodo === 'diario' ? user.pontos_hoje : 
                     periodo === 'semanal' ? user.pontos_semana : 
                     periodo === 'mensal' ? user.pontos_mes : 
                     user.pontos_totais_historico,
      level_atual: user.level_atual,
      streak_dias: user.streak_dias_consecutivos,
      posicao: index + 1,
      badges_count: user.badges_coletadas?.length || 0,
      qualidade_media: user.qualidade_media || 0,
      missoes_total: user.total_missoes_executadas
    })) || []

    return NextResponse.json({
      ranking: rankingFormatted,
      source: 'database',
      debug: {
        periodo,
        loja_filtro: lojaId,
        total_usuarios: rankingFormatted.length,
        order_field: orderField
      }
    })
    
  } catch (error) {
    console.error('💥 Erro ao buscar ranking:', error)
    throw error
  }
}

// Buscar badges do usuário
async function getUserBadges(supabase: any, userId: string) {
  try {
    console.log('🏅 Buscando badges do usuário:', userId)
    
    const { data: gamification, error } = await supabase
      .from('usuario_gamificacao')
      .select('badges_coletadas, conquistas_desbloqueadas')
      .eq('usuario_id', userId)
      .single()

    if (error) {
      console.error('❌ Erro ao buscar badges:', error)
      return NextResponse.json({
        badges: [],
        conquistas: [],
        source: 'empty'
      })
    }

    return NextResponse.json({
      badges: gamification.badges_coletadas || [],
      conquistas: gamification.conquistas_desbloqueadas || [],
      source: 'database'
    })
    
  } catch (error) {
    console.error('💥 Erro ao buscar badges:', error)
    throw error
  }
}

// Buscar estatísticas gerais de gamificação
async function getGamificationStats(supabase: any, userId: string, lojaId?: string | null) {
  try {
    console.log('📊 Buscando stats de gamificação:', userId)
    
    // Buscar dados do usuário
    const { data: userGamif, error: userError } = await supabase
      .from('usuario_gamificacao')
      .select('*')
      .eq('usuario_id', userId)
      .single()

    if (userError) {
      throw new Error(`Erro ao buscar dados do usuário: ${userError.message}`)
    }

    // Buscar ranking do usuário na loja
    let rankingQuery = supabase
      .from('usuario_gamificacao')
      .select('usuario_id, pontos_totais_historico')
      .order('pontos_totais_historico', { ascending: false })

    if (lojaId) {
      rankingQuery = rankingQuery.eq('loja_id', lojaId)
    }

    const { data: rankingData, error: rankingError } = await rankingQuery

    let posicaoRanking = null
    if (!rankingError && rankingData) {
      const userIndex = rankingData.findIndex((u: any) => u.usuario_id === userId)
      posicaoRanking = userIndex !== -1 ? userIndex + 1 : null
    }

    // Calcular estatísticas adicionais
    const stats = {
      ...userGamif,
      posicao_ranking_atual: posicaoRanking,
      total_usuarios_loja: rankingData?.length || 0,
      percentil: posicaoRanking ? Math.floor(((rankingData.length - posicaoRanking) / rankingData.length) * 100) : 0,
      proxima_badge: null, // TODO: calcular próxima badge disponível
      progresso_proximo_nivel: userGamif.xp_atual / userGamif.xp_proximo_level * 100
    }

    return NextResponse.json({
      stats,
      source: 'database',
      debug: {
        usuario_id: userId,
        nivel_atual: stats.level_atual,
        ranking_posicao: posicaoRanking,
        total_badges: stats.badges_coletadas?.length || 0
      }
    })
    
  } catch (error) {
    console.error('💥 Erro ao buscar stats:', error)
    throw error
  }
}

// ========================================
// FUNÇÕES POST
// ========================================

// Atualizar pontos do usuário
async function updatePoints(supabase: any, body: any) {
  try {
    const { userId, lojaId, pontos, missaoId, qualidade, badges } = body
    console.log('💰 Atualizando pontos:', { userId, pontos, badges })

    // Buscar dados atuais do usuário
    const { data: currentData, error: fetchError } = await supabase
      .from('usuario_gamificacao')
      .select('*')
      .eq('usuario_id', userId)
      .eq('loja_id', lojaId)
      .single()

    if (fetchError) {
      throw new Error(`Usuário não encontrado na gamificação: ${fetchError.message}`)
    }

    // Calcular novos totais
    const novosPontos: any = {
      pontos_totais_historico: currentData.pontos_totais_historico + pontos,
      pontos_disponiveis: currentData.pontos_disponiveis + pontos,
      pontos_hoje: currentData.pontos_hoje + pontos,
      pontos_semana: currentData.pontos_semana + pontos,
      pontos_mes: currentData.pontos_mes + pontos,
      xp_atual: currentData.xp_atual + Math.floor(pontos * 0.5), // XP = 50% dos pontos
      total_missoes_executadas: currentData.total_missoes_executadas + 1,
      data_ultima_atividade: new Date().toISOString().split('T')[0],
      data_ultima_missao_completa: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // Se tem qualidade, atualizar estatísticas 
    if (qualidade) {
      const totalMissoes = currentData.total_missoes_executadas + 1
      const novaQualidadeMedia = ((currentData.qualidade_media || 0) * currentData.total_missoes_executadas + qualidade) / totalMissoes
      
      novosPontos.qualidade_media = novaQualidadeMedia
      
      if (qualidade === 5) {
        novosPontos.total_missoes_perfeitas = currentData.total_missoes_perfeitas + 1
        novosPontos.streak_missoes_perfeitas = currentData.streak_missoes_perfeitas + 1
      } else {
        novosPontos.streak_missoes_perfeitas = 0
      }
    }

    // Se ganhou badges, adicionar
    if (badges && badges.length > 0) {
      const badgesAtuais = currentData.badges_coletadas || []
      const novasBadges = Array.from(new Set([...badgesAtuais, ...badges]))
      novosPontos.badges_coletadas = novasBadges
    }

    // Verificar se subiu de nível
    const configNivel = await getNextLevelXP(supabase, currentData.level_atual)
    if (novosPontos.xp_atual >= configNivel.xp_necessario) {
      novosPontos.level_atual = currentData.level_atual + 1
      novosPontos.xp_proximo_level = configNivel.proximo_level_xp
      
      // Buscar novo título
      const novoTitulo = await getTitleForLevel(supabase, novosPontos.level_atual)
      if (novoTitulo) {
        novosPontos.titulo_atual = novoTitulo
      }
    }

    // Atualizar no banco
    const { data: updated, error: updateError } = await supabase
      .from('usuario_gamificacao')
      .update(novosPontos)
      .eq('usuario_id', userId)
      .eq('loja_id', lojaId)
      .select()
      .single()

    if (updateError) {
      throw new Error(`Erro ao atualizar pontos: ${updateError.message}`)
    }

    return NextResponse.json({
      success: true,
      gamification: updated,
      pontos_adicionados: pontos,
      nivel_anterior: currentData.level_atual,
      nivel_atual: updated.level_atual,
      subiu_nivel: updated.level_atual > currentData.level_atual,
      badges_novas: badges || [],
      message: `+${pontos} pontos conquistados!`
    })
    
  } catch (error) {
    console.error('💥 Erro ao atualizar pontos:', error)
    throw error
  }
}

// Atualizar streak do usuário
async function updateStreak(supabase: any, body: any) {
  try {
    const { userId, lojaId, incrementar = true } = body
    console.log('🔥 Atualizando streak:', { userId, incrementar })

    const hoje = new Date().toISOString().split('T')[0]

    // Buscar dados atuais
    const { data: currentData, error: fetchError } = await supabase
      .from('usuario_gamificacao')
      .select('*')
      .eq('usuario_id', userId)
      .eq('loja_id', lojaId)
      .single()

    if (fetchError) {
      throw new Error(`Usuário não encontrado: ${fetchError.message}`)
    }

    let novoStreak = currentData.streak_dias_consecutivos

    if (incrementar) {
      // Verificar se é um novo dia
      if (currentData.data_ultimo_streak !== hoje) {
        novoStreak += 1
      }
    } else {
      // Quebrar streak
      novoStreak = 0
    }

    // Atualizar maior streak se necessário
    const maiorStreak = Math.max(currentData.maior_streak_historico, novoStreak)

    const updateData = {
      streak_dias_consecutivos: novoStreak,
      maior_streak_historico: maiorStreak,
      data_ultimo_streak: hoje,
      updated_at: new Date().toISOString()
    }

    const { data: updated, error: updateError } = await supabase
      .from('usuario_gamificacao')
      .update(updateData)
      .eq('usuario_id', userId)
      .eq('loja_id', lojaId)
      .select()
      .single()

    if (updateError) {
      throw new Error(`Erro ao atualizar streak: ${updateError.message}`)
    }

    return NextResponse.json({
      success: true,
      streak_dias: novoStreak,
      recorde_quebrado: maiorStreak > currentData.maior_streak_historico,
      gamification: updated
    })
    
  } catch (error) {
    console.error('💥 Erro ao atualizar streak:', error)
    throw error
  }
}

// Conceder badge
async function awardBadge(supabase: any, body: any) {
  try {
    const { userId, lojaId, badgeId, pontosBronus = 0 } = body
    console.log('🏅 Concedendo badge:', { userId, badgeId })

    const { data: currentData, error: fetchError } = await supabase
      .from('usuario_gamificacao')
      .select('badges_coletadas, pontos_totais_historico, pontos_disponiveis')
      .eq('usuario_id', userId)
      .eq('loja_id', lojaId)
      .single()

    if (fetchError) {
      throw new Error(`Usuário não encontrado: ${fetchError.message}`)
    }

    const badgesAtuais = currentData.badges_coletadas || []
    
    // Verificar se já tem a badge
    if (badgesAtuais.includes(badgeId)) {
      return NextResponse.json({
        success: false,
        message: 'Badge já conquistada',
        badge_id: badgeId
      })
    }

    // Adicionar nova badge
    const novasBadges = [...badgesAtuais, badgeId]
    
    const updateData: any = {
      badges_coletadas: novasBadges,
      updated_at: new Date().toISOString()
    }

    // Se tem pontos bônus, adicionar
    if (pontosBronus > 0) {
      updateData.pontos_totais_historico = currentData.pontos_totais_historico + pontosBronus
      updateData.pontos_disponiveis = currentData.pontos_disponiveis + pontosBronus
    }

    const { data: updated, error: updateError } = await supabase
      .from('usuario_gamificacao')
      .update(updateData)
      .eq('usuario_id', userId)
      .eq('loja_id', lojaId)
      .select()
      .single()

    if (updateError) {
      throw new Error(`Erro ao conceder badge: ${updateError.message}`)
    }

    return NextResponse.json({
      success: true,
      badge_id: badgeId,
      pontos_bonus: pontosBronus,
      total_badges: novasBadges.length,
      gamification: updated
    })
    
  } catch (error) {
    console.error('💥 Erro ao conceder badge:', error)
    throw error
  }
}

// Criar entrada de gamificação para novo usuário
async function createUserGamification(supabase: any, body: any) {
  try {
    const { userId, lojaId } = body
    console.log('🆕 Criando gamificação para usuário:', { userId, lojaId })

    const newGamification = {
      usuario_id: userId,
      loja_id: lojaId,
      pontos_totais_historico: 0,
      pontos_disponiveis: 0,
      pontos_hoje: 0,
      pontos_semana: 0,
      pontos_mes: 0,
      level_atual: 1,
      xp_atual: 0,
      xp_proximo_level: 100,
      titulo_atual: 'Novato',
      streak_dias_consecutivos: 0,
      streak_missoes_perfeitas: 0,
      maior_streak_historico: 0,
      badges_coletadas: [],
      conquistas_desbloqueadas: [],
      titulos_desbloqueados: ['Novato'],
      total_missoes_executadas: 0,
      total_missoes_perfeitas: 0,
      total_missoes_no_prazo: 0,
      total_missoes_antecipadas: 0,
      total_missoes_criticas_resolvidas: 0,
      meta_pontos_diaria: 300,
      meta_missoes_diarias: 8,
      meta_qualidade_minima: 4.0,
      data_inicio_sistema: new Date().toISOString().split('T')[0],
      data_ultima_atividade: new Date().toISOString().split('T')[0]
    }

    const { data: created, error } = await supabase
      .from('usuario_gamificacao')
      .insert(newGamification)
      .select()
      .single()

    if (error) {
      throw new Error(`Erro ao criar gamificação: ${error.message}`)
    }

    return NextResponse.json({
      success: true,
      gamification: created,
      message: 'Gamificação criada com sucesso!'
    })
    
  } catch (error) {
    console.error('💥 Erro ao criar gamificação:', error)
    throw error
  }
}

// ========================================
// FUNÇÕES AUXILIARES
// ========================================

// Buscar XP necessário para próximo nível
async function getNextLevelXP(supabase: any, currentLevel: number) {
  const { data: config, error } = await supabase
    .from('mission_control_config')
    .select('valor')
    .eq('chave', 'pontos_por_nivel')
    .single()

  if (error || !config) {
    return { xp_necessario: 999999, proximo_level_xp: 999999 }
  }

  const pontosPerLevel = config.valor
  const nextLevel = currentLevel + 1
  const xpNecessario = pontosPerLevel[String(nextLevel)] || 999999
  const proximoLevelXP = pontosPerLevel[String(nextLevel + 1)] || 999999

  return { xp_necessario: xpNecessario, proximo_level_xp: proximoLevelXP }
}

// Buscar título para nível
async function getTitleForLevel(supabase: any, level: number) {
  const { data: config, error } = await supabase
    .from('mission_control_config')
    .select('valor')
    .eq('chave', 'titulos_por_level')
    .single()

  if (error || !config) {
    return null
  }

  return config.valor[String(level)] || null
}