// ================================================================
// src/app/api/dashboard/analise-financeira/route.ts
// ================================================================

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import type { AnaliseFinanceira } from '@/lib/types/dashboard-bi'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    const { data, error } = await supabase
      .from('v_analise_financeira')
      .select('*')
      .order('faturamento_total', { ascending: false })
    
    if (error) {
      console.error('Erro ao buscar análise financeira:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json(data || [])
    
  } catch (error) {
    console.error('Erro interno:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}