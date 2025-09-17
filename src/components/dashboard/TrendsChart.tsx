// ================================================================
// src/components/dashboard/TrendsChart.tsx
// ================================================================

'use client'

import { LineChart, Line, AreaChart, Area, ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import type { EvolucaoMensal } from '@/lib/types/dashboard-bi'

interface TrendsChartProps {
  data: EvolucaoMensal[]
  title?: string
  description?: string
  type?: 'line' | 'area' | 'composed'
  showSLA?: boolean
  height?: number
  period?: 'month' | 'quarter' | 'year'
}

export function TrendsChart({ 
  data, 
  title = "Evolução", 
  description,
  type = 'line',
  showSLA = false,
  height = 300,
  period = 'month'
}: TrendsChartProps) {

  const formatData = data.map(item => ({
    periodo: item.ano_mes,
    pedidos: item.total_pedidos,
    entregues: item.entregues,
    sla: item.sla_compliance,
    leadTime: item.lead_time_medio,
    faturamento: item.faturamento_total / 1000 // Em milhares
  }))

  const formatPeriod = (periodo: string) => {
    const [ano, mes] = periodo.split('-')
    const monthNames = [
      'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
      'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
    ]
    return `${monthNames[parseInt(mes) - 1]}/${ano.slice(2)}`
  }

  if (type === 'composed') {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={formatData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="periodo" tickFormatter={formatPeriod} />
          <YAxis yAxisId="left" />
          <YAxis yAxisId="right" orientation="right" />
          <Tooltip 
            labelFormatter={(value) => `Período: ${formatPeriod(value as string)}`}
            formatter={(value, name) => {
              if (name === 'SLA') return [`${Number(value).toFixed(1)}%`, 'SLA Compliance']
              if (name === 'Lead Time') return [`${Number(value).toFixed(1)}d`, 'Lead Time']
              return [Number(value).toLocaleString('pt-BR'), name]
            }}
          />
          <Legend />
          <Bar yAxisId="left" dataKey="pedidos" fill="#3B82F6" name="Pedidos" />
          {showSLA && <Line yAxisId="right" type="monotone" dataKey="sla" stroke="#10B981" strokeWidth={2} name="SLA" />}
          <Line yAxisId="right" type="monotone" dataKey="leadTime" stroke="#F59E0B" strokeWidth={2} name="Lead Time" />
        </ComposedChart>
      </ResponsiveContainer>
    )
  }

  if (type === 'area') {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={formatData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="periodo" tickFormatter={formatPeriod} />
          <YAxis />
          <Tooltip 
            labelFormatter={(value) => `Período: ${formatPeriod(value as string)}`}
            formatter={(value, name) => [Number(value).toLocaleString('pt-BR'), name]}
          />
          <Legend />
          <Area type="monotone" dataKey="pedidos" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} name="Pedidos" />
          <Area type="monotone" dataKey="entregues" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.6} name="Entregues" />
        </AreaChart>
      </ResponsiveContainer>
    )
  }

  // Line Chart (default)
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={formatData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="periodo" tickFormatter={formatPeriod} />
        <YAxis />
        <Tooltip 
          labelFormatter={(value) => `Período: ${formatPeriod(value as string)}`}
          formatter={(value, name) => {
            if (name === 'SLA') return [`${Number(value).toFixed(1)}%`, 'SLA Compliance']
            if (name === 'Lead Time') return [`${Number(value).toFixed(1)}d`, 'Lead Time Médio']
            return [Number(value).toLocaleString('pt-BR'), name]
          }}
        />
        <Legend />
        <Line type="monotone" dataKey="pedidos" stroke="#3B82F6" strokeWidth={2} name="Total Pedidos" />
        <Line type="monotone" dataKey="entregues" stroke="#10B981" strokeWidth={2} name="Entregues" />
        {showSLA && <Line type="monotone" dataKey="sla" stroke="#F59E0B" strokeWidth={2} name="SLA" />}
      </LineChart>
    </ResponsiveContainer>
  )
}