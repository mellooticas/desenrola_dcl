import { NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = getServerSupabase()
    
    // Contagem total de pedidos
    const { count: totalPedidos } = await supabase
      .from('pedidos')
      .select('*', { count: 'exact', head: true })
    
    // Contagem por status
    const { data: statusCount } = await supabase
      .from('pedidos')
      .select('status, id')
      .select()
    
    const statusBreakdown = statusCount?.reduce((acc: any, pedido: any) => {
      acc[pedido.status] = (acc[pedido.status] || 0) + 1
      return acc
    }, {}) || {}
    
    // Contagem de pedidos nos últimos 30 dias
    const { count: pedidosRecentes } = await supabase
      .from('pedidos')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
    
    return NextResponse.json({
      total_pedidos: totalPedidos,
      pedidos_ultimos_30_dias: pedidosRecentes,
      breakdown_por_status: statusBreakdown,
      status_disponiveis: Object.keys(statusBreakdown),
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Erro ao contar pedidos:', error)
    return NextResponse.json(
      { error: 'Erro ao consultar banco de dados' },
      { status: 500 }
    )
  }
}