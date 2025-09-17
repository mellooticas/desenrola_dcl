// lib/supabase/client.ts
import { createClient } from '@supabase/supabase-js'
import { validateClientEnv } from '@/lib/env'

const { supabaseUrl, supabaseAnonKey } = validateClientEnv()

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper functions para queries comuns
export const supabaseHelpers = {
  // Buscar laboratórios ativos
  async getLaboratorios() {
    const { data, error } = await supabase
      .from('laboratorios')
      .select('*')
      .eq('ativo', true)
      .order('nome')
     
    if (error) throw error
    return data
  },

  // Buscar lojas ativas
  async getLojas() {
    const { data, error } = await supabase
      .from('lojas')
      .select('*')
      .eq('ativo', true)
      .order('nome')
    
    if (error) throw error
    return data
  },

  // Buscar classes de lente ativas
  async getClassesLente() {
    const { data, error } = await supabase
      .from('classes_lente')
      .select('*')
      .eq('ativa', true)
      .order('nome')
    
    if (error) throw error
    return data
  },

  // Buscar pedidos para Kanban
  async getPedidosKanban(filters?: {
    loja_id?: string
    laboratorio_id?: string
    status?: string[]
  }) {
    let query = supabase
      .from('v_pedidos_kanban')
      .select('*')
      .order('updated_at', { ascending: false })

    if (filters?.loja_id) {
      query = query.eq('loja_id', filters.loja_id)
    }
    
    if (filters?.laboratorio_id) {
      query = query.eq('laboratorio_id', filters.laboratorio_id)
    }
    
    if (filters?.status && filters.status.length > 0) {
      query = query.in('status', filters.status)
    }

    const { data, error } = await query
    
    if (error) throw error
    return data
  },

  // Criar novo pedido
  async criarPedido(pedido: {
    loja_id: string
    laboratorio_id: string
    classe_lente_id: string
    prioridade?: string
    cliente_nome: string
    cliente_telefone?: string
    valor_pedido?: number
    observacoes?: string
  }) {  
    const { data, error } = await supabase
      .from('pedidos')
      .insert({
        ...pedido,
        status: 'REGISTRADO',
        prioridade: pedido.prioridade || 'NORMAL',
        data_pedido: new Date().toISOString().split('T')[0],
        created_by: 'sistema' // TODO: pegar usuário logado
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Atualizar status do pedido
  async atualizarStatus(
    pedidoId: string, 
    novoStatus: string, 
    observacao?: string
  ) {
    const { data, error } = await supabase
      .from('pedidos')
      .update({
        status: novoStatus
        // campos de auditoria removidos temporariamente para debug
      })
      .eq('id', pedidoId)
      .select()
      .single()

    if (error) throw error

    // Registrar evento
    await supabase
      .from('pedido_eventos')
      .insert({
        pedido_id: pedidoId,
        tipo: 'STATUS_CHANGE',
        titulo: `Status alterado para ${novoStatus}`,
        descricao: observacao || null,
        status_novo: novoStatus,
        usuario: 'sistema',
        automatico: false
      })

    return data
  },

  // Marcar pagamento
  async marcarPagamento(
    pedidoId: string,
    dataPagamento: string,
    formaPagamento: string
  ) {
    const { data, error } = await supabase
      .from('pedidos')
      .update({
        status: 'PAGO',
        data_pagamento: dataPagamento,
        forma_pagamento: formaPagamento,
        updated_at: new Date().toISOString(),
        updated_by: 'sistema'
      })
      .eq('id', pedidoId)
      .select()
      .single()

    if (error) throw error

    // Registrar evento
    await supabase
      .from('pedido_eventos')
      .insert({
        pedido_id: pedidoId,
        tipo: 'PAYMENT',
        titulo: 'Pagamento confirmado',
        descricao: `Forma: ${formaPagamento}`,
        status_novo: 'PAGO',
        usuario: 'sistema',
        automatico: false
      })

    return data
  },

  // Buscar eventos do pedido
  async getEventosPedido(pedidoId: string) {
    const { data, error } = await supabase
      .from('pedido_eventos')
      .select('*')
      .eq('pedido_id', pedidoId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  // Buscar alertas ativos
  async getAlertasAtivos(lojaId?: string) {
    let query = supabase
      .from('alertas')
      .select(`
        *,
        pedidos:pedido_id (numero_sequencial, cliente_nome),
        lojas:loja_id (nome)
      `)
      .eq('lido', false)
      .order('created_at', { ascending: false })

    if (lojaId) {
      query = query.eq('loja_id', lojaId)
    }

    const { data, error } = await query
    
    if (error) throw error
    return data
  },

  // Marcar alerta como lido
  async marcarAlertaLido(alertaId: string) {
    const { error } = await supabase
      .from('alertas')
      .update({ lido: true })
      .eq('id', alertaId)

    if (error) throw error
  },

  // Métricas do dashboard
  async getDashboardMetrics(lojaId?: string) {
    // Esta query será complexa, vamos simplificar por enquanto
    const { data: pedidos, error } = await supabase
      .from('pedidos')
      .select('status, valor_pedido, data_pedido')
      .gte('data_pedido', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .eq('loja_id', lojaId || '')

    if (error) throw error

    // Calcular métricas básicas
    const total = pedidos.length
    const porStatus = pedidos.reduce((acc, p) => {
      acc[p.status] = (acc[p.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return {
      total_pedidos: total,
      registrados: porStatus.REGISTRADO || 0,
      aguardando_pagamento: porStatus.AG_PAGAMENTO || 0,
      em_producao: porStatus.PRODUCAO || 0,
      prontos: porStatus.PRONTO || 0,
      entregues: porStatus.ENTREGUE || 0,
      cancelados: porStatus.CANCELADO || 0,
      lead_time_medio: 5, // TODO: calcular real
      sla_compliance: 95, // TODO: calcular real
      alertas_ativos: 0, // TODO: contar alertas
      faturamento_mes: pedidos.reduce((sum, p) => sum + (p.valor_pedido || 0), 0)
    }
  }
}