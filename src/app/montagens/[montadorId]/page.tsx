'use client'

import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MontagemTable } from '@/components/montagens/MontagemTable'
import { Button } from '@/components/ui/button'
import { ArrowLeft, TrendingUp, Clock, Package, Award } from 'lucide-react'
import Link from 'next/link'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

interface MontadorDetalhes {
  id: string
  nome: string
  tipo: string
  laboratorio_nome: string | null
  em_montagem_atual: number
  concluidos_hoje: number
  concluidos_semana: number
  concluidos_mes: number
  tempo_medio_horas: number
  total_montagens: number
}

export default function MontadorDetalhePage({
  params,
}: {
  params: { montadorId: string }
}) {
  const { montadorId } = params

  const { data: montador, isLoading } = useQuery({
    queryKey: ['montador-detalhes', montadorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('view_kpis_montadores')
        .select('*')
        .eq('id', montadorId)
        .single()

      if (error) throw error
      return data as MontadorDetalhes
    },
  })

  if (isLoading || !montador) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="grid gap-4 md:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-muted rounded" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  const getInitials = (nome: string) => {
    return nome
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase()
  }

  const stats = [
    {
      title: 'Em Montagem',
      value: montador.em_montagem_atual,
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Concluídos Hoje',
      value: montador.concluidos_hoje,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Esta Semana',
      value: montador.concluidos_semana,
      icon: Award,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Tempo Médio',
      value: montador.tempo_medio_horas
        ? `${montador.tempo_medio_horas.toFixed(1)}h`
        : '-',
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ]

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/montagens">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </Link>
        <div className="flex items-center gap-4 flex-1">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
              {getInitials(montador.nome)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{montador.nome}</h1>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-muted-foreground">
                {montador.tipo === 'INTERNO' ? 'Montador Interno' : montador.laboratorio_nome}
              </p>
              <Badge variant={montador.em_montagem_atual > 0 ? 'default' : 'secondary'}>
                {montador.em_montagem_atual > 0 ? 'Ativo' : 'Livre'}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <div className={`${stat.bgColor} p-2 rounded-lg`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Histórico Total */}
      <Card>
        <CardHeader>
          <CardTitle>Desempenho Geral</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">Total de Montagens</p>
              <p className="text-3xl font-bold mt-1">{montador.total_montagens}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Este Mês</p>
              <p className="text-3xl font-bold mt-1">{montador.concluidos_mes}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Média Diária (mês)</p>
              <p className="text-3xl font-bold mt-1">
                {(montador.concluidos_mes / 30).toFixed(1)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pedidos do Montador */}
      <MontagemTable montadorId={montadorId} />
    </div>
  )
}
