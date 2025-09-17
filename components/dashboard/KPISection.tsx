// ================================================================
// src/components/dashboard/KPISection.tsx
// ================================================================

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Minus, Package, Clock, Target, DollarSign } from 'lucide-react'
import { useDashboardKPIs } from '@/lib/hooks/useDashboardBI'

interface KPICardProps {
  title: string
  value: number | string
  previousValue?: number
  unit?: string
  format?: 'number' | 'currency' | 'percentage'
  icon: React.ComponentType<{ className?: string }>
  color: string
  loading?: boolean
}

function KPICard({ title, value, previousValue, unit = '', format = 'number', icon: Icon, color, loading }: KPICardProps) {
  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-300 rounded mb-2"></div>
            <div className="h-8 bg-gray-300 rounded mb-1"></div>
            <div className="h-3 bg-gray-300 rounded w-24"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const formatValue = (val: number | string) => {
    if (typeof val === 'string') return val
    
    switch (format) {
      case 'currency':
        return `R$ ${val.toLocaleString('pt-BR')}`
      case 'percentage':
        return `${val.toFixed(1)}%`
      default:
        return val.toLocaleString('pt-BR')
    }
  }

  const getTrendInfo = () => {
    if (previousValue === undefined || typeof value !== 'number') return null
    
    const variation = ((value - previousValue) / previousValue) * 100
    const isPositive = variation > 0
    const isNeutral = Math.abs(variation) < 0.1
    
    if (isNeutral) {
      return { icon: Minus, color: 'text-gray-500', text: 'Estável' }
    }
    
    return {
      icon: isPositive ? TrendingUp : TrendingDown,
      color: isPositive ? 'text-green-600' : 'text-red-600',
      text: `${isPositive ? '+' : ''}${variation.toFixed(1)}%`
    }
  }

  const trend = getTrendInfo()

  return (
    <Card className={`border-l-4 ${color}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-3xl font-bold text-gray-900">
              {formatValue(value)}{unit}
            </p>
            {trend && (
              <div className={`flex items-center gap-1 mt-1 ${trend.color}`}>
                <trend.icon className="w-4 h-4" />
                <span className="text-sm font-medium">{trend.text}</span>
              </div>
            )}
          </div>
          <div className="p-3 rounded-full bg-gray-100">
            <Icon className="w-6 h-6 text-gray-600" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function KPISection() {
  const { data: kpis, isLoading, error } = useDashboardKPIs()

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-red-600">Erro ao carregar KPIs: {error.message}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <KPICard
        title="Total de Pedidos"
        value={kpis?.total_pedidos || 0}
        previousValue={kpis?.total_pedidos_anterior}
        icon={Package}
        color="border-blue-500"
        loading={isLoading}
      />
      
      <KPICard
        title="SLA Compliance"
        value={kpis?.sla_compliance || 0}
        previousValue={kpis?.sla_anterior}
        format="percentage"
        icon={Target}
        color="border-green-500"
        loading={isLoading}
      />
      
      <KPICard
        title="Lead Time Médio"
        value={kpis?.lead_time_medio || 0}
        previousValue={kpis?.lead_time_anterior}
        unit="d"
        icon={Clock}
        color="border-orange-500"
        loading={isLoading}
      />
      
      <KPICard
        title="Faturamento Total"
        value={kpis?.valor_total_vendas || 0}
        format="currency"
        icon={DollarSign}
        color="border-purple-500"
        loading={isLoading}
      />
    </div>
  )
}