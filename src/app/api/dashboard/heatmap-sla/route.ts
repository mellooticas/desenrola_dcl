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
      .from('v_heatmap_sla')
      .select('*')
      .order('total_pedidos', { ascending: false })

    if (error) {
      console.error('Erro ao buscar heatmap SLA:', error)
      return NextResponse.json({ error: 'Erro ao carregar heatmap SLA' }, { status: 500 })
    }

    // Transformar dados para formato de heatmap
    type HeatmapLab = {
      laboratorio: string
      classes: Array<{
        classe: string
        sla_compliance: number
        total_pedidos: number
        lead_time: number
      }>
    }

    const heatmapData = data?.reduce<HeatmapLab[]>((acc, item) => {
      const labIndex = acc.findIndex((lab: HeatmapLab) => lab.laboratorio === item.laboratorio_nome)
      
      if (labIndex === -1) {
        acc.push({
          laboratorio: item.laboratorio_nome,
          classes: [{
            classe: item.classe_categoria,
            sla_compliance: item.sla_compliance,
            total_pedidos: item.total_pedidos,
            lead_time: item.lead_time_medio
          }]
        })
      } else {
        acc[labIndex].classes.push({
          classe: item.classe_categoria,
          sla_compliance: item.sla_compliance,
          total_pedidos: item.total_pedidos,
          lead_time: item.lead_time_medio
        })
      }
      
      return acc
  }, [] as HeatmapLab[])

    return NextResponse.json(heatmapData || [])
  } catch (error) {
    console.error('Erro interno:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}