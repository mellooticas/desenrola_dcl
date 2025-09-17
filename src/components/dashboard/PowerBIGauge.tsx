'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { Target, TrendingUp, TrendingDown } from 'lucide-react'
import { useDashboardKPIs } from '@/lib/hooks/useDashboardBI'
import type { DashboardFilters } from '@/components/dashboard/FiltrosPeriodo'

interface PowerBIGaugeProps {
  filters?: DashboardFilters
}

export function PowerBIGauge({ filters }: PowerBIGaugeProps) {
  const { data: kpis } = useDashboardKPIs()

  if (!kpis) return null

  const gaugeData = [
    {
      name: 'SLA Compliance',
      value: kpis.sla_compliance || 0,
      target: 95,
      color: getSLAColor(kpis.sla_compliance || 0),
      icon: Target,
  trend: kpis.variacao_sla || 0
    },
    {
      name: 'Lead Time',
      value: kpis.lead_time_medio || 0,
      target: 5,
      color: getLeadTimeColor(kpis.lead_time_medio || 0),
      icon: Target,
  trend: kpis.variacao_lead_time || 0,
      isReverse: true // Para lead time, menor é melhor
    }
  ]

  function getSLAColor(value: number): string {
    if (value >= 95) return '#10B981'
    if (value >= 90) return '#F59E0B'
    if (value >= 80) return '#EF4444'
    return '#6B7280'
  }

  function getLeadTimeColor(value: number): string {
    if (value <= 3) return '#10B981'
    if (value <= 5) return '#F59E0B'
    if (value <= 7) return '#EF4444'
    return '#6B7280'
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      {gaugeData.map((gauge, index) => (
        <GaugeCard key={index} gauge={gauge} />
      ))}
    </div>
  )
}

function GaugeCard({ gauge }: { gauge: any }) {
  const percentage = gauge.isReverse 
    ? Math.max(0, (gauge.target - gauge.value) / gauge.target * 100)
    : (gauge.value / gauge.target) * 100

  const clampedPercentage = Math.min(100, Math.max(0, percentage))
  
  // Dados para o gráfico de rosca
  const pieData = [
    { value: clampedPercentage, fill: gauge.color },
    { value: 100 - clampedPercentage, fill: '#E5E7EB' }
  ]

  const TrendIcon = gauge.trend > 0 ? TrendingUp : TrendingDown
  const trendColor = gauge.isReverse 
    ? (gauge.trend > 0 ? 'text-red-500' : 'text-green-500')
    : (gauge.trend > 0 ? 'text-green-500' : 'text-red-500')

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          <gauge.icon className="w-4 h-4" />
          {gauge.name}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Gauge Chart */}
          <div style={{ width: '100%', height: 120 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  startAngle={180}
                  endAngle={0}
                  innerRadius={30}
                  outerRadius={50}
                  paddingAngle={0}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Valor Central */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold" style={{ color: gauge.color }}>
              {gauge.isReverse 
                ? `${gauge.value.toFixed(1)}d`
                : `${gauge.value.toFixed(1)}%`
              }
            </span>
            <span className="text-xs text-gray-500">
              Meta: {gauge.isReverse ? `${gauge.target}d` : `${gauge.target}%`}
            </span>
          </div>
        </div>

        {/* Trend */}
        <div className="flex items-center justify-center gap-1 mt-2">
          <TrendIcon className={`w-3 h-3 ${trendColor}`} />
          <span className={`text-xs ${trendColor}`}>
            {Math.abs(gauge.trend).toFixed(1)}%
          </span>
          <span className="text-xs text-gray-500">vs anterior</span>
        </div>

        {/* Status */}
        <div className="text-center mt-2">
          <span className={`text-xs px-2 py-1 rounded-full ${getStatusStyle(percentage)}`}>
            {getStatusText(percentage, gauge.isReverse)}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

function getStatusStyle(percentage: number): string {
  if (percentage >= 90) return 'bg-green-100 text-green-800'
  if (percentage >= 70) return 'bg-yellow-100 text-yellow-800'
  return 'bg-red-100 text-red-800'
}

function getStatusText(percentage: number, isReverse: boolean = false): string {
  if (percentage >= 90) return 'Excelente'
  if (percentage >= 70) return 'Bom'
  return 'Crítico'
}