// components/dashboard/EvolucaoTemporalMelhorada.tsx
'use client'

import { useState, useEffect } from 'react'
import { LineChart, Line, AreaChart, Area, ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
// Ícones como constantes
const IconesEvolucao = {
  TrendingUp: '📈',
  Calendar: '📅', 
  BarChart: '📊',
  Warning: '⚠️'
}
import type { DashboardFilters } from '@/components/dashboard/FiltrosPeriodo'

interface DadosEvolucao {
  periodo: string
  receita: number
  pedidos: number
  margem: number
  sla: number
  leadTime: number
}

interface EvolucaoTemporalMelhoradaProps {
  filters: DashboardFilters
}

type TipoPeriodo = 'dia' | 'semana' | 'mes' | 'ano'

export function EvolucaoTemporalMelhorada({ filters }: EvolucaoTemporalMelhoradaProps) {
  const [dadosEvolucao, setDadosEvolucao] = useState<DadosEvolucao[]>([])
  const [loading, setLoading] = useState(true)
  const [tipoPeriodo, setTipoPeriodo] = useState<TipoPeriodo>('mes')
  const [error, setError] = useState<string | null>(null)

  // Carregar dados quando mudam os filtros ou tipo de período
  useEffect(() => {
    carregarDadosEvolucao()
  }, [filters, tipoPeriodo])

  const carregarDadosEvolucao = async () => {
    try {
      setLoading(true)
      setError(null)

      // Construir parâmetros da API
      const params = new URLSearchParams({
        data_inicio: filters.dataInicio,
        data_fim: filters.dataFim,
        agrupamento: tipoPeriodo
      })

      if (filters.laboratorio) params.append('laboratorio_id', filters.laboratorio)
      if (filters.loja) params.append('loja_id', filters.loja)
      if (filters.classe) params.append('classe', filters.classe)

      const response = await fetch(`/api/dashboard/evolucao-temporal?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error('Erro ao carregar dados de evolução temporal')
      }

      const data = await response.json()
      setDadosEvolucao(data.evolucao || [])

    } catch (error) {
      console.error('Erro ao carregar evolução temporal:', error)
      setError('Erro ao carregar dados. Tente novamente.')
      setDadosEvolucao([])
    } finally {
      setLoading(false)
    }
  }

  const formatarPeriodo = (periodo: string) => {
    switch (tipoPeriodo) {
      case 'dia':
        return new Date(periodo).toLocaleDateString('pt-BR', { 
          day: '2-digit', 
          month: 'short' 
        })
      case 'semana':
        return `Sem ${periodo}`
      case 'mes':
        // Formato esperado: "2024-09" ou "2024-10"
        const [ano, mes] = periodo.split('-')
        const date = new Date(parseInt(ano), parseInt(mes) - 1, 1)
        return date.toLocaleDateString('pt-BR', { 
          month: 'short', 
          year: '2-digit' 
        }).replace('.', '')
      case 'ano':
        return periodo
      default:
        return periodo
    }
  }

  const dadosFormatados = dadosEvolucao.map(item => ({
    ...item,
    periodoFormatado: formatarPeriodo(item.periodo),
    receitaFormatada: `R$ ${(item.receita / 1000).toFixed(1)}k`
  }))

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-slate-200 rounded-lg shadow-lg">
          <p className="font-medium text-slate-800 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              <span className="font-medium">{entry.name}:</span>{' '}
              {entry.dataKey === 'receita' || entry.dataKey === 'margem' ? 
                formatCurrency(entry.value) : 
                entry.dataKey === 'sla' ? 
                `${entry.value.toFixed(1)}%` :
                entry.value}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-lg">{IconesEvolucao.TrendingUp}</span>
            Evolução Temporal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-slate-500">Carregando dados de evolução...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-lg">{IconesEvolucao.TrendingUp}</span>
            Evolução Temporal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-4">⚠️</div>
              <p className="text-slate-500">{error}</p>
              <Button 
                onClick={carregarDadosEvolucao} 
                variant="outline" 
                className="mt-4"
              >
                Tentar Novamente
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <span className="text-lg">{IconesEvolucao.TrendingUp}</span>
              Evolução Temporal
            </CardTitle>
            <CardDescription>
              Tendências de receita, pedidos e performance ao longo do tempo
            </CardDescription>
          </div>
          
          {/* Filtros de Período */}
          <div className="flex gap-2">
            {(['dia', 'semana', 'mes', 'ano'] as TipoPeriodo[]).map((tipo) => (
              <Button
                key={tipo}
                variant={tipoPeriodo === tipo ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTipoPeriodo(tipo)}
                className="capitalize"
              >
                {tipo}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {dadosFormatados.length > 0 ? (
          <>
            <ResponsiveContainer width="100%" height={500}>
              <ComposedChart data={dadosFormatados} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:stroke-gray-700" />
                <XAxis 
                  dataKey="periodoFormatado" 
                  stroke="#64748b"
                  fontSize={12}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  yAxisId="receita"
                  orientation="left"
                  stroke="#10b981"
                  fontSize={12}
                  tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                />
                <YAxis 
                  yAxisId="pedidos"
                  orientation="right"
                  stroke="#3b82f6"
                  fontSize={12}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                
                {/* Barras de Receita */}
                <Bar 
                  yAxisId="receita"
                  dataKey="receita" 
                  fill="#10b981" 
                  fillOpacity={0.8}
                  name="Receita"
                  radius={[2, 2, 0, 0]}
                />
                
                {/* Linha de Pedidos */}
                <Line 
                  yAxisId="pedidos"
                  type="monotone" 
                  dataKey="pedidos" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  name="Pedidos"
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                />
                
                {/* Linha de Margem */}
                <Line 
                  yAxisId="receita"
                  type="monotone" 
                  dataKey="margem" 
                  stroke="#f59e0b" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Margem"
                  dot={{ fill: '#f59e0b', strokeWidth: 2, r: 3 }}
                />

                {/* Linha de SLA */}
                <Line 
                  yAxisId="pedidos"
                  type="monotone" 
                  dataKey="sla" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  strokeDasharray="3 3"
                  name="SLA (%)"
                  dot={{ fill: '#ef4444', strokeWidth: 2, r: 3 }}
                />
              </ComposedChart>
            </ResponsiveContainer>

            {/* Resumo Estatístico */}
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-200">
              <div className="text-center">
                <p className="text-sm text-slate-600">Receita Total</p>
                <p className="text-lg font-semibold text-emerald-600">
                  {formatCurrency(dadosEvolucao.reduce((sum, item) => sum + item.receita, 0))}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-slate-600">Total Pedidos</p>
                <p className="text-lg font-semibold text-blue-600">
                  {dadosEvolucao.reduce((sum, item) => sum + item.pedidos, 0)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-slate-600">Margem Média</p>
                <p className="text-lg font-semibold text-amber-600">
                  {dadosEvolucao.length > 0 ? 
                    formatCurrency(dadosEvolucao.reduce((sum, item) => sum + item.margem, 0) / dadosEvolucao.length) : 
                    'R$ 0,00'}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-slate-600">SLA Médio</p>
                <p className="text-lg font-semibold text-purple-600">
                  {dadosEvolucao.length > 0 ? 
                    `${(dadosEvolucao.reduce((sum, item) => sum + item.sla, 0) / dadosEvolucao.length).toFixed(1)}%` : 
                    '0%'}
                </p>
              </div>
            </div>
          </>
        ) : (
          <div className="h-[400px] flex items-center justify-center">
            <div className="text-center">
              <span className="text-lg">{IconesEvolucao.BarChart}</span>
              <p className="text-slate-500">Nenhum dado disponível para o período selecionado</p>
              <p className="text-sm text-slate-400 mt-2">
                Tente ajustar os filtros ou selecionar um período diferente
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}