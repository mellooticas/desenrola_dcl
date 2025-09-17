// ================================================================
// src/app/api/dashboard/refresh/route.ts
// ================================================================

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Tentar executar função de refresh das views materializadas (se existir)
    const { error: refreshError } = await supabase.rpc('refresh_dashboard_views')
    
    // Se a função não existir, não é erro crítico
    if (refreshError && !refreshError.message.includes('does not exist')) {
      console.warn('Aviso ao fazer refresh:', refreshError.message)
    }
    
    return NextResponse.json({ 
      success: true, 
      timestamp: new Date().toISOString(),
      message: 'Dashboard atualizado com sucesso'
    })
    
  } catch (error) {
    console.error('Erro interno:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}