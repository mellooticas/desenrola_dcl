// components/dashboard/MetricasGeraisReal.tsx
'use client'

import { BarChart3, TrendingUp, Clock, Target, DollarSign } from 'lucide-react'
import { MetricCardAnimated } from '@/components/dashboard/MetricCardAnimated'
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton'

interface MetricasGeraisProps {
  metricas?: {
    receita_total: number
    custo_total: number
    margem_bruta: number
    percentual_margem: number
    quantidade_pedidos: number
    quantidade_total?: number
    quantidade_sem_valor?: number
    ticket_medio: number
  }
  performanceLabs?: Array<{
    laboratorio_id: string
    laboratorio_nome: string
    total_pedidos: number
    pedidos_entregues: number
    pedidos_atrasados: number
    valor_total: number
    taxa_entrega: number
    sla_compliance: number
  }>
  loading?: boolean
}

export function MetricasGeraisReal({ metricas, performanceLabs = [], loading = false }: MetricasGeraisProps) {
  
  if (loading) {
    return <LoadingSkeleton type="dashboard" count={4} />
  }
  
  // Calcular métricas derivadas
  const leadTimeMedia = performanceLabs.length > 0 
    ? performanceLabs.reduce((sum, lab) => sum + (lab.total_pedidos > 0 ? 5 : 0), 0) / performanceLabs.length
    : 0
  
  const slaCompliance = performanceLabs.length > 0
    ? performanceLabs.reduce((sum, lab) => sum + lab.sla_compliance, 0) / performanceLabs.length
    : 0

  const metricCards = [
    {
      title: 'Total de Pedidos',
      value: (metricas?.quantidade_total || metricas?.quantidade_pedidos || 0),
      subtitle: `${metricas?.quantidade_pedidos || 0} com valor`,
      icon: BarChart3,
      gradient: 'from-blue-500 to-cyan-500',
      trend: {
        value: performanceLabs.reduce((sum, lab) => sum + lab.pedidos_atrasados, 0),
        label: 'atrasados',
        direction: 'down' as const
      }
    },
    {
      title: 'Faturamento',
      value: (metricas?.receita_total || 0) / 1000,
      subtitle: `Ticket médio: R$ ${(metricas?.ticket_medio || 0).toFixed(0)}`,
      icon: DollarSign,
      gradient: 'from-green-500 to-emerald-500',
      prefix: 'R$',
      suffix: 'k',
      trend: {
        value: metricas?.percentual_margem || 0,
        label: '% margem',
        direction: (metricas?.percentual_margem || 0) > 20 ? 'up' as const : 'down' as const
      }
    },
    {
      title: 'Lead Time Médio',
      value: leadTimeMedia,
      subtitle: 'Meta: 5 dias',
      icon: Clock,
      gradient: 'from-orange-500 to-red-500',
      suffix: ' dias',
      trend: {
        value: leadTimeMedia <= 5 ? 100 : 85,
        label: leadTimeMedia <= 5 ? 'Dentro da meta' : 'Acima da meta',
        direction: leadTimeMedia <= 5 ? 'up' as const : 'down' as const
      }
    },
    {
      title: 'SLA Compliance',
      value: slaCompliance,
      subtitle: 'Meta: 95%',
      icon: Target,
      gradient: 'from-purple-500 to-pink-500',
      suffix: '%',
      trend: {
        value: slaCompliance >= 95 ? 100 : 85,
        label: slaCompliance >= 95 ? 'Meta atingida' : 'Abaixo da meta',
        direction: slaCompliance >= 95 ? 'up' as const : 'down' as const
      }
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metricCards.map((metric, index) => (
        <MetricCardAnimated
          key={index}
          {...metric}
          index={index}
        />
      ))}
    </div>
  )
}