import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase/server'
import type { ClasseLente } from '@/lib/types/database'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
  const supabase = getServerSupabase()
    
    const { data: classes, error } = await supabase
      .from('classes_lente')
      .select('*')
      .eq('ativa', true)
      .order('nome')
    
    if (error) {
      console.error('Erro ao buscar classes:', error)
      return NextResponse.json(
        { error: 'Erro ao buscar classes de lente' },
        { status: 500 }
      )
    }
    
    return NextResponse.json(classes)
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
    if (!body.nome || !body.sla_base_dias) {
      return NextResponse.json(
        { error: 'Nome e SLA são obrigatórios' },
        { status: 400 }
      )
    }
    
    const novaClasse: Partial<ClasseLente> = {
      nome: body.nome,
      codigo: body.codigo || null,
      categoria: body.categoria || null,
      sla_base_dias: parseInt(body.sla_base_dias),
      cor_badge: body.cor_badge || '#6B7280',
      ativa: true
    }
    
    const { data: classe, error } = await supabase
      .from('classes_lente')
      .insert(novaClasse)
      .select()
      .single()
    
    if (error) {
      console.error('Erro ao criar classe:', error)
      return NextResponse.json(
        { error: 'Erro ao criar classe de lente' },
        { status: 500 }
      )
    }
    
    return NextResponse.json(classe, { status: 201 })
  } catch (error) {
    console.error('Erro interno:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}