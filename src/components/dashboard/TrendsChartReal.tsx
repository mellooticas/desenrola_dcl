// components/dashboard/TrendsChartReal.tsx
'use client'

import { LineChart, Line, AreaChart, Area, ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface TendenciaData {
  periodo: string
  receita: number
  custos: number
  margem: number
  pedidos: number
}

interface TrendsChartRealProps {
  data?: TendenciaData[]
  evolucaoTemporal?: TendenciaData[]
  title?: string
  description?: string
  type?: 'line' | 'area' | 'composed'
  showSLA?: boolean
  height?: number
}

export function TrendsChartReal({ 
  data,
  evolucaoTemporal, 
  title = "Evolução Temporal", 
  description,
  type = 'composed',
  showSLA = false,
  height = 300
}: TrendsChartRealProps) {

  // Usar evolucaoTemporal se data não estiver disponível
  const chartData = data || evolucaoTemporal

  // Validação de dados antes do processamento
  if (!chartData || !Array.isArray(chartData) || chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>📈</span> {title}
          </CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-slate-500">
            📊 Carregando dados de evolução...
          </div>
        </CardContent>
      </Card>
    )
  }

  const formatPeriod = (periodo: string) => {
    try {
      // Formato esperado: "2024-09" ou "2024-10"
      const [ano, mes] = periodo.split('-')
      const date = new Date(parseInt(ano), parseInt(mes) - 1, 1)
      
      return date.toLocaleDateString('pt-BR', { 
        month: 'short',
        year: '2-digit'
      }).replace('.', '')
    } catch {
      return periodo // Fallback: retorna o período original
    }
  }

  const formatData = chartData.map(item => ({
    periodo: formatPeriod(item.periodo),
    receita: item.receita,
    pedidos: item.pedidos,
    margem: item.margem,
    receitaFormatted: `R$ ${(item.receita / 1000).toFixed(1)}k`
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
        <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-lg">
          <p className="font-medium text-slate-800 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              <span className="font-medium">{entry.dataKey}:</span>{' '}
              {entry.dataKey === 'receita' || entry.dataKey === 'margem' ? 
                formatCurrency(entry.value) : 
                entry.value}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <p className="text-sm text-slate-600">{description}</p>}
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-4">📊</div>
              <p className="text-slate-500">Nenhum dado de evolução temporal disponível</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>📈</span> {title}
        </CardTitle>
        {description && <p className="text-sm text-slate-600">{description}</p>}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <ComposedChart data={formatData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis 
              dataKey="periodo" 
              stroke="#64748b"
              fontSize={12}
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
            
            <Bar 
              yAxisId="receita"
              dataKey="receita" 
              fill="#10b981" 
              fillOpacity={0.8}
              name="Receita"
              radius={[2, 2, 0, 0]}
            />
            <Line 
              yAxisId="pedidos"
              type="monotone" 
              dataKey="pedidos" 
              stroke="#3b82f6" 
              strokeWidth={3}
              name="Pedidos"
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
            />
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
          </ComposedChart>
        </ResponsiveContainer>

        {/* Resumo dos dados */}
        <div className="mt-4 grid grid-cols-3 gap-4 pt-4 border-t border-slate-200">
          <div className="text-center">
            <p className="text-sm text-slate-600">Receita Total</p>
            <p className="text-lg font-semibold text-emerald-600">
              {formatCurrency(data.reduce((sum, item) => sum + item.receita, 0))}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-slate-600">Total Pedidos</p>
            <p className="text-lg font-semibold text-blue-600">
              {data.reduce((sum, item) => sum + item.pedidos, 0)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-slate-600">Margem Total</p>
            <p className="text-lg font-semibold text-amber-600">
              {formatCurrency(data.reduce((sum, item) => sum + item.margem, 0))}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}