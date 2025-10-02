'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { StoreSelector } from '@/components/store-selector'
import { toast } from 'sonner'
import { Clock, CheckCircle, Target, RefreshCw } from 'lucide-react'

interface Mission {
  id: string
  titulo?: string
  missao_nome?: string  // Campo real da API
  descricao: string
  prioridade?: 'baixa' | 'media' | 'alta' | 'critica'
  prazo_vencimento?: string
  data_vencimento?: string  // Campo real da API
  pontos_total: number
  status: 'pendente' | 'ativa' | 'concluida'
  template_titulo?: string
  categoria?: string
}

export default function MissionControlSimple() {
  const [missions, setMissions] = useState<Mission[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedLoja, setSelectedLoja] = useState<string | null>(null)

  // Carregar loja selecionada do localStorage na inicialização
  useEffect(() => {
    const savedLojaId = localStorage.getItem('selectedLojaId')
    if (savedLojaId) {
      setSelectedLoja(savedLojaId)
    } else {
      // Fallback para loja padrão se não houver seleção salva
      setSelectedLoja('e5915ba4-fdb4-4fa7-b9d5-c71d3c704c55')
    }
  }, [])

  // Função para alterar a loja selecionada
  const handleLojaChange = (lojaId: string) => {
    setSelectedLoja(lojaId)
    localStorage.setItem('selectedLojaId', lojaId)
  }

  // Buscar missões quando a loja selecionada mudar
  useEffect(() => {
    if (selectedLoja) {
      fetchMissions()
    }
  }, [selectedLoja])

  const fetchMissions = async () => {
    if (!selectedLoja) {
      toast.error('Selecione uma loja primeiro')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const response = await fetch(`/api/mission-control?action=missions&data=2025-10-01&loja_id=${selectedLoja}`)
      if (response.ok) {
        const data = await response.json()
        // A API retorna { missions: [...] }, então precisamos acessar a propriedade missions
        const missionsArray = data.missions || data || []
        setMissions(Array.isArray(missionsArray) ? missionsArray : [])
      }
    } catch (error) {
      toast.error('Erro ao carregar missões')
    } finally {
      setLoading(false)
    }
  }

  // Iniciar missão (marcar checkbox e bloquear)
  const handleStartMission = async (missionId: string) => {
    try {
      const response = await fetch('/api/mission-control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'start_mission',
          missaoId: missionId,
          usuario: 'Usuário Logado'
        })
      })

      if (response.ok) {
        const result = await response.json()
        toast.success(result.message || 'Missão iniciada!')
        fetchMissions() // Recarregar lista
      } else {
        toast.error('Erro ao iniciar missão')
      }
    } catch (error) {
      toast.error('Erro de conexão')
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
          usuario: 'Usuário Logado',
          evidencias: [],
          observacoes: 'Missão finalizada',
          qualidade: 5
        })
      })

      if (response.ok) {
        const result = await response.json()
        toast.success(result.message || 'Missão finalizada!')
        if (result.badges_conquistadas?.length > 0) {
          toast.success(`Badges conquistadas: ${result.badges_conquistadas.join(', ')}`)
        }
        fetchMissions() // Recarregar lista
      } else {
        toast.error('Erro ao finalizar missão')
      }
    } catch (error) {
      toast.error('Erro de conexão')
    }
  }

  // Organizar missões: Pendentes, Ativas, Concluídas no final
  const organizedMissions = (missions || []).sort((a, b) => {
    const statusOrder = { 'pendente': 1, 'ativa': 2, 'concluida': 3 }
    return statusOrder[a.status] - statusOrder[b.status]
  })

  // Debug: vamos ver o que está acontecendo
  console.log('Debug Mission Control v2:', {
    missionsLength: missions.length,
    organizedLength: organizedMissions.length,
    firstMission: organizedMissions[0]
  })

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critica': return 'bg-red-500'
      case 'alta': return 'bg-orange-500'
      case 'media': return 'bg-yellow-500'
      case 'baixa': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendente': return 'bg-gray-500'
      case 'ativa': return 'bg-blue-500'
      case 'concluida': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <RefreshCw className="animate-spin w-8 h-8" />
        <span className="ml-2">Carregando missões...</span>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header Simples */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">🎯 Missões do Dia</h1>
        <p className="text-gray-600">Escolha uma loja e marque para iniciar as missões</p>
      </div>

      {/* Seletor de Loja e Gamificação */}
      <div className="mb-6">
        <StoreSelector 
          selectedLojaId={selectedLoja} 
          onLojaChange={handleLojaChange} 
        />
      </div>

      {/* Botão de Atualizar */}
      <div className="mb-6">
        <Button 
          onClick={fetchMissions} 
          className="mr-4"
          variant="outline"
          disabled={!selectedLoja}
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Atualizar Missões
        </Button>
      </div>

      {/* Lista de Missões */}
      <div className="grid gap-4">
        {!selectedLoja ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-gray-500">Selecione uma loja para ver as missões</p>
              <p className="text-sm text-gray-400 mt-2">
                Use o seletor acima para escolher a loja e começar a gamificação!
              </p>
            </CardContent>
          </Card>
        ) : organizedMissions.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-gray-500">Nenhuma missão encontrada para hoje</p>
              <p className="text-sm text-gray-400 mt-2">
                Total de missões carregadas: {missions.length}
              </p>
            </CardContent>
          </Card>
        ) : (
          organizedMissions.map((mission) => (
          <Card key={mission.id} className={`${mission.status === 'concluida' ? 'opacity-60' : ''}`}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                
                {/* Checkbox + Informações da Missão */}
                <div className="flex items-start space-x-4 flex-1">
                  
                  {/* Checkbox para iniciar */}
                  <div className="mt-1">
                    <Checkbox
                      checked={mission.status === 'ativa' || mission.status === 'concluida'}
                      disabled={mission.status === 'ativa' || mission.status === 'concluida'}
                      onCheckedChange={() => {
                        if (mission.status === 'pendente') {
                          handleStartMission(mission.id)
                        }
                      }}
                      className="w-5 h-5"
                    />
                  </div>

                  {/* Informações */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className={`font-semibold ${mission.status === 'concluida' ? 'line-through' : ''}`}>
                        {mission.titulo || mission.missao_nome || 'Missão'}
                        <span className="text-xs text-gray-500 ml-2">ID: {mission.id.substring(0, 8)}</span>
                      </h3>
                      {mission.prioridade && (
                        <Badge className={`${getPriorityColor(mission.prioridade)} text-white text-xs`}>
                          {mission.prioridade}
                        </Badge>
                      )}
                      <Badge className={`${getStatusColor(mission.status)} text-white text-xs`}>
                        {mission.status}
                      </Badge>
                    </div>

                    <p className="text-gray-600 mb-3">
                      {mission.descricao || 'Descrição da missão'}
                    </p>

                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <Target className="w-4 h-4 mr-1" />
                        {mission.pontos_total || 0} pontos
                      </span>
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {(mission.prazo_vencimento || mission.data_vencimento) ? 
                          new Date(mission.prazo_vencimento || mission.data_vencimento!).toLocaleDateString() : 
                          'Hoje'
                        }
                      </span>
                      {mission.categoria && (
                        <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                          {mission.categoria}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Botão Finalizar */}
                <div className="ml-4">
                  {mission.status === 'ativa' && (
                    <Button
                      onClick={() => handleCompleteMission(mission.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Finalizar
                    </Button>
                  )}
                  {mission.status === 'concluida' && (
                    <Button disabled variant="outline">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Concluída
                    </Button>
                  )}
                </div>

              </div>
            </CardContent>
          </Card>
        ))
        )}
      </div>

      {/* Estatísticas Simples */}
      <Card className="mt-6">
        <CardContent className="p-4">
          <div className="flex justify-around text-center">
            <div>
              <div className="text-2xl font-bold text-gray-600">
                {missions.filter(m => m.status === 'pendente').length}
              </div>
              <div className="text-sm text-gray-500">Pendentes</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {missions.filter(m => m.status === 'ativa').length}
              </div>
              <div className="text-sm text-gray-500">Em Execução</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {missions.filter(m => m.status === 'concluida').length}
              </div>
              <div className="text-sm text-gray-500">Finalizadas</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}