import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = getServerSupabase()
    
    // Buscar últimos 5 pedidos com todos os campos
    const { data: pedidos, error } = await supabase
      .from('pedidos')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5)
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    // Formatar dados para debug
    const pedidosFormatados = pedidos?.map(p => ({
      id: p.id,
      numero_sequencial: p.numero_sequencial,
      cliente_nome: p.cliente_nome,
      cliente_telefone: p.cliente_telefone,
      numero_os_fisica: p.numero_os_fisica,
      valor_pedido: p.valor_pedido,
      custo_lentes: p.custo_lentes,
      observacoes: p.observacoes,
      eh_garantia: p.eh_garantia,
      created_at: p.created_at,
      created_by: p.created_by
    }))
    
    return NextResponse.json({ pedidos: pedidosFormatados })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}