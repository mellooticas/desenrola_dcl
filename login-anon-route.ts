// API alternativa para login usando apenas Anon Key
// Coloque em: src/app/api/auth/login-anon/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, senha } = body

    if (!email || !senha) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' }, 
        { status: 400 }
      )
    }

    // Usar apenas Anon Key (funciona!)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Tentar autenticação com Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password: senha
    })

    if (authError) {
      return NextResponse.json(
        { error: 'Credenciais inválidas' }, 
        { status: 401 }
      )
    }

    // Se chegou aqui, login foi bem-sucedido
    const user = authData.user
    
    // Buscar dados do usuário na tabela usuarios
    const { data: userData } = await supabase
      .from('usuarios')
      .select('id, email, nome, role, permissoes')
      .eq('user_id', user.id)
      .single()

    const response = NextResponse.json({
      success: true,
      user: userData || {
        id: user.id,
        email: user.email,
        nome: user.email?.split('@')[0],
        role: 'operador'
      }
    })

    // Definir cookie
    response.cookies.set('auth-token', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 dias
      path: '/'
    })

    return response

  } catch (error) {
    return NextResponse.json(
      { error: 'Erro interno do servidor' }, 
      { status: 500 }
    )
  }
}