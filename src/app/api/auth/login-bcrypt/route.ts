// Versão alternativa da API de login usando BCrypt
// app/api/auth/login-bcrypt/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase/server'
import bcrypt from 'bcryptjs'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const supabase = getServerSupabase()
    
    const body = await request.json()
    const { email, senha } = body
    

    if (!email || !senha) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' }, 
        { status: 400 }
      )
    }

    // Buscar usuário no banco de dados
    const { data: usuarioBanco, error: dbError } = await supabase
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

    // Verificar se tem senha hash
    if (!usuarioBanco.senha_hash) {
      return NextResponse.json(
        { error: 'Usuário sem senha definida' }, 
        { status: 401 }
      )
    }

    // Comparar senha usando BCrypt
    const senhaCorreta = await bcrypt.compare(senha, usuarioBanco.senha_hash)
    
    if (!senhaCorreta) {
      return NextResponse.json(
        { error: 'Senha incorreta' }, 
        { status: 401 }
      )
    }


    // Atualizar último acesso
    await supabase
      .from('usuarios')
      .update({ ultimo_acesso: new Date().toISOString() })
      .eq('id', usuarioBanco.id)

    // Preparar resposta com dados do usuário
    const userData = {
      id: usuarioBanco.id,
      email: usuarioBanco.email,
      nome: usuarioBanco.nome,
      role: usuarioBanco.role,
      loja_id: usuarioBanco.loja_id,
      permissoes: usuarioBanco.permissoes || [],
      ativo: usuarioBanco.ativo
    }

    
    return NextResponse.json({ 
      success: true, 
      user: userData, 
      message: 'Login realizado com sucesso' 
    })

  } catch (error: unknown) {
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error instanceof Error ? error.message : 'Erro desconhecido' }, 
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'API de login BCrypt está funcionando', 
    timestamp: new Date().toISOString(),
    description: 'Esta API compara senhas com bcrypt.compare() usando senha_hash do banco'
  })
}