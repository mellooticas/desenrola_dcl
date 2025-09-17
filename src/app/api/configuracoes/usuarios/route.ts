import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase, hasServerSupabaseEnv } from '@/lib/supabase/server'

// GET - Listar usuários
export async function GET(request: NextRequest) {
  try {
    if (!hasServerSupabaseEnv()) {
      // Retornar dados mock se não houver configuração do Supabase
      const mockUsers = [
        { 
          id: '1', 
          name: 'Admin Sistema', 
          email: 'admin@dcl.com', 
          role: 'admin', 
          status: 'active',
          phone: '(11) 99999-9999',
          created_at: '2024-01-15T00:00:00Z',
          last_login: '2024-03-10T14:30:00Z'
        },
        { 
          id: '2', 
          name: 'João Silva', 
          email: 'joao@dcl.com', 
          role: 'manager', 
          status: 'active',
          phone: '(11) 88888-8888',
          created_at: '2024-02-01T00:00:00Z',
          last_login: '2024-03-10T09:15:00Z'
        }
      ]
      return NextResponse.json({ usuarios: mockUsers })
    }

    const supabase = getServerSupabase()
    
    const { data: usuarios, error } = await supabase
      .from('usuarios')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erro ao buscar usuários:', error)
      return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
    }

    return NextResponse.json({ usuarios })
  } catch (error) {
    console.error('Erro na API de usuários:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// POST - Criar novo usuário
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, role, phone } = body

    if (!name || !email || !role) {
      return NextResponse.json({ error: 'Campos obrigatórios: name, email, role' }, { status: 400 })
    }

    if (!hasServerSupabaseEnv()) {
      // Simular criação em ambiente sem Supabase
      const mockUser = {
        id: Math.random().toString(36),
        name,
        email,
        role,
        phone: phone || '',
        status: 'active',
        created_at: new Date().toISOString()
      }
      return NextResponse.json({ usuario: mockUser }, { status: 201 })
    }

    const supabase = getServerSupabase()
    
    const { data: usuario, error } = await supabase
      .from('usuarios')
      .insert([{
        name,
        email,
        role,
        phone: phone || '',
        status: 'active',
        created_at: new Date().toISOString()
      }])
      .select()
      .single()

    if (error) {
      console.error('Erro ao criar usuário:', error)
      return NextResponse.json({ error: 'Erro ao criar usuário' }, { status: 500 })
    }

    return NextResponse.json({ usuario }, { status: 201 })
  } catch (error) {
    console.error('Erro na API de usuários:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// PUT - Atualizar usuário
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, email, role, phone, status } = body

    if (!id) {
      return NextResponse.json({ error: 'ID do usuário é obrigatório' }, { status: 400 })
    }

    if (!hasServerSupabaseEnv()) {
      // Simular atualização em ambiente sem Supabase
      const mockUser = {
        id,
        name: name || 'Nome Atualizado',
        email: email || 'email@teste.com',
        role: role || 'operator',
        phone: phone || '',
        status: status || 'active'
      }
      return NextResponse.json({ usuario: mockUser })
    }

    const supabase = getServerSupabase()
    
    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (email !== undefined) updateData.email = email
    if (role !== undefined) updateData.role = role
    if (phone !== undefined) updateData.phone = phone
    if (status !== undefined) updateData.status = status

    const { data: usuario, error } = await supabase
      .from('usuarios')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Erro ao atualizar usuário:', error)
      return NextResponse.json({ error: 'Erro ao atualizar usuário' }, { status: 500 })
    }

    return NextResponse.json({ usuario })
  } catch (error) {
    console.error('Erro na API de usuários:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// DELETE - Excluir usuário
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID do usuário é obrigatório' }, { status: 400 })
    }

    if (!hasServerSupabaseEnv()) {
      // Simular exclusão em ambiente sem Supabase
      return NextResponse.json({ message: 'Usuário excluído com sucesso' })
    }

    const supabase = getServerSupabase()
    
    const { error } = await supabase
      .from('usuarios')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Erro ao excluir usuário:', error)
      return NextResponse.json({ error: 'Erro ao excluir usuário' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Usuário excluído com sucesso' })
  } catch (error) {
    console.error('Erro na API de usuários:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}