// src/app/api/gamificacao/route.ts
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { LigaTipo, LIGAS_CONFIG, LojaGamificacao, LojaRanking } from '@/lib/types/database'

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
    const action = searchParams.get('action') || 'loja'

    if (!lojaId) {
      return NextResponse.json({ error: 'loja_id é obrigatório' }, { status: 400 })
    }

    switch (action) {
      case 'loja':
        return await getLojaGamificacao(lojaId)
      case 'ranking':
        return await getRankingCompleto()
      case 'badges':
        return await getBadgesDisponiveis()
      default:
        return NextResponse.json({ error: 'Ação não reconhecida' }, { status: 400 })
    }
  } catch (error) {
    console.error('Erro na API de gamificação:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

async function getLojaGamificacao(lojaId: string) {
  try {
    // Primeiro, verificar se a loja já existe na tabela de gamificação
    let { data: lojaGaming, error } = await supabaseAdmin
      .from('lojas_gamificacao')
      .select('*')
      .eq('loja_id', lojaId)
      .single()

    // Se não existir, criar um registro inicial
    if (error && error.code === 'PGRST116') {
      const novaLojaGaming = {
        loja_id: lojaId,
        liga_atual: 'BRONZE' as LigaTipo,
        pontos_mes_atual: 0,
        pontos_total: 0,
        streak_dias: 0,
        maior_streak: 0,
        badges_conquistadas: [],
        ultima_atividade: new Date().toISOString(),
        promocoes: 0,
        rebaixamentos: 0
      }

      const { data: created, error: createError } = await supabaseAdmin
        .from('lojas_gamificacao')
        .insert(novaLojaGaming)
        .select()
        .single()

      if (createError) {
        throw createError
      }

      lojaGaming = created
    } else if (error) {
      throw error
    }

    // Buscar dados da loja
    const { data: loja, error: lojaError } = await supabaseAdmin
      .from('lojas')
      .select('nome')
      .eq('id', lojaId)
      .single()

    if (lojaError) {
      throw lojaError
    }

    // Calcular ranking
    const ranking = await calcularRanking(lojaId)

    return NextResponse.json({
      loja: lojaGaming,
      ranking,
      badges: await getBadgesConquistadas(lojaGaming.badges_conquistadas || [])
    })
  } catch (error) {
    console.error('Erro ao buscar gamificação da loja:', error)
    throw error
  }
}

async function calcularRanking(lojaId: string): Promise<LojaRanking> {
  // Buscar todas as lojas para calcular ranking
  const { data: todasLojas, error } = await supabaseAdmin
    .from('lojas_gamificacao')
    .select(`
      loja_id,
      liga_atual,
      pontos_mes_atual,
      pontos_total,
      badges_conquistadas,
      streak_dias,
      lojas!inner(nome)
    `)
    .order('pontos_mes_atual', { ascending: false })

  if (error) {
    throw error
  }

  const lojaAtual = todasLojas.find(l => l.loja_id === lojaId)
  if (!lojaAtual) {
    throw new Error('Loja não encontrada no ranking')
  }

  // Calcular posições
  const posicaoGeral = todasLojas.findIndex(l => l.loja_id === lojaId) + 1
  const lojasNaMesmaLiga = todasLojas.filter(l => l.liga_atual === lojaAtual.liga_atual)
  const posicaoLiga = lojasNaMesmaLiga.findIndex(l => l.loja_id === lojaId) + 1

  // Calcular progresso para próxima liga
  const ligaAtual = lojaAtual.liga_atual as LigaTipo
  const pontosMes = lojaAtual.pontos_mes_atual
  const ligaConfig = LIGAS_CONFIG[ligaAtual]
  const progressoProxima = ligaConfig.percentual_promocao === Infinity ? 100 :
    Math.min(100, (pontosMes / ligaConfig.percentual_promocao) * 100)

  return {
    loja_id: lojaId,
    loja_nome: (lojaAtual as any).lojas.nome,
    liga_atual: ligaAtual,
    pontos_mes: pontosMes,
    pontos_total: lojaAtual.pontos_total,
    posicao_liga: posicaoLiga,
    posicao_geral: posicaoGeral,
    badges_total: (lojaAtual.badges_conquistadas || []).length,
    streak_atual: lojaAtual.streak_dias,
    progresso_proxima_liga: progressoProxima
  }
}

async function getRankingCompleto() {
  const { data: lojas, error } = await supabaseAdmin
    .from('lojas_gamificacao')
    .select(`
      loja_id,
      liga_atual,
      pontos_mes_atual,
      pontos_total,
      badges_conquistadas,
      streak_dias,
      lojas!inner(nome)
    `)
    .order('pontos_mes_atual', { ascending: false })

  if (error) {
    throw error
  }

  const ranking = lojas.map((loja, index) => ({
    loja_id: loja.loja_id,
    loja_nome: (loja as any).lojas.nome,
    liga_atual: loja.liga_atual as LigaTipo,
    pontos_mes: loja.pontos_mes_atual,
    pontos_total: loja.pontos_total,
    posicao_liga: 0, // Será calculado por liga
    posicao_geral: index + 1,
    badges_total: (loja.badges_conquistadas || []).length,
    streak_atual: loja.streak_dias,
    progresso_proxima_liga: 0 // Será calculado
  }))

  return NextResponse.json({ ranking })
}

async function getBadgesDisponiveis() {
  // Por enquanto, retornar badges hardcoded
  const badges = [
    {
      tipo: 'PRIMEIRA_MISSAO',
      nome: 'Primeira Missão',
      descricao: 'Complete sua primeira missão',
      icone: '🎯',
      cor: '#10B981',
      pontos_requisito: 0,
      raridade: 'COMUM'
    },
    {
      tipo: 'STREAK_7_DIAS',
      nome: 'Sequência de 7 Dias',
      descricao: 'Complete missões por 7 dias consecutivos',
      icone: '🔥',
      cor: '#F59E0B',
      pontos_requisito: 0,
      raridade: 'RARO'
    },
    {
      tipo: 'PONTUACAO_100',
      nome: 'Centena',
      descricao: 'Alcance 100 pontos',
      icone: '💯',
      cor: '#8B5CF6',
      pontos_requisito: 100,
      raridade: 'COMUM'
    }
  ]

  return NextResponse.json({ badges })
}

async function getBadgesConquistadas(badgeTypes: string[]) {
  const todasBadges = await getBadgesDisponiveis()
  const badges = await todasBadges.json()
  
  return badges.badges.filter((badge: any) => badgeTypes.includes(badge.tipo))
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { loja_id, pontos, acao } = body

    if (!loja_id || pontos === undefined) {
      return NextResponse.json({ error: 'loja_id e pontos são obrigatórios' }, { status: 400 })
    }

    // Atualizar pontos da loja
    const { data: lojaAtual, error: fetchError } = await supabaseAdmin
      .from('lojas_gamificacao')
      .select('*')
      .eq('loja_id', loja_id)
      .single()

    if (fetchError) {
      throw fetchError
    }

    const novosPontosMes = lojaAtual.pontos_mes_atual + pontos
    const novosPontosTotal = lojaAtual.pontos_total + pontos
    
    // Verificar se houve promoção de liga
    const ligaAtual = lojaAtual.liga_atual as LigaTipo
    const novaLiga = determinarLiga(novosPontosMes)
    const houvePromocao = novaLiga !== ligaAtual && isPromocao(ligaAtual, novaLiga)

    const updateData = {
      pontos_mes_atual: novosPontosMes,
      pontos_total: novosPontosTotal,
      liga_atual: novaLiga,
      ultima_atividade: new Date().toISOString(),
      ...(houvePromocao && { promocoes: lojaAtual.promocoes + 1 })
    }

    const { error: updateError } = await supabaseAdmin
      .from('lojas_gamificacao')
      .update(updateData)
      .eq('loja_id', loja_id)

    if (updateError) {
      throw updateError
    }

    return NextResponse.json({ 
      success: true, 
      nova_liga: novaLiga,
      promocao: houvePromocao,
      pontos_adicionados: pontos
    })
  } catch (error) {
    console.error('Erro ao atualizar pontos:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

function determinarLiga(pontos: number): LigaTipo {
  // Usando pontos absolutos para determinação
  if (pontos >= 2500) return 'DIAMANTE'
  if (pontos >= 1200) return 'OURO'
  if (pontos >= 500) return 'PRATA'
  return 'BRONZE'
}

function isPromocao(ligaAnterior: LigaTipo, ligaNova: LigaTipo): boolean {
  const ordem: LigaTipo[] = ['BRONZE', 'PRATA', 'OURO', 'DIAMANTE']
  return ordem.indexOf(ligaNova) > ordem.indexOf(ligaAnterior)
}