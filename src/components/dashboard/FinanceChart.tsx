
// ================================================================
// src/components/dashboard/FinanceChart.tsx
// ================================================================

'use client'

import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import type { AnaliseFinanceira } from '@/lib/types/dashboard-bi'

interface FinanceChartProps {
  data: AnaliseFinanceira[]
  type?: 'bar' | 'pie'
  metric?: 'faturamento' | 'volume' | 'ticket_medio'
  height?: number
  showLegend?: boolean
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4']

export function FinanceChart({ 
  data, 
  type = 'bar', 
  metric = 'faturamento', 
  height = 300,
  showLegend = true 
}: FinanceChartProps) {
  
  const getMetricValue = (item: AnaliseFinanceira) => {
    switch (metric) {
      case 'volume': return item.volume_pedidos
      case 'ticket_medio': return item.ticket_medio
      default: return item.faturamento_total
    }
  }

  const getMetricLabel = () => {
    switch (metric) {
      case 'volume': return 'Volume de Pedidos'
      case 'ticket_medio': return 'Ticket Médio (R$)'
      default: return 'Faturamento (R$)'
    }
  }

  const formatValue = (value: number) => {
    if (metric === 'ticket_medio' || metric === 'faturamento') {
      return `R$ ${value.toLocaleString('pt-BR')}`
    }
    return value.toString()
  }

  if (type === 'pie') {
    const pieData = data.map((item, index) => ({
      name: item.categoria,
      value: getMetricValue(item),
      color: COLORS[index % COLORS.length]
    }))

    return (
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {pieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [formatValue(Number(value)), getMetricLabel()]} />
          {showLegend && <Legend />}
        </PieChart>
      </ResponsiveContainer>
    )
  }

  // Bar Chart
  const barData = data.map(item => ({
    categoria: item.categoria,
    value: getMetricValue(item),
    sla: item.sla_compliance
  }))

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="categoria" 
          angle={-45}
          textAnchor="end"
          height={60}
        />
        <YAxis tickFormatter={(value) => formatValue(value)} />
        <Tooltip 
          formatter={(value) => [formatValue(Number(value)), getMetricLabel()]}
          labelStyle={{ color: '#000' }}
        />
        {showLegend && <Legend />}
        <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}