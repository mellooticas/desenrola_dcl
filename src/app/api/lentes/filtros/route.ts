/**
 * API: /api/lentes/filtros
 * 
 * Retorna filtros disponíveis dinamicamente do banco sis_lens
 * Usa a view v_filtros_disponiveis que agrega:
 * - tipo_lente
 * - material
 * - indice_refracao
 * 
 * Cada filtro contém: nome, valor, total de lentes, preço min/max
 */

import { NextRequest, NextResponse } from 'next/server'
import { lentesClient } from '@/lib/supabase/lentes-client'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    console.log('[LENTES/FILTROS] Buscando filtros disponíveis...')

    // Buscar todos os filtros da view
    const { data, error } = await lentesClient
      .from('v_filtros_disponiveis')
      .select('*')
      .order('filtro_nome', { ascending: true })
      .order('total', { ascending: false })

    if (error) {
      console.error('[LENTES/FILTROS] Erro ao buscar:', error)
      return NextResponse.json({ 
        success: false, 
        error: 'Erro ao buscar filtros',
        details: error.message 
      }, { status: 500 })
    }

    // Agrupar por tipo de filtro
    const filtrosAgrupados = (data || []).reduce((acc, item) => {
      if (!acc[item.filtro_nome]) {
        acc[item.filtro_nome] = []
      }
      acc[item.filtro_nome].push({
        valor: item.valor,
        total: item.total,
        preco_min: item.preco_min,
        preco_max: item.preco_max
      })
      return acc
    }, {} as Record<string, any[]>)

    console.log('[LENTES/FILTROS] ✅ Filtros carregados:', Object.keys(filtrosAgrupados))

    return NextResponse.json({
      success: true,
      data: filtrosAgrupados,
      total: Object.keys(filtrosAgrupados).length
    })

  } catch (error: any) {
    console.error('[LENTES/FILTROS] Erro inesperado:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Erro ao processar requisição',
      details: error.message 
    }, { status: 500 })
  }
}
