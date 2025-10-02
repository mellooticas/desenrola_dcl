// src/app/api/cron/renovacao-diaria/route.ts
// Endpoint para execução automática via cron job
// Configurar no Vercel Cron ou serviço externo para chamar às 20:00 diariamente

import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Verificar token de segurança para cron jobs
const CRON_SECRET = process.env.CRON_SECRET || 'seu-token-secreto-aqui'

export async function GET(request: NextRequest) {
  try {
    // Verificar token de autorização
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    
    if (token !== CRON_SECRET) {
      return NextResponse.json({ 
        error: 'Token de autorização inválido' 
      }, { status: 401 })
    }

    // Executar renovação via função do banco
    const { data, error } = await supabase
      .rpc('cron_renovacao_diaria')

    if (error) {
      console.error('Erro na renovação diária:', error)
      return NextResponse.json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }, { status: 500 })
    }

    console.log('Renovação diária executada:', data)

    return NextResponse.json({
      success: true,
      resultado: data,
      timestamp: new Date().toISOString(),
      timezone: 'America/Sao_Paulo'
    })

  } catch (error) {
    console.error('Erro no cron de renovação:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  // Mesmo comportamento do GET para flexibilidade
  return GET(request)
}