// ================================================================
// TIPOS TYPESCRIPT PARA DASHBOARD BI - BASEADOS NAS VIEWS REAIS
// ================================================================

// ✅ CORRIGIDO: Interface baseada na view v_kpis_dashboard real
export interface DashboardKPIs {
  total_pedidos: number
  entregues: number
  lead_time_medio: number
  pedidos_atrasados: number
  ticket_medio: number
  sla_compliance: number
  labs_ativos: number
  valor_total_vendas: number
  margem_percentual: number
   
  // Comparações
  total_pedidos_anterior: number
  lead_time_anterior: number
  sla_anterior: number
   
  // Variações percentuais (nomes corretos da view)
  variacao_pedidos: number 
  variacao_lead_time: number
  variacao_sla: number
}

// ✅ CORRIGIDO: Interface baseada na view v_evolucao_mensal real
export interface EvolucaoMensal {
  ano_mes: string
  ano: number
  mes: number
  total_pedidos: number
  entregues: number
  ticket_medio: number
  lead_time_medio: number
  sla_compliance: number
  pedidos_atrasados: number
  pedidos_risco: number
  faturamento_total: number
  labs_ativos: number
  lojas_ativas: number
  pedidos_urgentes: number
  horas_producao_media: number
}

// ✅ CORRIGIDO: Interface baseada na view v_ranking_laboratorios real
export interface RankingLaboratorio {
  posicao: number
  laboratorio_nome: string
  laboratorio_codigo: string | null
  total_pedidos: number
  pedidos_ultima_semana: number
  pedidos_mes_atual: number
  sla_compliance: number
  lead_time_medio: number
  tempo_producao_medio: number | null
  ticket_medio: number
  faturamento_total: number
  pedidos_atrasados: number
  pedidos_risco: number
  monofocais: number
  multifocais: number
  transitions: number
  tempo_resposta_horas: number | null
  ultimo_pedido: string | null
  score_geral: number
  status_risco: 'BAIXO' | 'MÉDIO' | 'ALTO'
  tendencia: 'SUBINDO' | 'DESCENDO' | 'ESTÁVEL'
}

// ✅ Interface para alertas da API /api/dashboard/alertas-criticos
export interface AlertaCritico {
  id: string
  tipo: string
  prioridade: 'CRITICA' | 'ALTA' | 'MEDIA' | 'BAIXA'
  titulo: string
  mensagem: string
  dados: any
  created_at: string
  severidade: string
  descricao: string
  // Campos opcionais para compatibilidade
  laboratorio_nome?: string
  problema?: string
  pedidos_afetados?: number
  valor_risco?: number
  indicador_numerico?: number
  acao_sugerida?: string
  prazo_acao?: string
  responsavel?: string
  ordem_prioridade?: number
}

// ✅ CORRIGIDO: Interface baseada na view v_analise_financeira real
export interface AnaliseFinanceira {
  categoria: string
  volume_pedidos: number
  pedidos_entregues: number
  faturamento_total: number
  ticket_medio: number
  lead_time_medio: number
  sla_compliance: number
  registrados: number
  aguardando_pagamento: number
  em_producao: number
  entregues: number
  idade_media_dias: number
  laboratorio_mais_usado: string
}

// Interface para projeções (calculada no frontend)
export interface Projecoes {
  periodo: string
  pedidos_projetados: number
  ticket_projetado: number
  lead_time_projetado: number
  faturamento_projetado: number
  crescimento_percentual_mensal: number
}

// ✅ NOVO: Interface para heatmap de SLA
export interface HeatmapSLA {
  laboratorio: string
  classes: Array<{
    classe: string
    sla_compliance: number
    total_pedidos: number
    lead_time: number
  }>
}

// ✅ NOVO: Interface para análise de sazonalidade
export interface AnaliseSazonalidade {
  dia_semana: number
  nome_dia_semana: string
  total_pedidos: number
  ticket_medio: number
  lead_time_medio: number
  pedidos_urgentes: number
  labs_diferentes: number
  percentual_total: number
}

// Interface para insights automáticos
export interface InsightsAutomaticos {
  insights: string[]
  score_sistema: number
  recomendacoes: string[]
  alertas_urgentes: number
}

// Interface consolidada do dashboard completo
export interface DashboardCompleto {
  kpis: DashboardKPIs | null
  evolucao: EvolucaoMensal[]
  ranking_laboratorios: RankingLaboratorio[]
  alertas_criticos: AlertaCritico[]
  analise_financeira: AnaliseFinanceira[]
  
  // Metadata
  last_updated: string
  data_freshness: string
}

// ================================================================
// TIPOS PARA COMPONENTES DE UI
// ================================================================

export interface KPICardProps {
  title: string
  value: number | string
  previousValue?: number
  unit?: string
  trend?: 'up' | 'down' | 'stable'
  className?: string
  format?: 'number' | 'currency' | 'percentage'
  loading?: boolean
}

export interface TrendIndicatorProps {
  value: number
  previousValue: number
  format?: 'number' | 'currency' | 'percentage'
  showIcon?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export interface AlertCardProps {
  alerta: AlertaCritico
  onAction?: (action: string, alerta: AlertaCritico) => void
  showActions?: boolean
  compact?: boolean
}

export interface RankingTableProps {
  laboratorios: RankingLaboratorio[]
  showActions?: boolean
  maxRows?: number
  sortBy?: keyof RankingLaboratorio
  sortOrder?: 'asc' | 'desc'
}

export interface FinanceChartProps {
  data: AnaliseFinanceira[]
  type?: 'bar' | 'pie' | 'line'
  metric?: 'faturamento' | 'volume' | 'ticket_medio'
  height?: number
  showLegend?: boolean
}

export interface TrendsChartProps {
  data: EvolucaoMensal[]
  title?: string
  description?: string
  type?: 'line' | 'area' | 'composed'
  showSLA?: boolean
  height?: number
  period?: 'month' | 'quarter' | 'year'
}

// ================================================================
// TIPOS PARA FILTROS E CONFIGURAÇÕES
// ================================================================

export interface DashboardFilters {
  periodo?: 'ultimos_30_dias' | 'ultimos_90_dias' | 'ultimo_ano' | 'customizado'
  data_inicio?: string
  data_fim?: string
  laboratorios?: string[]
  lojas?: string[]
  status_risco?: ('BAIXO' | 'MÉDIO' | 'ALTO')[]
  prioridade_alerta?: ('CRÍTICA' | 'ALTA' | 'MÉDIA')[]
  apenas_alertas?: boolean
  incluir_garantias?: boolean
}

export interface DashboardConfig {
  refresh_interval: number // em minutos
  auto_refresh: boolean
  show_trends: boolean
  default_period: string
  kpi_precision: number
  chart_theme: 'light' | 'dark'
  max_alertas: number
  max_labs_ranking: number
}

// ================================================================
// TIPOS PARA STATUS DO SISTEMA
// ================================================================

export interface SystemStatus {
  status: 'excellent' | 'good' | 'warning' | 'critical' | 'unknown'
  health_score: number
  sla_compliance: number
  pedidos_atrasados: number
  total_pedidos: number
  last_check: string
  issues: string[]
  recommendations: string[]
}

// ================================================================
// TIPOS PARA POWERBI ESPECÍFICOS
// ================================================================

export interface PowerBIData {
  heatmap: HeatmapSLA[]
  sazonalidade: AnaliseSazonalidade[]
  correlacoes?: {
    volume_vs_sla: number
    preco_vs_lead_time: number
    sazonalidade_score: number
  }
  last_updated: string
}

export interface GaugeData {
  label: string
  value: number
  min: number
  max: number
  target?: number
  color?: string
  unit?: string
}

export interface TreemapData {
  name: string
  value: number
  children?: TreemapData[]
  color?: string
  percentage?: number
}

export interface WaterfallData {
  category: string
  value: number
  isTotal?: boolean
  color?: string
}

export interface FunnelData {
  stage: string
  value: number
  percentage: number
  color?: string
}

// ================================================================
// FUNÇÕES UTILITÁRIAS DE TIPOS
// ================================================================

export const isValidDashboardPeriodo = (period: string): period is NonNullable<DashboardFilters['periodo']> => {
  return ['ultimos_30_dias', 'ultimos_90_dias', 'ultimo_ano', 'customizado'].includes(period)
}

export const isValidStatusRisco = (status: string): status is RankingLaboratorio['status_risco'] => {
  return ['BAIXO', 'MÉDIO', 'ALTO'].includes(status)
}

export const isValidPrioridadeAlerta = (prioridade: string): prioridade is AlertaCritico['prioridade'] => {
  return ['CRÍTICA', 'ALTA', 'MÉDIA'].includes(prioridade)
}

// Função para mapear dados da API antiga para os novos tipos
export const mapLegacyKPIs = (legacyData: any): DashboardKPIs => {
  return {
    total_pedidos: legacyData.total_pedidos || 0,
    entregues: legacyData.entregues || 0,
    lead_time_medio: legacyData.lead_time_medio || 0,
    pedidos_atrasados: legacyData.pedidos_atrasados || 0,
    ticket_medio: legacyData.ticket_medio || 0,
    sla_compliance: legacyData.sla_compliance || 0,
    labs_ativos: legacyData.labs_ativos || 0,
    valor_total_vendas: legacyData.valor_total_vendas || 0,
    margem_percentual: legacyData.margem_percentual || 0,
    total_pedidos_anterior: legacyData.total_pedidos_anterior || 0,
    lead_time_anterior: legacyData.lead_time_anterior || 0,
    sla_anterior: legacyData.sla_anterior || 0,
    // Mapear nomes antigos para novos
    variacao_pedidos: legacyData.variacao_pedidos_percent || legacyData.variacao_pedidos || 0,
    variacao_lead_time: legacyData.variacao_lead_time_percent || legacyData.variacao_lead_time || 0,
    variacao_sla: legacyData.variacao_sla_percent || legacyData.variacao_sla || 0
  }
}