import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase/server'
import type { PedidoEvento } from '@/lib/types/database'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface RouteParams {
  params: {
    id: string
  }
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
  const supabase = getServerSupabase()
    const pedidoId = params.id
    
    if (!pedidoId) {
      return NextResponse.json(
        { error: 'ID do pedido é obrigatório' },
        { status: 400 }
      )
    }
    
    // Buscar eventos do pedido ordenados por data (mais recente primeiro)
    const { data: eventos, error } = await supabase
      .from('pedido_eventos')
      .select('*')
      .eq('pedido_id', pedidoId)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Erro ao buscar eventos:', error)
      return NextResponse.json(
        { error: 'Erro ao buscar eventos do pedido' },
        { status: 500 }
      )
    }
    
    return NextResponse.json(eventos)
  } catch (error) {
    console.error('Erro interno:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
  const supabase = getServerSupabase()
    const pedidoId = params.id
    const body = await request.json()
    
    if (!pedidoId) {
      return NextResponse.json(
        { error: 'ID do pedido é obrigatório' },
        { status: 400 }
      )
    }
    
    if (!body.tipo || !body.titulo) {
      return NextResponse.json(
        { error: 'Tipo e título são obrigatórios' },
        { status: 400 }
      )
    }
    
    // Verificar se o pedido existe
    const { data: pedido, error: pedidoError } = await supabase
      .from('pedidos')
      .select('id, status')
      .eq('id', pedidoId)
      .single()
    
    if (pedidoError || !pedido) {
      return NextResponse.json(
        { error: 'Pedido não encontrado' },
        { status: 404 }
      )
    }
    
    // Criar novo evento
    const novoEvento: Partial<PedidoEvento> = {
      pedido_id: pedidoId,
      tipo: body.tipo,
      titulo: body.titulo,
      descricao: body.descricao || null,
      status_anterior: body.status_anterior || null,
      status_novo: body.status_novo || null,
      usuario: body.usuario || 'api',
      automatico: body.automatico || false
    }
    
    const { data: evento, error } = await supabase
      .from('pedido_eventos')
      .insert(novoEvento)
      .select()
      .single()
    
    if (error) {
      console.error('Erro ao criar evento:', error)
      return NextResponse.json(
        { error: 'Erro ao criar evento' },
        { status: 500 }
      )
    }
    
    return NextResponse.json(evento, { status: 201 })
  } catch (error) {
    console.error('Erro interno:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}