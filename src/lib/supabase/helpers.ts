// lib/supabase/helpers.ts - Funções atualizadas

import { supabase } from './client'
import { 
  Laboratorio, 
  Loja, 
  ClasseLente,  
  Tratamento,
  PedidoCompleto, 
  CriarPedidoCompletoData,
  StatusPedido,
  FiltrosPedidos,
  DashboardMetricas 
} from '../types/database'

export const supabaseHelpers = {
  // ========== TRATAMENTOS ==========
  
  async getTratamentos(): Promise<Tratamento[]> {
    const { data, error } = await supabase
      .from('tratamentos')
      .select('*')
      .eq('ativo', true)
      .order('nome')

    if (error) {
      console.error('Erro ao buscar tratamentos:', error)
      throw error
    }

    return data || []
  },

  async criarTratamento(tratamento: Omit<Tratamento, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('tratamentos')
      .insert([tratamento])
      .select()
      .single()

    if (error) {
      console.error('Erro ao criar tratamento:', error)
      throw error
    }

    return data
  },

  // ========== FUNÇÕES EXISTENTES ATUALIZADAS ==========

  async getLaboratorios(): Promise<Laboratorio[]> {
    const { data, error } = await supabase
      .from('laboratorios')
      .select('*')
      .eq('ativo', true)
      .order('nome')

    if (error) {
      console.error('Erro ao buscar laboratórios:', error)
      throw error
    }

    return data || []
  },

  async getLojas(): Promise<Loja[]> {
    const { data, error } = await supabase
      .from('lojas')
      .select('*')
      .eq('ativo', true)
      .order('nome')

    if (error) {
      console.error('Erro ao buscar lojas:', error)
      throw error
    }

    return data || []
  },

  async getClassesLente(): Promise<ClasseLente[]> {
    const { data, error } = await supabase
      .from('classes_lente')
      .select('*')
      .eq('ativa', true)
      .order('nome') 

    if (error) {
      console.error('Erro ao buscar classes de lente:', error)
      throw error
    }

    return data || []
  },

  // ========== PEDIDOS COM NOVOS CAMPOS ==========

  async getPedidosKanban(filtros: FiltrosPedidos = {}): Promise<PedidoCompleto[]> {
    const params = new URLSearchParams()
    params.set('view', 'kanban')
    if (filtros.loja_id) params.set('loja_id', filtros.loja_id)
    if (filtros.laboratorio_id) params.set('laboratorio_id', filtros.laboratorio_id)
    if (filtros.status) params.set('status', String(filtros.status))
    if (filtros.prioridade) params.set('prioridade', filtros.prioridade)
    if (typeof filtros.eh_garantia === 'boolean') params.set('eh_garantia', String(filtros.eh_garantia))
    if (filtros.cliente_nome) params.set('cliente_nome', filtros.cliente_nome)
    if (typeof filtros.numero_sequencial === 'number') params.set('numero_sequencial', String(filtros.numero_sequencial))
    if (filtros.numero_os_fisica) params.set('numero_os_fisica', filtros.numero_os_fisica)
    if (filtros.data_inicio) params.set('data_inicio', filtros.data_inicio)
    if (filtros.data_fim) params.set('data_fim', filtros.data_fim)

    const res = await fetch(`/api/pedidos?${params.toString()}`, { cache: 'no-store' })
    if (!res.ok) {
      const txt = await res.text()
      throw new Error(`API /api/pedidos falhou: ${res.status} ${txt}`)
    }
    const data = await res.json()
    return data || []
  },

  async criarPedidoCompleto(dadosPedido: CriarPedidoCompletoData) {
    const res = await fetch('/api/pedidos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dadosPedido),
    })
    if (!res.ok) {
      const txt = await res.text()
      throw new Error(`API /api/pedidos (POST) falhou: ${res.status} ${txt}`)
    }
    const pedido = await res.json()
    // Evento de criação já é tratado no backend no futuro; por ora, mantemos simples
    return pedido
  },

  async atualizarStatus(
    pedidoId: string, 
    novoStatus: StatusPedido, 
    observacao?: string
    // usuario removido - estava causando erro UUID
  ) {
    // Buscar status atual
    const { data: pedidoAtual, error: errorBusca } = await supabase
      .from('pedidos')
      .select('status')
      .eq('id', pedidoId)
      .single()

    if (errorBusca) {
      console.error('Erro ao buscar pedido atual:', errorBusca)
      throw errorBusca
    }

    const statusAnterior = pedidoAtual.status

    // Atualizar status
    const { error } = await supabase
      .from('pedidos')
      .update({ 
        status: novoStatus,
        updated_at: new Date().toISOString(),
        updated_by: null // NULL para evitar erro na trigger 
      })
      .eq('id', pedidoId)

    if (error) {
      console.error('Erro ao atualizar status:', error)
      throw error
    }

    // Criar evento - TEMPORARIAMENTE COMENTADO PARA DEBUG
    /*
    await this.criarEvento({
      pedido_id: pedidoId,
      tipo: 'STATUS_CHANGE',
      titulo: `Status alterado`,
      descricao: observacao || `Status alterado para ${novoStatus}`,
      status_anterior: statusAnterior,
      status_novo: novoStatus
      // usuario removido temporariamente - campo espera UUID, não string
    })
    */

    return true
  },

  async marcarPagamento(
    pedidoId: string, 
    dataParamento: string, 
    formaPagamento: string
    // usuario removido - estava causando erro UUID
  ) {
    const { error } = await supabase
      .from('pedidos')
      .update({ 
        status: 'PAGO',
        data_pagamento: dataParamento,
        forma_pagamento: formaPagamento
        // campos de auditoria removidos para evitar erro UUID
      })
      .eq('id', pedidoId)

    if (error) {
      console.error('Erro ao marcar pagamento:', error)
      throw error
    }

    // Criar evento
    await this.criarEvento({
      pedido_id: pedidoId,
      tipo: 'PAYMENT',
      titulo: 'Pagamento confirmado',
      descricao: `Pagamento confirmado via ${formaPagamento}`,
      status_anterior: 'AG_PAGAMENTO',
      status_novo: 'PAGO'
      // usuario removido para evitar erro UUID
    })

    return true
  },

  // ========== EVENTOS ==========

  async criarEvento(evento: {
    pedido_id: string
    tipo: string
    titulo: string
    descricao?: string
    status_anterior?: StatusPedido
    status_novo?: StatusPedido
    usuario?: string
  }) {
    // Remover campo usuario se não for fornecido (para evitar erro UUID)
    const { usuario, ...eventoSemUsuario } = evento
    const eventoParaInserir = usuario ? evento : eventoSemUsuario

    const { error } = await supabase
      .from('pedido_eventos')
      .insert([{
        ...eventoParaInserir,
        automatico: false
      }])

    if (error) {
      console.error('Erro ao criar evento:', error)
      throw error
    }

    return true
  },

  async getEventosPedido(pedidoId: string) {
    const { data, error } = await supabase
      .from('pedido_eventos')
      .select('*')
      .eq('pedido_id', pedidoId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erro ao buscar eventos:', error)
      throw error
    }

    return data || []
  },

  // ========== DASHBOARD COM NOVOS DADOS ==========

  async getDashboardMetricas(): Promise<DashboardMetricas> {
    // Query para métricas básicas
    const { data: metricas, error } = await supabase
      .from('pedidos')
      .select(`
        status,
        eh_garantia,
        valor_pedido,
        custo_lentes,
        created_at
      `)

    if (error) {
      console.error('Erro ao buscar métricas:', error)
      throw error
    }

    if (!metricas) {
      throw new Error('Nenhum dado encontrado')
    }

    const agora = new Date()
    const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1)
    
    // Filtrar pedidos do mês atual
    const pedidosMes = metricas.filter(p => 
      new Date(p.created_at) >= inicioMes
    )

    // Calcular totais
    const totalPedidos = pedidosMes.length
    const pedidosGarantia = pedidosMes.filter(p => p.eh_garantia).length
    
    // Contar por status
    const contadores = pedidosMes.reduce((acc, pedido) => {
      acc[pedido.status] = (acc[pedido.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Calcular valores financeiros
    const valorTotalVendas = pedidosMes
      .filter(p => !p.eh_garantia)
      .reduce((acc, p) => acc + (p.valor_pedido || 0), 0)
    
    const custoTotalLentes = pedidosMes
      .reduce((acc, p) => acc + (p.custo_lentes || 0), 0)

    const margemBruta = valorTotalVendas - custoTotalLentes

    // Buscar alertas ativos
    const { data: alertas } = await supabase
      .from('alertas')
      .select('id')
      .eq('lido', false)

    const alertasAtivos = alertas?.length || 0

    return {
      total_pedidos: totalPedidos,
      registrados: contadores.REGISTRADO || 0,
      aguardando_pagamento: contadores.AG_PAGAMENTO || 0,
      em_producao: contadores.PRODUCAO || 0,
      entregues: contadores.ENTREGUE || 0,
      cancelados: contadores.CANCELADO || 0,
      pedidos_garantia: pedidosGarantia,
      lead_time_medio: 5, // TODO: calcular real
      alertas_ativos: alertasAtivos,
      valor_total_vendas: valorTotalVendas,
      custo_total_lentes: custoTotalLentes,
      margem_bruta: margemBruta,
      sla_compliance: 95 // TODO: calcular real
    }
  },

  // ========== BUSCA AVANÇADA ==========

  async buscarPedidos(termo: string) {
    const { data, error } = await supabase
      .from('v_pedidos_kanban')
      .select('*')
      .or(`
        numero_sequencial.eq.${parseInt(termo) || 0},
        numero_os_fisica.ilike.%${termo}%,
        cliente_nome.ilike.%${termo}%
      `)
      .limit(10)

    if (error) {
      console.error('Erro na busca:', error)
      throw error
    }

    return data || []
  },

  // ========== RELATÓRIOS ==========

  async getRelatorioTratamentos(dataInicio: string, dataFim: string) {
    const { data, error } = await supabase
      .from('pedido_tratamentos')
      .select(`
        tratamento_id,
        custo_unitario,
        tratamentos!inner(nome, custo_adicional),
        pedidos!inner(data_pedido, valor_pedido, eh_garantia)
      `)
      .gte('pedidos.data_pedido', dataInicio)
      .lte('pedidos.data_pedido', dataFim)

    if (error) {
      console.error('Erro ao buscar relatório tratamentos:', error)
      throw error
    }

    return data || []
  },

  async getRelatorioGarantias(dataInicio: string, dataFim: string) {
    const { data, error } = await supabase
      .from('pedidos')
      .select('*')
      .eq('eh_garantia', true)
      .gte('data_pedido', dataInicio)
      .lte('data_pedido', dataFim)
      .order('data_pedido', { ascending: false })

    if (error) {
      console.error('Erro ao buscar relatório garantias:', error)
      throw error
    }

    return data || []
  }
}

