import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase/server'
import bcrypt from 'bcryptjs'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    
    // Inicializa Supabase
    const hasServerEnv = !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
    const supabase = hasServerEnv ? getServerSupabase() : null
    
    if (!hasServerEnv) {
      return NextResponse.json(
        { error: 'Configuração do servidor incompleta' }, 
        { status: 500 }
      )
    }
    const body = await request.json()
    const { email, senha } = body

    if (!email || !senha) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' }, 
        { status: 400 }
      )
    }

    // Buscar usuário no banco de dados
    const { data: usuarioBanco, error: dbError } = await supabase!
      .from('usuarios')
      .select('*')
      .eq('email', email)
      .eq('ativo', true)
      .single()

    if (dbError || !usuarioBanco) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' }, 
        { status: 401 }
      )
    }


    // Verificar senha usando BCrypt
    if (!usuarioBanco.senha_hash) {
      return NextResponse.json(
        { error: 'Usuário sem senha cadastrada' }, 
        { status: 401 }
      )
    }

    const senhaCorreta = await bcrypt.compare(senha, usuarioBanco.senha_hash)
    
    if (!senhaCorreta) {
      return NextResponse.json(
        { error: 'Senha incorreta' }, 
        { status: 401 }
      )
    }


    // Atualizar último acesso
    await supabase!
      .from('usuarios')
      .update({ ultimo_acesso: new Date().toISOString() })
      .eq('id', usuarioBanco.id)


    // Retornar dados do usuário (sem campos sensíveis)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { senha_hash, reset_token, reset_token_expires_at, ...usuarioLimpo } = usuarioBanco

    return NextResponse.json({
      success: true,
      user: usuarioLimpo
    })

  } catch (error: unknown) {
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error instanceof Error ? error.message : 'Erro desconhecido' }, 
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({ message: 'API de login está funcionando', timestamp: new Date().toISOString() })
}