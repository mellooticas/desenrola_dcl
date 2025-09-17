// ================================================================
// src/app/api/dashboard/alertas-criticos/route.ts
// ================================================================

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import type { AlertaCritico } from '@/lib/types/dashboard-bi'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { searchParams } = new URL(request.url)
    
    const prioridade = searchParams.get('prioridade')
    const limit = parseInt(searchParams.get('limit') || '50')
    
    let query = supabase
      .from('v_alertas_criticos')
      .select('*')
      .order('ordem_prioridade', { ascending: true })
      .limit(limit)
    
    if (prioridade) {
      query = query.eq('prioridade', prioridade)
    }
    
    const { data, error } = await query
    
    if (error) {
      console.error('Erro ao buscar alertas:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json(data || [])
    
  } catch (error) {
    console.error('Erro interno:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}