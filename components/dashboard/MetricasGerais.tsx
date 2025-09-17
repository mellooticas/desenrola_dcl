// components/dashboard/MetricasGerais.tsx
'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BarChart3, TrendingUp, Clock, Target, DollarSign } from 'lucide-react'

export function MetricasGerais() {
  // TODO: Buscar dados reais da API baseado nos filtros
  const metricas = {
    totalPedidos: 1247,
    faturamentoTotal: 185620.00,
    ticketMedio: 148.90,
    leadTimeMedia: 4.2,
    slaCompliance: 94.5,
    crescimentoMensal: 8.3,
    pedidosEmAndamento: 156,
    pedidosEntregues: 891
  }

  const metricCards = [
    {
      title: 'Total de Pedidos',
      value: metricas.totalPedidos.toLocaleString(),
      change: `+${metricas.crescimentoMensal}%`,
      subtitle: 'vs mês anterior',
      icon: BarChart3,
      gradient: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-50/80 to-indigo-50/80',
      iconColor: 'text-blue-600'
    },
    {
      title: 'Faturamento',
      value: `R$ ${((metricas.faturamentoTotal || 0) / 1000).toFixed(0)}k`,
      subtitle: `Ticket médio: R$ ${(metricas.ticketMedio || 0).toFixed(2)}`,
      icon: DollarSign,
      gradient: 'from-emerald-500 to-green-600',
      bgGradient: 'from-emerald-50/80 to-green-50/80',
      iconColor: 'text-emerald-600'
    },
    {
      title: 'Lead Time Médio',
      value: `${metricas.leadTimeMedia} dias`,
      subtitle: 'Meta: 5 dias',
      icon: Clock,
      gradient: 'from-amber-500 to-orange-600',
      bgGradient: 'from-amber-50/80 to-orange-50/80',
      iconColor: 'text-amber-600',
      status: 'Meta: 5 dias'
    },
    {
      title: 'SLA Compliance',
      value: `${metricas.slaCompliance}%`,
      subtitle: 'Meta: 95%',
      icon: Target,
      gradient: 'from-purple-500 to-purple-600',
      bgGradient: 'from-purple-50/80 to-violet-50/80',
      iconColor: 'text-purple-600',
      status: 'Meta: 95%'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metricCards.map((metric, index) => {
        const Icon = metric.icon
        return (
          <Card 
            key={index}
            className={`group relative overflow-hidden bg-gradient-to-br ${metric.bgGradient} backdrop-blur-sm border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
            <CardContent className="relative p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600 tracking-wide">
                    {metric.title}
                  </p>
                  <p className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-900 bg-clip-text text-transparent">
                    {metric.value}
                  </p>
                </div>
                <div className={`p-3 rounded-xl bg-gradient-to-br ${metric.gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {metric.change && (
                  <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs shadow-sm">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    {metric.change}
                  </Badge>
                )}
                <span className="text-xs text-gray-500 font-medium">
                  {metric.subtitle}
                </span>
              </div>
              
              {metric.status && (
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/30">
                  <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${metric.gradient}`} />
                  <span className="text-xs text-gray-600 font-medium">
                    {metric.status}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}