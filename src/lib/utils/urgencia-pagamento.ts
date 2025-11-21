// lib/utils/urgencia-pagamento.ts
// Utilitários para cálculo de urgência de pagamento baseado em SLA do laboratório

export type NivelUrgencia = 'FOLGA' | 'ATENCAO' | 'URGENTE' | 'CRITICO'

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
}

/**
 * Calcula urgência de pagamento baseado em data_sla_laboratorio
 * @param dataSlaLab - Data limite do laboratório (string ISO ou Date)
 * @param dataPedido - Data do pedido (para calcular SLA total)
 * @returns Objeto com informações de urgência
 */
export function calcularUrgenciaPagamento(
  dataSlaLab: string | Date | null,
  dataPedido?: string | Date
): UrgenciaInfo {
  // Caso não tenha data SLA, retorna estado neutro
  if (!dataSlaLab) {
    return {
      diasRestantes: 999,
      percentualUrgencia: 0,
      nivel: 'FOLGA',
      cor: 'text-gray-500',
      corBg: 'bg-gray-100',
      corBarra: 'from-gray-400 to-gray-500',
      label: 'SLA não definido',
      icon: '❓',
      pulsante: false,
      dataLimite: null
    }
  }

  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0) // Zera horário para comparação precisa

  const dataLimite = typeof dataSlaLab === 'string' ? new Date(dataSlaLab) : dataSlaLab
  dataLimite.setHours(0, 0, 0, 0)

  // Calcula dias restantes
  const diffTime = dataLimite.getTime() - hoje.getTime()
  const diasRestantes = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  // Calcula SLA total (do pedido até limite)
  let slaTotal = 7 // Padrão 7 dias
  if (dataPedido) {
    const dataPed = typeof dataPedido === 'string' ? new Date(dataPedido) : dataPedido
    dataPed.setHours(0, 0, 0, 0)
    const diffTotal = dataLimite.getTime() - dataPed.getTime()
    slaTotal = Math.ceil(diffTotal / (1000 * 60 * 60 * 24))
  }

  // Percentual de urgência (0 = início do prazo, 100 = prazo esgotado)
  const percentualUrgencia = Math.max(0, Math.min(100, ((slaTotal - diasRestantes) / slaTotal) * 100))

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
    dataLimite
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
