import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Usar Service Role Key para bypass RLS (necessário pois não temos sessão real)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function POST(request: NextRequest) {
  try {
    const { pedidoId, montadorId } = await request.json()

    if (!pedidoId) {
      return NextResponse.json(
        { error: 'pedidoId é obrigatório' },
        { status: 400 }
      )
    }

    // UPDATE usando Service Role (bypass RLS)
    const { data, error } = await supabaseAdmin
      .from('pedidos')
      .update({ 
        montador_id: montadorId,
        updated_at: new Date().toISOString()
      })
      .eq('id', pedidoId)
      .select()

    if (error) {
      console.error('❌ Erro ao atualizar montador:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: data?.[0] || null,
      updated: data?.length || 0
    })

  } catch (error: any) {
    console.error('❌ Erro na API update-montador:', error)
    return NextResponse.json(
      { error: error.message || 'Erro desconhecido' },
      { status: 500 }
    )
  }
}
