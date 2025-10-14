// lib/types/database.ts - Tipos atualizados (APENAS OS AJUSTES NECESSÁRIOS)

export type StatusPedido =
  | 'REGISTRADO'
  | 'AG_PAGAMENTO'
  | 'PAGO'
  | 'PRODUCAO'
  | 'PRONTO'
  | 'ENVIADO'
  | 'CHEGOU'
  | 'ENTREGUE'
  | 'CANCELADO'

export type PrioridadeLevel = 'BAIXA' | 'NORMAL' | 'ALTA' | 'URGENTE'
 
// ========== INTERFACES PRINCIPAIS ==========
 
export interface Laboratorio {
  id: string
  nome: string
  codigo?: string | null 
  contato?: {
    email?: string
    telefone?: string
    endereco?: string
  } | null
  sla_padrao_dias: number
  trabalha_sabado: boolean
  ativo: boolean
  created_at?: string
}

export interface Loja {
  id: string
  nome: string
  codigo: string
  endereco: string | null
  telefone: string | null
  gerente: string | null
  ativo: boolean
  created_at: string
  margem_seguranca_dias: number
  alerta_sla_dias: number
}

export interface ClasseLente {
  id: string
  nome: string
  codigo?: string | null
  categoria?: string | null
  sla_base_dias: number
  cor_badge: string
  ativa: boolean
  created_at?: string
}

// NOVO: Interface para Tratamentos
export interface Tratamento {
  id: string
  nome: string
  codigo: string | null
  descricao: string | null
  custo_adicional: number
  tempo_adicional_dias: number
  cor_badge: string
  ativo: boolean
  created_at: string
}

// Interface do Pedido atualizada
export interface Pedido {
  id: string
  numero_sequencial: number
  numero_os_fisica: string | null
  numero_pedido_laboratorio: string | null
  loja_id: string
  laboratorio_id: string
  classe_lente_id: string
  status: StatusPedido
  prioridade: PrioridadeLevel
  data_pedido: string
  data_prometida: string | null
  data_limite_pagamento: string | null
  data_prevista_pronto: string | null
  data_prevista_envio: string | null
  data_sla_laboratorio: string | null
  observacoes_sla: string | null
  valor_pedido: number | null
  custo_lentes: number | null
  eh_garantia: boolean
  data_pagamento: string | null
  forma_pagamento: string | null
  pagamento_atrasado: boolean
  producao_atrasada: boolean
  requer_atencao: boolean
  cliente_nome: string
  cliente_telefone: string | null
  montador_id: string | null
  data_montagem: string | null
  custo_montagem: number | null
  observacoes: string | null
  observacoes_garantia: string | null
  observacoes_internas: string | null
  created_at?: string
  updated_at?: string
  created_by?: string | null
  updated_by?: string | null
}

// ⭐ INTERFACE COMPLETA PARA KANBAN - independente para evitar conflitos
export interface PedidoCompleto {
  // Campos base do pedido
  id: string
  numero_sequencial: number
  numero_os_fisica: string | null
  numero_pedido_laboratorio: string | null
  loja_id: string
  laboratorio_id: string
  classe_lente_id: string
  status: StatusPedido
  prioridade: PrioridadeLevel
  data_pedido: string
  data_prometida: string | null
  data_limite_pagamento: string | null
  data_prevista_pronto: string | null
  data_prevista_envio: string | null
  data_sla_laboratorio: string | null
  observacoes_sla: string | null
  valor_pedido: number | null
  custo_lentes: number | null
  eh_garantia: boolean
  data_pagamento: string | null
  forma_pagamento: string | null
  pagamento_atrasado: boolean
  producao_atrasada: boolean
  requer_atencao: boolean
  cliente_nome: string
  cliente_telefone: string | null
  montador_id: string | null
  data_montagem: string | null
  custo_montagem: number | null
  observacoes: string | null
  observacoes_garantia: string | null
  observacoes_internas: string | null
  created_at?: string
  updated_at?: string
  created_by?: string | null
  updated_by?: string | null

  // Dados da loja
  loja_nome: string
  loja_codigo: string
  loja_endereco: string | null
  loja_telefone: string | null
  margem_seguranca_dias: number
  alerta_sla_dias: number
  
  // Dados do laboratório  
  laboratorio_nome: string
  laboratorio_codigo: string | null
  laboratorio_sla_padrao: number
  laboratorio_trabalha_sabado: boolean
  
  // Dados do montador (quando aplicável)
  montador_nome: string | null
  montador_local: string | null
  montador_contato: string | null
  
  // Dados da classe de lente
  classe_nome: string
  classe_codigo: string | null
  classe_categoria: string
  classe_sla_base: number
  classe_cor: string  // ← ESTE ERA classe_cor, não cor_badge
  
  // Tratamentos
  tratamentos_nomes: string  // ← AJUSTADO: não é nullable na view
  tratamentos_count: number
  
  // Novos campos calculados da view (migração SLA)
  sla_atrasado: boolean
  sla_alerta: boolean
  dias_para_sla: number
  dias_para_promessa: number
  
  // Cálculos úteis (mantidos para compatibilidade)
  dias_desde_pedido: number
  dias_para_vencer_sla: number | null
  dias_para_vencer_prometido: number | null
  
  // Contadores
  alertas_count: number
}

// NOVO: Interface para Montadores DCL
export interface Montador {
  id: string
  nome: string
  local: string
  contato: string | null
  preco_base: number
  ativo: boolean
  especialidades?: string[]
  created_at?: string
}

// NOVO: Interface para relacionamento Pedido-Tratamentos
export interface PedidoTratamento {
  id: string
  pedido_id: string
  tratamento_id: string
  custo_unitario: number | null
  created_at: string
}

// Interface para o formulário de criação completo
export interface CriarPedidoCompletoData {
  loja_id: string
  laboratorio_id: string
  classe_lente_id: string
  prioridade: PrioridadeLevel
  cliente_nome: string
  cliente_telefone?: string
  numero_os_fisica?: string        // NOVO
  numero_pedido_laboratorio?: string // NOVO
  valor_pedido?: number
  custo_lentes?: number           // NOVO
  eh_garantia: boolean            // NOVO
  tratamentos_ids: string[]       // NOVO
  observacoes?: string
  observacoes_garantia?: string   // NOVO
  data_prometida_cliente: string  // NOVO: Data prometida ao cliente (manual)
}

// Evento de pedido atualizado
export interface PedidoEvento {
  id: string
  pedido_id: string
  tipo: string
  titulo: string
  descricao: string | null
  status_anterior: StatusPedido | null
  status_novo: StatusPedido | null
  usuario: string | null
  automatico: boolean
  created_at: string
}

export interface Alerta {
  id: string
  pedido_id: string | null
  tipo: string
  titulo: string
  mensagem: string
  lido: boolean
  destinatario: string | null
  loja_id: string | null
  created_at: string
}

export interface Usuario {
  id: string
  email: string
  nome: string
  loja_id: string | null
  role: string
  permissoes: string[]
  ativo: boolean
  created_at: string
}

// ========== CONSTANTES ==========

export const STATUS_COLORS: Record<StatusPedido, string> = {
  'REGISTRADO': '#94A3B8',
  'AG_PAGAMENTO': '#F59E0B',
  'PAGO': '#10B981',
  'PRODUCAO': '#3B82F6',
  'PRONTO': '#8B5CF6',
  'ENVIADO': '#EF4444',
  'CHEGOU': '#06B6D4',
  'ENTREGUE': '#10B981',
  'CANCELADO': '#6B7280'
}

export const STATUS_LABELS: Record<StatusPedido, string> = {
  'REGISTRADO': 'Registrado',
  'AG_PAGAMENTO': 'Aguardando Pagamento',
  'PAGO': 'Pago',
  'PRODUCAO': 'Em Produção',
  'PRONTO': 'Pronto',
  'ENVIADO': 'Enviado',
  'CHEGOU': 'Chegou na Loja',
  'ENTREGUE': 'Entregue',
  'CANCELADO': 'Cancelado'
}

export const PRIORIDADE_LABELS: Record<PrioridadeLevel, string> = {
  'BAIXA': 'Baixa',
  'NORMAL': 'Normal',
  'ALTA': 'Alta',
  'URGENTE': 'Urgente'
}

export const PRIORIDADE_COLORS: Record<PrioridadeLevel, string> = {
  'BAIXA': '#6B7280',
  'NORMAL': '#3B82F6',
  'ALTA': '#F59E0B',
  'URGENTE': '#EF4444'
}

// Tipos para filtros
export interface FiltrosPedidos {
  loja_id?: string
  laboratorio_id?: string
  status?: StatusPedido
  prioridade?: PrioridadeLevel
  eh_garantia?: boolean
  data_inicio?: string
  data_fim?: string
  cliente_nome?: string
  numero_sequencial?: number
  numero_os_fisica?: string
  numero_pedido_laboratorio?: string  // ← NOVO: campo de filtro
}

// Tipos para métricas do dashboard
export interface DashboardMetricas {
  total_pedidos: number
  registrados: number
  aguardando_pagamento: number
  em_producao: number
  entregues: number
  cancelados: number
  pedidos_garantia: number          // NOVO
  lead_time_medio: number
  alertas_ativos: number
  valor_total_vendas: number
  custo_total_lentes: number        // NOVO
  margem_bruta: number              // NOVO
  sla_compliance: number
}

// Interface para relatórios
export interface RelatorioFinanceiro {
  periodo: {
    inicio: string
    fim: string
  }
  vendas: {
    total_vendas: number
    custo_total: number
    margem_bruta: number
    margem_percentual: number
  }
  tratamentos: {
    mais_vendidos: Array<{
      nome: string
      quantidade: number
      valor_total: number
    }>
  }
  garantias: {
    quantidade: number
    percentual_total: number
    custo_estimado: number
  }
}

// Helpers para validação
export const isStatusValido = (status: string): status is StatusPedido => {
  return Object.keys(STATUS_LABELS).includes(status)
}

export const isPrioridadeValida = (prioridade: string): prioridade is PrioridadeLevel => {
  return Object.keys(PRIORIDADE_LABELS).includes(prioridade)
}

// Função para calcular margem
export const calcularMargem = (valorVenda: number, custoLente: number): number => {
  if (valorVenda === 0) return 0
  return ((valorVenda - custoLente) / valorVenda) * 100
}

// Função para validar OS física
export const validarOSFisica = (os: string): boolean => {
  // Formato sugerido: OS-YYYY-NNNNNN ou similar
  const regex = /^[A-Z]{2,5}-\d{4}-\d{4,8}$/
  return regex.test(os)
}

// ⭐ NOVA: Função para validar número do laboratório
export const validarNumeroLaboratorio = (numero: string): boolean => {
  // Formato: LAB-YYYYMM-NNNN (ex: EXP-202409-0001)
  const regex = /^[A-Z]{2,4}-\d{6}-\d{4}$/
  return regex.test(numero)
}

// ========== SISTEMA DE GAMIFICAÇÃO ==========

export type LigaTipo = 'BRONZE' | 'PRATA' | 'OURO' | 'DIAMANTE'

export type BadgeTipo = 
  | 'PRIMEIRA_MISSAO'
  | 'STREAK_7_DIAS'
  | 'STREAK_30_DIAS'
  | 'PONTUACAO_100'
  | 'PONTUACAO_500'
  | 'PONTUACAO_1000'
  | 'MISSOES_PERFEITAS_10'
  | 'MISSOES_PERFEITAS_50'
  | 'CAMPEAO_SEMANAL'
  | 'CAMPEAO_MENSAL'
  | 'SUBIU_LIGA'
  | 'LIDER_EQUIPE'

export type DesafioTipo = 
  | 'SEMANA_PERFEICAO'
  | 'MARATONA_VENDAS'
  | 'SPRINT_PRODUCAO'
  | 'DESAFIO_QUALIDADE'
  | 'BATALHA_LOJAS'

export interface LojaGamificacao {
  id: string
  loja_id: string
  liga_atual: LigaTipo
  pontos_mes_atual: number
  pontos_total: number
  streak_dias: number
  maior_streak: number
  badges_conquistadas: BadgeTipo[]
  ultima_atividade: string
  promocoes: number
  rebaixamentos: number
  created_at: string
  updated_at: string
}

export interface Badge {
  id: string
  tipo: BadgeTipo
  nome: string
  descricao: string
  icone: string
  cor: string
  pontos_requisito: number
  condicao_especial?: string
  raridade: 'COMUM' | 'RARO' | 'EPICO' | 'LENDARIO'
}

export interface LojaRanking {
  loja_id: string
  loja_nome: string
  liga_atual: LigaTipo
  pontos_mes: number
  pontos_total: number
  posicao_liga: number
  posicao_geral: number
  badges_total: number
  streak_atual: number
  progresso_proxima_liga: number
}

export interface Desafio {
  id: string
  tipo: DesafioTipo
  nome: string
  descricao: string
  meta_pontos: number
  data_inicio: string
  data_fim: string
  bonus_multiplicador: number
  lojas_participantes: string[]
  premiacao: string
  ativo: boolean
  created_at: string
}

export interface DesafioParticipacao {
  id: string
  desafio_id: string
  loja_id: string
  pontos_conquistados: number
  meta_atingida: boolean
  posicao_final?: number
  bonus_recebido: number
  created_at: string
}

// Liga configuration
export const LIGAS_CONFIG = {
  BRONZE: {
    nome: 'Liga Bronze',
    cor: '#CD7F32',
    percentual_minimo: 0, // 0% dos pontos possíveis
    percentual_promocao: 60, // 60% para promover para Prata
    icone: '🥉'
  },
  PRATA: {
    nome: 'Liga Prata',
    cor: '#C0C0C0',
    percentual_minimo: 60, // 60% dos pontos possíveis
    percentual_promocao: 80, // 80% para promover para Ouro
    icone: '🥈'
  },
  OURO: {
    nome: 'Liga Ouro',
    cor: '#FFD700',
    percentual_minimo: 80, // 80% dos pontos possíveis
    percentual_promocao: 100, // 100% para promover para Diamante
    icone: '🥇'
  },
  DIAMANTE: {
    nome: 'Liga Diamante',
    cor: '#B9F2FF',
    percentual_minimo: 100, // 100% dos pontos possíveis
    percentual_promocao: Infinity, // Não há promoção além de Diamante
    icone: '💎'
  }
} as const

// Interface para controle diário de pontuação
export interface PontuacaoDiaria {
  id: string
  loja_id: string
  data: string // YYYY-MM-DD
  pontos_possiveis: number // Total de pontos que poderiam ser ganhos no dia
  pontos_conquistados: number // Pontos realmente conquistados
  missoes_totais: number // Total de missões disponíveis
  missoes_completadas: number // Missões realmente completadas
  percentual_eficiencia: number // pontos_conquistados / pontos_possiveis * 100
  liga_no_dia: LigaTipo // Liga que a loja estava no dia
  streak_dias: number // Sequência de dias consecutivos
  created_at: string
  updated_at: string
}

// Interface para métricas mensais
export interface MetricasMensais {
  loja_id: string
  mes_ano: string // YYYY-MM
  pontos_possiveis_mes: number
  pontos_conquistados_mes: number
  percentual_mensal: number
  dias_ativos: number
  melhor_dia: number
  pior_dia: number
  media_diaria: number
  liga_inicial: LigaTipo
  liga_final: LigaTipo
  promocoes_mes: number
  rebaixamentos_mes: number
}