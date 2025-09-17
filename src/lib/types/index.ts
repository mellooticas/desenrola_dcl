// Centralizador de todos os tipos do sistema
export * from './database'

// Re-exports para facilitar imports
export type {
  StatusPedido,
  PrioridadeLevel,
  Laboratorio,
  Loja,
  ClasseLente,
  Tratamento,
  Pedido,
  PedidoCompleto,
  PedidoTratamento,
  CriarPedidoCompletoData,
  PedidoEvento, 
  Alerta,
  Usuario,
  FiltrosPedidos,
  DashboardMetricas,
  RelatorioFinanceiro
} from './database'
import type { FiltrosPedidos } from './database'

// Tipos específicos para API
export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

export interface ApiError {
  error: string
  details?: any
  status: number
}

// Tipos para formulários
export interface FormState {
  isLoading: boolean
  errors: Record<string, string>
  isDirty: boolean
}

// Tipos para filtros avançados
export interface FiltroAvancado extends FiltrosPedidos {
  ordenacao?: 'asc' | 'desc'
  campo_ordenacao?: string
  limite?: number
  offset?: number
}