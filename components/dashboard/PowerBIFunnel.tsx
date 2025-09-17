'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts'
import { Filter, Target, TrendingDown } from 'lucide-react'
import { useRankingLaboratorios } from '@/lib/hooks/useDashboardBI'
import type { DashboardFilters } from '@/components/dashboard/FiltrosPeriodo'

interface PowerBIFunnelProps {
  filters?: DashboardFilters
}

export function PowerBIFunnel({ filters }: PowerBIFunnelProps) {
  const { data: laboratorios = [] } = useRankingLaboratorios()

  // Simular dados de funil de conversão baseados nos dados disponíveis
  const funnelData = generateFunnelData(laboratorios)

  function generateFunnelData(data: any[]) {
    if (!data.length) return []

    const totalPedidos = data.reduce((sum, item) => sum + (item.pedidos || 0), 0)
    
    return [
      {
        name: 'Leads Gerados',
        value: Math.round(totalPedidos * 3.2),
        percentage: 100,
        color: '#3B82F6',
        icon: '👥'
      },
      {
        name: 'Leads Qualificados',
        value: Math.round(totalPedidos * 2.1),
        percentage: 65.6,
        color: '#10B981',
        icon: '✅'
      },
      {
        name: 'Propostas Enviadas',
        value: Math.round(totalPedidos * 1.4),
        percentage: 43.8,
        color: '#F59E0B',
        icon: '📄'
      },
      {
        name: 'Negociações',
        value: Math.round(totalPedidos * 1.1),
        percentage: 34.4,
        color: '#EF4444',
        icon: '🤝'
      },
      {
        name: 'Pedidos Fechados',
        value: totalPedidos,
        percentage: 31.3,
        color: '#8B5CF6',
        icon: '🎉'
      }
    ]
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 flex items-center gap-2">
            <span>{data.icon}</span>
            {data.name}
          </p>
          <p className="text-sm text-blue-600">
            Quantidade: {data.value.toLocaleString()}
          </p>
          <p className="text-sm text-gray-600">
            Taxa de Conversão: {data.percentage.toFixed(1)}%
          </p>
        </div>
      )
    }
    return null
  }

  // Calcular taxas de conversão entre etapas
  const conversionRates = funnelData.map((item, index) => {
    if (index === 0) return null
    const previousValue = funnelData[index - 1].value
    const currentValue = item.value
    return ((currentValue / previousValue) * 100).toFixed(1)
  }).filter(Boolean)

  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-blue-600" />
          Funil de Conversão de Vendas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ width: '100%', height: 350 }}>
          <ResponsiveContainer>
            <BarChart 
              data={funnelData} 
              layout="horizontal"
              margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                type="number"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => value.toLocaleString()}
              />
              <YAxis 
                type="category"
                dataKey="name"
                tick={{ fontSize: 12 }}
                width={120}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {funnelData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Métricas de Conversão */}
        <div className="grid grid-cols-4 gap-4 mt-4">
          {conversionRates.map((rate, index) => (
            <div key={index} className="p-3 bg-gray-50 rounded-lg text-center">
              <div className="flex items-center justify-center gap-1 text-gray-600 mb-1">
                <TrendingDown className="w-4 h-4" />
                <span className="text-xs font-medium">
                  {funnelData[index].name} → {funnelData[index + 1].name}
                </span>
              </div>
              <p className="text-lg font-bold text-gray-800">{rate}%</p>
              <p className="text-xs text-gray-500">Taxa de Conversão</p>
            </div>
          ))}
        </div>

        {/* Insights e Recomendações */}
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-5 h-5 text-blue-600" />
            <h4 className="font-semibold text-blue-800">Insights do Funil</h4>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-blue-700 font-medium">🎯 Maior Oportunidade:</p>
              <p className="text-blue-600">
                {conversionRates[0] && parseFloat(conversionRates[0]) < 60 
                  ? "Qualificação de Leads (65.6%)" 
                  : "Fechamento de Negociações"}
              </p>
            </div>
            <div>
              <p className="text-blue-700 font-medium">📈 Taxa Geral:</p>
              <p className="text-blue-600">
                {funnelData[funnelData.length - 1]?.percentage.toFixed(1)}% do lead ao fechamento
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}