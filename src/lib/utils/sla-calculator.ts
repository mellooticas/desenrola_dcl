/**
 * 📅 SLA Calculator - Cálculo de Datas e Prazos
 * 
 * Funções para calcular SLA de laboratórios e datas prometidas ao cliente
 * Considera apenas dias úteis (seg-sex)
 */

/**
 * Adiciona dias úteis a uma data (ignorando sábados e domingos)
 */
export function addBusinessDays(date: Date, days: number): Date {
  const result = new Date(date)
  let addedDays = 0

  while (addedDays < days) {
    result.setDate(result.getDate() + 1)
    const dayOfWeek = result.getDay()
    
    // Pular fins de semana (0 = domingo, 6 = sábado)
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      addedDays++
    }
  }

  return result
}

/**
 * Calcula quantos dias úteis existem entre duas datas
 */
export function countBusinessDays(startDate: Date, endDate: Date): number {
  let count = 0
  const current = new Date(startDate)

  while (current < endDate) {
    const dayOfWeek = current.getDay()
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      count++
    }
    current.setDate(current.getDate() + 1)
  }

  return count
}

/**
 * Verifica se uma data é dia útil
 */
export function isBusinessDay(date: Date): boolean {
  const dayOfWeek = date.getDay()
  return dayOfWeek !== 0 && dayOfWeek !== 6
}

/**
 * Interface para resultado do cálculo de SLA
 */
export interface SLACalculado {
  // SLA do Laboratório (prazo real de produção)
  diasSlaLab: number
  dataSlaLab: Date
  dataSlaLabFormatted: string
  
  // Data Prometida ao Cliente (SLA + margem de segurança)
  diasPromessaCliente: number
  dataPromessaCliente: Date
  dataPromessaClienteFormatted: string
  
  // Margem de segurança aplicada
  margemSegurancaDias: number
  
  // Validações
  isDataManualAntesSLA: boolean // True se data manual < SLA lab
  alertaDataManual?: string
}

/**
 * Calcula SLA completo (laboratório + cliente)
 * 
 * @param dataBase Data base para cálculo (geralmente hoje)
 * @param prazoLaboratorioDias Prazo informado pelo laboratório
 * @param margemSegurancaDias Margem de segurança para o cliente (padrão: 2 dias)
 * @param dataPrometidaManual Data prometida manualmente (opcional)
 */
export function calcularSLA(
  dataBase: Date,
  prazoLaboratorioDias: number,
  margemSegurancaDias: number = 2,
  dataPrometidaManual?: Date | null
): SLACalculado {
  
  // 1. Calcular SLA do Laboratório (prazo real de produção)
  const dataSlaLab = addBusinessDays(dataBase, prazoLaboratorioDias)
  
  // 2. Calcular Data Prometida ao Cliente (SLA + margem)
  const diasPromessaCliente = prazoLaboratorioDias + margemSegurancaDias
  const dataPromessaCliente = addBusinessDays(dataBase, diasPromessaCliente)
  
  // 3. Validar data manual (se fornecida)
  let isDataManualAntesSLA = false
  let alertaDataManual: string | undefined
  
  if (dataPrometidaManual) {
    if (dataPrometidaManual < dataSlaLab) {
      isDataManualAntesSLA = true
      alertaDataManual = '⚠️ Data prometida manual é ANTERIOR ao SLA do laboratório! Risco de atraso.'
    } else if (dataPrometidaManual < dataPromessaCliente) {
      alertaDataManual = 'ℹ️ Data prometida manual está entre o SLA lab e a data recomendada.'
    }
  }
  
  return {
    diasSlaLab: prazoLaboratorioDias,
    dataSlaLab,
    dataSlaLabFormatted: formatDate(dataSlaLab),
    
    diasPromessaCliente,
    dataPromessaCliente: dataPrometidaManual || dataPromessaCliente,
    dataPromessaClienteFormatted: formatDate(dataPrometidaManual || dataPromessaCliente),
    
    margemSegurancaDias,
    
    isDataManualAntesSLA,
    alertaDataManual,
  }
}

/**
 * Formata data para exibição (dd/mm/aaaa)
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

/**
 * Formata data para input HTML (aaaa-mm-dd)
 */
export function formatDateForInput(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Converte string de input HTML para Date
 */
export function parseDateFromInput(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number)
  return new Date(year, month - 1, day)
}

/**
 * Calcula diferença em dias úteis entre hoje e uma data futura
 */
export function calcularDiasUteisRestantes(dataFutura: Date): number {
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  
  const dataFuturaZerada = new Date(dataFutura)
  dataFuturaZerada.setHours(0, 0, 0, 0)
  
  if (dataFuturaZerada <= hoje) return 0
  
  return countBusinessDays(hoje, dataFuturaZerada)
}

/**
 * Retorna cor do alerta baseado em dias restantes
 * Verde: 5+ dias, Amarelo: 2-4 dias, Vermelho: 0-1 dias
 */
export function getCorAlertaSLA(diasRestantes: number): 'success' | 'warning' | 'error' {
  if (diasRestantes >= 5) return 'success'
  if (diasRestantes >= 2) return 'warning'
  return 'error'
}
