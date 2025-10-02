// src/hooks/useGamificacao.ts
import { useState, useEffect } from 'react'
import { LigaTipo, LojaGamificacao, LojaRanking, Badge, LIGAS_CONFIG, PontuacaoDiaria } from '@/lib/types/database'
import { 
  determinarLigaPorPercentual, 
  calcularPotencialMensal,
  calcularProgressoProximaLiga,
  isPromocao 
} from '@/lib/utils/gamificacao'
import { avaliarLevelUp, AvaliacaoLevelUp, HistoricoPontuacao } from '@/lib/utils/levelUp'

interface GamificacaoData {
  loja: LojaGamificacao | null
  ranking: LojaRanking | null
  badges: Badge[]
  loading: boolean
  error: string | null
  levelUpPendente: boolean
  pontosPossiveisMes: number
  historicoDiario: PontuacaoDiaria[]
  avaliacaoLevelUp: AvaliacaoLevelUp | null // Novo campo
}

export function useGamificacao(lojaId: string | null) {
  const [data, setData] = useState<GamificacaoData>({
    loja: null,
    ranking: null,
    badges: [],
    loading: true,
    error: null,
    levelUpPendente: false,
    pontosPossiveisMes: 0,
    historicoDiario: [],
    avaliacaoLevelUp: null
  })

  useEffect(() => {
    if (!lojaId) {
      setData(prev => ({ ...prev, loading: false }))
      return
    }

    // Buscar dados reais da gamificação
    fetchGamificacaoData(lojaId)
  }, [lojaId])

  const fetchGamificacaoData = async (lojaId: string) => {
    try {
      setData(prev => ({ ...prev, loading: true, error: null }))

      // Buscar dados reais das missões desta loja
      const hoje = new Date().toISOString().split('T')[0]
      const primeiroDiaMes = new Date().toISOString().slice(0, 7) + '-01'
      
      // Buscar missões do mês atual
      const missionsResponse = await fetch(`/api/mission-control?action=stats&loja_id=${lojaId}&data_inicio=${primeiroDiaMes}&data_fim=${hoje}`)
      const missionData = await missionsResponse.json()
      
      // Buscar histórico diário
      const historicoResponse = await fetch(`/api/gamificacao/historico?loja_id=${lojaId}&periodo=30d`)
      const historicoData = await historicoResponse.json()
      
      // Calcular dados de gamificação baseados nas missões reais
      const pontosMesAtual = missionData.pontos_conquistados || 0
      const pontosPossiveisMes = missionData.pontos_possiveis || 15000 // Fallback
      const ligaAtual = determinarLigaPorPercentual(pontosMesAtual, pontosPossiveisMes)
      
      // Converter histórico para formato esperado pela avaliação
      const historicoFormatado: HistoricoPontuacao[] = (historicoData.historico || []).map((dia: PontuacaoDiaria) => ({
        data: dia.data,
        percentual_eficiencia: dia.percentual_eficiencia,
        liga_no_dia: dia.liga_no_dia,
        pontos_conquistados: dia.pontos_conquistados,
        pontos_possiveis: dia.pontos_possiveis
      }))
      
      // Avaliar level up automático
      const avaliacaoLevelUp = avaliarLevelUp(historicoFormatado)
      
      setData({
        loja: {
          id: '1',
          loja_id: lojaId,
          liga_atual: ligaAtual,
          pontos_mes_atual: pontosMesAtual,
          pontos_total: missionData.pontos_total || pontosMesAtual,
          streak_dias: missionData.streak_atual || 0,
          maior_streak: missionData.maior_streak || 0,
          badges_conquistadas: [], // TODO: implementar lógica de badges
          ultima_atividade: new Date().toISOString(),
          promocoes: 0, // TODO: calcular baseado no histórico
          rebaixamentos: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        ranking: {
          loja_id: lojaId,
          loja_nome: missionData.loja_nome || 'Loja',
          liga_atual: ligaAtual,
          pontos_mes: pontosMesAtual,
          pontos_total: missionData.pontos_total || pontosMesAtual,
          posicao_liga: 1, // TODO: calcular ranking real
          posicao_geral: 1,
          badges_total: 0,
          streak_atual: missionData.streak_atual || 0,
          progresso_proxima_liga: calcularProgressoProximaLiga(ligaAtual, pontosMesAtual, pontosPossiveisMes)
        },
        badges: [], // TODO: buscar badges reais
        loading: false,
        error: null,
        levelUpPendente: avaliacaoLevelUp.celebrar,
        pontosPossiveisMes,
        historicoDiario: historicoData.historico || [],
        avaliacaoLevelUp
      })
    } catch (error) {
      console.error('Erro ao buscar gamificação:', error)
      setData(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }))
    }
  }

  const atualizarPontos = async (pontos: number) => {
    if (!lojaId || !data.loja) return

    try {
      const pontosAnteriores = data.loja.pontos_mes_atual
      const novosPontos = pontosAnteriores + pontos
      
      const ligaAnterior = data.loja.liga_atual
      const novaLiga = determinarLigaPorPercentual(novosPontos, data.pontosPossiveisMes)
      
      const houvePromo = isPromocao(ligaAnterior, novaLiga)
      
      // Atualizar localmente primeiro para feedback imediato
      setData(prev => ({
        ...prev,
        loja: prev.loja ? {
          ...prev.loja,
          pontos_mes_atual: novosPontos,
          pontos_total: prev.loja.pontos_total + pontos,
          liga_atual: novaLiga,
          promocoes: prev.loja.promocoes + (houvePromo ? 1 : 0)
        } : null,
        levelUpPendente: houvePromo
      }))

      // TODO: Implementar quando a API estiver pronta
      console.log(`Pontos adicionados: ${pontos} para loja ${lojaId}`)
      console.log(`Liga anterior: ${ligaAnterior}, Nova liga: ${novaLiga}`)
      console.log(`Percentual atual: ${((novosPontos / data.pontosPossiveisMes) * 100).toFixed(1)}%`)
      
      if (houvePromo) {
        console.log('🎉 LEVEL UP! Subiu de liga!')
        // Aqui você pode adicionar mais lógica como toasts, confetti, etc.
      }
      
    } catch (error) {
      console.error('Erro ao atualizar pontos:', error)
    }
  }

  const confirmarLevelUp = () => {
    setData(prev => ({ ...prev, levelUpPendente: false }))
  }

  return {
    ...data,
    refetch: () => lojaId && fetchGamificacaoData(lojaId),
    atualizarPontos,
    confirmarLevelUp
  }
}