'use client'

import React, { useState, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LojaSelector } from '@/components/mission-control/loja-selector'
import { MissionKanbanColumn } from '@/components/kanban/MissionKanbanColumn'
import { MissionKanbanCard } from '@/components/kanban/MissionKanbanCard'
import { LigaBadge } from '@/components/gamification/LigaBadge'
import { ProgressBar } from '@/components/gamification/ProgressBar'
import { HistoricoDiario } from '@/components/gamification/HistoricoDiario'
import { useGamificacao } from '@/hooks/useGamificacao'
import { toast } from 'sonner'
import { RefreshCw, Target, LogOut, Trophy, Star } from 'lucide-react'

interface Mission {
  id: string
  titulo?: string
  missao_nome?: string
  descricao: string
  prioridade?: 'baixa' | 'media' | 'alta' | 'critica'
  prazo_vencimento?: string
  data_vencimento?: string
  pontos_total: number
  status: 'pendente' | 'ativa' | 'concluida'
}

type KanbanColumn = {
  id: 'pendente' | 'ativa' | 'concluida'
  title: string
  color: string
  missions: Mission[]
}

type MissionsByStatus = {
  pendente: Mission[]
  ativa: Mission[]
  concluida: Mission[]
}

export default function MissionControlKanban() {
  const [missions, setMissions] = useState<Mission[]>([])
  const [missionsByStatus, setMissionsByStatus] = useState<MissionsByStatus>({
    pendente: [],
    ativa: [],
    concluida: []
  })
  const [loading, setLoading] = useState(false) // Mudei para false - só carrega quando buscar missões
  const [selectedLoja, setSelectedLoja] = useState<string | null>(null)
  const [selectedLojaName, setSelectedLojaName] = useState<string>('')
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null)
  const [showCompleted, setShowCompleted] = useState(false)

  // Hook de gamificação
  const { 
    loja: gamificacao, 
    ranking, 
    badges, 
    loading: gamingLoading, 
    levelUpPendente,
    pontosPossiveisMes,
    historicoDiario,
    atualizarPontos,
    confirmarLevelUp 
  } = useGamificacao(selectedLoja)

  // Carregar loja selecionada do localStorage na inicialização
  useEffect(() => {
    const savedLojaId = localStorage.getItem('selectedLojaId')
    const savedLojaName = localStorage.getItem('selectedLojaName')
    if (savedLojaId && savedLojaName) {
      console.log('🏪 Loja encontrada no localStorage:', savedLojaName)
      setSelectedLoja(savedLojaId)
      setSelectedLojaName(savedLojaName)
    } else {
      console.log('🏪 Nenhuma loja salva no localStorage')
    }
  }, [])

  // Função chamada quando uma loja é selecionada no LojaSelector
  const handleLojaSelected = (lojaId: string, lojaNome: string) => {
    setSelectedLoja(lojaId)
    setSelectedLojaName(lojaNome)
    localStorage.setItem('selectedLojaId', lojaId)
    localStorage.setItem('selectedLojaName', lojaNome)
    toast.success(`Loja selecionada: ${lojaNome}`)
  }

  // Função para trocar de loja (voltar à seleção)
  const handleChangeLoja = () => {
    setSelectedLoja(null)
    setSelectedLojaName('')
    setMissions([])
    localStorage.removeItem('selectedLojaId')
    localStorage.removeItem('selectedLojaName')
  }

  // Buscar missões quando a loja selecionada mudar
  useEffect(() => {
    if (selectedLoja) {
      fetchMissions()
    }
  }, [selectedLoja])

  // Organizar missões por status sempre que a lista mudar
  useEffect(() => {
    console.log('📊 Organizando missões por status, total:', missions.length)
    const organized: MissionsByStatus = {
      pendente: missions.filter(m => m.status === 'pendente'),
      ativa: missions.filter(m => m.status === 'ativa'),
      concluida: missions.filter(m => m.status === 'concluida')
    }
    console.log('📋 Missões organizadas:', {
      pendente: organized.pendente.length,
      ativa: organized.ativa.length,
      concluida: organized.concluida.length
    })
    setMissionsByStatus(organized)
  }, [missions])

  const fetchMissions = async () => {
    if (!selectedLoja) {
      console.log('❌ Não é possível carregar missões - nenhuma loja selecionada')
      toast.error('Selecione uma loja primeiro')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      console.log('🎯 Carregando missões para loja:', selectedLoja)
      const response = await fetch(`/api/mission-control?action=missions&data=2025-10-01&loja_id=${selectedLoja}`)
      
      if (response.ok) {
        const data = await response.json()
        console.log('📦 Dados recebidos da API:', data)
        const missionsArray = data.missions || data || []
        console.log('🎯 Array de missões processado:', missionsArray.length, 'missões')
        setMissions(Array.isArray(missionsArray) ? missionsArray : [])
      } else {
        console.log('❌ Erro na resposta da API:', response.status, response.statusText)
        toast.error(`Erro na API: ${response.status}`)
      }
    } catch (error) {
      console.error('❌ Erro no fetch de missões:', error)
      toast.error('Erro ao carregar missões')
    } finally {
      setLoading(false)
    }
  }

  // Iniciar missão
  const handleStartMission = async (missionId: string) => {
    try {
      const response = await fetch('/api/mission-control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'start_mission',
          missaoId: missionId,
          usuario: 'usuario_atual'
        })
      })

      if (response.ok) {
        toast.success('Missão iniciada!')
        fetchMissions()
      } else {
        toast.error('Erro ao iniciar missão')
      }
    } catch (error) {
      toast.error('Erro ao iniciar missão')
    }
  }

  // Finalizar missão
  const handleCompleteMission = async (missionId: string) => {
    try {
      const response = await fetch('/api/mission-control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'execute_mission',
          missaoId: missionId,
          usuario: 'usuario_atual',
          qualidade: 5
        })
      })

      if (response.ok) {
        const result = await response.json()
        const pontosGanhos = result.pontos_ganhos || 50
        
        toast.success(`🎉 Missão finalizada! +${pontosGanhos} pontos!`)
        
        // Atualizar pontos na gamificação
        if (atualizarPontos) {
          await atualizarPontos(pontosGanhos)
        }
        
        // Atualizar localmente para feedback imediato
        setMissions(prev => prev.map(m => 
          m.id === missionId ? { ...m, status: 'concluida' as const } : m
        ))
        
        // Recarregar dados completos
        setTimeout(() => fetchMissions(), 1000)
      } else {
        const errorData = await response.json()
        console.error('Erro na API:', errorData)
        toast.error(`❌ Erro: ${errorData.details || 'Erro desconhecido'}`)
      }
    } catch (error) {
      console.error('Erro na finalização:', error)
      toast.error('❌ Erro de conexão ao finalizar missão')
    }
  }

  // Organizar missões em colunas
  const organizeColumns = (): KanbanColumn[] => {
    return [
      {
        id: 'pendente',
        title: 'Pendentes',
        color: '#6b7280',
        missions: missionsByStatus.pendente
      },
      {
        id: 'ativa',
        title: 'Em Andamento',
        color: '#3b82f6',
        missions: missionsByStatus.ativa
      },
      {
        id: 'concluida',
        title: `Concluídas ${showCompleted ? '' : '(ocultas)'}`,
        color: '#10b981',
        missions: showCompleted ? missionsByStatus.concluida : [] // Só mostra se showCompleted for true
      }
    ]
  }

  const columns = organizeColumns()
  const totalPoints = missions.reduce((sum, m) => m.status === 'concluida' ? sum + m.pontos_total : sum, 0)

  // Handle drag and drop
  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result

    if (!destination) return
    if (destination.droppableId === source.droppableId) return

    // Atualizar status da missão baseado na coluna de destino
    const newStatus = destination.droppableId as 'pendente' | 'ativa' | 'concluida'
    const mission = missions.find(m => m.id === draggableId)
    
    if (mission && mission.status !== newStatus) {
      if (newStatus === 'ativa' && mission.status === 'pendente') {
        handleStartMission(mission.id)
      } else if (newStatus === 'concluida' && mission.status === 'ativa') {
        handleCompleteMission(mission.id)
      }
    }
  }

  if (loading && selectedLoja) {
    return (
      <div className="flex justify-center items-center h-screen">
        <RefreshCw className="animate-spin w-8 h-8" />
        <span className="ml-2">Carregando missões...</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Se não tiver loja selecionada, mostra o seletor */}
      {!selectedLoja ? (
        <LojaSelector 
          onLojaSelected={handleLojaSelected}
        />
      ) : (
        <div className="container mx-auto p-6">
          {/* Header com Gamificação */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">🎯 Mission Control</h1>
              <p className="text-gray-600 mb-2">
                Loja: <span className="font-semibold text-blue-600">{selectedLojaName}</span> - 
                Arraste cartões ou clique nos botões!
              </p>
              
              {/* Sistema de Liga com Barra de Progresso */}
              {gamificacao && (
                <div className="bg-white p-4 rounded-lg border shadow-sm">
                  <ProgressBar 
                    ligaAtual={gamificacao.liga_atual}
                    pontosAtuais={gamificacao.pontos_mes_atual}
                    pontosPossiveisMes={pontosPossiveisMes}
                    showLevelUp={levelUpPendente}
                    onLevelUp={(novaLiga) => {
                      toast.success(`🎉 Parabéns! Você subiu para ${novaLiga}!`, {
                        duration: 5000,
                      })
                      confirmarLevelUp()
                    }}
                  />
                  
                  {ranking && (
                    <div className="flex items-center gap-4 mt-3 pt-3 border-t text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Trophy className="h-4 w-4" />
                        <span>#{ranking.posicao_geral} no geral</span>
                      </div>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4" />
                        <span>{ranking.badges_total} badges</span>
                      </div>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <span>🔥 {ranking.streak_atual} dias</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            <Button 
              onClick={handleChangeLoja}
              variant="outline"
              className="flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Trocar Loja
            </Button>
          </div>

      {/* Stats da Sessão */}
      {selectedLoja && (
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-600">{missionsByStatus.pendente.length}</div>
              <div className="text-sm text-gray-500">Pendentes</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{missionsByStatus.ativa.length}</div>
              <div className="text-sm text-gray-500">Em Andamento</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{missionsByStatus.concluida.length}</div>
              <div className="text-sm text-gray-500">Concluídas</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">{totalPoints}</div>
              <div className="text-sm text-gray-500">Pontos Ganhos</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Botão de Atualizar */}
      <div className="mb-6 flex items-center gap-4">
        <Button 
          onClick={fetchMissions} 
          variant="outline"
          disabled={!selectedLoja}
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Atualizar Missões
        </Button>
        
        <Button 
          onClick={() => setShowCompleted(!showCompleted)} 
          variant={showCompleted ? "default" : "outline"}
          disabled={!selectedLoja}
        >
          {showCompleted ? "Ocultar" : "Mostrar"} Concluídas ({missionsByStatus.concluida.length})
        </Button>
      </div>

      {/* Kanban Board */}
      {!selectedLoja ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Target className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">Selecione uma loja</h3>
            <p className="text-gray-500">
              Escolha uma loja usando o seletor acima para ver as missões e começar a gamificação!
            </p>
          </CardContent>
        </Card>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-3 gap-6">
            {columns.map((column) => (
              <Droppable key={column.id} droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`rounded-lg border ${snapshot.isDraggingOver ? 'border-blue-300 bg-blue-50' : 'border-gray-200'}`}
                  >
                    <MissionKanbanColumn
                      id={column.id}
                      title={column.title}
                      color={column.color}
                      count={column.missions.length}
                      points={column.missions.reduce((sum, m) => sum + (m.status === 'concluida' ? m.pontos_total : 0), 0)}
                    >
                      {column.missions.map((mission, index) => (
                        <Draggable key={mission.id} draggableId={mission.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                              <MissionKanbanCard
                                mission={mission}
                                onClick={() => setSelectedMission(mission)}
                                onStart={() => handleStartMission(mission.id)}
                                onComplete={() => handleCompleteMission(mission.id)}
                                isDragging={snapshot.isDragging}
                              />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </MissionKanbanColumn>
                  </div>
                )}
              </Droppable>
            ))}
          </div>
        </DragDropContext>
      )}
      
      {/* Histórico Diário de Performance */}
      {selectedLoja && (
        <div className="mt-8">
          <HistoricoDiario 
            lojaId={selectedLoja}
            historico={historicoDiario}
            loading={gamingLoading}
          />
        </div>
      )}
        </div>
      )}
    </div>
  )
}