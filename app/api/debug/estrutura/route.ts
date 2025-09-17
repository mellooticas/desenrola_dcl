import { NextResponse } from 'next/server'
import { getServerSupabase, hasServerSupabaseEnv } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    if (!hasServerSupabaseEnv()) {
      return NextResponse.json({ error: 'Variáveis do Supabase não configuradas' }, { status: 500 })
    }

    const supabase = getServerSupabase()

    // Verificar views existentes
    const { data: views, error: viewsError } = await supabase
      .rpc('exec_sql', { 
        sql: `
          SELECT 
            schemaname,
            viewname,
            definition
          FROM pg_views 
          WHERE schemaname = 'public'
          ORDER BY viewname
        `
      })

    if (viewsError) {
      console.error('Erro ao buscar views:', viewsError)
    }

    // Verificar tabelas existentes
    const { data: tables, error: tablesError } = await supabase
      .rpc('exec_sql', {
        sql: `
          SELECT 
            table_name,
            table_type
          FROM information_schema.tables 
          WHERE table_schema = 'public'
          ORDER BY table_name
        `
      })

    if (tablesError) {
      console.error('Erro ao buscar tabelas:', tablesError)
    }

    // Verificar algumas tabelas específicas
    const { data: pedidos, error: pedidosError } = await supabase
      .from('pedidos')
      .select('id, status, data_pedido, valor_pedido')
      .limit(5)

    const { data: laboratorios, error: labsError } = await supabase
      .from('laboratorios')
      .select('id, nome, ativo')
      .limit(5)

    return NextResponse.json({
      success: true,
      database_structure: {
        views: views || [],
        tables: tables || [],
        viewsError,
        tablesError
      },
      sample_data: {
        pedidos: pedidos || [],
        laboratorios: laboratorios || [],
        pedidosError,
        labsError
      }
    })

  } catch (error) {
    console.error('Erro geral:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}