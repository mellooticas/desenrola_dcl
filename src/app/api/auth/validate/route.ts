// app/api/auth/validate/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Token não fornecido' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)

  // Cliente Supabase no servidor (usa chaves de servidor)
  const supabase = getServerSupabase()

    // Buscar sessão válida
    const { data: session, error: sessionError } = await supabase
      .from('user_sessions')
      .select(`
        *,
        usuarios (
          id,
          nome,
          email,
          role,
          loja_id,
          ativo
        )
      `)
      .eq('token', token)
      .gt('expires_at', new Date().toISOString())
      .single()


    if (sessionError || !session) {
      return NextResponse.json(
        { success: false, error: 'Sessão inválida ou expirada' },
        { status: 401 }
      )
    }

    const user = session.usuarios

    if (!user || !user.ativo) {
      return NextResponse.json(
        { success: false, error: 'Usuário inativo' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        role: user.role,
        loja_id: user.loja_id
      }
    })

  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}