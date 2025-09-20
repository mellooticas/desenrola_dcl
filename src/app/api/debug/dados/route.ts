// API Route temporária para investigar dados
import { supabase } from '@/lib/supabase/client'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    console.log('=== INVESTIGAÇÃO DO BANCO ===')
    
    // 1. Verificar campos com dados
    const { data: pedidos, error } = await supabase
      .from('pedidos')
      .select('*')
      .limit(20)
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!pedidos || pedidos.length === 0) {
      return NextResponse.json({ message: 'Nenhum pedido encontrado' }, { status: 404 })
    }

    // Analisar preenchimento dos campos
    const analise: any = {}
    const primeiroRegistro = pedidos[0]
    
    Object.keys(primeiroRegistro).forEach(campo => {
      const valoresPreenchidos = pedidos.filter(p => 
        p[campo] !== null && 
        p[campo] !== undefined && 
        p[campo] !== '' &&
        p[campo] !== 0
      ).length
      
      const percentual = ((valoresPreenchidos / pedidos.length) * 100).toFixed(1)
      const exemplo = pedidos.find(p => 
        p[campo] !== null && 
        p[campo] !== undefined && 
        p[campo] !== ''
      )?.[campo]
      
      analise[campo] = {
        preenchidos: valoresPreenchidos,
        total: pedidos.length,
        percentual: parseFloat(percentual),
        exemplo: exemplo
      }
    })

    // Separar por categoria
    const camposImportantes = [
      'numero_os_fisica',
      'numero_pedido_laboratorio',
      'laboratorio_responsavel_producao',
      'data_limite_pagamento',
      'data_prevista_pronto',
      'distancia_pupilar',
      'material_lente',
      'indice_refracao',
      'lead_time_producao_horas',
      'lead_time_total_horas'
    ]

    const camposPreenchidos = Object.entries(analise)
      .filter(([_, dados]: [string, any]) => dados.percentual > 0)
      .sort(([_, a]: [string, any], [__, b]: [string, any]) => b.percentual - a.percentual)

    const camposVazios = Object.entries(analise)
      .filter(([_, dados]: [string, any]) => dados.percentual === 0)

    const resultado = {
      totalPedidos: pedidos.length,
      camposPreenchidos: camposPreenchidos.map(([campo, dados]: [string, any]) => ({
        campo,
        percentual: dados.percentual,
        preenchidos: dados.preenchidos,
        exemplo: String(dados.exemplo).substring(0, 50)
      })),
      camposVazios: camposVazios.map(([campo]) => campo),
      camposImportantes: camposImportantes.map(campo => ({
        campo,
        status: analise[campo] ? 
          `${analise[campo].percentual}% preenchido` : 
          'CAMPO NÃO ENCONTRADO',
        exemplo: analise[campo]?.exemplo
      })),
      dadosExemplo: pedidos.slice(0, 3).map(p => ({
        sequencial: p.numero_sequencial,
        os_fisica: p.numero_os_fisica,
        pedido_lab: p.numero_pedido_laboratorio,
        material: p.material_lente,
        distancia_pupilar: p.distancia_pupilar
      }))
    }

    return NextResponse.json(resultado, { status: 200 })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}