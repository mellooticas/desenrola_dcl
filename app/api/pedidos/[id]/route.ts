import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase/server'
import type { Pedido, StatusPedido } from '@/lib/types/database'

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
    
    // Buscar pedido completo com relacionamentos
    const { data: pedido, error } = await supabase
      .from('v_pedidos_kanban')
      .select('*')
      .eq('id', pedidoId)
      .single()
    
    if (error) {
      console.error('Erro ao buscar pedido:', error)
      return NextResponse.json(
        { error: 'Pedido não encontrado' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(pedido)
  } catch (error) {
    console.error('Erro interno:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(
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
    
    // Buscar pedido atual para comparação
    const { data: pedidoAtual, error: buscaError } = await supabase
      .from('pedidos')
      .select('*')
      .eq('id', pedidoId)
      .single()
    
    if (buscaError || !pedidoAtual) {
      return NextResponse.json(
        { error: 'Pedido não encontrado' },
        { status: 404 }
      )
    }
    
    // Preparar dados para atualização
    const dadosAtualizacao: Partial<Pedido> = {
      ...body,
      updated_at: new Date().toISOString(),
      updated_by: body.updated_by || 'api'
    }
    
    // Remover campos que não devem ser atualizados via API
    delete dadosAtualizacao.id
    delete dadosAtualizacao.numero_sequencial
    delete dadosAtualizacao.created_at
    delete dadosAtualizacao.created_by
    
    // Atualizar pedido
    const { data: pedidoAtualizado, error } = await supabase
      .from('pedidos')
      .update(dadosAtualizacao)
      .eq('id', pedidoId)
      .select()
      .single()
    
    if (error) {
      console.error('Erro ao atualizar pedido:', error)
      return NextResponse.json(
        { error: 'Erro ao atualizar pedido' },
        { status: 500 }
      )
    }
    
    // Se o status mudou, registrar evento
    if (body.status && body.status !== pedidoAtual.status) {
      const eventoMudancaStatus = {
        pedido_id: pedidoId,
        tipo: 'STATUS_CHANGE',
        titulo: `Status alterado para ${body.status}`,
        descricao: body.observacao_mudanca || null,
        status_anterior: pedidoAtual.status,
        status_novo: body.status,
        usuario: body.updated_by || 'api',
        automatico: false
      }
      
      await supabase
        .from('pedido_eventos')
        .insert(eventoMudancaStatus)
    }
    
    return NextResponse.json(pedidoAtualizado)
  } catch (error) {
    console.error('Erro interno:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(
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
    
    // Verificar se o pedido pode ser excluído
    const { data: pedido, error: buscaError } = await supabase
      .from('pedidos')
      .select('status')
      .eq('id', pedidoId)
      .single()
    
    if (buscaError || !pedido) {
      return NextResponse.json(
        { error: 'Pedido não encontrado' },
        { status: 404 }
      )
    }
    
    // Não permitir exclusão de pedidos já entregues
    if (pedido.status === 'ENTREGUE') {
      return NextResponse.json(
        { error: 'Não é possível excluir pedidos entregues' },
        { status: 400 }
      )
    }
    
    // Marcar como cancelado em vez de excluir
    const { error } = await supabase
      .from('pedidos')
      .update({ 
        status: 'CANCELADO',
        updated_at: new Date().toISOString(),
        updated_by: 'api'
      })
      .eq('id', pedidoId)
    
    if (error) {
      console.error('Erro ao cancelar pedido:', error)
      return NextResponse.json(
        { error: 'Erro ao cancelar pedido' },
        { status: 500 }
      )
    }
    
    // Registrar evento de cancelamento
    await supabase
      .from('pedido_eventos')
      .insert({
        pedido_id: pedidoId,
        tipo: 'STATUS_CHANGE',
        titulo: 'Pedido cancelado',
        status_anterior: pedido.status,
        status_novo: 'CANCELADO',
        usuario: 'api',
        automatico: false
      })
    
    return NextResponse.json({ message: 'Pedido cancelado com sucesso' })
  } catch (error) {
    console.error('Erro interno:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}