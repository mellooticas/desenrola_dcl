import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase, hasServerSupabaseEnv } from '@/lib/supabase/server'
import type { Pedido, CriarPedidoCompletoData } from '@/lib/types/database'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    if (!hasServerSupabaseEnv()) {
      // Ambiente local sem SUPABASE_URL/SERVICE_ROLE: retornar mock para evitar 404 no dev
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
      if (eh_garantia !== undefined && (eh_garantia === 'true' || eh_garantia === 'false')) query = query.eq('eh_garantia', eh_garantia === 'true')
      if (cliente_nome) query = query.ilike('cliente_nome', `%${cliente_nome}%`)
      if (numero_sequencial) query = query.eq('numero_sequencial', Number(numero_sequencial))
      if (numero_os_fisica) query = query.ilike('numero_os_fisica', `%${numero_os_fisica}%`)
      if (data_inicio) query = query.gte('data_pedido', data_inicio)
      if (data_fim) query = query.lte('data_pedido', data_fim)

      const { data: pedidos, error } = await query.order('updated_at', { ascending: false })
      
      if (error) {
        const debug = process.env.NEXT_PUBLIC_DEBUG === 'true' || process.env.NEXT_PUBLIC_DEBUG === '1'
        const errPayload = debug
          ? { error: 'Erro ao buscar pedidos', details: (error as unknown as { message?: string })?.message || 'Falha na consulta' }
          : { error: 'Erro ao buscar pedidos' }
        return NextResponse.json(errPayload, { status: 500 })
      }
      
      return NextResponse.json(pedidos)
    } else {
      // Busca simples na tabela principal
      const { data: pedidos, error } = await supabase
        .from('pedidos')
        .select(`
          *,
          loja:lojas(nome, codigo),
          laboratorio:laboratorios(nome, codigo),
          classe:classes_lente(nome, categoria, cor_badge)
        `)
        .order('updated_at', { ascending: false })
      
      if (error) {
        const debug = process.env.NEXT_PUBLIC_DEBUG === 'true' || process.env.NEXT_PUBLIC_DEBUG === '1'
        const errPayload = debug
          ? { error: 'Erro ao buscar pedidos', details: (error as unknown as { message?: string })?.message || 'Falha na consulta' }
          : { error: 'Erro ao buscar pedidos' }
        return NextResponse.json(errPayload, { status: 500 })
      }
      
      return NextResponse.json(pedidos)
    }
  } catch {
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!hasServerSupabaseEnv()) {
      return NextResponse.json({ error: 'Servidor sem SUPABASE configurado' }, { status: 503 })
    }
    
    const supabase = getServerSupabase()
    const body: CriarPedidoCompletoData = await request.json()
    
    // DEBUG: Log dos dados recebidos na API
    console.log('🔔 API /pedidos POST - Dados recebidos:', {
      numero_os_fisica: body.numero_os_fisica,
      numero_pedido_laboratorio: body.numero_pedido_laboratorio,
      cliente_nome: body.cliente_nome,
      cliente_telefone: body.cliente_telefone,
      valor_pedido: body.valor_pedido,
      custo_lentes: body.custo_lentes,
      observacoes: body.observacoes,
      loja_id: body.loja_id,
      eh_garantia: body.eh_garantia
    })
    
    // Validação básica
    if (!body.loja_id || !body.laboratorio_id || !body.classe_lente_id || !body.cliente_nome) {
      return NextResponse.json(
        { error: 'Loja, laboratório, classe e nome do cliente são obrigatórios' },
        { status: 400 }
      )
    }

    // MÉTODO 1: Usar função SQL (mais confiável para permissões)
    try {
      const { data: pedidoId, error: funcaoError } = await supabase
        .rpc('criar_pedido_simples', {
          p_loja_id: body.loja_id,
          p_laboratorio_id: body.laboratorio_id,
          p_classe_lente_id: body.classe_lente_id,
          p_cliente_nome: body.cliente_nome,
          p_cliente_telefone: body.cliente_telefone || null,
          p_numero_os_fisica: body.numero_os_fisica || null,
          p_numero_pedido_laboratorio: body.numero_pedido_laboratorio || null,
          p_valor_pedido: body.valor_pedido || null,
          p_custo_lentes: body.custo_lentes || null,
          p_eh_garantia: body.eh_garantia || false,
          p_observacoes: body.observacoes || null,
          p_observacoes_garantia: body.observacoes_garantia || null,
          p_prioridade: body.prioridade || 'NORMAL'
        })

      if (!funcaoError && pedidoId) {
        // DEBUG: Log da função SQL
        console.log('🔧 Pedido criado via função SQL - ID:', pedidoId)
        
        // Buscar dados completos do pedido criado
        const { data: pedidoCompleto, error: buscaError } = await supabase
          .from('pedidos')
          .select('*')
          .eq('id', pedidoId)
          .single()

        if (!buscaError && pedidoCompleto) {
          console.log('✅ Pedido criado com sucesso:', {
            id: pedidoCompleto.id,
            numero_sequencial: pedidoCompleto.numero_sequencial,
            cliente_telefone: pedidoCompleto.cliente_telefone,
            numero_os_fisica: pedidoCompleto.numero_os_fisica,
            numero_pedido_laboratorio: pedidoCompleto.numero_pedido_laboratorio,
            valor_pedido: pedidoCompleto.valor_pedido,
            custo_lentes: pedidoCompleto.custo_lentes,
            observacoes: pedidoCompleto.observacoes,
            eh_garantia: pedidoCompleto.eh_garantia,
            cliente_nome: pedidoCompleto.cliente_nome
          })
          return NextResponse.json(pedidoCompleto, { status: 201 })
        } else {
          // Retornar pelo menos o ID
          return NextResponse.json({ id: pedidoId }, { status: 201 })
        }
      } else {
        console.log('⚠️ Função SQL falhou, erro:', funcaoError)
      }
    } catch (error) {
      console.log('⚠️ Erro ao executar função SQL:', error)
    }

    // MÉTODO 2: Inserção direta (fallback)
    // Usar SLA padrão sem acessar laboratorio_sla para evitar problema de permissões
    let slaDias = 5 // SLA padrão
    
    // Tentar buscar SLA da classe de lente (com fallback se falhar)
    try {
      const { data: classe, error: classeError } = await supabase
        .from('classes_lente')
        .select('sla_base_dias')
        .eq('id', body.classe_lente_id)
        .single()
      
      if (!classeError && classe && classe.sla_base_dias) {
        slaDias = classe.sla_base_dias
      }
    } catch (error) {
      console.log('⚠️ Erro ao buscar SLA da classe, usando padrão:', error)
      // Continuar com SLA padrão
    }

    // Ajustar por prioridade (apenas para SLA lab)
    switch (body.prioridade) {
      case 'BAIXA': slaDias += 2; break
      case 'ALTA': slaDias -= 1; break
      case 'URGENTE': slaDias -= 3; break
    }
    slaDias = Math.max(1, slaDias)

    // Buscar margem de segurança da loja
    let margemSegurancaDias = 2 // padrão
    try {
      const { data: lojaData } = await supabase
        .from('lojas')
        .select('margem_seguranca_dias')
        .eq('id', body.loja_id)
        .single()
      
      if (lojaData?.margem_seguranca_dias) {
        margemSegurancaDias = lojaData.margem_seguranca_dias
      }
    } catch (error) {
      console.log('⚠️ Erro ao buscar margem da loja, usando padrão:', error)
    }

    // Calcular datas (dias úteis)
    const addBusinessDays = (start: Date, days: number) => {
      const d = new Date(start)
      let added = 0
      while (added < days) {
        d.setDate(d.getDate() + 1)
        const dow = d.getDay()
        if (dow !== 0 && dow !== 6) added++
      }
      return d
    }
    
    // 1. SLA LAB (controle interno)
    const dataSlaLab = addBusinessDays(new Date(), slaDias)
    const data_sla_laboratorio = dataSlaLab.toISOString().split('T')[0]
    
    // 2. PROMESSA CLIENTE (SLA + margem)
    const diasPromessaCliente = slaDias + margemSegurancaDias
    const dataPromessaCliente = addBusinessDays(new Date(), diasPromessaCliente)
    const data_prometida = dataPromessaCliente.toISOString().split('T')[0]
    
    // 3. LEGADO (compatibilidade - usar SLA lab)
    const data_prevista_pronto = data_sla_laboratorio

    const novoPedido: Partial<Pedido> = {
      loja_id: body.loja_id,
      laboratorio_id: body.laboratorio_id,
      classe_lente_id: body.classe_lente_id,
      status: 'REGISTRADO',
      prioridade: body.prioridade || 'NORMAL',
      cliente_nome: body.cliente_nome,
      cliente_telefone: body.cliente_telefone || null,
      numero_os_fisica: body.numero_os_fisica || null,
      numero_pedido_laboratorio: body.numero_pedido_laboratorio || null,
      valor_pedido: body.valor_pedido || null,
      custo_lentes: body.custo_lentes || null,
      eh_garantia: body.eh_garantia || false,
      observacoes: body.observacoes || null,
      observacoes_garantia: body.observacoes_garantia || null,
      // NOVAS DATAS CALCULADAS SEPARADAMENTE
      data_sla_laboratorio,
      data_prometida,
      data_prevista_pronto, // compatibilidade
      created_by: 'api_direct'
    }
    
    // DEBUG: Log do objeto que será inserido
    console.log('📝 Objeto para inserção no banco:', {
      cliente_nome: novoPedido.cliente_nome,
      data_sla_laboratorio: novoPedido.data_sla_laboratorio,
      data_prometida: novoPedido.data_prometida,
      data_prevista_pronto: novoPedido.data_prevista_pronto,
      margem_seguranca_dias: margemSegurancaDias,
      custo_lentes: novoPedido.custo_lentes,
      observacoes: novoPedido.observacoes,
      eh_garantia: novoPedido.eh_garantia
    })
    
    const { data: pedido, error } = await supabase
      .from('pedidos')
      .insert(novoPedido)
      .select()
      .single()
    
    if (error) {
      console.error('❌ Erro ao inserir pedido:', error)
      const debug = process.env.NEXT_PUBLIC_DEBUG === 'true' || process.env.NEXT_PUBLIC_DEBUG === '1'
      const errPayload = debug
        ? { error: 'Erro ao criar pedido', details: (error as unknown as { message?: string })?.message || 'Falha na inserção' }
        : { error: 'Erro ao criar pedido' }
      return NextResponse.json(errPayload, { status: 500 })
    }
    
    // DEBUG: Log do pedido criado
    console.log('✅ Pedido criado com sucesso:', {
      id: pedido.id,
      numero_sequencial: pedido.numero_sequencial,
      cliente_telefone: pedido.cliente_telefone,
      numero_os_fisica: pedido.numero_os_fisica,
      numero_pedido_laboratorio: pedido.numero_pedido_laboratorio,
      valor_pedido: pedido.valor_pedido,
      custo_lentes: pedido.custo_lentes,
      observacoes: pedido.observacoes,
      eh_garantia: pedido.eh_garantia,
      cliente_nome: pedido.cliente_nome
    })
    
    return NextResponse.json(pedido, { status: 201 })
    
  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}