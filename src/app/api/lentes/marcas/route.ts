/**
 * API: /api/lentes/marcas
 * 
 * Retorna marcas de lentes ativas do banco sis_lens
 * Usado para filtro de marca no seletor
 */

import { NextRequest, NextResponse } from 'next/server'
import { lentesClient } from '@/lib/supabase/lentes-client'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    console.log('[LENTES/MARCAS] Buscando marcas ativas...')

    const { data, error } = await lentesClient
      .from('marcas')
      .select('id, nome, slug, is_premium, logo_url')
      .eq('ativo', true)
      .order('nome', { ascending: true })

    if (error) {
      console.error('[LENTES/MARCAS] Erro ao buscar:', error)
      return NextResponse.json({ 
        success: false, 
        error: 'Erro ao buscar marcas',
        details: error.message 
      }, { status: 500 })
    }

    console.log(`[LENTES/MARCAS] ✅ ${data?.length || 0} marcas carregadas`)

    return NextResponse.json({
      success: true,
      data: data || [],
      total: data?.length || 0
    })

  } catch (error: any) {
    console.error('[LENTES/MARCAS] Erro inesperado:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Erro ao processar requisição',
      details: error.message 
    }, { status: 500 })
  }
}
