// lib/types/notifications.ts
export interface Notificacao {
  id: string
  pedido_id?: string
  tipo: TipoNotificacao
  titulo: string
  mensagem: string
  destinatarios: string[]
  lida: boolean
  severidade: 'info' | 'warning' | 'error' | 'success'
  data_envio?: string
  created_at: string
}

export type TipoNotificacao = 
  | 'PAGAMENTO_VENCENDO'      // T-24h antes do vencimento
  | 'PAGAMENTO_VENCIDO'       // Pagamento em atraso
  | 'PRODUCAO_50_PERCENT'     // 50% do SLA de produção
  | 'PRODUCAO_VENCENDO'       // T-24h antes do SLA
  | 'PRODUCAO_VENCIDA'        // SLA de produção estourado
  | 'ENVIO_DISPONIVEL'        // Produto pronto para envio
  | 'ENVIO_ATRASADO'          // Envio em atraso
  | 'PEDIDO_CANCELADO'        // Pedido cancelado
  | 'RESUMO_DIARIO'           // Resumo executivo diário