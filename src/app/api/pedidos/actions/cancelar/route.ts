import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
  const supabase = getServerSupabase()
    const { pedido_id, motivo, usuario } = await request.json()
    
    if (!pedido_id) {
      return NextResponse.json(
        { error: 'ID do pedido é obrigatório' },
        { status: 400 }
      )
    }
    
    // Buscar pedido atual
    const { data: pedidoAtual, error: buscaError } = await supabase
      .from('pedidos')
      .select('id, status, numero_sequencial, cliente_nome')
      .eq('id', pedido_id)
      .single()
    
    if (buscaError || !pedidoAtual) {
      return NextResponse.json(
        { error: 'Pedido não encontrado' },
        { status: 404 }
      )
    }
    
    // Verificar se pode cancelar
    if (pedidoAtual.status === 'CANCELADO') {
      return NextResponse.json(
        { error: 'Pedido já está cancelado' },
        { status: 400 }
      )
    }
    
    if (pedidoAtual.status === 'ENTREGUE') {
      return NextResponse.json(
        { error: 'Não é possível cancelar pedido já entregue' },
        { status: 400 }
      )
    }
    
    // Atualizar status para cancelado
    const { data: pedidoCancelado, error: updateError } = await supabase
      .from('pedidos')
      .update({
        status: 'CANCELADO',
        updated_at: new Date().toISOString(),
        updated_by: usuario || 'api'
      })
      .eq('id', pedido_id)
      .select()
      .single()
    
    if (updateError) {
      console.error('Erro ao cancelar pedido:', updateError)
      return NextResponse.json(
        { error: 'Erro ao cancelar pedido' },
        { status: 500 }
      )
    }
    
    // Registrar evento de cancelamento
    await supabase
      .from('pedido_eventos')
      .insert({
        pedido_id: pedido_id,
        tipo: 'STATUS_CHANGE',
        titulo: 'Pedido cancelado',
        descricao: motivo || 'Cancelado via API',
        status_anterior: pedidoAtual.status,
        status_novo: 'CANCELADO',
        usuario: usuario || 'api',
        automatico: false
      })
    
    // Criar alerta para gestão
    await supabase
      .from('alertas')
      .insert({
        pedido_id: pedido_id,
        tipo: 'pedido_cancelado',
        titulo: 'Pedido cancelado',
        mensagem: `Pedido #${pedidoAtual.numero_sequencial} (${pedidoAtual.cliente_nome}) foi cancelado. Motivo: ${motivo || 'Não informado'}`,
        lido: false,
        destinatario: 'gestao'
      })
    
    return NextResponse.json({
      success: true,
      message: 'Pedido cancelado com sucesso',
      pedido: pedidoCancelado,
      motivo: motivo
    })
  } catch (error) {
    console.error('Erro interno:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}