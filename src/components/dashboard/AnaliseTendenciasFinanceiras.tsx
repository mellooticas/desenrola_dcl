// components/dashboard/AnaliseTendenciasFinanceiras.tsx
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface DadosTendencia {
  periodo: string
  receita: number
  custos: number
  margem: number
  pedidos: number
  ticket_medio: number
  margem_percentual: number
  variacao_receita?: number
  variacao_margem?: number
}

interface AnaliseTendenciasFinanceirasProps {
  agrupamento: 'day' | 'week' | 'month'
  periodo: number
  filtros?: {
    laboratorio_id?: string
    loja_id?: string
    classe?: string
  }
}

const IconesTendencias = {
  TrendUp: '📈',
  TrendDown: '📉',
  TrendNeutral: '➡️',
  Target: '🎯',
  Warning: '⚠️'
}

export function AnaliseTendenciasFinanceiras({ 
  agrupamento, 
  periodo,
  filtros = {}
}: AnaliseTendenciasFinanceirasProps) {
  const [dadosTendencia, setDadosTendencia] = useState<DadosTendencia[]>([])
  const [loading, setLoading] = useState(true)
  const [metricas, setMetricas] = useState<{
    tendencia_receita: 'crescimento' | 'declinio' | 'estavel'
    crescimento_medio: number
    melhor_periodo: string
    pior_periodo: string
    volatilidade: number
  } | null>(null)

  useEffect(() => {
    carregarDadosTendencia()
  }, [agrupamento, periodo, filtros])

  const carregarDadosTendencia = async () => {
    try {
      setLoading(true)

      const params = new URLSearchParams({
        periodo: periodo.toString(),
        agrupamento
      })

      if (filtros.laboratorio_id) params.append('laboratorio_id', filtros.laboratorio_id)
      if (filtros.loja_id) params.append('loja_id', filtros.loja_id)
      if (filtros.classe) params.append('classe', filtros.classe)

      const response = await fetch(`/api/dashboard/evolucao-financeira?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error('Erro ao carregar dados de tendência')
      }

      const dados: DadosTendencia[] = await response.json()
      
      // Calcular variações período a período
      const dadosComVariacao = dados.map((item, index) => {
        const itemAnterior = dados[index - 1]
        
        return {
          ...item,
          variacao_receita: itemAnterior 
            ? ((item.receita - itemAnterior.receita) / (itemAnterior.receita || 1)) * 100
            : 0,
          variacao_margem: itemAnterior 
            ? ((item.margem - itemAnterior.margem) / (itemAnterior.margem || 1)) * 100
            : 0,
          periodoFormatado: formatarPeriodo(item.periodo, agrupamento)
        }
      })

      setDadosTendencia(dadosComVariacao)

      // Calcular métricas de tendência
      calcularMetricasTendencia(dadosComVariacao)

    } catch (error) {
      console.error('Erro ao carregar tendências:', error)
      setDadosTendencia([])
      setMetricas(null)
    } finally {
      setLoading(false)
    }
  }

  const formatarPeriodo = (periodo: string, agrupamento: string) => {
    const data = new Date(periodo)
    
    switch (agrupamento) {
      case 'day':
        return data.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
      case 'week':
        return `Sem ${Math.ceil(data.getDate() / 7)}/${String(data.getMonth() + 1).padStart(2, '0')}`
      case 'month':
        return data.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
      default:
        return periodo
    }
  }

  const calcularMetricasTendencia = (dados: DadosTendencia[]) => {
    if (dados.length < 2) {
      setMetricas(null)
      return
    }

    // Calcular crescimento médio
    const variacoesReceita = dados
      .filter(d => d.variacao_receita !== undefined && !isNaN(d.variacao_receita!))
      .map(d => d.variacao_receita!)

    const crescimentoMedio = variacoesReceita.length > 0 
      ? variacoesReceita.reduce((acc, val) => acc + val, 0) / variacoesReceita.length
      : 0

    // Determinar tendência geral
    let tendencia: 'crescimento' | 'declinio' | 'estavel' = 'estavel'
    if (crescimentoMedio > 2) tendencia = 'crescimento'
    else if (crescimentoMedio < -2) tendencia = 'declinio'

    // Encontrar melhor e pior períodos
    const dadosOrdenados = [...dados].sort((a, b) => b.receita - a.receita)
    const melhorPeriodo = dadosOrdenados[0]?.periodo || ''
    const piorPeriodo = dadosOrdenados[dadosOrdenados.length - 1]?.periodo || ''

    // Calcular volatilidade (desvio padrão das variações)
    const media = crescimentoMedio
    const variancia = variacoesReceita.length > 0
      ? variacoesReceita.reduce((acc, val) => acc + Math.pow(val - media, 2), 0) / variacoesReceita.length
      : 0
    const volatilidade = Math.sqrt(variancia)

    setMetricas({
      tendencia_receita: tendencia,
      crescimento_medio: crescimentoMedio,
      melhor_periodo: formatarPeriodo(melhorPeriodo, agrupamento),
      pior_periodo: formatarPeriodo(piorPeriodo, agrupamento),
      volatilidade
    })
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  const getTendenciaIcon = (tendencia: string) => {
    switch (tendencia) {
      case 'crescimento': return IconesTendencias.TrendUp
      case 'declinio': return IconesTendencias.TrendDown
      default: return IconesTendencias.TrendNeutral
    }
  }

  const getTendenciaColor = (tendencia: string) => {
    switch (tendencia) {
      case 'crescimento': return 'text-green-600 bg-green-50 border-green-200'
      case 'declinio': return 'text-red-600 bg-red-50 border-red-200'
      default: return 'text-blue-600 bg-blue-50 border-blue-200'
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="h-80 bg-gray-100 animate-pulse rounded"></div>
        </CardContent>
      </Card>
    )
  }

  if (dadosTendencia.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>📊 Análise de Tendências</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-4xl mb-4">📈</div>
            <p className="text-slate-500">Dados insuficientes para análise de tendências</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      
      {/* Métricas de Tendência */}
      {metricas && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <Card className={`${getTendenciaColor(metricas.tendencia_receita)}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Tendência Geral</p>
                  <p className="text-lg font-bold capitalize">
                    {metricas.tendencia_receita}
                  </p>
                </div>
                <span className="text-2xl">
                  {getTendenciaIcon(metricas.tendencia_receita)}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Crescimento Médio</p>
                  <p className="text-lg font-bold">
                    {metricas.crescimento_medio.toFixed(1)}%
                  </p>
                </div>
                <span className="text-xl">📊</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Melhor Período</p>
                  <p className="text-lg font-bold text-green-600">
                    {metricas.melhor_periodo}
                  </p>
                </div>
                <span className="text-xl">{IconesTendencias.Target}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Volatilidade</p>
                  <p className="text-lg font-bold">
                    {metricas.volatilidade.toFixed(1)}%
                  </p>
                  <Badge 
                    variant={metricas.volatilidade > 10 ? 'destructive' : 'secondary'}
                    className="text-xs mt-1"
                  >
                    {metricas.volatilidade > 10 ? 'Alta' : 'Baixa'}
                  </Badge>
                </div>
                <span className="text-xl">
                  {metricas.volatilidade > 10 ? IconesTendencias.Warning : '✅'}
                </span>
              </div>
            </CardContent>
          </Card>

        </div>
      )}

      {/* Gráfico de Tendências */}
      <Card>
        <CardHeader>
          <CardTitle>📈 Evolução de Receita e Margem</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={dadosTendencia}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis 
                dataKey="periodoFormatado" 
                stroke="#64748b"
                fontSize={12}
              />
              <YAxis 
                yAxisId="valor"
                orientation="left"
                stroke="#10b981"
                fontSize={12}
                tickFormatter={(value) => formatCurrency(value)}
              />
              <YAxis 
                yAxisId="percent"
                orientation="right"
                stroke="#f59e0b"
                fontSize={12}
                tickFormatter={(value) => `${value.toFixed(0)}%`}
              />
              <Tooltip 
                formatter={(value, name) => {
                  if (name === 'margem_percentual') return [`${Number(value).toFixed(1)}%`, 'Margem %']
                  return [formatCurrency(Number(value)), name]
                }}
              />
              <Legend />
              
              <Area 
                yAxisId="valor"
                type="monotone"
                dataKey="receita"
                stackId="1"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.6}
                name="Receita"
              />
              <Area 
                yAxisId="valor"
                type="monotone"
                dataKey="custos"
                stackId="2"
                stroke="#ef4444"
                fill="#ef4444"
                fillOpacity={0.6}
                name="Custos"
              />
              <Line 
                yAxisId="percent"
                type="monotone"
                dataKey="margem_percentual"
                stroke="#f59e0b"
                strokeWidth={3}
                name="Margem %"
                dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

    </div>
  )
}