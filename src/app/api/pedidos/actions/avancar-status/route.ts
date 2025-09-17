import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase/server'
import type { StatusPedido } from '@/lib/types/database'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Fluxo de status válidos
const FLUXO_STATUS: Record<StatusPedido, StatusPedido | null> = {
  'REGISTRADO': 'AG_PAGAMENTO',
  'AG_PAGAMENTO': 'PAGO',
  'PAGO': 'PRODUCAO',
  'PRODUCAO': 'PRONTO',
  'PRONTO': 'ENVIADO',
  'ENVIADO': 'CHEGOU',
  'CHEGOU': 'ENTREGUE',
  'ENTREGUE': null, // Status final
  'CANCELADO': null  // Status final
}

export async function POST(request: NextRequest) {
  try {
  const supabase = getServerSupabase()
    const { pedido_id, observacao, usuario } = await request.json()
    
    if (!pedido_id) {
      return NextResponse.json(
        { error: 'ID do pedido é obrigatório' },
        { status: 400 }
      )
    }
    
    // Buscar pedido atual
    const { data: pedidoAtual, error: buscaError } = await supabase
      .from('pedidos')
      .select('id, status, numero_sequencial')
      .eq('id', pedido_id)
      .single()
    
    if (buscaError || !pedidoAtual) {
      return NextResponse.json(
        { error: 'Pedido não encontrado' },
        { status: 404 }
      )
    }
    
    // Determinar próximo status
    const proximoStatus = FLUXO_STATUS[pedidoAtual.status as StatusPedido]
    
    if (!proximoStatus) {
      return NextResponse.json(
        { error: `Pedido já está no status final: ${pedidoAtual.status}` },
        { status: 400 }
      )
    }
    
    // Usar função do banco se existir
    const { data: resultado, error: funcaoError } = await supabase
      .rpc('alterar_status_pedido', {
        pedido_uuid: pedido_id,
        novo_status: proximoStatus,
        observacao: observacao || `Status avançado para ${proximoStatus}`,
        usuario: usuario || 'api'
      })
    
    if (funcaoError) {
      console.error('Erro na função alterar_status:', funcaoError)
      
      // Fallback: fazer manualmente
      const { data: pedidoAtualizado, error: updateError } = await supabase
        .from('pedidos')
        .update({
          status: proximoStatus,
          updated_at: new Date().toISOString(),
          updated_by: usuario || 'api'
        })
        .eq('id', pedido_id)
        .select()
        .single()
      
      if (updateError) {
        console.error('Erro ao atualizar status:', updateError)
        return NextResponse.json(
          { error: 'Erro ao avançar status' },
          { status: 500 }
        )
      }
      
      // Registrar evento manualmente
      await supabase
        .from('pedido_eventos')
        .insert({
          pedido_id: pedido_id,
          tipo: 'STATUS_CHANGE',
          titulo: `Status alterado para ${proximoStatus}`,
          descricao: observacao || null,
          status_anterior: pedidoAtual.status,
          status_novo: proximoStatus,
          usuario: usuario || 'api',
          automatico: false
        })
      
      return NextResponse.json({
        success: true,
        message: `Status avançado para ${proximoStatus}`,
        status_anterior: pedidoAtual.status,
        status_novo: proximoStatus,
        pedido: pedidoAtualizado
      })
    }
    
    // Se a função funcionou, buscar pedido atualizado
    const { data: pedidoFinal } = await supabase
      .from('pedidos')
      .select('*')
      .eq('id', pedido_id)
      .single()
    
    return NextResponse.json({
      success: true,
      message: `Status avançado para ${proximoStatus}`,
      status_anterior: pedidoAtual.status,
      status_novo: proximoStatus,
      pedido: pedidoFinal
    })
  } catch (error) {
    console.error('Erro interno:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}