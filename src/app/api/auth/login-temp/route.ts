import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

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

    // Usar apenas Anon Key (que funciona!)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    console.log('🔐 Tentando login com:', email)

    // Lista de usuários válidos (temporário até resolver Service Role)
    const usuariosValidos = [
      {
        email: 'junior@oticastatymello.com.br',
        senha: 'DCL@2025#c09ef0',
        nome: 'Junior - Admin',
        role: 'gestor',
        id: '1'
      },
      {
        email: 'dcl@oticastatymello.com.br',
        senha: 'DCL@2025#c09ef0',
        nome: 'DCL Laboratório',
        role: 'dcl',
        id: '2'
      },
      {
        email: 'financeiroesc@hotmail.com',
        senha: 'DCL@2025#c09ef0',
        nome: 'Financeiro ESC',
        role: 'financeiro',
        id: '3'
      },
      {
        email: 'lojas@oticastatymello.com.br',
        senha: 'DCL@2025#c09ef0',
        nome: 'Operadores Lojas',
        role: 'operador',
        id: '4'
      }
    ]

    // Verificar credenciais
    const usuario = usuariosValidos.find(u => u.email === email && u.senha === senha)

    if (!usuario) {
      return NextResponse.json(
        { error: 'Usuário não encontrado ou senha incorreta' }, 
        { status: 401 }
      )
    }

    console.log('✅ Login válido para:', usuario.email)

    // Retornar dados do usuário (sem senha)
    const { senha: _, ...usuarioLimpo } = usuario

    const response = NextResponse.json({
      success: true,
      user: usuarioLimpo
    })

    // Definir cookie de autenticação
    response.cookies.set('auth-token', usuario.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 dias
      path: '/'
    })

    // Definir cookie de role (necessário para o middleware)
    response.cookies.set('user-role', usuario.role, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 dias
      path: '/'
    })

    return response

  } catch (error: unknown) {
    console.error('❌ Erro no login:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' }, 
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'API de login temporária funcionando',
    usuarios: [
      'junior@oticastatymello.com.br',
      'dcl@oticastatymello.com.br', 
      'financeiroesc@hotmail.com',
      'lojas@oticastatymello.com.br'
    ],
    senha: 'DCL@2025#c09ef0'
  })
}