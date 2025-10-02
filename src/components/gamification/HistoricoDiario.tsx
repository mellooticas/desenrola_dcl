// src/components/gamification/HistoricoDiario.tsx
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Target,
  Star,
  Trophy,
  Flame,
  BarChart3
} from 'lucide-react'
import { PontuacaoDiaria, LigaTipo, LIGAS_CONFIG } from '@/lib/types/database'

interface HistoricoDiarioProps {
  lojaId: string
  historico: PontuacaoDiaria[]
  loading?: boolean
}

export function HistoricoDiario({ lojaId, historico, loading = false }: HistoricoDiarioProps) {
  const [periodo, setPeriodo] = useState<'7d' | '30d' | '90d'>('30d')
  
  // Filtrar dados baseado no período
  const historicoFiltrado = filtrarPorPeriodo(historico, periodo)
  
  // Calcular estatísticas
  const stats = calcularEstatisticas(historicoFiltrado)

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header com filtros */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Histórico de Performance
            </CardTitle>
            
            <div className="flex gap-2">
              {(['7d', '30d', '90d'] as const).map((p) => (
                <Button
                  key={p}
                  variant={periodo === p ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPeriodo(p)}
                >
                  {p === '7d' ? '7 dias' : p === '30d' ? '30 dias' : '90 dias'}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Estatísticas resumidas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {stats.percentualMedio.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Eficiência Média</div>
            </div>
            
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {stats.melhorDia?.percentual_eficiencia.toFixed(1) || 0}%
              </div>
              <div className="text-sm text-gray-600">Melhor Dia</div>
            </div>
            
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {stats.streakAtual}
              </div>
              <div className="text-sm text-gray-600">Sequência Atual</div>
            </div>
            
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {stats.diasAtivos}
              </div>
              <div className="text-sm text-gray-600">Dias Ativos</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de histórico */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Detalhamento Diário
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Data</th>
                  <th className="text-left p-3">Liga</th>
                  <th className="text-center p-3">Missões</th>
                  <th className="text-center p-3">Pontos</th>
                  <th className="text-center p-3">Eficiência</th>
                  <th className="text-center p-3">Status</th>
                  <th className="text-center p-3">Streak</th>
                </tr>
              </thead>
              <tbody>
                {historicoFiltrado.map((dia, index) => {
                  const tendencia = getTendencia(historicoFiltrado, index)
                  
                  return (
                    <motion.tr
                      key={dia.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b hover:bg-gray-50"
                    >
                      {/* Data */}
                      <td className="p-3">
                        <div className="font-medium">
                          {formatarData(dia.data)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {getDiaSemana(dia.data)}
                        </div>
                      </td>
                      
                      {/* Liga */}
                      <td className="p-3">
                        <div className="flex items-center gap-1">
                          <span>{LIGAS_CONFIG[dia.liga_no_dia].icone}</span>
                          <span 
                            className="text-xs font-medium"
                            style={{ color: LIGAS_CONFIG[dia.liga_no_dia].cor }}
                          >
                            {dia.liga_no_dia}
                          </span>
                        </div>
                      </td>
                      
                      {/* Missões */}
                      <td className="p-3 text-center">
                        <div className="font-medium">
                          {dia.missoes_completadas}/{dia.missoes_totais}
                        </div>
                        <div className="text-xs text-gray-500">
                          {((dia.missoes_completadas / dia.missoes_totais) * 100).toFixed(0)}%
                        </div>
                      </td>
                      
                      {/* Pontos */}
                      <td className="p-3 text-center">
                        <div className="font-medium">
                          {dia.pontos_conquistados.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          /{dia.pontos_possiveis.toLocaleString()}
                        </div>
                      </td>
                      
                      {/* Eficiência */}
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <span className="font-medium">
                            {dia.percentual_eficiencia.toFixed(1)}%
                          </span>
                          {tendencia === 'up' && <TrendingUp className="h-3 w-3 text-green-500" />}
                          {tendencia === 'down' && <TrendingDown className="h-3 w-3 text-red-500" />}
                          {tendencia === 'stable' && <Minus className="h-3 w-3 text-gray-400" />}
                        </div>
                      </td>
                      
                      {/* Status */}
                      <td className="p-3 text-center">
                        <Badge variant={getStatusVariant(dia.percentual_eficiencia)}>
                          {getStatusText(dia.percentual_eficiencia)}
                        </Badge>
                      </td>
                      
                      {/* Streak */}
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {dia.streak_dias > 0 && <Flame className="h-3 w-3 text-orange-500" />}
                          <span className="font-medium">{dia.streak_dias}</span>
                        </div>
                      </td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          
          {historicoFiltrado.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Target className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>Nenhum dado encontrado para o período selecionado</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Funções auxiliares
function filtrarPorPeriodo(historico: PontuacaoDiaria[], periodo: '7d' | '30d' | '90d'): PontuacaoDiaria[] {
  const dias = periodo === '7d' ? 7 : periodo === '30d' ? 30 : 90
  const dataLimite = new Date()
  dataLimite.setDate(dataLimite.getDate() - dias)
  
  return historico
    .filter(item => new Date(item.data) >= dataLimite)
    .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
}

function calcularEstatisticas(historico: PontuacaoDiaria[]) {
  if (historico.length === 0) {
    return {
      percentualMedio: 0,
      melhorDia: null,
      streakAtual: 0,
      diasAtivos: 0
    }
  }
  
  const percentualMedio = historico.reduce((sum, dia) => sum + dia.percentual_eficiencia, 0) / historico.length
  const melhorDia = historico.reduce((melhor, atual) => 
    atual.percentual_eficiencia > melhor.percentual_eficiencia ? atual : melhor
  )
  
  // Calcular streak atual (do mais recente para trás)
  let streakAtual = 0
  for (const dia of historico) {
    if (dia.missoes_completadas > 0) {
      streakAtual++
    } else {
      break
    }
  }
  
  const diasAtivos = historico.filter(dia => dia.missoes_completadas > 0).length
  
  return {
    percentualMedio,
    melhorDia,
    streakAtual,
    diasAtivos
  }
}

function getTendencia(historico: PontuacaoDiaria[], index: number): 'up' | 'down' | 'stable' {
  if (index >= historico.length - 1) return 'stable'
  
  const atual = historico[index].percentual_eficiencia
  const anterior = historico[index + 1].percentual_eficiencia
  
  if (atual > anterior + 5) return 'up'
  if (atual < anterior - 5) return 'down'
  return 'stable'
}

function getStatusVariant(percentual: number): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (percentual >= 90) return 'default' // Verde
  if (percentual >= 70) return 'secondary' // Azul
  if (percentual >= 50) return 'outline' // Cinza
  return 'destructive' // Vermelho
}

function getStatusText(percentual: number): string {
  if (percentual >= 90) return 'Excelente'
  if (percentual >= 70) return 'Bom'
  if (percentual >= 50) return 'Regular'
  return 'Baixo'
}

function formatarData(data: string): string {
  return new Date(data).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit'
  })
}

function getDiaSemana(data: string): string {
  return new Date(data).toLocaleDateString('pt-BR', {
    weekday: 'short'
  })
}