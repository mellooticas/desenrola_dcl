'use client'

import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, TrendingUp, Clock, CheckCircle } from 'lucide-react'

interface KPIMontador {
  id: string
  nome: string
  em_montagem_atual: number
  concluidos_hoje: number
  concluidos_semana: number
  tempo_medio_horas: number
}

export function MontadorKPIs() {
  const { data: kpis = [], isLoading } = useQuery({
    queryKey: ['kpis-montadores'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('view_kpis_montadores')
        .select('*')
        .order('concluidos_hoje', { ascending: false })

      if (error) throw error
      return data as KPIMontador[]
    },
    staleTime: 30 * 1000, // 30 segundos
  })

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="h-20 bg-muted" />
            <CardContent className="h-16 bg-muted/50" />
          </Card>
        ))}
      </div>
    )
  }

  // Calcular totais gerais
  const totalEmMontagem = kpis.reduce((acc, k) => acc + (k.em_montagem_atual || 0), 0)
  const totalConcluidosHoje = kpis.reduce((acc, k) => acc + (k.concluidos_hoje || 0), 0)
  const totalConcluidosSemana = kpis.reduce((acc, k) => acc + (k.concluidos_semana || 0), 0)
  const tempoMedioGeral = kpis.length > 0
    ? kpis.reduce((acc, k) => acc + (k.tempo_medio_horas || 0), 0) / kpis.length
    : 0

  const kpiCards = [
    {
      title: 'Em Montagem',
      value: totalEmMontagem,
      icon: Users,
      description: 'Pedidos aguardando',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Concluídos Hoje',
      value: totalConcluidosHoje,
      icon: CheckCircle,
      description: 'Finalizados',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Semana',
      value: totalConcluidosSemana,
      icon: TrendingUp,
      description: 'Total esta semana',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Tempo Médio',
      value: tempoMedioGeral.toFixed(1) + 'h',
      icon: Clock,
      description: 'Por montagem',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {kpiCards.map((kpi) => {
        const Icon = kpi.icon
        return (
          <Card key={kpi.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {kpi.title}
              </CardTitle>
              <div className={`${kpi.bgColor} p-2 rounded-lg`}>
                <Icon className={`h-4 w-4 ${kpi.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {kpi.description}
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
