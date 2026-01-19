// src/app/api/produtos/buscar/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { buscarProdutos } from '@/lib/supabase/crm-erp-client'

/**
 * GET /api/produtos/buscar
 * 
 * Buscar produtos (armações, acessórios) no crm_erp
 * 
 * Query Params:
 * - tipo: 'armacao' | 'acessorio' | 'servico'
 * - sku_visual: string (ex: "MO123456")
 * - cod: string
 * - nome: string (busca na descrição)
 * - loja_id: UUID (filtrar por loja)
 * - limite: number (default: 20)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    
    const filtros = {
      tipo: searchParams.get('tipo') as 'armacao' | 'acessorio' | 'servico' | undefined,
      sku_visual: searchParams.get('sku_visual') || undefined,
      cod: searchParams.get('cod') || undefined,
      nome: searchParams.get('nome') || undefined,
      loja_id: searchParams.get('loja_id') || undefined,
      limite: searchParams.get('limite') ? parseInt(searchParams.get('limite')!) : 20,
    }

    const produtos = await buscarProdutos(filtros)

    return NextResponse.json({
      success: true,
      data: produtos,
      total: produtos.length,
    })
  } catch (error) {
    console.error('Erro ao buscar produtos:', error)
    console.error('Stack:', error instanceof Error ? error.stack : 'No stack')
    
    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao buscar produtos',
        message: error instanceof Error ? error.message : String(error),
        details: process.env.NODE_ENV === 'development' ? error : undefined,
      },
      { status: 500 }
    )
  }
}
