// ======= STORE PRINCIPAL (ZUSTAND) =======

// lib/stores/pedidos.ts
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

// Definição dos tipos ausentes
type PedidoStatus = 'REGISTRADO' | 'AG_PAGAMENTO' | 'PAGO' | 'PRODUCAO' | 'ENVIO_MONTAGEM' | 'CHEGOU'
type PrioridadeLevel = 'BAIXA' | 'MEDIA' | 'ALTA'

interface PedidoKanban {
  id: string
  numero_sequencial: number
  loja_nome: string
  laboratorio_nome: string
  classe_lente: string
  cor_badge: string
  status: PedidoStatus
  prioridade: PrioridadeLevel
  data_prometida: string | null
  valor_pedido: number | null
  pagamento_atrasado: boolean
  producao_atrasada: boolean
  envio_atrasado: boolean
  cor_status: 'verde' | 'amarelo' | 'vermelho'
  dias_para_vencimento_pagamento: number | null
  dias_para_producao: number | null
}

interface PedidosState {
  // Estado
  pedidos: PedidoKanban[]
  filtros: {
    loja_id?: string
    laboratorio_id?: string
    status?: PedidoStatus[]
    busca?: string
    data_inicio?: string
    data_fim?: string
  }
  loading: boolean
  erro: string | null
  
  // Ações
  carregarPedidos: () => Promise<void>
  atualizarPedido: (id: string, dados: Partial<PedidoKanban>) => void
  moverCard: (cardId: string, novoStatus: PedidoStatus) => Promise<boolean>
  definirFiltros: (filtros: Partial<PedidosState['filtros']>) => void
  limparFiltros: () => void
  
  // Optimistic updates
  adicionarPedidoOptimista: (pedido: PedidoKanban) => void
  removerPedidoOptimista: (id: string) => void
}

export const usePedidosStore = create<PedidosState>()(
  devtools(
    (set, get) => ({
      pedidos: [],
      filtros: {},
      loading: false,
      erro: null,

      carregarPedidos: async () => {
        set({ loading: true, erro: null })
        try {
          // Implementar busca com filtros
          const response = await fetch('/api/pedidos')
          const pedidos = await response.json()
          set({ pedidos, loading: false })
        } catch (error) {
          set({ erro: 'Erro ao carregar pedidos', loading: false })
        }
      },

      atualizarPedido: (id, dados) => {
        set(state => ({
          pedidos: state.pedidos.map(p => 
            p.id === id ? { ...p, ...dados } : p
          )
        }))
      },

      moverCard: async (cardId, novoStatus) => {
        const pedidoAtual = get().pedidos.find(p => p.id === cardId)
        if (!pedidoAtual) return false

        // Validar transição
        const transicoesValidas: Partial<Record<PedidoStatus, PedidoStatus[]>> = {
          'REGISTRADO': ['AG_PAGAMENTO'],
          'AG_PAGAMENTO': ['PAGO'],
          'PAGO': ['PRODUCAO'],
          'PRODUCAO': ['ENVIO_MONTAGEM'],
          'ENVIO_MONTAGEM': ['CHEGOU'],
          'CHEGOU': []
        }

        if (!transicoesValidas[pedidoAtual.status]?.includes(novoStatus)) {
          return false
        }

        // Optimistic update
        get().atualizarPedido(cardId, { status: novoStatus })

        try {
          const response = await fetch(`/api/pedidos/${cardId}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: novoStatus })
          })

          if (!response.ok) {
            // Reverter se falhou
            get().atualizarPedido(cardId, { status: pedidoAtual.status })
            return false
          }

          return true
        } catch (error) {
          // Reverter se falhou
          get().atualizarPedido(cardId, { status: pedidoAtual.status })
          return false
        }
      },

      definirFiltros: (novosFiltros) => {
        set(state => ({
          filtros: { ...state.filtros, ...novosFiltros }
        }))
        get().carregarPedidos()
      },

      limparFiltros: () => {
        set({ filtros: {} })
        get().carregarPedidos()
      },

      adicionarPedidoOptimista: (pedido) => {
        set(state => ({
          pedidos: [pedido, ...state.pedidos]
        }))
      },

      removerPedidoOptimista: (id) => {
        set(state => ({
          pedidos: state.pedidos.filter(p => p.id !== id)
        }))
      }
    }),
    { name: 'pedidos-store' }
  )
)