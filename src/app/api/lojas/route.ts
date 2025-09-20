// app/api/lojas/route.ts - CORRIGIDO PARA FUNCIONAR COM FILTROSPERIODO
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { 
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const ativo = searchParams.get('ativo')
    
    console.log('🏪 Buscando lojas reais do banco...')
    
    // Buscar lojas ativas da tabela real
    let query = supabaseAdmin
      .from('lojas')
      .select('*')
      .order('nome')

    // Se veio parâmetro ativo=true, filtrar apenas ativas
    if (ativo === 'true') {
      query = query.eq('ativo', true)
    }

    const { data: lojas, error } = await query

    if (error) {
      console.error('❌ Erro ao buscar lojas:', error)
      throw new Error(`Erro ao buscar lojas: ${error.message}`)
    }

    if (!lojas || lojas.length === 0) {
      console.log('⚠️ Nenhuma loja encontrada, retornando array vazio')
      // IMPORTANTE: FiltrosPeriodo espera array direto, não objeto com propriedade
      return NextResponse.json([])
    }

    console.log(`✅ Encontradas ${lojas.length} lojas`)

    // Para LojaSelector (sem parâmetro ativo), incluir stats
    if (!ativo) {
      const hoje = new Date().toISOString().split('T')[0]
      const lojasComStats = await Promise.all(
        lojas.map(async (loja) => {
          try {
            // Buscar stats desta loja (se a view existir)
            const { data: stats, error: statsError } = await supabaseAdmin
              .from('v_mission_control_dashboard')
              .select('*')
              .eq('loja_id', loja.id)
              .eq('data_missao', hoje)
              .maybeSingle() // usar maybeSingle em vez de single para não dar erro se não encontrar

            return {
              ...loja,
              total_missoes: stats?.total_missoes || 0,
              concluidas: stats?.concluidas || 0,
              percentual_conclusao: stats?.percentual_conclusao || 0,
              status_sistemas: stats?.status_sistemas || 'ok'
            }
          } catch (err) {
            console.warn(`⚠️ Erro ao buscar stats da loja ${loja.nome}:`, err)
            return {
              ...loja,
              total_missoes: 0,
              concluidas: 0,
              percentual_conclusao: 0,
              status_sistemas: 'ok' as const
            }
          }
        })
      )

      return NextResponse.json({
        lojas: lojasComStats,
        source: 'database',
        debug: {
          total_lojas: lojasComStats.length,
          data_consultada: hoje,
          message: 'Dados reais da tabela lojas + stats da view dashboard'
        }
      })
    }

    // Para FiltrosPeriodo (ativo=true), retornar array simples
    console.log('🔄 Retornando array simples para FiltrosPeriodo')
    return NextResponse.json(lojas)

  } catch (error) {
    console.error('💥 Erro crítico na API de lojas:', error)
    
    // Fallback: retornar array vazio para não quebrar os componentes
    return NextResponse.json([])
  }
}