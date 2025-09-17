import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
  const supabase = getServerSupabase()
    const { pedido_id, data_pagamento, forma_pagamento, usuario } = await request.json()
    
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
    
    // Verificar se pode marcar como pago
    if (!['REGISTRADO', 'AG_PAGAMENTO'].includes(pedidoAtual.status)) {
      return NextResponse.json(
        { error: 'Pedido já foi pago ou está em status inválido' },
        { status: 400 }
      )
    }
    
    // Usar função do banco para marcar pagamento (se existir)
    const { data: resultado, error: funcaoError } = await supabase
      .rpc('marcar_pagamento', {
        pedido_uuid: pedido_id,
        data: data_pagamento || new Date().toISOString().split('T')[0],
        forma: forma_pagamento || 'Não informado',
        usuario: usuario || 'api'
      })
    
    if (funcaoError) {
      console.error('Erro na função marcar_pagamento:', funcaoError)
      // Fallback: fazer manualmente
      const { data: pedidoAtualizado, error: updateError } = await supabase
        .from('pedidos')
        .update({
          status: 'PAGO',
          data_pagamento: data_pagamento || new Date().toISOString().split('T')[0],
          forma_pagamento: forma_pagamento || 'Não informado',
          pagamento_atrasado: false,
          updated_at: new Date().toISOString(),
          updated_by: usuario || 'api'
        })
        .eq('id', pedido_id)
        .select()
        .single()
      
      if (updateError) {
        console.error('Erro ao atualizar pedido:', updateError)
        return NextResponse.json(
          { error: 'Erro ao marcar pagamento' },
          { status: 500 }
        )
      }
      
      // Registrar evento manualmente
      await supabase
        .from('pedido_eventos')
        .insert({
          pedido_id: pedido_id,
          tipo: 'PAYMENT',
          titulo: 'Pagamento confirmado',
          descricao: `Forma: ${forma_pagamento || 'Não informado'}`,
          status_anterior: pedidoAtual.status,
          status_novo: 'PAGO',
          usuario: usuario || 'api',
          automatico: false
        })
      
      return NextResponse.json(pedidoAtualizado)
    }
    
    // Se a função funcionou, buscar o pedido atualizado
    const { data: pedidoFinal, error: finalError } = await supabase
      .from('pedidos')
      .select('*')
      .eq('id', pedido_id)
      .single()
    
    if (finalError) {
      console.error('Erro ao buscar pedido final:', finalError)
      return NextResponse.json(
        { error: 'Pagamento processado mas erro ao buscar resultado' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: 'Pagamento marcado com sucesso',
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