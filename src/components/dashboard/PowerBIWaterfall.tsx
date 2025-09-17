'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { DollarSign, TrendingUp } from 'lucide-react'
import { useAnaliseFinanceira } from '@/lib/hooks/useDashboardBI'
import type { DashboardFilters } from '@/components/dashboard/FiltrosPeriodo'

interface PowerBIWaterfallProps {
  filters?: DashboardFilters
}

export function PowerBIWaterfall({ filters }: PowerBIWaterfallProps) {
  const { data: financeiro = [] } = useAnaliseFinanceira()

  // Simular dados de waterfall baseados nos dados disponíveis
  const waterfallData = generateWaterfallData(financeiro)

  function generateWaterfallData(data: any[]) {
    if (!data.length) return []

    const currentMonth = data[data.length - 1]
    const previousMonth = data[data.length - 2] || currentMonth

    const base = previousMonth?.valor_total || 100000
    const current = currentMonth?.valor_total || base

    return [
      {
        name: 'Base Anterior',
        value: base,
        cumulative: base,
        type: 'base',
        color: '#6B7280'
      },
      {
        name: 'Novos Pedidos',
        value: Math.max(0, current - base) * 0.6,
        cumulative: base + (Math.max(0, current - base) * 0.6),
        type: 'positive',
        color: '#10B981'
      },
      {
        name: 'Upselling',
        value: Math.max(0, current - base) * 0.3,
        cumulative: base + (Math.max(0, current - base) * 0.9),
        type: 'positive',
        color: '#059669'
      },
      {
        name: 'Cancelamentos',
        value: Math.min(0, current - base) * 0.5,
        cumulative: base + (Math.max(0, current - base) * 0.9) + (Math.min(0, current - base) * 0.5),
        type: 'negative',
        color: '#EF4444'
      },
      {
        name: 'Total Atual',
        value: current,
        cumulative: current,
        type: 'total',
        color: '#3B82F6'
      }
    ]
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{label}</p>
          <p className="text-sm text-blue-600">
            Valor: R$ {(Math.abs(data.value) / 1000).toFixed(0)}k
          </p>
          <p className="text-sm text-gray-600">
            Acumulado: R$ {(data.cumulative / 1000).toFixed(0)}k
          </p>
        </div>
      )
    }
    return null
  }

  const formatYAxis = (value: number) => {
    return `R$ ${(value / 1000).toFixed(0)}k`
  }

  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-green-600" />
          Waterfall: Análise de Receita
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <BarChart data={waterfallData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }}
                interval={0}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickFormatter={formatYAxis}
                label={{ value: 'Receita', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {waterfallData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Insights */}
        <div className="grid grid-cols-3 gap-4 mt-4 text-center">
          <div className="p-3 bg-green-50 rounded-lg">
            <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium">Crescimento</span>
            </div>
            <p className="text-lg font-bold text-green-700">
              +{((waterfallData[1]?.value || 0) / 1000).toFixed(0)}k
            </p>
            <p className="text-xs text-green-600">Novos Pedidos</p>
          </div>

          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
              <DollarSign className="w-4 h-4" />
              <span className="text-sm font-medium">Upselling</span>
            </div>
            <p className="text-lg font-bold text-blue-700">
              +{((waterfallData[2]?.value || 0) / 1000).toFixed(0)}k
            </p>
            <p className="text-xs text-blue-600">Valor Adicional</p>
          </div>

          <div className="p-3 bg-red-50 rounded-lg">
            <div className="flex items-center justify-center gap-1 text-red-600 mb-1">
              <span className="text-sm font-medium">Perdas</span>
            </div>
            <p className="text-lg font-bold text-red-700">
              {((waterfallData[3]?.value || 0) / 1000).toFixed(0)}k
            </p>
            <p className="text-xs text-red-600">Cancelamentos</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}