'use client'

import { useState } from 'react'
import { useGamificacao } from '@/hooks/useGamificacao'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Trophy, 
  TrendingUp, 
  Target, 
  Flame, 
  Star, 
  Award,
  Calendar,
  BarChart3,
  Users,
  Clock,
  CheckCircle2,
  Sparkles,
  Zap,
  Crown
} from 'lucide-react'
import { ProgressBar } from './ProgressBar'
import { LigaBadge } from './LigaBadge'
import { HistoricoDiario } from './HistoricoDiario'
import LevelUpNotification from './LevelUpNotification'
import { gerarMensagemMotivacional } from '@/lib/utils/levelUp'

interface GamificationDashboardPremiumProps {
  lojaId: string
}

export default function GamificationDashboardPremium({ lojaId }: GamificationDashboardPremiumProps) {
  const { 
    loja, 
    ranking, 
    loading, 
    error, 
    levelUpPendente,
    avaliacaoLevelUp,
    historicoDiario,
    pontosPossiveisMes,
    refetch,
    confirmarLevelUp
  } = useGamificacao(lojaId)

  const [showNotification, setShowNotification] = useState(true)
  const [activeSubTab, setActiveSubTab] = useState('overview')

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-48 bg-gradient-to-r from-purple-100 to-blue-100 rounded-xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-32 bg-gray-100 rounded-xl"></div>
          <div className="h-32 bg-gray-100 rounded-xl"></div>
          <div className="h-32 bg-gray-100 rounded-xl"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold text-red-800 mb-2">Erro ao Carregar Gamificação</h3>
            <p className="text-red-600 mb-6">{error}</p>
            <Button 
              onClick={refetch}
              variant="outline"
              className="border-red-300 hover:bg-red-100"
            >
              🔄 Tentar Novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!loja || !ranking) {
    return (
      <Card>
        <CardContent className="pt-12 pb-12 text-center">
          <div className="text-6xl mb-4">🎮</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Sistema Não Inicializado</h3>
          <p className="text-gray-500">Dados de gamificação não disponíveis para esta loja</p>
        </CardContent>
      </Card>
    )
  }

  const mensagemMotivacional = avaliacaoLevelUp ? 
    gerarMensagemMotivacional(avaliacaoLevelUp) : 
    "Continue com o excelente trabalho!"

  const percentualProgresso = (loja.pontos_mes_atual / pontosPossiveisMes) * 100
  const ligaAtualIndex = ['BRONZE', 'PRATA', 'OURO', 'DIAMANTE'].indexOf(loja.liga_atual)
  const proximaLiga = ['BRONZE', 'PRATA', 'OURO', 'DIAMANTE'][ligaAtualIndex + 1] || 'DIAMANTE'

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

      {/* Hero Section - Header Premium */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-600 opacity-90"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzBoLTZ2LTZoNnYtem0tNiAwdjZoLTZ2LTZoNnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-10"></div>
        
        <div className="relative px-8 py-10">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <Crown className="w-8 h-8 text-yellow-300" />
                <h2 className="text-3xl font-bold text-white">Sistema de Ligas</h2>
              </div>
              <p className="text-blue-100 text-lg mb-2">{mensagemMotivacional}</p>
              <div className="flex items-center gap-3 text-blue-100">
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  Posição #{ranking.posicao_geral}
                </span>
                <span className="text-blue-200">•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                </span>
              </div>
            </div>
            
            <div className="text-right">
              <LigaBadge 
                liga={loja.liga_atual} 
                pontos={loja.pontos_mes_atual}
                className="justify-end mb-3 scale-125"
              />
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                {loja.streak_dias > 0 ? `🔥 ${loja.streak_dias} dias consecutivos` : '📅 Comece seu streak'}
              </Badge>
            </div>
          </div>

          {/* Barra de Progresso Premium */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <div className="flex items-center justify-between mb-3">
              <span className="text-white font-semibold">Progresso para {proximaLiga}</span>
              <span className="text-white font-bold">{percentualProgresso.toFixed(1)}%</span>
            </div>
            <Progress value={percentualProgresso} className="h-3 bg-white/20" />
            <div className="flex items-center justify-between mt-2 text-sm text-blue-100">
              <span>{loja.pontos_mes_atual.toLocaleString()} pontos</span>
              <span>{pontosPossiveisMes.toLocaleString()} possíveis</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cards de Estatísticas Premium */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Pontos do Mês */}
        <Card className="border-2 border-purple-200 hover:shadow-lg transition-all duration-300">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Trophy className="w-6 h-6 text-purple-600" />
              </div>
              <Badge variant="outline" className="text-xs">Este Mês</Badge>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">Pontos Conquistados</h3>
            <p className="text-3xl font-bold text-purple-600 mb-1">
              {loja.pontos_mes_atual.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500">
              Total histórico: {loja.pontos_total.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        {/* Streak */}
        <Card className="border-2 border-orange-200 hover:shadow-lg transition-all duration-300">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Flame className="w-6 h-6 text-orange-600" />
              </div>
              <Badge variant="outline" className="text-xs">Sequência</Badge>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">Streak Atual</h3>
            <p className="text-3xl font-bold text-orange-600 mb-1">
              {loja.streak_dias} {loja.streak_dias === 1 ? 'dia' : 'dias'}
            </p>
            <p className="text-xs text-gray-500">
              Recorde: {loja.maior_streak} dias
            </p>
          </CardContent>
        </Card>

        {/* Performance */}
        <Card className="border-2 border-green-200 hover:shadow-lg transition-all duration-300">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <Badge variant="outline" className="text-xs">Eficiência</Badge>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">Performance</h3>
            <p className="text-3xl font-bold text-green-600 mb-1">
              {avaliacaoLevelUp?.mediaPerformance.toFixed(1) || '0.0'}%
            </p>
            <p className="text-xs text-gray-500">
              Média de conclusão
            </p>
          </CardContent>
        </Card>

        {/* Ranking */}
        <Card className="border-2 border-blue-200 hover:shadow-lg transition-all duration-300">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Award className="w-6 h-6 text-blue-600" />
              </div>
              <Badge variant="outline" className="text-xs">Geral</Badge>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">Posição</h3>
            <p className="text-3xl font-bold text-blue-600 mb-1">
              #{ranking.posicao_geral}
            </p>
            <p className="text-xs text-gray-500">
              Na liga {loja.liga_atual}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de Conteúdo */}
      <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">📊 Visão Geral</TabsTrigger>
          <TabsTrigger value="historico">📅 Histórico</TabsTrigger>
          <TabsTrigger value="badges">🏅 Conquistas</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Missões Recentes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Missões Recentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {historicoDiario && historicoDiario.length > 0 ? (
                  <div className="space-y-3">
                    {historicoDiario.slice(0, 5).map((dia, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                          <div>
                            <p className="font-medium text-sm">
                              {new Date(dia.data).toLocaleDateString('pt-BR', { 
                                day: '2-digit', 
                                month: 'short' 
                              })}
                            </p>
                            <p className="text-xs text-gray-500">
                              {dia.missoes_completadas || 0} de {dia.missoes_totais || 0} missões
                            </p>
                          </div>
                        </div>
                        <Badge variant="secondary" className="font-bold">
                          +{dia.pontos_conquistados || 0}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Target className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>Nenhuma missão completada ainda</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Estatísticas Adicionais */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Estatísticas do Mês
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    <span className="text-sm font-medium">Missões Completadas</span>
                  </div>
                  <span className="text-lg font-bold text-purple-600">
                    {historicoDiario?.reduce((sum, dia) => sum + (dia.missoes_completadas || 0), 0) || 0}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-orange-600" />
                    <span className="text-sm font-medium">Dias Ativos</span>
                  </div>
                  <span className="text-lg font-bold text-orange-600">
                    {historicoDiario?.length || 0}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Zap className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium">Taxa de Conclusão</span>
                  </div>
                  <span className="text-lg font-bold text-green-600">
                    {avaliacaoLevelUp?.mediaPerformance.toFixed(0) || 0}%
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Histórico */}
        <TabsContent value="historico">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Pontuação Diária</CardTitle>
            </CardHeader>
            <CardContent>
              <HistoricoDiario lojaId={lojaId} historico={historicoDiario || []} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Badges */}
        <TabsContent value="badges">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5" />
                Conquistas e Badges
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🏆</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  Sistema de Badges em Desenvolvimento
                </h3>
                <p className="text-gray-500">
                  Em breve você poderá desbloquear conquistas especiais!
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
