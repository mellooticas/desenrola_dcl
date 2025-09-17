// ================================================================
// src/app/api/dashboard/evolucao-mensal/route.ts
// ================================================================

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import type { EvolucaoMensal } from '@/lib/types/dashboard-bi'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { searchParams } = new URL(request.url)
    
    const meses = parseInt(searchParams.get('meses') || '12')
    
    const { data, error } = await supabase
      .from('v_evolucao_mensal')
      .select('*')
      .order('ano_mes', { ascending: true })
      .limit(meses)
    
    if (error) {
      console.error('Erro ao buscar evolução mensal:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json(data || [])
    
  } catch (error) {
    console.error('Erro interno:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}