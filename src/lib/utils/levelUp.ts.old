// Sistema de Level Up Automático
// Verifica performance dos últimos 30 dias para promoção/rebaixamento

import { LigaTipo, LIGAS_CONFIG } from '@/lib/types/database';

export interface HistoricoPontuacao {
  data: string;
  percentual_eficiencia: number;
  liga_no_dia: LigaTipo;
  pontos_conquistados: number;
  pontos_possiveis: number;
}

export interface AvaliacaoLevelUp {
  ligaAtual: LigaTipo;
  ligaRecomendada: LigaTipo;
  mudouLiga: boolean;
  tipoMudanca: 'promocao' | 'rebaixamento' | 'manutencao';
  mediaPerformance: number;
  diasConsecutivos: number;
  motivoMudanca: string;
  celebrar: boolean;
}

/**
 * Avalia se a loja deve mudar de liga baseado na performance dos últimos 30 dias
 */
export function avaliarLevelUp(historico: HistoricoPontuacao[]): AvaliacaoLevelUp {
  if (historico.length === 0) {
    return {
      ligaAtual: 'BRONZE',
      ligaRecomendada: 'BRONZE',
      mudouLiga: false,
      tipoMudanca: 'manutencao',
      mediaPerformance: 0,
      diasConsecutivos: 0,
      motivoMudanca: 'Histórico insuficiente',
      celebrar: false
    };
  }

  // Pegar os últimos 30 dias ou todos os disponíveis
  const ultimosDias = historico.slice(-30);
  const ligaAtual = ultimosDias[ultimosDias.length - 1]?.liga_no_dia || 'BRONZE';
  
  // Calcular média de performance
  const mediaPerformance = ultimosDias.reduce((acc, dia) => acc + dia.percentual_eficiencia, 0) / ultimosDias.length;
  
  // Calcular dias consecutivos na performance atual
  const diasConsecutivos = calcularDiasConsecutivos(ultimosDias);
  
  // Determinar liga recomendada baseada na média
  const ligaRecomendada = determinarLigaPorPerformance(mediaPerformance);
  
  // Verificar se mudou de liga
  const mudouLiga = ligaAtual !== ligaRecomendada;
  const tipoMudanca = !mudouLiga ? 'manutencao' : 
    getLigaLevel(ligaRecomendada) > getLigaLevel(ligaAtual) ? 'promocao' : 'rebaixamento';
  
  // Gerar motivo da mudança
  const motivoMudanca = gerarMotivoMudanca(ligaAtual, ligaRecomendada, mediaPerformance, diasConsecutivos);
  
  // Decidir se deve celebrar (apenas promoções)
  const celebrar = tipoMudanca === 'promocao';

  return {
    ligaAtual,
    ligaRecomendada,
    mudouLiga,
    tipoMudanca,
    mediaPerformance,
    diasConsecutivos,
    motivoMudanca,
    celebrar
  };
}

/**
 * Calcula quantos dias consecutivos a loja mantém a performance atual
 */
function calcularDiasConsecutivos(historico: HistoricoPontuacao[]): number {
  if (historico.length === 0) return 0;
  
  const ligaAtual = historico[historico.length - 1].liga_no_dia;
  let count = 0;
  
  // Contar de trás para frente
  for (let i = historico.length - 1; i >= 0; i--) {
    if (historico[i].liga_no_dia === ligaAtual) {
      count++;
    } else {
      break;
    }
  }
  
  return count;
}

/**
 * Determina a liga baseada na performance média
 */
function determinarLigaPorPerformance(mediaPerformance: number): LigaTipo {
  if (mediaPerformance >= LIGAS_CONFIG.DIAMANTE.percentual_minimo) return 'DIAMANTE';
  if (mediaPerformance >= LIGAS_CONFIG.OURO.percentual_minimo) return 'OURO';
  if (mediaPerformance >= LIGAS_CONFIG.PRATA.percentual_minimo) return 'PRATA';
  return 'BRONZE';
}

/**
 * Retorna o nível numérico da liga para comparação
 */
function getLigaLevel(liga: LigaTipo): number {
  const levels: Record<LigaTipo, number> = { 
    'BRONZE': 1, 
    'PRATA': 2, 
    'OURO': 3, 
    'DIAMANTE': 4 
  };
  return levels[liga];
}

/**
 * Gera o motivo da mudança de liga
 */
function gerarMotivoMudanca(
  ligaAtual: LigaTipo, 
  ligaRecomendada: LigaTipo, 
  mediaPerformance: number, 
  diasConsecutivos: number
): string {
  if (ligaAtual === ligaRecomendada) {
    return `Mantendo ${ligaAtual} com ${mediaPerformance.toFixed(1)}% de eficiência`;
  }
  
  const isPromocao = getLigaLevel(ligaRecomendada) > getLigaLevel(ligaAtual);
  
  if (isPromocao) {
    return `🎉 PROMOÇÃO! Performance de ${mediaPerformance.toFixed(1)}% por ${diasConsecutivos} dias`;
  } else {
    return `📉 Performance de ${mediaPerformance.toFixed(1)}% requer ajustes`;
  }
}

/**
 * Calcula a porcentagem para o próximo nível
 */
export function calcularProgressoProximoNivel(ligaAtual: LigaTipo, performanceAtual: number): {
  percentualAtual: number;
  percentualProximo: number;
  progressoParaProximo: number;
} {
  const ligaConfig = LIGAS_CONFIG[ligaAtual as keyof typeof LIGAS_CONFIG];
  const proximaLiga = getProximaLiga(ligaAtual);
  
  if (!proximaLiga) {
    return {
      percentualAtual: ligaConfig.percentual_minimo,
      percentualProximo: 100,
      progressoParaProximo: 100
    };
  }
  
  const percentualProximo = LIGAS_CONFIG[proximaLiga as keyof typeof LIGAS_CONFIG].percentual_minimo;
  const range = percentualProximo - ligaConfig.percentual_minimo;
  const progresso = ((performanceAtual - ligaConfig.percentual_minimo) / range) * 100;
  
  return {
    percentualAtual: ligaConfig.percentual_minimo,
    percentualProximo,
    progressoParaProximo: Math.max(0, Math.min(100, progresso))
  };
}

/**
 * Retorna a próxima liga na hierarquia
 */
function getProximaLiga(ligaAtual: LigaTipo): LigaTipo | null {
  const hierarquia: LigaTipo[] = ['BRONZE', 'PRATA', 'OURO', 'DIAMANTE'];
  const indexAtual = hierarquia.indexOf(ligaAtual);
  return indexAtual < hierarquia.length - 1 ? hierarquia[indexAtual + 1] : null;
}

/**
 * Gera mensagens motivacionais para cada tipo de mudança
 */
export function gerarMensagemMotivacional(avaliacao: AvaliacaoLevelUp): string {
  const { tipoMudanca, ligaRecomendada, mediaPerformance } = avaliacao;
  
  switch (tipoMudanca) {
    case 'promocao':
      return `🏆 PARABÉNS! Você foi promovido para ${ligaRecomendada}! Eficiência de ${mediaPerformance.toFixed(1)}%`;
    
    case 'rebaixamento':
      return `📊 Performance atual: ${mediaPerformance.toFixed(1)}%. Vamos recuperar o ritmo!`;
    
    default:
      if (mediaPerformance >= 90) {
        return `🔥 Performance excelente! ${mediaPerformance.toFixed(1)}% de eficiência!`;
      } else if (mediaPerformance >= 70) {
        return `👍 Bom trabalho! ${mediaPerformance.toFixed(1)}% de eficiência`;
      } else {
        return `💪 Vamos melhorar! Meta atual: ${mediaPerformance.toFixed(1)}%`;
      }
  }
}