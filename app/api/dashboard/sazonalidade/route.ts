import { NextResponse } from 'next/server'
import { getServerSupabase, hasServerSupabaseEnv } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    if (!hasServerSupabaseEnv()) {
      return NextResponse.json([])
    }

    const supabase = getServerSupabase()
    const { data, error } = await supabase
      .from('v_analise_sazonalidade')
      .select('*')
      .order('dia_semana', { ascending: true })

    if (error) {
      console.error('Erro ao buscar sazonalidade:', error)
      return NextResponse.json({ error: 'Erro ao carregar sazonalidade' }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Erro interno:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}