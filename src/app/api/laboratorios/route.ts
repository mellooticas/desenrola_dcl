import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase/server'
import type { Laboratorio } from '@/lib/types/database'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabase = getServerSupabase()
    
    // Buscar parâmetros da URL
    const { searchParams } = new URL(request.url)
    const ativo = searchParams.get('ativo')
    
    let query = supabase
      .from('laboratorios')
      .select('*')
      .order('nome')
    
    // Filtrar por ativo se especificado
    if (ativo !== null) {
      query = query.eq('ativo', ativo === 'true')
    }
    
    const { data: laboratorios, error } = await query
    
    if (error) {
      console.error('Erro ao buscar laboratórios:', error)
      const debug = process.env.NEXT_PUBLIC_DEBUG === 'true' || process.env.NEXT_PUBLIC_DEBUG === '1'
      return NextResponse.json(
        debug ? { error: 'Erro ao buscar laboratórios', details: (error as any).message, code: (error as any).code, hint: (error as any).hint } : { error: 'Erro ao buscar laboratórios' },
        { status: 500 }
      )
    }
    
    return NextResponse.json(laboratorios)
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
    
    // Validação básica
    if (!body.nome) {
      return NextResponse.json(
        { error: 'Nome é obrigatório' },
        { status: 400 }
      )
    }
    
    const novoLaboratorio: Partial<Laboratorio> = {
      nome: body.nome,
      codigo: body.codigo || null,
      contato: body.contato || {},
      sla_padrao_dias: parseInt(body.sla_padrao_dias) || 5,
      trabalha_sabado: body.trabalha_sabado || false,
      ativo: true
    }
    
    const { data: laboratorio, error } = await supabase
      .from('laboratorios')
      .insert(novoLaboratorio)
      .select()
      .single()
    
    if (error) {
      console.error('Erro ao criar laboratório:', error)
      return NextResponse.json(
        { error: 'Erro ao criar laboratório' },
        { status: 500 }
      )
    }
    
    return NextResponse.json(laboratorio, { status: 201 })
  } catch (error) {
    console.error('Erro interno:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = getServerSupabase()
    const body = await request.json()

    const id = body?.id as string | undefined
    if (!id) {
      return NextResponse.json(
        { error: 'id é obrigatório' },
        { status: 400 }
      )
    }

    const updates: Partial<Laboratorio> = {}

    if (typeof body.nome === 'string') updates.nome = body.nome
    if (typeof body.codigo === 'string' || body.codigo === null) updates.codigo = body.codigo
    if (typeof body.trabalha_sabado === 'boolean') updates.trabalha_sabado = body.trabalha_sabado
    if (typeof body.ativo === 'boolean') updates.ativo = body.ativo
    if (body.contato && typeof body.contato === 'object') updates.contato = body.contato

    if (body.sla_padrao_dias !== undefined) {
      const sla = typeof body.sla_padrao_dias === 'string'
        ? parseInt(body.sla_padrao_dias)
        : body.sla_padrao_dias

      if (Number.isFinite(sla)) {
        updates.sla_padrao_dias = sla
      }
    }

    const { data: laboratorio, error } = await supabase
      .from('laboratorios')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Erro ao atualizar laboratório:', error)
      const debug = process.env.NEXT_PUBLIC_DEBUG === 'true' || process.env.NEXT_PUBLIC_DEBUG === '1'
      return NextResponse.json(
        debug ? { error: 'Erro ao atualizar laboratório', details: (error as any).message, code: (error as any).code, hint: (error as any).hint } : { error: 'Erro ao atualizar laboratório' },
        { status: 500 }
      )
    }

    return NextResponse.json(laboratorio)
  } catch (error) {
    console.error('Erro interno:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}