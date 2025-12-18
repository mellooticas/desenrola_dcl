// 📋 Types para Sistema de Controle de OSs

export type TipoJustificativaOS = 
  | 'cancelada_cliente'
  | 'duplicada'
  | 'erro_numeracao'
  | 'nao_concretizada'
  | 'teste'
  | 'outro'

export type StatusOS = 
  | 'lancada'
  | 'nao_lancada'
  | 'justificada'
  | 'pendente_justificativa'

export interface OSSequencia {
  id: string
  numero_os: number
  loja_id: string
  data_esperada: string
  origem: 'importacao' | 'manual' | 'sistema'
  created_at: string
  updated_at: string
}

export interface OSNaoLancada {
  id: string
  numero_os: number
  loja_id: string
  justificativa: string
  tipo_justificativa: TipoJustificativaOS
  usuario_id: string
  resolvido: boolean
  data_resolucao: string | null
  created_at: string
  updated_at: string
}

export interface OSGap {
  numero_os: number
  loja_id: string
  loja_nome: string
  data_esperada: string
  origem: string
  status: StatusOS
  justificativa: string | null
  tipo_justificativa: TipoJustificativaOS | null
  precisa_atencao: boolean
}

export interface OSEstatisticas {
  loja_id: string | null // null quando agregando todas as lojas
  loja_nome: string
  total_os_esperadas: number
  total_lancadas: number
  total_nao_lancadas: number
  total_justificadas: number
  total_pendentes: number
  total_precisa_atencao: number
  percentual_lancamento: number
}

export interface JustificarOSParams {
  numero_os: number
  loja_id: string
  justificativa: string
  tipo_justificativa: TipoJustificativaOS
  usuario_id: string
}

export interface PopularSequenciaParams {
  loja_id: string
  numero_inicial: number
  numero_final: number
  origem?: 'importacao' | 'manual' | 'sistema'
}

export const TIPOS_JUSTIFICATIVA_LABELS: Record<TipoJustificativaOS, string> = {
  cancelada_cliente: '❌ Cancelada pelo Cliente',
  duplicada: '📋 OS Duplicada',
  erro_numeracao: '🔢 Erro de Numeração',
  nao_concretizada: '⏸️ Não Concretizada',
  teste: '🧪 OS de Teste',
  outro: '📝 Outro Motivo'
}
