'use client'

import { useState } from 'react'
import { useGamificacao } from '@/hooks/useGamificacao'
import { ProgressBar } from './ProgressBar'
import { LigaBadge } from './LigaBadge'
import { HistoricoDiario } from './HistoricoDiario'
import LevelUpNotification from './LevelUpNotification'
import { gerarMensagemMotivacional } from '@/lib/utils/levelUp'

interface GamificationDashboardProps {
  lojaId: string
}

export default function GamificationDashboard({ lojaId }: GamificationDashboardProps) {
  const { 
    loja, 
    ranking, 
    loading, 
    error, 
    levelUpPendente,
    avaliacaoLevelUp,
    historicoDiario,
    refetch,
    atualizarPontos,
    confirmarLevelUp
  } = useGamificacao(lojaId)

  const [showNotification, setShowNotification] = useState(true)

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-20 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <div className="text-red-500 mr-3">❌</div>
          <div>
            <h3 className="text-red-800 font-medium">Erro ao carregar gamificação</h3>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        </div>
        <button
          onClick={refetch}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          Tentar novamente
        </button>
      </div>
    )
  }

  if (!loja || !ranking) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <div className="text-center text-gray-500">
          <div className="text-4xl mb-4">🎮</div>
          <h3 className="text-lg font-medium mb-2">Sistema de Gamificação</h3>
          <p className="text-sm">Nenhuma loja selecionada</p>
        </div>
      </div>
    )
  }

  const mensagemMotivacional = avaliacaoLevelUp ? 
    gerarMensagemMotivacional(avaliacaoLevelUp) : 
    "Continue o bom trabalho!"

  return (
    <div className="space-y-6">
      {/* Notificação de Level Up */}
      {levelUpPendente && avaliacaoLevelUp && showNotification && (
        <LevelUpNotification
          avaliacao={avaliacaoLevelUp}
          onClose={() => {
            setShowNotification(false)
            confirmarLevelUp()
          }}
        />
      )}

      {/* Header da Gamificação */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">🎮 Sistema de Ligas</h2>
            <p className="text-blue-100">{mensagemMotivacional}</p>
          </div>
          <div className="text-right">
            <LigaBadge 
              liga={loja.liga_atual} 
              pontos={loja.pontos_mes_atual}
              className="justify-end"
            />
            <div className="text-sm text-blue-100 mt-2">
              Posição: #{ranking.posicao_geral}
            </div>
          </div>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Pontos do Mês */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="text-3xl mr-4">🏆</div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Pontos do Mês</h3>
              <p className="text-2xl font-bold text-blue-600">{loja.pontos_mes_atual.toLocaleString()}</p>
              <p className="text-sm text-gray-500">
                de {loja.pontos_total.toLocaleString()} total
              </p>
            </div>
          </div>
        </div>

        {/* Streak Atual */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="text-3xl mr-4">🔥</div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Streak Atual</h3>
              <p className="text-2xl font-bold text-orange-600">{loja.streak_dias}</p>
              <p className="text-sm text-gray-500">
                recorde: {loja.maior_streak} dias
              </p>
            </div>
          </div>
        </div>

        {/* Performance */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="text-3xl mr-4">📊</div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Performance</h3>
              <p className="text-2xl font-bold text-green-600">
                {avaliacaoLevelUp?.mediaPerformance.toFixed(1) || '0.0'}%
              </p>
              <p className="text-sm text-gray-500">
                {avaliacaoLevelUp?.diasConsecutivos || 0} dias na liga
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Barra de Progresso */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Progresso da Liga</h3>
        <ProgressBar
          ligaAtual={loja.liga_atual}
          pontosAtuais={loja.pontos_mes_atual}
          pontosPossiveisMes={ranking.progresso_proxima_liga}
          showLevelUp={levelUpPendente}
        />
      </div>

      {/* Histórico Diário */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Histórico de Performance</h3>
          <button
            onClick={refetch}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Atualizar
          </button>
        </div>
        <HistoricoDiario 
          lojaId={lojaId}
          historico={historicoDiario} 
        />
      </div>

      {/* Informações de Level Up */}
      {avaliacaoLevelUp && avaliacaoLevelUp.mudouLiga && (
        <div className={`rounded-lg p-4 ${
          avaliacaoLevelUp.tipoMudanca === 'promocao' 
            ? 'bg-green-50 border border-green-200' 
            : avaliacaoLevelUp.tipoMudanca === 'rebaixamento'
            ? 'bg-yellow-50 border border-yellow-200'
            : 'bg-blue-50 border border-blue-200'
        }`}>
          <div className="flex items-center">
            <div className="text-2xl mr-3">
              {avaliacaoLevelUp.tipoMudanca === 'promocao' ? '🎉' : 
               avaliacaoLevelUp.tipoMudanca === 'rebaixamento' ? '📉' : '📊'}
            </div>
            <div>
              <h4 className="font-medium text-gray-800">
                {avaliacaoLevelUp.tipoMudanca === 'promocao' ? 'Recomendação de Promoção!' :
                 avaliacaoLevelUp.tipoMudanca === 'rebaixamento' ? 'Ajuste de Liga' : 'Status da Liga'}
              </h4>
              <p className="text-sm text-gray-600">{avaliacaoLevelUp.motivoMudanca}</p>
            </div>
          </div>
        </div>
      )}

      {/* Botões de Teste (apenas em desenvolvimento) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-800 mb-3">🧪 Testes (Dev Only)</h4>
          <div className="flex gap-2">
            <button
              onClick={() => atualizarPontos(500)}
              className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
            >
              +500 pontos
            </button>
            <button
              onClick={() => atualizarPontos(1000)}
              className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
            >
              +1000 pontos
            </button>
            <button
              onClick={refetch}
              className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
            >
              Recarregar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}