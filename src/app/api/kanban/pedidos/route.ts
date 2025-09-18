import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase/server'
import type { StatusPedido } from '@/lib/types/database'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const statuses = searchParams.get('statuses')?.split(',') || []
    const lojaId = searchParams.get('loja_id')
    const labId = searchParams.get('laboratorio_id')
    
    const supabase = getServerSupabase()
    
    // Query na view v_pedidos_kanban (que já funciona via server-side)
    let query = supabase
      .from('v_pedidos_kanban')
      .select('*')
      .order('created_at', { ascending: false })
    
    // Filtrar por status se fornecido
    if (statuses.length > 0) {
      query = query.in('status', statuses)
    }
    
    // Filtrar por loja se fornecido
    if (lojaId && lojaId !== 'all') {
      query = query.eq('loja_id', lojaId)
    }
    
    // Filtrar por laboratório se fornecido
    if (labId && labId !== 'all') {
      query = query.eq('laboratorio_id', labId)
    }
    
    const { data, error } = await query
    
    if (error) {
      console.error('Erro ao buscar pedidos do Kanban:', error)
      return NextResponse.json(
        { error: 'Erro ao carregar pedidos do Kanban' },
        { status: 500 }
      )
    }
    
    console.log('API Kanban: Carregados', data?.length || 0, 'pedidos')
    return NextResponse.json(data || [])
    
  } catch (error) {
    console.error('Erro interno na API Kanban:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}