// src/app/api/produtos/estoque/[produto_uuid]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { buscarEstoqueProduto } from '@/lib/supabase/crm-erp-client'

export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * GET /api/produtos/estoque/[produto_uuid]
 * 
 * Buscar estoque de um produto específico
 * 
 * Params:
 * - produto_uuid: UUID do produto
 * 
 * Query Params:
 * - loja_id: UUID (opcional - filtrar por loja)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { produto_uuid: string } }
) {
  try {
    const { produto_uuid } = params
    const searchParams = request.nextUrl.searchParams
    const loja_id = searchParams.get('loja_id') || undefined

    if (!produto_uuid) {
      return NextResponse.json(
        {
          success: false,
          error: 'produto_uuid é obrigatório',
        },
        { status: 400 }
      )
    }

    const estoque = await buscarEstoqueProduto(produto_uuid, loja_id)

    return NextResponse.json({
      success: true,
      data: estoque,
    })
  } catch (error) {
    console.error('Erro ao buscar estoque:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao buscar estoque do produto',
        message: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    )
  }
}
