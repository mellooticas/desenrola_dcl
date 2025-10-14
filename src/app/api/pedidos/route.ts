import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase, hasServerSupabaseEnv } from '../../../lib/supabase/server'
import type { Pedido, CriarPedidoCompletoData } from '../../../lib/types/database'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    if (!hasServerSupabaseEnv()) {
      const useMock = process.env.NEXT_PUBLIC_DEBUG === 'true' || process.env.NEXT_PUBLIC_DEBUG_DEV_MOCK === 'true'
      if (useMock) {
        return NextResponse.json([])
      }
      return NextResponse.json([], { status: 200 })
    }
    
    const supabase = getServerSupabase()
    const { searchParams } = new URL(request.url)
    
    // Buscar pela view otimizada do Kanban por padrão
    const useKanbanView = searchParams.get('view') !== 'simple'
    const lojaId = searchParams.get('loja_id') || undefined
    const laboratorioId = searchParams.get('laboratorio_id') || undefined
    const status = searchParams.get('status') || undefined
    const prioridade = searchParams.get('prioridade') || undefined
    const eh_garantia = searchParams.get('eh_garantia')
    const cliente_nome = searchParams.get('cliente_nome') || undefined
    const numero_sequencial = searchParams.get('numero_sequencial') || undefined
    const numero_os_fisica = searchParams.get('numero_os_fisica') || undefined
    const data_inicio = searchParams.get('data_inicio') || undefined
    const data_fim = searchParams.get('data_fim') || undefined
    
    if (useKanbanView) {
      // Usar view completa para Kanban
      let query = supabase
        .from('v_pedidos_kanban')
        .select('*')

      if (lojaId) query = query.eq('loja_id', lojaId)
      if (laboratorioId) query = query.eq('laboratorio_id', laboratorioId)
      // Suporte para filtros múltiplos de status (ex: status=REGISTRADO,PAGO,PRODUCAO)
      if (status) {
        const statusArray = status.split(',').map(s => s.trim())
        if (statusArray.length === 1) {
          query = query.eq('status', statusArray[0])
        } else {
          query = query.in('status', statusArray)
        }
      }
      if (prioridade) query = query.eq('prioridade', prioridade)
      if (eh_garantia !== null) query = query.eq('eh_garantia', eh_garantia === 'true')
      if (cliente_nome) query = query.ilike('cliente_nome', `%${cliente_nome}%`)
      if (numero_sequencial) query = query.eq('numero_sequencial', parseInt(numero_sequencial))
      if (numero_os_fisica) query = query.ilike('numero_os_fisica', `%${numero_os_fisica}%`)
      
      if (data_inicio && data_fim) {
        query = query.gte('created_at', data_inicio).lte('created_at', data_fim + ' 23:59:59')
      }

      query = query.order('created_at', { ascending: false })

      const { data, error } = await query

      if (error) {
        console.error('❌ Erro ao buscar pedidos Kanban:', error)
        return NextResponse.json({ error: 'Erro ao buscar pedidos' }, { status: 500 })
      }

      return NextResponse.json(data || [])
    } else {
      // Busca simples na tabela pedidos
      let query = supabase
        .from('pedidos')
        .select(`
          *,
          lojas (id, nome, codigo),
          laboratorios (id, nome, codigo),
          classes_lente (id, nome, codigo)
        `)

      if (lojaId) query = query.eq('loja_id', lojaId)
      if (laboratorioId) query = query.eq('laboratorio_id', laboratorioId)
      if (status) query = query.eq('status', status)
      if (prioridade) query = query.eq('prioridade', prioridade)
      if (eh_garantia !== null) query = query.eq('eh_garantia', eh_garantia === 'true')
      if (cliente_nome) query = query.ilike('cliente_nome', `%${cliente_nome}%`)

      query = query.order('created_at', { ascending: false })

      const { data, error } = await query

      if (error) {
        console.error('❌ Erro ao buscar pedidos simples:', error)
        return NextResponse.json({ error: 'Erro ao buscar pedidos' }, { status: 500 })
      }

      return NextResponse.json(data || [])
    }
  } catch (error) {
    console.error('❌ Erro geral na busca de pedidos:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!hasServerSupabaseEnv()) {
      return NextResponse.json({ error: 'Servidor sem SUPABASE configurado' }, { status: 503 })
    }
    
    const supabase = getServerSupabase()
    const body: CriarPedidoCompletoData = await request.json()
    
    console.log('🔔 API /pedidos POST - Dados recebidos:', {
      numero_os_fisica: body.numero_os_fisica,
      numero_pedido_laboratorio: body.numero_pedido_laboratorio,
      cliente_nome: body.cliente_nome,
      eh_garantia: body.eh_garantia
    })
    
    // Validação básica
    if (!body.loja_id || !body.laboratorio_id || !body.classe_lente_id || !body.cliente_nome) {
      return NextResponse.json(
        { error: 'Loja, laboratório, classe e nome do cliente são obrigatórios' },
        { status: 400 }
      )
    }

    // MÉTODO COM CÁLCULO DE SLA NA API (evita problema de trigger)
    console.log('🔄 Calculando SLA na API para evitar problemas de trigger')
    
    // Verificar se foi fornecida data prometida manual
    const dataPrometidaManual = body.data_prometida_manual
    let dataPrometida: Date
    
    if (dataPrometidaManual) {
      // Usar data manual fornecida pelo usuário
      dataPrometida = new Date(dataPrometidaManual + 'T00:00:00')
      console.log('📅 Usando data prometida MANUAL:', dataPrometidaManual)
    } else {
      // Calcular data prometida com SLA automático por prioridade
      const prioridade = body.prioridade || 'NORMAL'
      let slaDias = 5 // padrão
      
      switch (prioridade) {
        case 'URGENTE':
          slaDias = 2
          break
        case 'ALTA':
          slaDias = 4
          break
        case 'BAIXA':
          slaDias = 7
          break
        default: // NORMAL
          slaDias = 5
          break
      }
      
      const hoje = new Date()
      dataPrometida = new Date(hoje.getTime() + (slaDias * 24 * 60 * 60 * 1000))
      console.log('🤖 Usando data prometida AUTOMÁTICA:', slaDias, 'dias')
    }
    
    const hoje = new Date()
    const prioridade = body.prioridade || 'NORMAL'
    
    const novoPedido = {
      loja_id: body.loja_id,
      laboratorio_id: body.laboratorio_id,
      classe_lente_id: body.classe_lente_id,
      status: 'REGISTRADO' as const,
      prioridade: prioridade,
      cliente_nome: body.cliente_nome,
      cliente_telefone: body.cliente_telefone || null,
      numero_os_fisica: body.numero_os_fisica || null,
      numero_pedido_laboratorio: body.numero_pedido_laboratorio || null,
      valor_pedido: body.valor_pedido || null,
      custo_lentes: body.custo_lentes || null,
      eh_garantia: body.eh_garantia || false,
      observacoes: body.observacoes || null,
      observacoes_garantia: body.observacoes_garantia || null,
      // Calcular datas na API
      data_pedido: hoje.toISOString().split('T')[0],
      data_prometida: dataPrometida.toISOString().split('T')[0],
      created_at: hoje.toISOString(),
      updated_at: hoje.toISOString()
    }
    
    console.log('📝 Inserindo pedido com data prometida:', {
      cliente_nome: novoPedido.cliente_nome,
      prioridade: novoPedido.prioridade,
      data_prometida: novoPedido.data_prometida,
      tipo_data: dataPrometidaManual ? 'MANUAL' : 'AUTOMÁTICA',
      eh_garantia: novoPedido.eh_garantia
    })

    // Usar função que bypassa triggers
    console.log('🔄 Usando função que bypassa triggers problemáticos')
    
    const { data: resultado, error } = await supabase.rpc('inserir_pedido_sem_trigger', {
      p_loja_id: novoPedido.loja_id,
      p_laboratorio_id: novoPedido.laboratorio_id,
      p_classe_lente_id: novoPedido.classe_lente_id,
      p_status: novoPedido.status,
      p_prioridade: novoPedido.prioridade,
      p_cliente_nome: novoPedido.cliente_nome,
      p_cliente_telefone: novoPedido.cliente_telefone,
      p_observacoes: novoPedido.observacoes,
      p_eh_garantia: novoPedido.eh_garantia,
      p_data_pedido: novoPedido.data_pedido,
      p_data_prometida: novoPedido.data_prometida
    })
    
    if (error) {
      console.error('❌ Erro na função bypass:', error)
      return NextResponse.json({ error: 'Erro ao criar pedido' }, { status: 500 })
    }

    if (!resultado || resultado.length === 0) {
      console.error('❌ Função não retornou dados')
      return NextResponse.json({ error: 'Erro ao criar pedido' }, { status: 500 })
    }

    // Converter resultado da função para formato esperado
    const pedido = {
      id: resultado[0].id,
      numero_sequencial: resultado[0].numero_sequencial,
      cliente_nome: resultado[0].cliente_nome,
      data_pedido: resultado[0].data_pedido,
      data_prometida: resultado[0].data_prometida,
      status: resultado[0].status,
      prioridade: resultado[0].prioridade,
      loja_id: novoPedido.loja_id,
      laboratorio_id: novoPedido.laboratorio_id,
      classe_lente_id: novoPedido.classe_lente_id
    }
    
    if (error) {
      console.error('❌ Erro ao inserir pedido com SLA calculado:', error)
      return NextResponse.json({ error: 'Erro ao criar pedido' }, { status: 500 })
    }

    console.log('✅ Pedido criado via função bypass:', {
      id: pedido.id,
      numero_sequencial: pedido.numero_sequencial,
      cliente_nome: pedido.cliente_nome,
      data_prometida: pedido.data_prometida
    })
    
    return NextResponse.json(pedido, { status: 201 })
    
  } catch (error) {
    console.error('❌ Erro geral na API:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}