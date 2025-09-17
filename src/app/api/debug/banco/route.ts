import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    console.log('🔍 DEBUG: Testando conexão com banco...')
    
    const hasServerEnv = !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
    console.log('🔑 Variáveis do Supabase:', hasServerEnv)
    
    if (!hasServerEnv) {
      return NextResponse.json({
        error: 'Variáveis do Supabase não configuradas',
        env: {
          SUPABASE_URL: !!process.env.SUPABASE_URL,
          SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY
        }
      }, { status: 500 })
    }

    const supabase = getServerSupabase()
    
    // Teste 1: Verificar se consegue acessar a tabela usuarios
    console.log('📋 Teste 1: Listando todos os usuários...')
    const { data: allUsers, error: allError } = await supabase
      .from('usuarios')
      .select('email, nome, ativo')
      .limit(10)

    console.log('📊 Resultado todos os usuários:', { allUsers, allError })

    // Teste 2: Buscar usuário específico
    console.log('👤 Teste 2: Buscando junior específico...')
    const { data: specificUser, error: specificError } = await supabase
      .from('usuarios')
      .select('*')
      .eq('email', 'junior@oticastatymello.com.br')

    console.log('📊 Resultado usuário específico:', { specificUser, specificError })

    // Teste 3: Buscar com ativo=true
    console.log('✅ Teste 3: Buscando junior ativo...')
    const { data: activeUser, error: activeError } = await supabase
      .from('usuarios')
      .select('*')
      .eq('email', 'junior@oticastatymello.com.br')
      .eq('ativo', true)

    console.log('📊 Resultado usuário ativo:', { activeUser, activeError })

    return NextResponse.json({
      success: true,
      environment: {
        hasSupabaseEnv: hasServerEnv,
        nodeEnv: process.env.NODE_ENV
      },
      tests: {
        allUsers: { data: allUsers, error: allError },
        specificUser: { data: specificUser, error: specificError },
        activeUser: { data: activeUser, error: activeError }
      }
    })

  } catch (error) {
    console.error('❌ Erro no debug:', error)
    return NextResponse.json({
      error: 'Erro interno',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}