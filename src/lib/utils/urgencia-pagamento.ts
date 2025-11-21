// lib/utils/urgencia-pagamento.ts
// Utilitários para cálculo de urgência de pagamento baseado em prazo de entrega ao cliente

export type NivelUrgencia = 'FOLGA' | 'ATENCAO' | 'URGENTE' | 'CRITICO'
export type FiltroPrazo = 'vencido' | 'hoje' | 'amanha' | 'proximos-3-dias' | 'esta-semana' | null

export interface UrgenciaInfo {
  diasRestantes: number
  percentualUrgencia: number // 0-100
  nivel: NivelUrgencia
  cor: string // Tailwind class
  corBg: string // Background class
  corBarra: string // Progress bar gradient
  label: string
  icon: string
  pulsante: boolean // Se deve pulsar (urgente/crítico)
  dataLimite: Date | null
  dataPrometida: Date | null
  slaLaboratorio: number
}

/**
 * Calcula urgência de pagamento baseado em:
 * Data Limite Pagamento = Data Prometida ao Cliente - SLA Laboratório - Margem de Segurança (3 dias)
 * 
 * Exemplo:
 * - Cliente deve receber: 20/11
 * - SLA Lab: 7 dias
 * - Margem: 3 dias
 * - Prazo para pagar: 20/11 - 7 - 3 = 10/11
 * 
 * @param dataPrometida - Data prometida ao cliente (string ISO ou Date)
 * @param slaLaboratorio - SLA do laboratório em dias (extraído da data_sla_laboratorio)
 * @param margemSeguranca - Margem de segurança para montagem (padrão 3 dias)
 * @returns Objeto com informações de urgência
 */
export function calcularUrgenciaPagamento(
  dataPrometida: string | Date | null,
  dataPedido?: string | Date,
  margemSeguranca: number = 3
): UrgenciaInfo {
  // Caso não tenha data prometida, retorna estado neutro
  if (!dataPrometida) {
    return {
      diasRestantes: 999,
      percentualUrgencia: 0,
      nivel: 'FOLGA',
      cor: 'text-gray-500',
      corBg: 'bg-gray-100',
      corBarra: 'from-gray-400 to-gray-500',
      label: 'Data não definida',
      icon: '❓',
      pulsante: false,
      dataLimite: null,
      dataPrometida: null,
      slaLaboratorio: 0
    }
  }

  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0) // Zera horário para comparação precisa

  const dataPrometidaCliente = typeof dataPrometida === 'string' ? new Date(dataPrometida) : dataPrometida
  dataPrometidaCliente.setHours(0, 0, 0, 0)

  // Calcula SLA do laboratório (diferença entre data_prometida e data_pedido - margem)
  let slaLaboratorio = 7 // Padrão 7 dias
  if (dataPedido) {
    const dataPed = typeof dataPedido === 'string' ? new Date(dataPedido) : dataPedido
    dataPed.setHours(0, 0, 0, 0)
    const diffTotal = dataPrometidaCliente.getTime() - dataPed.getTime()
    const diasTotais = Math.ceil(diffTotal / (1000 * 60 * 60 * 24))
    // SLA Lab = Total de dias - margem de segurança
    slaLaboratorio = Math.max(1, diasTotais - margemSeguranca)
  }

  // CÁLCULO DO PRAZO LIMITE PARA PAGAMENTO
  // Data Limite = Data Prometida - SLA Lab - Margem Segurança
  const dataLimitePagamento = new Date(dataPrometidaCliente)
  dataLimitePagamento.setDate(dataLimitePagamento.getDate() - slaLaboratorio - margemSeguranca)

  // Calcula dias restantes até o prazo limite de pagamento
  const diffTime = dataLimitePagamento.getTime() - hoje.getTime()
  const diasRestantes = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  // Calcula prazo total desde o pedido até o limite de pagamento
  let prazoTotal = slaLaboratorio + margemSeguranca
  if (dataPedido) {
    const dataPed = typeof dataPedido === 'string' ? new Date(dataPedido) : dataPedido
    dataPed.setHours(0, 0, 0, 0)
    const diffTotal = dataLimitePagamento.getTime() - dataPed.getTime()
    prazoTotal = Math.ceil(diffTotal / (1000 * 60 * 60 * 24))
  }

  // Percentual de urgência (0 = início do prazo, 100 = prazo esgotado)
  const percentualUrgencia = Math.max(0, Math.min(100, ((prazoTotal - diasRestantes) / prazoTotal) * 100))

  // Determina nível de urgência
  let nivel: NivelUrgencia
  let cor: string
  let corBg: string
  let corBarra: string
  let label: string
  let icon: string
  let pulsante: boolean

  if (diasRestantes < 0) {
    // VENCIDO
    nivel = 'CRITICO'
    cor = 'text-red-700'
    corBg = 'bg-red-100 border-red-300'
    corBarra = 'from-red-600 to-red-800'
    label = 'VENCIDO'
    icon = '🚨'
    pulsante = true
  } else if (diasRestantes === 0) {
    // HOJE (último dia)
    nivel = 'CRITICO'
    cor = 'text-red-600'
    corBg = 'bg-red-50 border-red-400'
    corBarra = 'from-red-500 to-red-700'
    label = 'PAGAR HOJE!'
    icon = '🔥'
    pulsante = true
  } else if (diasRestantes === 1) {
    // AMANHÃ
    nivel = 'CRITICO'
    cor = 'text-red-600'
    corBg = 'bg-red-50 border-red-300'
    corBarra = 'from-red-500 to-orange-600'
    label = 'CRÍTICO'
    icon = '⚠️'
    pulsante = true
  } else if (diasRestantes === 2) {
    // 2 DIAS
    nivel = 'URGENTE'
    cor = 'text-orange-600'
    corBg = 'bg-orange-50 border-orange-300'
    corBarra = 'from-orange-500 to-red-500'
    label = 'URGENTE'
    icon = '⏰'
    pulsante = true
  } else if (diasRestantes <= 3) {
    // 3 DIAS
    nivel = 'URGENTE'
    cor = 'text-orange-600'
    corBg = 'bg-orange-50 border-orange-200'
    corBarra = 'from-orange-400 to-orange-600'
    label = 'URGENTE'
    icon = '⏰'
    pulsante = false
  } else if (diasRestantes <= 5) {
    // 4-5 DIAS
    nivel = 'ATENCAO'
    cor = 'text-yellow-700'
    corBg = 'bg-yellow-50 border-yellow-200'
    corBarra = 'from-yellow-400 to-orange-400'
    label = 'ATENÇÃO'
    icon = '🟡'
    pulsante = false
  } else {
    // 6+ DIAS (folga)
    nivel = 'FOLGA'
    cor = 'text-green-700'
    corBg = 'bg-green-50 border-green-200'
    corBarra = 'from-green-400 to-emerald-500'
    label = 'NO PRAZO'
    icon = '✅'
    pulsante = false
  }

  return {
    diasRestantes,
    percentualUrgencia: Math.round(percentualUrgencia),
    nivel,
    cor,
    corBg,
    corBarra,
    label,
    icon,
    pulsante,
    dataLimite: dataLimitePagamento,
    dataPrometida: dataPrometidaCliente,
    slaLaboratorio
  }
}

/**
 * Formata dias restantes para exibição amigável
 */
export function formatarDiasRestantes(dias: number): string {
  if (dias < 0) {
    const diasAtraso = Math.abs(dias)
    return `${diasAtraso} ${diasAtraso === 1 ? 'dia' : 'dias'} ATRASADO`
  }
  if (dias === 0) return 'HOJE'
  if (dias === 1) return 'AMANHÃ'
  return `${dias} dias`
}

/**
 * Retorna prioridade numérica para ordenação (menor = mais urgente)
 */
export function getPrioridadeOrdenacao(nivel: NivelUrgencia): number {
  switch (nivel) {
    case 'CRITICO': return 1
    case 'URGENTE': return 2
    case 'ATENCAO': return 3
    case 'FOLGA': return 4
    default: return 5
  }
}

/**
 * Verifica se um pedido está dentro do filtro de prazo selecionado
 */
export function verificarFiltroPrazo(
  urgenciaInfo: UrgenciaInfo,
  filtro: FiltroPrazo
): boolean {
  if (!filtro) return true // Sem filtro, mostra tudo

  const diasRestantes = urgenciaInfo.diasRestantes

  switch (filtro) {
    case 'vencido':
      return diasRestantes < 0
    case 'hoje':
      return diasRestantes === 0
    case 'amanha':
      return diasRestantes === 1
    case 'proximos-3-dias':
      return diasRestantes >= 0 && diasRestantes <= 3
    case 'esta-semana':
      return diasRestantes >= 0 && diasRestantes <= 7
    default:
      return true
  }
}

/**
 * Retorna label amigável para o filtro de prazo
 */
export function getLabelFiltroPrazo(filtro: FiltroPrazo): string {
  switch (filtro) {
    case 'vencido':
      return 'Vencidos'
    case 'hoje':
      return 'Vence Hoje'
    case 'amanha':
      return 'Vence Amanhã'
    case 'proximos-3-dias':
      return 'Próximos 3 dias'
    case 'esta-semana':
      return 'Esta Semana'
    default:
      return 'Todos'
  }
}
