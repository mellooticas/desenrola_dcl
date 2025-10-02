// src/app/api/renovacao-diaria/route.ts
// API para gerenciar renovação diária do sistema de gamificação

import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const action = searchParams.get('action')

  try {
    switch (action) {
      case 'status':
        return await getStatusRenovacao()
      
      case 'proxima':
        return await getProximaRenovacao()
      
      case 'historico':
        return await getHistoricoRenovacao()
      
      case 'deve-executar':
        return await getDeveExecutar()
      
      default:
        return NextResponse.json({
          error: 'Ação não especificada',
          acoes_disponiveis: ['status', 'proxima', 'historico', 'deve-executar', 'executar']
        }, { status: 400 })
    }
  } catch (error) {
    console.error('Erro na API de renovação:', error)
    return NextResponse.json({
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json()

    if (action === 'executar') {
      return await executarRenovacao()
    }

    return NextResponse.json({
      error: 'Ação POST não reconhecida',
      acao_disponivel: 'executar'
    }, { status: 400 })

  } catch (error) {
    console.error('Erro ao executar renovação:', error)
    return NextResponse.json({
      error: 'Erro ao executar renovação',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}

// Obter status da última renovação
async function getStatusRenovacao() {
  const { data, error } = await supabase
    .rpc('status_ultima_renovacao')

  if (error) {
    throw error
  }

  const status = data?.[0] || null

  return NextResponse.json({
    status_renovacao: status,
    timestamp: new Date().toISOString(),
    timezone: 'America/Sao_Paulo'
  })
}

// Obter informações da próxima renovação
async function getProximaRenovacao() {
  const { data, error } = await supabase
    .rpc('proxima_renovacao')

  if (error) {
    throw error
  }

  const proxima = data?.[0] || null

  return NextResponse.json({
    proxima_renovacao: proxima,
    timestamp_atual: new Date().toISOString(),
    timezone: 'America/Sao_Paulo'
  })
}

// Obter histórico de renovações
async function getHistoricoRenovacao() {
  const { data, error } = await supabase
    .from('renovacao_diaria')
    .select('*')
    .order('data_renovacao', { ascending: false })
    .limit(30)

  if (error) {
    throw error
  }

  return NextResponse.json({
    historico: data,
    total_registros: data?.length || 0
  })
}

// Verificar se deve executar renovação agora
async function getDeveExecutar() {
  const { data, error } = await supabase
    .rpc('deve_executar_renovacao')

  if (error) {
    throw error
  }

  return NextResponse.json({
    deve_executar: data,
    timestamp: new Date().toISOString(),
    timezone: 'America/Sao_Paulo'
  })
}

// Executar renovação diária
async function executarRenovacao() {
  // Verificar se deve executar
  const { data: deveExecutar, error: errorVerificacao } = await supabase
    .rpc('deve_executar_renovacao')

  if (errorVerificacao) {
    throw errorVerificacao
  }

  if (!deveExecutar) {
    return NextResponse.json({
      executado: false,
      motivo: 'Renovação não necessária no momento',
      timestamp: new Date().toISOString()
    })
  }

  // Executar renovação
  const { data, error } = await supabase
    .rpc('executar_renovacao_diaria')

  if (error) {
    throw error
  }

  const resultado = data?.[0] || null

  return NextResponse.json({
    executado: true,
    resultado,
    timestamp: new Date().toISOString(),
    timezone: 'America/Sao_Paulo'
  })
}