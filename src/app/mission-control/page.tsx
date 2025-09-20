'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import {
  Search,
  Filter,
  Clock,
  Target,
  CheckCircle,
  Activity,
  Trophy,
  Crown,
  Flame,
  AlertTriangle,
  RefreshCw,
  Gamepad2,
  Volume2,
  VolumeX,
  Sparkles,
  X,
  SortAsc,
  SortDesc,
  PartyPopper,
  Camera,
  Play,
  Pause,
  TrendingUp,
  BarChart3,
  MapPin
} from 'lucide-react'

// Importar hooks e tipos
import useMissionControl, {
  useStartMission,
  useCompleteMission,
  usePauseMission,
  calculateMissionMetrics,
  calculateGamificationStats,
  getCriticalMissions,
  calculateTimeToDeadline,
  formatTimeRemaining,
  canExecuteMission,
  getRecommendedAction,
  type MissaoDiaria,
  type DashboardData
} from '@/lib/hooks/use-mission-control'

import { useQuery } from '@tanstack/react-query'
import LojaSelector from '@/components/mission-control/loja-selector'

// =============================================================================
// COMPONENTE: MissionCard
// =============================================================================

function MissionCard({ 
  mission, 
  onStart, 
  onPause, 
  onComplete, 
  userId 
}: {
  mission: MissaoDiaria
  onStart: (id: string) => void
  onPause: (id: string) => void
  onComplete: (id: string, obs: string, qual: number, ev: File[]) => void
  userId: string
}) {
  const [showCompleteDialog, setShowCompleteDialog] = useState(false)
  const [observacoes, setObservacoes] = useState('')
  const [qualidadeExecucao, setQualidadeExecucao] = useState(5)
  const [evidenceFiles, setEvidenceFiles] = useState<File[]>([])
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Timer em tempo real
  useEffect(() => {
    if (mission.data_vencimento && mission.status !== 'concluida') {
      const updateTimer = () => {
        const timeData = calculateTimeToDeadline(mission)
        setTimeLeft(timeData.timeLeft)
      }
      
      updateTimer()
      intervalRef.current = setInterval(updateTimer, 1000)
      
      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current)
      }
    }
  }, [mission.data_vencimento, mission.status])

  // Badge de urgência
  const getUrgencyBadge = () => {
    switch (mission.urgencia_status) {
      case 'vencida':
        return (
          <Badge className="bg-red-600 text-white animate-pulse">
            <AlertTriangle className="h-3 w-3 mr-1" />
            VENCIDA
          </Badge>
        )
      case 'urgente':
        return (
          <Badge className="bg-orange-500 text-white">
            <Flame className="h-3 w-3 mr-1" />
            URGENTE
          </Badge>
        )
      case 'concluida':
        return (
          <Badge className="bg-green-600 text-white">
            <CheckCircle className="h-3 w-3 mr-1" />
            CONCLUÍDA
          </Badge>
        )
      default:
        return (
          <Badge className="bg-blue-500 text-white">
            <Clock className="h-3 w-3 mr-1" />
            NO PRAZO
          </Badge>
        )
    }
  }

  // Conclusão rápida
  const handleQuickComplete = (checked: boolean) => {
    if (checked && mission.status !== 'concluida') {
      onComplete(mission.id, 'Conclusão rápida', 4, [])
    }
  }

  // Classes de urgência
  const urgencyClass = {
    'vencida': 'border-red-500 bg-red-50',
    'urgente': 'border-orange-500 bg-orange-50',
    'no_prazo': 'border-gray-200 bg-white',
    'concluida': 'border-green-500 bg-green-50'
  }[mission.urgencia_status] || 'border-gray-200 bg-white'

  const canExecute = canExecuteMission(mission)

  return (
    <Card className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.01] border-2 ${urgencyClass}`}>
      {/* Header da loja e tipo */}
      {mission.loja_nome && (
        <div className="bg-gray-50 px-3 py-2 border-b border-gray-200">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600 font-medium">🏪 {mission.loja_nome}</span>
            <span className={`px-2 py-1 rounded text-white text-xs font-bold ${
              mission.tipo === 'critica' ? 'bg-red-500' :
              mission.tipo === 'especial' ? 'bg-purple-500' :
              mission.tipo === 'rapida' ? 'bg-blue-500' :
              mission.tipo === 'bonus' ? 'bg-yellow-500' :
              'bg-gray-500'
            }`}>
              {mission.tipo?.toUpperCase()}
            </span>
          </div>
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 flex-1">
            <Checkbox
              checked={mission.status === 'concluida'}
              onCheckedChange={handleQuickComplete}
              className="h-5 w-5 rounded-full border-2"
              disabled={mission.status === 'concluida'}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl" style={{ color: mission.cor_primary || '#3B82F6' }}>
                  {mission.icone || '📋'}
                </span>
                <CardTitle className={`text-sm font-bold leading-tight ${
                  mission.status === 'concluida' ? 'line-through text-gray-500' : 'text-gray-800'
                }`}>
                  {mission.missao_nome}
                </CardTitle>
              </div>
              
              {mission.categoria && (
                <div className="text-xs text-gray-600 mb-1">
                  📁 {mission.categoria}
                </div>
              )}
              
              {mission.descricao && (
                <p className="text-xs text-gray-700 line-clamp-2 mb-2">
                  {mission.descricao}
                </p>
              )}
            </div>
          </div>

          <div className="shrink-0">
            {getUrgencyBadge()}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Progresso horário */}
        {mission.progresso_tempo > 0 && mission.status !== 'concluida' && (
          <div className="space-y-1 mb-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Progresso horário</span>
              <span className={`font-medium ${
                mission.progresso_tempo > 90 ? 'text-red-600' :
                mission.progresso_tempo > 70 ? 'text-orange-600' :
                'text-green-600'
              }`}>
                {mission.progresso_tempo}%
              </span>
            </div>
            <Progress value={mission.progresso_tempo} className="h-2" />
          </div>
        )}

        {/* Métricas principais */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="text-center bg-yellow-50 rounded-lg p-2 border border-yellow-200">
            <div className="text-lg font-bold text-yellow-700">
              {mission.pontos_total || 0}
            </div>
            <div className="text-xs text-yellow-600">pontos</div>
          </div>
          
          <div className="text-center bg-blue-50 rounded-lg p-2 border border-blue-200">
            <div className="text-lg font-bold text-blue-700">
              {mission.tempo_estimado_min || 0}m
            </div>
            <div className="text-xs text-blue-600">estimado</div>
          </div>
          
          <div className="text-center bg-green-50 rounded-lg p-2 border border-green-200">
            {mission.status === 'concluida' && mission.qualidade_execucao ? (
              <>
                <div className="text-lg font-bold text-green-700">
                  ⭐ {mission.qualidade_execucao}
                </div>
                <div className="text-xs text-green-600">qualidade</div>
              </>
            ) : (
              <>
                <div className="text-lg font-bold text-green-700">
                  {mission.status === 'ativa' ? '▶️' :
                   mission.status === 'concluida' ? '✅' : '⏳'}
                </div>
                <div className="text-xs text-green-600">status</div>
              </>
            )}
          </div>
        </div>

        {/* Horários */}
        {(mission.horario_inicio || mission.horario_limite) && (
          <div className="bg-gray-50 rounded-lg p-2 mb-3 border border-gray-200">
            <div className="text-xs text-gray-600 mb-1">⏰ Horários:</div>
            <div className="flex justify-between text-xs">
              <span>Início: {mission.horario_inicio || '--:--'}</span>
              <span>Limite: {mission.horario_limite || '--:--'}</span>
            </div>
          </div>
        )}

        {/* Evidência obrigatória */}
        {mission.requer_evidencia && (
          <div className="mb-3">
            <Badge className="bg-orange-100 text-orange-700 border-orange-300 text-xs">
              <Camera className="h-3 w-3 mr-1" />
              Foto Obrigatória
            </Badge>
          </div>
        )}

        {/* Timer de vencimento */}
        {timeLeft !== null && mission.status !== 'concluida' && (
          <div className={`text-center p-2 rounded-lg mb-3 ${
            timeLeft <= 0 ? 'bg-red-100 text-red-700' :
            timeLeft < 1800 ? 'bg-orange-100 text-orange-700' :
            'bg-blue-100 text-blue-700'
          }`}>
            <div className="text-sm font-bold">
              {formatTimeRemaining(timeLeft)}
            </div>
            <div className="text-xs">
              {timeLeft <= 0 ? 'Missão vencida' : 'até vencimento'}
            </div>
          </div>
        )}

        {/* Detalhes de conclusão */}
        {mission.status === 'concluida' && (
          <div className="bg-green-50 rounded-lg p-2 mb-3 border border-green-200">
            <div className="text-xs text-green-600 mb-1">✅ Concluída:</div>
            <div className="text-xs text-green-700 space-y-1">
              {mission.concluida_em && (
                <div>🕒 {new Date(mission.concluida_em).toLocaleString()}</div>
              )}
              {mission.tempo_total_execucao_segundos && (
                <div>⏱️ Tempo: {Math.round(mission.tempo_total_execucao_segundos / 60)}min</div>
              )}
              {mission.executada_por && (
                <div>👤 Por: {mission.executada_por}</div>
              )}
            </div>
          </div>
        )}

        {/* Avisos de execução */}
        {!canExecute.canExecute && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 mb-3">
            <div className="text-xs text-amber-700">
              ⚠️ {canExecute.reason}
            </div>
            {canExecute.suggestion && (
              <div className="text-xs text-amber-600 mt-1">
                💡 {canExecute.suggestion}
              </div>
            )}
          </div>
        )}

        {/* Botões de ação */}
        {mission.status !== 'concluida' && (
          <div className="flex gap-2">
            {mission.status === 'pendente' && (
              <Button
                onClick={() => onStart(mission.id)}
                size="sm"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                disabled={!canExecute.canExecute}
              >
                <Play className="h-4 w-4 mr-1" />
                Iniciar
              </Button>
            )}
            
            {mission.status === 'ativa' && (
              <>
                <Button
                  onClick={() => onPause(mission.id)}
                  size="sm"
                  variant="outline"
                  className="flex-1"
                >
                  <Pause className="h-4 w-4 mr-1" />
                  Pausar
                </Button>
                <Button
                  onClick={() => setShowCompleteDialog(true)}
                  size="sm"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Concluir
                </Button>
              </>
            )}
          </div>
        )}

        {/* Modal de conclusão */}
        {showCompleteDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-bold mb-4">Finalizar Missão</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-bold mb-2">Qualidade da execução:</label>
                <div className="flex gap-2 justify-center">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      onClick={() => setQualidadeExecucao(star)}
                      className={`text-2xl ${
                        star <= qualidadeExecucao ? 'text-yellow-500' : 'text-gray-300'
                      }`}
                    >
                      ⭐
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-bold mb-2">Observações:</label>
                <Textarea
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  placeholder="Como foi executada a tarefa?"
                  rows={3}
                />
              </div>

              {mission.requer_evidencia && (
                <div className="mb-4">
                  <label className="block text-sm font-bold mb-2">Evidência fotográfica:</label>
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => setEvidenceFiles(Array.from(e.target.files || []))}
                    className="block w-full text-sm border rounded p-2"
                  />
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowCompleteDialog(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={() => {
                    onComplete(mission.id, observacoes, qualidadeExecucao, evidenceFiles)
                    setShowCompleteDialog(false)
                  }}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  disabled={mission.requer_evidencia && evidenceFiles.length === 0}
                >
                  Concluir
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// =============================================================================
// COMPONENTE: LoadingScreen
// =============================================================================

function LoadingScreen({ lojaNome }: { lojaNome?: string }) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="text-center">
        <div className="relative">
          <Target className="h-16 w-16 animate-spin mx-auto mb-4 text-blue-600" />
          <Sparkles className="h-6 w-6 absolute top-0 left-12 text-yellow-500 animate-ping" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Carregando Mission Control</h2>
        <p className="text-gray-600 mb-2">
          {lojaNome ? `Conectando com ${lojaNome}...` : 'Conectando com dados reais das views...'}
        </p>
      </div>
    </div>
  )
}

// =============================================================================
// COMPONENTE: CelebrationOverlay
// =============================================================================

function CelebrationOverlay({ show }: { show: boolean }) {
  if (!show) return null

  return (
    <div className="fixed inset-0 z-40 pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-r from-yellow-300/20 via-pink-300/20 to-purple-300/20 animate-pulse"></div>
      <div className="flex items-center justify-center h-full">
        <div className="text-8xl animate-bounce">🎉</div>
      </div>
    </div>
  )
}

// =============================================================================
// COMPONENTE: HeaderControls
// =============================================================================

function HeaderControls({ 
  isGameMode, 
  soundEnabled, 
  onGameModeToggle, 
  onSoundToggle, 
  onRefresh, 
  isLoading 
}: {
  isGameMode: boolean
  soundEnabled: boolean
  onGameModeToggle: () => void
  onSoundToggle: () => void
  onRefresh: () => void
  isLoading: boolean
}) {
  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={onGameModeToggle}
        className={isGameMode ? 'border-green-500 bg-green-50 text-green-700' : ''}
      >
        <Gamepad2 className="h-4 w-4 mr-2" />
        {isGameMode ? 'Game ON' : 'Game OFF'}
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onSoundToggle}
      >
        {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onRefresh}
        disabled={isLoading}
      >
        <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
      </Button>
    </div>
  )
}

// =============================================================================
// COMPONENTE: StatsCards
// =============================================================================

function StatsCards({ dashboard, progresso }: { 
  dashboard: DashboardData | null
  progresso: number 
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
      <div className="bg-white rounded-xl p-4 shadow-lg border-l-4 border-blue-500">
        <div className="text-3xl font-bold text-blue-600">{dashboard?.total_missoes || 0}</div>
        <div className="text-sm font-medium text-gray-700">Total</div>
      </div>
      <div className="bg-white rounded-xl p-4 shadow-lg border-l-4 border-orange-500">
        <div className="text-3xl font-bold text-orange-600">{dashboard?.ativas || 0}</div>
        <div className="text-sm font-medium text-gray-700">Ativas</div>
      </div>
      <div className="bg-white rounded-xl p-4 shadow-lg border-l-4 border-gray-500">
        <div className="text-3xl font-bold text-gray-600">{dashboard?.pendentes || 0}</div>
        <div className="text-sm font-medium text-gray-700">Pendentes</div>
      </div>
      <div className="bg-white rounded-xl p-4 shadow-lg border-l-4 border-green-500">
        <div className="text-3xl font-bold text-green-600">{dashboard?.concluidas || 0}</div>
        <div className="text-sm font-medium text-gray-700">Concluídas</div>
      </div>
      <div className="bg-white rounded-xl p-4 shadow-lg border-l-4 border-red-500">
        <div className="text-3xl font-bold text-red-600">{dashboard?.criticas || 0}</div>
        <div className="text-sm font-medium text-gray-700">Críticas</div>
      </div>
      <div className="bg-white rounded-xl p-4 shadow-lg border-l-4 border-purple-500">
        <div className="text-2xl font-bold text-purple-600">{Math.round(progresso)}%</div>
        <div className="text-sm font-medium text-gray-700">Progresso</div>
      </div>
    </div>
  )
}

// =============================================================================
// COMPONENTE: ProgressSection
// =============================================================================

function ProgressSection({ dashboard, progresso }: { 
  dashboard: DashboardData | null
  progresso: number 
}) {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl p-6 shadow-xl">
        <div className="flex justify-between items-center mb-3">
          <span className="font-bold text-gray-800">Progresso do Dia</span>
          <span className="text-sm text-gray-600">
            {dashboard?.concluidas || 0}/{dashboard?.total_missoes || 0}
          </span>
        </div>
        <Progress value={progresso} className="h-6 mb-4" />
        
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-blue-600">{dashboard?.pontos_total_dia || 0}</div>
            <div className="text-xs text-gray-600">Pontos Hoje</div>
          </div>
          <div>
            <div className="text-lg font-bold text-green-600">{dashboard?.qualidade_media?.toFixed(1) || '0.0'}</div>
            <div className="text-xs text-gray-600">Qualidade Média</div>
          </div>
          <div>
            <div className="text-lg font-bold text-purple-600">
              {dashboard?.tempo_medio ? Math.round(dashboard.tempo_medio / 60) : 0}min
            </div>
            <div className="text-xs text-gray-600">Tempo Médio</div>
          </div>
        </div>

        {/* Status do sistema */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className={`text-center p-3 rounded-lg ${
            dashboard?.status_sistemas === 'critico' ? 'bg-red-100 text-red-800' :
            dashboard?.status_sistemas === 'atencao' ? 'bg-yellow-100 text-yellow-800' :
            'bg-green-100 text-green-800'
          }`}>
            <div className="font-bold">
              {dashboard?.status_sistemas === 'critico' ? '🚨 Sistema Crítico' :
               dashboard?.status_sistemas === 'atencao' ? '⚠️ Requer Atenção' :
               '✅ Sistema OK'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// =============================================================================
// COMPONENTE: CriticalMissions
// =============================================================================

function CriticalMissions({ 
  criticalMissions, 
  onStart, 
  isPending 
}: { 
  criticalMissions: MissaoDiaria[]
  onStart: (id: string) => void
  isPending: boolean
}) {
  if (criticalMissions.length === 0) return null

  return (
    <Card className="border-red-500 bg-gradient-to-r from-red-50 to-pink-50 shadow-2xl">
      <CardHeader>
        <CardTitle className="text-red-800 flex items-center gap-3">
          <AlertTriangle className="h-8 w-8 animate-bounce" />
          MISSÕES CRÍTICAS - AÇÃO IMEDIATA!
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-red-700 mb-4 font-medium">
          {criticalMissions.length} missão(ões) crítica(s) identificada(s)!
        </p>
        <div className="space-y-2">
          {criticalMissions.slice(0, 3).map(mission => (
            <div key={mission.id} className="bg-red-100 border border-red-300 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-red-800">{mission.missao_nome}</div>
                  <div className="text-sm text-red-600">
                    {mission.loja_nome} - {mission.urgencia_status.toUpperCase()}
                  </div>
                </div>
                <Button 
                  size="sm" 
                  className="bg-red-600 text-white"
                  onClick={() => onStart(mission.id)}
                  disabled={isPending || mission.status === 'ativa'}
                >
                  {mission.status === 'ativa' ? 'Em Andamento' : 'Resolver Agora'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// =============================================================================
// COMPONENTE: FiltersSection
// =============================================================================

function FiltersSection({ 
  searchText, 
  statusFilter, 
  categoryFilter, 
  typeFilter, 
  sortBy, 
  sortOrder, 
  showFilters, 
  filteredMissions, 
  missions, 
  uniqueCategories, 
  uniqueTypes,
  onSearchChange,
  onStatusChange,
  onCategoryChange,
  onTypeChange,
  onSortByChange,
  onSortOrderChange,
  onToggleFilters,
  onClearFilters
}: {
  searchText: string
  statusFilter: string
  categoryFilter: string
  typeFilter: string
  sortBy: string
  sortOrder: string
  showFilters: boolean
  filteredMissions: MissaoDiaria[]
  missions: MissaoDiaria[]
  uniqueCategories: string[]
  uniqueTypes: string[]
  onSearchChange: (value: string) => void
  onStatusChange: (value: string) => void
  onCategoryChange: (value: string) => void
  onTypeChange: (value: string) => void
  onSortByChange: (value: string) => void
  onSortOrderChange: () => void
  onToggleFilters: () => void
  onClearFilters: () => void
}) {
  const hasActiveFilters = searchText || 
    statusFilter !== 'todos' || 
    categoryFilter !== 'todas' || 
    typeFilter !== 'todos'

  return (
    <Card className="bg-white shadow-xl border-2 border-blue-200">
      <CardContent className="p-6">
        {/* Busca */}
        <div className="flex gap-4 items-center mb-4">
          <div className="flex-1 relative">
            <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar missões por nome, descrição ou categoria..."
              value={searchText}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
            />
            {searchText && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
          
          <Button
            variant="outline"
            onClick={onToggleFilters}
            className={`border-2 px-6 py-3 ${showFilters ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300'}`}
          >
            <Filter className="h-5 w-5 mr-2" />
            Filtros {showFilters ? '↑' : '↓'}
          </Button>
        </div>

        {/* Filtros avançados */}
        {showFilters && (
          <div className="border-t-2 border-gray-100 pt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Status */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => onStatusChange(e.target.value)}
                  className="w-full p-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                >
                  <option value="todos">Todos</option>
                  <option value="pendente">Pendentes</option>
                  <option value="ativa">Ativas</option>
                  <option value="concluida">Concluídas</option>
                  <option value="falhada">Falhadas</option>
                </select>
              </div>

              {/* Categoria */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Categoria</label>
                <select
                  value={categoryFilter}
                  onChange={(e) => onCategoryChange(e.target.value)}
                  className="w-full p-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                >
                  <option value="todas">Todas</option>
                  {uniqueCategories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* Tipo */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo</label>
                <select
                  value={typeFilter}
                  onChange={(e) => onTypeChange(e.target.value)}
                  className="w-full p-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                >
                  <option value="todos">Todos</option>
                  {uniqueTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Ordenar por */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Ordenar por</label>
                <select
                  value={sortBy}
                  onChange={(e) => onSortByChange(e.target.value)}
                  className="w-full p-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                >
                  <option value="prioridade">Prioridade</option>
                  <option value="pontos">Pontos</option>
                  <option value="tempo">Tempo</option>
                  <option value="deadline">Prazo</option>
                  <option value="nome">Nome</option>
                </select>
              </div>

              {/* Direção */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Direção</label>
                <Button
                  variant="outline"
                  onClick={onSortOrderChange}
                  className="w-full border-2 border-gray-300 hover:border-blue-500"
                >
                  {sortOrder === 'asc' ? (
                    <>
                      <SortAsc className="h-4 w-4 mr-2" />
                      ↑
                    </>
                  ) : (
                    <>
                      <SortDesc className="h-4 w-4 mr-2" />
                      ↓
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Resumo e limpar */}
            <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
              <div className="flex items-center justify-between">
                <span className="text-blue-800 font-semibold">
                  Mostrando {filteredMissions.length} de {missions.length} missões
                </span>
                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onClearFilters}
                    className="border-red-300 text-red-700 hover:bg-red-50"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Limpar
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// =============================================================================
// COMPONENTE: EmptyState
// =============================================================================

function EmptyState({ missions }: { missions: MissaoDiaria[] }) {
  return (
    <div className="col-span-full">
      <Card className="text-center py-16 bg-gradient-to-br from-green-50 to-emerald-50 shadow-xl">
        <CardContent>
          <div className="mb-6">
            {missions.length === 0 ? (
              <Trophy className="h-20 w-20 mx-auto text-green-400 animate-bounce" />
            ) : (
              <Search className="h-20 w-20 mx-auto text-blue-400 animate-pulse" />
            )}
          </div>
          <h3 className="text-3xl font-bold text-gray-800 mb-4">
            {missions.length === 0 ? 'PARABÉNS!' : 'NENHUMA MISSÃO ENCONTRADA'}
          </h3>
          <p className="text-xl text-gray-600 mb-4">
            {missions.length === 0
              ? 'Você não tem missões pendentes para hoje!' 
              : 'Nenhuma missão corresponde aos filtros aplicados.'}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

// =============================================================================
// COMPONENTE: HundredPercentCelebration
// =============================================================================

function HundredPercentCelebration({ 
  dashboard, 
  stats, 
  lojaNome 
}: { 
  dashboard: DashboardData
  stats: ReturnType<typeof calculateGamificationStats>
  lojaNome?: string
}) {
  if (!dashboard || dashboard.total_missoes === 0) return null

  return (
    <Card className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white text-center relative overflow-hidden shadow-2xl">
      <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/30 via-orange-500/30 to-red-500/30 animate-pulse"></div>
      <CardContent className="pt-8 pb-8 relative z-10">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <Crown className="h-20 w-20 text-yellow-200 animate-bounce" />
            <Sparkles className="h-8 w-8 absolute -top-2 -right-2 text-pink-300 animate-ping" />
          </div>
        </div>
        <h3 className="text-4xl font-bold mb-4">LENDÁRIO!</h3>
        <p className="text-2xl mb-4">
          Todas as missões do dia concluídas{lojaNome ? ` em ${lojaNome}!` : '!'}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-lg max-w-4xl mx-auto">
          <div className="bg-white/20 rounded-lg p-3">
            <div>+{dashboard.pontos_total_dia} pontos</div>
          </div>
          <div className="bg-white/20 rounded-lg p-3">
            <div>Qualidade: {dashboard.qualidade_media.toFixed(1)}/5</div>
          </div>
          <div className="bg-white/20 rounded-lg p-3">
            <div>Eficiência: {stats?.eficiencia_score || 100}%</div>
          </div>
          <div className="bg-white/20 rounded-lg p-3">
            <div>Status: {dashboard.status_sistemas.toUpperCase()}</div>
          </div>
        </div>
        <div className="mt-6">
          <Button
            size="lg"
            className="bg-white text-orange-600 hover:bg-gray-100 font-bold px-8 py-4 text-xl shadow-xl"
          >
            <PartyPopper className="h-6 w-6 mr-2" />
            Compartilhar Conquista
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// =============================================================================
// COMPONENTE PRINCIPAL: MissionControlPage
// =============================================================================

export default function MissionControlPage() {
  // =============================================================================
  // ESTADOS GERAIS
  // =============================================================================
  
  // Estados da loja selecionada
  const [selectedLoja, setSelectedLoja] = useState<{ id: string, nome: string } | null>(null)
  const [lojaLocked, setLojaLocked] = useState(false)

  // Estados de configurações
  const [isGameMode, setIsGameMode] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [showCelebration, setShowCelebration] = useState(false)

  // Estados para filtros
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState('todos')
  const [categoryFilter, setCategoryFilter] = useState('todas')
  const [typeFilter, setTypeFilter] = useState('todos')
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState('prioridade')
  const [sortOrder, setSortOrder] = useState('desc')

  // User ID fixo para demonstração
  const userId = 'user-demo'

  // =============================================================================
  // HOOKS E MUTAÇÕES
  // =============================================================================

  // Hooks com a loja selecionada
  const {
    missions,
    dashboard,
    isLoading,
    refetchAll
  } = useMissionControl(userId, selectedLoja?.id)

  // Hook de gamificação com fallback
  const { data: gamification } = useQuery({
    queryKey: ['gamification', userId, selectedLoja?.id],
    queryFn: async () => {
      try {
        if (!selectedLoja?.id) return null
        
        const params = new URLSearchParams({
          action: 'user_gamification',
          userId,
          lojaId: selectedLoja.id
        })

        const response = await fetch(`/api/gamification?${params.toString()}`)
        
        if (!response.ok) {
          console.warn('Gamificação indisponível, usando mock')
          return {
            level_atual: 3,
            xp_atual: 750,
            xp_proximo_level: 1000,
            streak_dias_consecutivos: 5,
            titulo_atual: 'Especialista',
            pontos_hoje: 85,
            pontos_semana: 320,
            pontos_totais_historico: 1250
          }
        }
        
        const result = await response.json()
        return result.gamification
      } catch (err) {
        console.warn('Erro ao buscar gamificação, usando mock:', err)
        return {
          level_atual: 3,
          xp_atual: 750,
          xp_proximo_level: 1000,
          streak_dias_consecutivos: 5,
          titulo_atual: 'Especialista',
          pontos_hoje: 85,
          pontos_semana: 320,
          pontos_totais_historico: 1250
        }
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
    enabled: !!selectedLoja?.id
  })

  const startMutation = useStartMission()
  const completeMutation = useCompleteMission()
  const pauseMutation = usePauseMission()

  // =============================================================================
  // FUNÇÕES DE SELEÇÃO DE LOJA
  // =============================================================================

  const handleLojaSelected = (lojaId: string, lojaNome: string) => {
    setSelectedLoja({ id: lojaId, nome: lojaNome })
    setLojaLocked(true)
    toast.success(`Loja ${lojaNome} selecionada com sucesso!`)
  }

  // Se não tem loja selecionada, mostrar o seletor
  if (!selectedLoja || !lojaLocked) {
    return (
      <LojaSelector 
        onLojaSelected={handleLojaSelected}
        selectedLoja={selectedLoja || undefined}
        locked={lojaLocked}
      />
    )
  }

  // =============================================================================
  // FUNÇÕES DE FILTRAGEM E ORDENAÇÃO
  // =============================================================================

  const getFilteredAndSortedMissions = () => {
    if (!missions || missions.length === 0) return []
    
    let filtered = missions.filter(mission => {
      const matchesSearch = searchText === '' ||
        mission.missao_nome.toLowerCase().includes(searchText.toLowerCase()) ||
        mission.descricao?.toLowerCase().includes(searchText.toLowerCase()) ||
        mission.categoria?.toLowerCase().includes(searchText.toLowerCase())
      
      const matchesStatus = statusFilter === 'todos' || mission.status === statusFilter
      const matchesCategory = categoryFilter === 'todas' || mission.categoria === categoryFilter
      const matchesType = typeFilter === 'todos' || mission.tipo === typeFilter
      
      return matchesSearch && matchesStatus && matchesCategory && matchesType
    })

    // Ordenação usando dados reais da view
    filtered.sort((a, b) => {
      let aValue, bValue
      switch (sortBy) {
        case 'prioridade':
          const priorityOrder = { 'vencida': 4, 'urgente': 3, 'no_prazo': 2, 'concluida': 1 }
          aValue = priorityOrder[a.urgencia_status] || 0
          bValue = priorityOrder[b.urgencia_status] || 0
          break
        case 'pontos':
          aValue = a.pontos_total || 0
          bValue = b.pontos_total || 0
          break
        case 'tempo':
          aValue = a.tempo_estimado_min || 0
          bValue = b.tempo_estimado_min || 0
          break
        case 'deadline':
          aValue = a.data_vencimento ? new Date(a.data_vencimento).getTime() : Infinity
          bValue = b.data_vencimento ? new Date(b.data_vencimento).getTime() : Infinity
          break
        case 'nome':
          aValue = a.missao_nome
          bValue = b.missao_nome
          return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
        default:
          return 0
      }
      return sortOrder === 'desc' ? bValue - aValue : aValue - bValue
    })
    
    return filtered
  }

  const filteredMissions = getFilteredAndSortedMissions()
  const uniqueCategories = Array.from(new Set((missions || []).map(m => m.categoria).filter(Boolean)))
  const uniqueTypes = Array.from(new Set((missions || []).map(m => m.tipo).filter(Boolean)))

  // =============================================================================
  // CÁLCULOS E PROCESSAMENTO
  // =============================================================================

  const stats = calculateGamificationStats(dashboard, gamification)
  const missionStats = calculateMissionMetrics(missions || [])
  const criticalMissions = getCriticalMissions(missions || [])
  const recommendedAction = getRecommendedAction(missions || [])
  const progresso = dashboard?.percentual_conclusao || 0

  // =============================================================================
  // FUNÇÕES DE AÇÃO DAS MISSÕES
  // =============================================================================

  const handleStart = async (missionId: string) => {
    startMutation.mutate({ 
      missaoId: missionId, 
      usuario: userId,
    })
  }

  const handlePause = async (missionId: string) => {
    pauseMutation.mutate({ missaoId: missionId })
  }

  const handleComplete = async (missionId: string, observacoes: string, qualidade: number, evidencia: File[]) => {
    completeMutation.mutate({
      missaoId: missionId,
      userId,
      observacoes,
      qualidade,
      evidencias: []
    })
    
    setShowCelebration(true)
    setTimeout(() => setShowCelebration(false), 3000)
  }

  // =============================================================================
  // FUNÇÕES DE CONTROLE DE FILTROS
  // =============================================================================

  const clearAllFilters = () => {
    setSearchText('')
    setStatusFilter('todos')
    setCategoryFilter('todas')
    setTypeFilter('todos')
    setSortBy('prioridade')
    setSortOrder('desc')
  }

  // =============================================================================
  // RENDERIZAÇÃO - Loading
  // =============================================================================

  if (isLoading) {
    return <LoadingScreen lojaNome={selectedLoja?.nome} />
  }

  // =============================================================================
  // RENDERIZAÇÃO - PÁGINA PRINCIPAL
  // =============================================================================

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Overlay de celebração */}
      <CelebrationOverlay show={showCelebration} />

      <div className="p-6 space-y-8 max-w-7xl mx-auto">
        {/* Header com loja selecionada */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-500 p-2 rounded-full">
                <MapPin className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="font-bold text-blue-800">Operando em:</div>
                <div className="text-blue-700 text-lg font-semibold">{selectedLoja.nome}</div>
              </div>
            </div>
            <HeaderControls
              isGameMode={isGameMode}
              soundEnabled={soundEnabled}
              onGameModeToggle={() => setIsGameMode(!isGameMode)}
              onSoundToggle={() => setSoundEnabled(!soundEnabled)}
              onRefresh={refetchAll}
              isLoading={isLoading}
            />
          </div>
        </div>

        {/* Header principal */}
        <div className="text-center relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-3xl"></div>
          <div className="relative z-10 p-8">
            {/* Título principal */}
            <h1 className="text-5xl font-bold flex items-center justify-center gap-4 mb-4">
              <Target className="h-12 w-12 text-blue-600 animate-pulse" />
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                MISSION CONTROL
              </span>
              {gamification?.streak_dias_consecutivos >= 30 && <Crown className="h-10 w-10 text-yellow-500 animate-bounce" />}
            </h1>

            {/* Debug info (apenas em desenvolvimento) */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mb-4 p-4 bg-gray-100 rounded-lg text-sm">
                <div className="font-bold mb-2">Debug Info:</div>
                <div>Missões carregadas: {missions.length}</div>
                <div>Dashboard: {dashboard ? 'OK' : 'Usando mock'}</div>
                <div>Gamificação: {gamification ? 'OK' : 'Usando mock'}</div>
                <div>Fonte: {missions[0]?.loja_nome?.includes('Mock') ? 'Dados Mock' : 'API Real'}</div>
              </div>
            )}

            {/* Recomendação de ação */}
            {recommendedAction.mission && (
              <div className={`max-w-2xl mx-auto mb-6 p-4 rounded-xl border-2 ${
                recommendedAction.action === 'start_critical' ? 'bg-red-50 border-red-300' :
                recommendedAction.action === 'complete_active' ? 'bg-blue-50 border-blue-300' :
                'bg-green-50 border-green-300'
              }`}>
                <div className="text-center">
                  <div className={`text-lg font-bold mb-2 ${
                    recommendedAction.action === 'start_critical' ? 'text-red-800' :
                    recommendedAction.action === 'complete_active' ? 'text-blue-800' :
                    'text-green-800'
                  }`}>
                    🎯 Próxima Ação Recomendada
                  </div>
                  <div className="text-sm text-gray-700 mb-2">{recommendedAction.reason}</div>
                  <div className="font-medium">📋 {recommendedAction.mission.missao_nome}</div>
                  {recommendedAction.action === 'start_critical' && (
                    <Button 
                      className="mt-2 bg-red-600 text-white"
                      onClick={() => handleStart(recommendedAction.mission!.id)}
                    >
                      Iniciar Agora
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Info do usuário */}
            <div className="flex items-center justify-center gap-6 mb-6">
              <div className="bg-white rounded-full p-1 shadow-lg">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-full p-3">
                  <span className="text-3xl">🎯</span>
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{stats?.titulo_atual || 'Carregando...'}</div>
                <div className="flex items-center justify-center gap-4 text-sm mt-2">
                  <span className="text-blue-600 font-bold">Nível {stats?.nivel_atual || 1}</span>
                  <span className="text-orange-600">🔥 {stats?.streak_atual || 0} dias</span>
                </div>
              </div>
            </div>

            {/* Cards de estatísticas */}
            <StatsCards dashboard={dashboard || null} progresso={progresso} />

            {/* Seção de progresso */}
            <ProgressSection dashboard={dashboard || null} progresso={progresso} />
          </div>
        </div>

        {/* Missões críticas */}
        <CriticalMissions
          criticalMissions={criticalMissions}
          onStart={handleStart}
          isPending={startMutation.isPending}
        />

        {/* Filtros e busca */}
        <FiltersSection
          searchText={searchText}
          statusFilter={statusFilter}
          categoryFilter={categoryFilter}
          typeFilter={typeFilter}
          sortBy={sortBy}
          sortOrder={sortOrder}
          showFilters={showFilters}
          filteredMissions={filteredMissions}
          missions={missions || []}
          uniqueCategories={uniqueCategories}
          uniqueTypes={uniqueTypes}
          onSearchChange={setSearchText}
          onStatusChange={setStatusFilter}
          onCategoryChange={setCategoryFilter}
          onTypeChange={setTypeFilter}
          onSortByChange={setSortBy}
          onSortOrderChange={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          onToggleFilters={() => setShowFilters(!showFilters)}
          onClearFilters={clearAllFilters}
        />

        {/* Grid de missões */}
        <div className="grid grid-cols-1 xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2 gap-6">
          {filteredMissions.length === 0 ? (
            <EmptyState missions={missions || []} />
          ) : (
            filteredMissions.map((mission) => (
              <MissionCard
                key={mission.id}
                mission={mission}
                onStart={handleStart}
                onPause={handlePause}
                onComplete={handleComplete}
                userId={userId}
              />
            ))
          )}
        </div>

        {/* Celebração 100% */}
        {progresso >= 100 && dashboard && dashboard.total_missoes > 0 && (
          <HundredPercentCelebration
            dashboard={dashboard}
            stats={stats}
            lojaNome={selectedLoja?.nome}
          />
        )}
      </div>
    </div>
  )
}