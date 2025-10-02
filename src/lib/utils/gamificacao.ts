// src/lib/utils/gamificacao.ts
import { LigaTipo, LIGAS_CONFIG, PontuacaoDiaria } from '@/lib/types/database'

// Calcula o potencial máximo de pontos de uma loja por dia
export function calcularPotencialDiario(
  totalMissoesDisponiveis: number,
  pontosPorMissao: number = 50
): number {
  return totalMissoesDisponiveis * pontosPorMissao
}

// Calcula o potencial mensal baseado em 30 dias
export function calcularPotencialMensal(potencialDiario: number): number {
  return potencialDiario * 30 // Assumindo 30 dias por mês
}

// Determina a liga baseada no percentual de eficiência mensal
export function determinarLigaPorPercentual(
  pontosConquistados: number, 
  pontosPossiveis: number
): LigaTipo {
  if (pontosPossiveis === 0) return 'BRONZE'
  
  const percentual = (pontosConquistados / pontosPossiveis) * 100
  
  if (percentual >= LIGAS_CONFIG.DIAMANTE.percentual_minimo) return 'DIAMANTE'
  if (percentual >= LIGAS_CONFIG.OURO.percentual_minimo) return 'OURO'
  if (percentual >= LIGAS_CONFIG.PRATA.percentual_minimo) return 'PRATA'
  return 'BRONZE'
}

// Calcula os pontos necessários para próxima liga
export function calcularPontosParaProximaLiga(
  ligaAtual: LigaTipo,
  pontosPossiveisMes: number
): number | null {
  const proximaLiga = getProximaLiga(ligaAtual)
  if (!proximaLiga) return null
  
  const percentualNecessario = LIGAS_CONFIG[proximaLiga].percentual_minimo
  return Math.ceil((percentualNecessario / 100) * pontosPossiveisMes)
}

// Calcula o progresso atual para a próxima liga
export function calcularProgressoProximaLiga(
  ligaAtual: LigaTipo,
  pontosAtuais: number,
  pontosPossiveisMes: number
): number {
  const proximaLiga = getProximaLiga(ligaAtual)
  if (!proximaLiga) return 100
  
  const percentualAtual = (pontosAtuais / pontosPossiveisMes) * 100
  const percentualMinimo = LIGAS_CONFIG[ligaAtual].percentual_minimo
  const percentualProximaLiga = LIGAS_CONFIG[proximaLiga].percentual_minimo
  
  const progressoPercent = ((percentualAtual - percentualMinimo) / 
    (percentualProximaLiga - percentualMinimo)) * 100
  
  return Math.min(100, Math.max(0, progressoPercent))
}

// Valida se houve promoção
export function isPromocao(ligaAnterior: LigaTipo, ligaNova: LigaTipo): boolean {
  const ordem: LigaTipo[] = ['BRONZE', 'PRATA', 'OURO', 'DIAMANTE']
  return ordem.indexOf(ligaNova) > ordem.indexOf(ligaAnterior)
}

// Obtém a próxima liga
export function getProximaLiga(ligaAtual: LigaTipo): LigaTipo | null {
  const ordem: LigaTipo[] = ['BRONZE', 'PRATA', 'OURO', 'DIAMANTE']
  const indiceAtual = ordem.indexOf(ligaAtual)
  return indiceAtual < ordem.length - 1 ? ordem[indiceAtual + 1] : null
}

// Calcula métricas do dia
export function calcularMetricasDiarias(
  missoesCompletadas: number,
  totalMissoes: number,
  pontosGanhos: number,
  pontosPossiveis: number
): {
  percentualEficiencia: number
  statusDia: 'excellent' | 'good' | 'average' | 'poor'
  pontosPerdidos: number
} {
  const percentualEficiencia = pontosPossiveis > 0 ? 
    (pontosGanhos / pontosPossiveis) * 100 : 0
  
  let statusDia: 'excellent' | 'good' | 'average' | 'poor'
  if (percentualEficiencia >= 90) statusDia = 'excellent'
  else if (percentualEficiencia >= 70) statusDia = 'good'
  else if (percentualEficiencia >= 50) statusDia = 'average'
  else statusDia = 'poor'
  
  const pontosPerdidos = pontosPossiveis - pontosGanhos
  
  return {
    percentualEficiencia,
    statusDia,
    pontosPerdidos
  }
}

// Gera relatório semanal
export function gerarRelatorioSemanal(
  historicoDiario: PontuacaoDiaria[]
): {
  totalPontos: number
  totalPossiveis: number
  percentualSemanal: number
  melhorDia: PontuacaoDiaria | null
  piorDia: PontuacaoDiaria | null
  tendencia: 'improving' | 'declining' | 'stable'
  diasConsecutivos: number
} {
  if (historicoDiario.length === 0) {
    return {
      totalPontos: 0,
      totalPossiveis: 0,
      percentualSemanal: 0,
      melhorDia: null,
      piorDia: null,
      tendencia: 'stable',
      diasConsecutivos: 0
    }
  }
  
  const totalPontos = historicoDiario.reduce((sum, dia) => sum + dia.pontos_conquistados, 0)
  const totalPossiveis = historicoDiario.reduce((sum, dia) => sum + dia.pontos_possiveis, 0)
  const percentualSemanal = totalPossiveis > 0 ? (totalPontos / totalPossiveis) * 100 : 0
  
  const melhorDia = historicoDiario.reduce((best, current) => 
    current.percentual_eficiencia > best.percentual_eficiencia ? current : best
  )
  
  const piorDia = historicoDiario.reduce((worst, current) => 
    current.percentual_eficiencia < worst.percentual_eficiencia ? current : worst
  )
  
  // Calcular tendência (comparar primeira e segunda metade)
  const metade = Math.floor(historicoDiario.length / 2)
  const primeiraMeta = historicoDiario.slice(0, metade)
  const segundaMeta = historicoDiario.slice(metade)
  
  const mediaPrimeira = primeiraMeta.reduce((sum, dia) => sum + dia.percentual_eficiencia, 0) / primeiraMeta.length
  const mediaSegunda = segundaMeta.reduce((sum, dia) => sum + dia.percentual_eficiencia, 0) / segundaMeta.length
  
  let tendencia: 'improving' | 'declining' | 'stable'
  if (mediaSegunda > mediaPrimeira + 5) tendencia = 'improving'
  else if (mediaSegunda < mediaPrimeira - 5) tendencia = 'declining'
  else tendencia = 'stable'
  
  // Calcular dias consecutivos com atividade
  let diasConsecutivos = 0
  for (let i = historicoDiario.length - 1; i >= 0; i--) {
    if (historicoDiario[i].missoes_completadas > 0) {
      diasConsecutivos++
    } else {
      break
    }
  }
  
  return {
    totalPontos,
    totalPossiveis,
    percentualSemanal,
    melhorDia,
    piorDia,
    tendencia,
    diasConsecutivos
  }
}