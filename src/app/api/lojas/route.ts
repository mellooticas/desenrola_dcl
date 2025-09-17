import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase/server'
import type { Loja } from '@/lib/types/database'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
  const supabase = getServerSupabase()
    
    const { searchParams } = new URL(request.url)
    const ativo = searchParams.get('ativo')
    
    let query = supabase
      .from('lojas')
      .select('*')
      .order('nome')
    
    if (ativo !== null) {
      query = query.eq('ativo', ativo === 'true')
    }
    
    const { data: lojas, error } = await query
    
    if (error) {
      console.error('Erro ao buscar lojas:', error)
      return NextResponse.json(
        { error: 'Erro ao buscar lojas' },
        { status: 500 }
      )
    }
    
    return NextResponse.json(lojas)
  } catch (error) {
    console.error('Erro interno:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
  const supabase = getServerSupabase()
    const body = await request.json()
    
    if (!body.nome || !body.codigo) {
      return NextResponse.json(
        { error: 'Nome e código são obrigatórios' },
        { status: 400 }
      )
    }
    
    const novaLoja: Partial<Loja> = {
      nome: body.nome,
      codigo: body.codigo,
      endereco: body.endereco || null,
      telefone: body.telefone || null,
      gerente: body.gerente || null,
      ativo: true
    }
    
    const { data: loja, error } = await supabase
      .from('lojas')
      .insert(novaLoja)
      .select()
      .single()
    
    if (error) {
      console.error('Erro ao criar loja:', error)
      return NextResponse.json(
        { error: 'Erro ao criar loja' },
        { status: 500 }
      )
    }
    
    return NextResponse.json(loja, { status: 201 })
  } catch (error) {
    console.error('Erro interno:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}