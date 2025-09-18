import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase, hasServerSupabaseEnv } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function PUT(request: NextRequest) {
  try {
    if (!hasServerSupabaseEnv()) {
      // Ambiente local sem SUPABASE_URL/SERVICE_ROLE: simular sucesso para desenvolvimento
      const useMock = process.env.NEXT_PUBLIC_DEBUG === 'true' || process.env.NEXT_PUBLIC_DEBUG_DEV_MOCK === 'true'
      if (useMock) {
        return NextResponse.json({ success: true, message: 'Mock: Status atualizado' })
      }
      return NextResponse.json({ error: 'Configuração do Supabase não encontrada' }, { status: 500 })
    }

    const body = await request.json()
    const { 
      pedido_id, 
      novo_status, 
      observacao, 
      usuario,
      data_pagamento,
      forma_pagamento
    } = body

    if (!pedido_id || !novo_status || !usuario) {
      return NextResponse.json({ error: 'Parâmetros obrigatórios: pedido_id, novo_status, usuario' }, { status: 400 })
    }

    const supabase = getServerSupabase()

    // Se for alteração para status PAGO e tiver dados de pagamento
    if (novo_status === 'PAGO' && data_pagamento && forma_pagamento) {
      const { data, error } = await supabase
        .rpc('marcar_pagamento', {
          pedido_uuid: pedido_id,
          data_pagamento: data_pagamento,
          forma_pagamento: forma_pagamento,
          usuario: usuario
        })

      if (error) {
        console.error('Erro ao marcar pagamento:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ success: true, data })
    }

    // Para outras alterações de status, usar função genérica
    const { data, error } = await supabase
      .rpc('alterar_status_pedido', {
        pedido_uuid: pedido_id,
        novo_status: novo_status,
        observacao: observacao || `Status alterado para ${novo_status} por ${usuario}`,
        usuario: usuario
      })

    if (error) {
      console.error('Erro ao alterar status:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })

  } catch (error) {
    console.error('Erro interno ao alterar status:', error)
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}