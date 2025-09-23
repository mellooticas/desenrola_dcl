import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { PedidoCompleto, StatusPedido, PrioridadeLevel } from '@/lib/types/database'
import { toast } from 'sonner'

interface PedidosFilters {
  loja?: string
  laboratorio?: string
  status?: string
  prioridade?: string
  search?: string
}

export function usePedidos(filters: PedidosFilters = {}) {
  return useQuery({
    queryKey: ['pedidos', filters],
    queryFn: async (): Promise<PedidoCompleto[]> => {
      // Buscando pedidos com filtros

      try {
        // Query direta na tabela pedidos com joins
        let query = supabase
          .from('pedidos')
          .select(`
            *,
            lojas!inner(nome, codigo, endereco, telefone),
            laboratorios!inner(nome, codigo, sla_padrao_dias, trabalha_sabado),
            classes_lente!inner(nome, categoria, sla_base_dias, cor_badge)
          `)
          .order('updated_at', { ascending: false })

        // Aplicar filtros
        if (filters.loja && filters.loja !== 'all') {
          query = query.eq('loja_id', filters.loja)
        }

        if (filters.laboratorio && filters.laboratorio !== 'all') {
          query = query.eq('laboratorio_id', filters.laboratorio)
        }

        if (filters.status && filters.status !== 'all') {
          query = query.eq('status', filters.status)
        }

        if (filters.search) {
          query = query.or(`
            numero_sequencial.eq.${filters.search},
            cliente_nome.ilike.%${filters.search}%,
            numero_os_fisica.ilike.%${filters.search}%
          `)
        }

        const { data, error } = await query

        if (error) {
          throw error
        }

        // Pedidos encontrados: ${data?.length || 0}
        
        // Transformar dados para PedidoCompleto
        const pedidosCompletos: PedidoCompleto[] = (data || []).map((pedido: any) => {
          const hoje = new Date()
          const dataPedido = new Date(pedido.data_pedido)
          const diasDesdePedido = Math.floor((hoje.getTime() - dataPedido.getTime()) / (1000 * 60 * 60 * 24))

          return {
            ...pedido,
            // Dados da loja
            loja_nome: pedido.lojas?.nome || 'Loja não encontrada',
            loja_codigo: pedido.lojas?.codigo || 'N/A',
            loja_endereco: pedido.lojas?.endereco || null,
            loja_telefone: pedido.lojas?.telefone || null,
            
            // Dados do laboratório
            laboratorio_nome: pedido.laboratorios?.nome || 'Lab não encontrado',
            laboratorio_codigo: pedido.laboratorios?.codigo || null,
            laboratorio_sla_padrao: pedido.laboratorios?.sla_padrao_dias || 5,
            laboratorio_trabalha_sabado: pedido.laboratorios?.trabalha_sabado || false,
            
            // Dados da classe - CAMPO CORRIGIDO
            classe_nome: pedido.classes_lente?.nome || 'Classe não encontrada',
            classe_codigo: pedido.classes_lente?.codigo || null,
            classe_categoria: pedido.classes_lente?.categoria || 'geral',
            classe_sla_base: pedido.classes_lente?.sla_base_dias || 3,
            classe_cor: pedido.classes_lente?.cor_badge || '#6B7280',
            
            // Placeholders
            tratamentos_nomes: '',
            tratamentos_count: 0,
            dias_desde_pedido: diasDesdePedido,
            dias_para_vencer_sla: null,
            dias_para_vencer_prometido: null,
            alertas_count: 0
          }
        })

        return pedidosCompletos

      } catch {
        // Erro geral ao buscar pedidos
        
        // Dados mock como fallback
        return [
          {
            id: 'mock-1',
            numero_sequencial: 1001,
            numero_os_fisica: 'DCL001-2024-1001',
            numero_pedido_laboratorio: 'EXP-202409-1001',
            loja_id: 'loja-1',
            laboratorio_id: 'lab-1',
            classe_lente_id: 'classe-1',
            status: 'REGISTRADO',
            prioridade: 'NORMAL',
            data_pedido: '2024-09-10',
            data_prometida: '2024-09-15',
            data_limite_pagamento: null,
            data_prevista_pronto: null,
            data_prevista_envio: null,
            valor_pedido: 450.00,
            custo_lentes: 180.00,
            eh_garantia: false,
            data_pagamento: null,
            forma_pagamento: null,
            pagamento_atrasado: false,
            producao_atrasada: false,
            requer_atencao: false,
            cliente_nome: 'Maria Silva Santos',
            cliente_telefone: '(11) 99999-1234',
            observacoes: 'Cliente prefere lente transition',
            observacoes_garantia: null,
            observacoes_internas: null,
            created_at: '2024-09-10T10:00:00Z',
            updated_at: '2024-09-10T10:00:00Z',
            created_by: 'sistema',
            updated_by: null,
            loja_nome: 'DCL Matriz',
            loja_codigo: 'DCL001',
            loja_endereco: 'Av. Paulista, 1000',
            loja_telefone: '(11) 3000-1000',
            laboratorio_nome: 'Express Lentes Rio',
            laboratorio_codigo: 'EXPRESS_REAL',
            laboratorio_sla_padrao: 5,
            laboratorio_trabalha_sabado: true,
            classe_nome: 'Multifocal Premium',
            classe_codigo: 'MULTI_PREM',
            classe_categoria: 'multifocal',
            classe_sla_base: 7,
            classe_cor: '#8B5CF6',
            tratamentos_nomes: 'Antirreflexo, Transition',
            tratamentos_count: 2,
            dias_desde_pedido: 2,
            dias_para_vencer_sla: 3,
            dias_para_vencer_prometido: 5,
            alertas_count: 0,
            // Campos do montador
            montador_id: null,
            data_montagem: null,
            custo_montagem: null,
            montador_nome: null,
            montador_local: null,
            montador_contato: null
          }
        ]
      }
    },
    staleTime: 30000,
    refetchInterval: 60000,
  })
}

export function useUpdatePedidoStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      status,
      observacao,
      usuario
    }: {
      id: string
      status: StatusPedido
      observacao?: string
      usuario: string
    }) => {
      const { error } = await supabase
        .from('pedidos')
        .update({
          status: status,
          updated_at: new Date().toISOString(),
          updated_by: usuario
        })
        .eq('id', id)

      if (error) throw error

      // Registrar evento
      await supabase
        .from('pedido_eventos')
        .insert({
          pedido_id: id,
          tipo: 'STATUS_CHANGE',
          titulo: 'Status alterado',
          descricao: observacao || `Status alterado para ${status}`,
          status_novo: status,
          usuario: usuario,
          automatico: false
        })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pedidos'] })
      toast.success('Status atualizado com sucesso!')
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      toast.error('Erro ao atualizar status: ' + errorMessage)
    },
  })
}

export function useMarkPayment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      dataPagamento,
      formaPagamento,
      usuario
    }: {
      id: string
      dataPagamento: string
      formaPagamento: string
      usuario: string
    }) => {
      // Atualizar pedido para status PAGO
      const { error } = await supabase
        .from('pedidos')
        .update({
          status: 'PAGO',
          data_pagamento: dataPagamento,
          forma_pagamento: formaPagamento,
          updated_at: new Date().toISOString(),
          updated_by: usuario
        })
        .eq('id', id)

      if (error) {
        throw error
      }

      // Registrar evento
      await supabase
        .from('pedido_eventos')
        .insert({
          pedido_id: id,
          tipo: 'PAYMENT',
          titulo: 'Pagamento confirmado',
          descricao: `Pagamento confirmado via ${formaPagamento}`,
          status_anterior: 'AG_PAGAMENTO',
          status_novo: 'PAGO',
          usuario: usuario,
          automatico: false
        })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pedidos'] })
      toast.success('Pagamento registrado com sucesso!')
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      toast.error('Erro ao registrar pagamento: ' + errorMessage)
    },
  })
}


export function useCreatePedido() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (pedidoData: {
      loja_id: string
      laboratorio_id: string
      classe_lente_id: string
      prioridade?: PrioridadeLevel
      cliente_nome?: string
      cliente_telefone?: string
      valor_pedido?: number
      custo_lentes?: number
      observacoes?: string
      created_by: string
    }) => {
      const { data, error } = await supabase
        .from('pedidos')
        .insert({
          ...pedidoData,
          status: 'REGISTRADO' as StatusPedido,
          data_pedido: new Date().toISOString().split('T')[0],
          prioridade: pedidoData.prioridade || 'NORMAL',
          eh_garantia: false,
          pagamento_atrasado: false,
          producao_atrasada: false,
          requer_atencao: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pedidos'] })
      toast.success('Pedido criado com sucesso!')
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      toast.error('Erro ao criar pedido: ' + errorMessage)
    },
  })
}