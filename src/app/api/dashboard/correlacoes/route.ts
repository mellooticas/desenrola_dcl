import { NextResponse } from 'next/server'
import { getServerSupabase, hasServerSupabaseEnv } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    if (!hasServerSupabaseEnv()) {
      // Fallback para desenvolvimento
      return NextResponse.json([
        {
          prioridade: 'URGENTE',
          classe_categoria: 'monofocal',
          total_pedidos: 45,
          lead_time_urgente: 3.2,
          lead_time_normal: 5.1,
          ticket_urgente: 1800.00,
          ticket_normal: 1200.00,
          sla_urgente: 85.5,
          sla_normal: 92.3
        }
      ])
    }

    const supabase = getServerSupabase()
    const { data, error } = await supabase
      .from('v_correlacoes')
      .select('*')
      .order('classe_categoria', { ascending: true })

    if (error) {
      console.error('Erro ao buscar correlações:', error)
      return NextResponse.json({ error: 'Erro ao carregar correlações' }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Erro interno:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}