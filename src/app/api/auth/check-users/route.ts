// Script para verificar/criar estrutura da tabela usuarios
// app/api/auth/check-users/route.ts

import { NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = getServerSupabase()
    
    // Verificar estrutura da tabela usuarios
    
    // Listar usuários (sem senhas por segurança)
    const { data: allUsers, error: listError } = await supabase
      .from('usuarios')
      .select(`
        id, 
        email, 
        nome, 
        role, 
        ativo, 
        loja_id,
        permissoes,
        created_at,
        updated_at
      `)
      .order('email')
    
    if (listError) {
      
      // Tentar verificar se a tabela existe
      const { error: tableError } = await supabase
        .rpc('get_table_info', { table_name: 'usuarios' })
        .single()
      
      if (tableError) {
        return NextResponse.json({ 
          error: 'Tabela usuarios não existe ou sem permissão de acesso', 
          details: listError.message,
          suggestion: 'Verifique as permissões RLS ou se a tabela foi criada'
        }, { status: 500 })
      }
    }
    
    // Verificar quais usuários têm senha definida (sem mostrar a senha)
    const usersWithPasswordCheck = allUsers?.map(user => ({
      ...user,
      has_password: user.id ? 'checking...' : 'no_id', // Placeholder - seria necessário query separada
      hardcoded_credentials: getHardcodedCredentials(user.email)
    }))
    
    return NextResponse.json({
      success: true,
      message: 'Usuários listados com sucesso',
      usuarios: usersWithPasswordCheck,
      count: allUsers?.length || 0,
      hardcoded_users: getHardcodedUsers(),
      sql_queries: {
        list_users: "SELECT id, email, nome, role, ativo FROM usuarios ORDER BY email;",
        check_structure: "\\d usuarios;",
        check_passwords: "SELECT email, CASE WHEN senha IS NOT NULL THEN 'Tem senha' ELSE 'Sem senha' END FROM usuarios;"
      }
    })
    
  } catch (error: unknown) {
    return NextResponse.json({
      error: 'Erro interno',
      details: error instanceof Error ? error.message : 'Erro desconhecido',
      hardcoded_users: getHardcodedUsers() // Mostrar pelo menos os usuários hardcoded
    }, { status: 500 })
  }
}

// Função para obter credenciais hardcoded (do código)
function getHardcodedCredentials(email: string) {
  const hardcodedUsers = getHardcodedUsers()
  return hardcodedUsers.find(u => u.email === email) || null
}

function getHardcodedUsers() {
  return [
    { 
      email: 'junior@oticastatymello.com.br', 
      nome: 'Junior - Admin', 
      role: 'gestor',
      senha: 'admin123' // Em produção, essas senhas estariam hashadas
    },
    { 
      email: 'financeiroesc@hotmail.com', 
      nome: 'Financeiro ESC', 
      role: 'financeiro',
      senha: 'financeiro123'
    },
    { 
      email: 'dcl@oticastatymello.com.br', 
      nome: 'DCL Laboratório', 
      role: 'dcl',
      senha: 'dcl123'
    },
    { 
      email: 'lojas@oticastatymello.com.br', 
      nome: 'Operadores Lojas', 
      role: 'loja',
      senha: 'lojas123'
    }
  ]
}