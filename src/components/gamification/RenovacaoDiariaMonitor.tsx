'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Clock, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  Calendar,
  Timer,
  Activity,
  BarChart3
} from 'lucide-react'

interface StatusRenovacao {
  data_renovacao: string
  hora_renovacao: string
  status: 'PENDENTE' | 'PROCESSANDO' | 'CONCLUIDO' | 'ERRO'
  lojas_processadas: number
  pontuacoes_calculadas: number
  tempo_execucao?: string
}

interface ProximaRenovacao {
  proxima_data: string
  proxima_hora: string
  deve_executar_agora: boolean
  tempo_restante: string
}

export default function RenovacaoDiariaMonitor() {
  const [statusAtual, setStatusAtual] = useState<StatusRenovacao | null>(null)
  const [proximaRenovacao, setProximaRenovacao] = useState<ProximaRenovacao | null>(null)
  const [loading, setLoading] = useState(true)
  const [executando, setExecutando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    carregarDados()
    
    // Atualizar a cada minuto
    const interval = setInterval(carregarDados, 60000)
    return () => clearInterval(interval)
  }, [])

  const carregarDados = async () => {
    try {
      setError(null)
      
      // Buscar status atual
      const statusResponse = await fetch('/api/renovacao-diaria?action=status')
      const statusData = await statusResponse.json()
      
      // Buscar próxima renovação
      const proximaResponse = await fetch('/api/renovacao-diaria?action=proxima')
      const proximaData = await proximaResponse.json()
      
      setStatusAtual(statusData.status_renovacao)
      setProximaRenovacao(proximaData.proxima_renovacao)
      
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      setError('Erro ao carregar dados do sistema')
    } finally {
      setLoading(false)
    }
  }

  const executarRenovacao = async () => {
    try {
      setExecutando(true)
      setError(null)
      
      const response = await fetch('/api/renovacao-diaria', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'executar' })
      })
      
      const data = await response.json()
      
      if (data.executado) {
        await carregarDados() // Recarregar dados após execução
      } else {
        setError(data.motivo || 'Renovação não executada')
      }
      
    } catch (error) {
      console.error('Erro ao executar renovação:', error)
      setError('Erro ao executar renovação')
    } finally {
      setExecutando(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONCLUIDO': return 'bg-green-100 text-green-800 border-green-200'
      case 'PROCESSANDO': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'ERRO': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CONCLUIDO': return <CheckCircle className="w-4 h-4" />
      case 'PROCESSANDO': return <RefreshCw className="w-4 h-4 animate-spin" />
      case 'ERRO': return <AlertCircle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const formatarTempo = (tempo: string) => {
    if (!tempo) return '--'
    
    // Converter intervalo PostgreSQL para formato legível
    const match = tempo.match(/(\d+):(\d+):(\d+)/)
    if (match) {
      const [, horas, minutos, segundos] = match
      return `${horas}h ${minutos}m ${segundos}s`
    }
    
    return tempo
  }

  const formatarDataHora = (dataHora: string) => {
    if (!dataHora) return '--'
    
    return new Date(dataHora).toLocaleString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">🇧🇷 Renovação Diária</h2>
          <p className="text-gray-600">Sistema automático - Horário de Brasília</p>
        </div>
        <Button 
          onClick={carregarDados}
          variant="outline"
          size="sm"
          disabled={loading}
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-lg p-4"
        >
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
            <span className="text-red-800">{error}</span>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Atual */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              Status Atual
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {statusAtual ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status:</span>
                  <Badge className={getStatusColor(statusAtual.status)}>
                    {getStatusIcon(statusAtual.status)}
                    <span className="ml-1">{statusAtual.status}</span>
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Data da renovação:</span>
                  <span className="text-sm font-medium">
                    {new Date(statusAtual.data_renovacao).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Hora da execução:</span>
                  <span className="text-sm font-medium">
                    {formatarDataHora(statusAtual.hora_renovacao)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Lojas processadas:</span>
                  <span className="text-sm font-bold text-blue-600">
                    {statusAtual.lojas_processadas}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Pontuações calculadas:</span>
                  <span className="text-sm font-bold text-green-600">
                    {statusAtual.pontuacoes_calculadas}
                  </span>
                </div>
                
                {statusAtual.tempo_execucao && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Tempo de execução:</span>
                    <span className="text-sm font-medium">
                      {formatarTempo(statusAtual.tempo_execucao)}
                    </span>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma renovação encontrada</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Próxima Renovação */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Timer className="w-5 h-5 mr-2" />
              Próxima Renovação
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {proximaRenovacao ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Data:</span>
                  <span className="text-sm font-medium">
                    {new Date(proximaRenovacao.proxima_data).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Horário:</span>
                  <span className="text-sm font-medium">
                    20:00 (Horário de Brasília)
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Tempo restante:</span>
                  <span className="text-sm font-bold text-orange-600">
                    {formatarTempo(proximaRenovacao.tempo_restante)}
                  </span>
                </div>
                
                {proximaRenovacao.deve_executar_agora && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                        <span className="text-green-800 font-medium">
                          Pronto para executar!
                        </span>
                      </div>
                      <Button
                        onClick={executarRenovacao}
                        disabled={executando}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {executando ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          'Executar Agora'
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Carregando informações...</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Informações do Sistema */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            Como Funciona
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div className="space-y-2">
              <div className="font-medium text-blue-600">🕐 Horário</div>
              <p className="text-gray-600">
                Renovação automática todos os dias às 20:00 (Brasília)
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="font-medium text-green-600">📊 Pontuação</div>
              <p className="text-gray-600">
                Calcula performance do dia anterior e atualiza histórico
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="font-medium text-purple-600">🏆 Ligas</div>
              <p className="text-gray-600">
                Atualiza liga baseado na performance do mês atual
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="font-medium text-orange-600">🔥 Streak</div>
              <p className="text-gray-600">
                Mantém sequência de dias ativos e reseta se necessário
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}