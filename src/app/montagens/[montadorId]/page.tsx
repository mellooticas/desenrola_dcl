'use client'

import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MontagemTable } from '@/components/montagens/MontagemTable'
import { Button } from '@/components/ui/button'
import { ArrowLeft, TrendingUp, Clock, Package, Award, LayoutGrid, List, Filter } from 'lucide-react'
import Link from 'next/link'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays, subWeeks, subMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'

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

interface Pedido {
  id: string
  numero_sequencial: number
  cliente_nome: string
  status: string
  data_enviado_montagem: string | null
  data_montagem_concluida: string | null
  tempo_montagem_horas: number | null
  prioridade: string
  valor_total: number
  created_at: string
}

type ViewMode = 'cards' | 'list'
type FilterPreset = 'hoje' | 'ontem' | 'esta_semana' | 'semana_passada' | 'este_mes' | 'mes_passado' | 'custom'

export default function MontadorDetalhePage({
  params,
}: {
  params: { montadorId: string }
}) {
  const { montadorId } = params
  const [viewMode, setViewMode] = useState<ViewMode>('cards')
  const [filterPreset, setFilterPreset] = useState<FilterPreset>('este_mes')
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')

  // Calcular range de datas baseado no preset
  const dateRange = useMemo(() => {
    const now = new Date()
    
    switch (filterPreset) {
      case 'hoje':
        return {
          start: startOfDay(now),
          end: endOfDay(now)
        }
      case 'ontem':
        return {
          start: startOfDay(subDays(now, 1)),
          end: endOfDay(subDays(now, 1))
        }
      case 'esta_semana':
        return {
          start: startOfWeek(now, { locale: ptBR }),
          end: endOfWeek(now, { locale: ptBR })
        }
      case 'semana_passada':
        return {
          start: startOfWeek(subWeeks(now, 1), { locale: ptBR }),
          end: endOfWeek(subWeeks(now, 1), { locale: ptBR })
        }
      case 'este_mes':
        return {
          start: startOfMonth(now),
          end: endOfMonth(now)
        }
      case 'mes_passado':
        return {
          start: startOfMonth(subMonths(now, 1)),
          end: endOfMonth(subMonths(now, 1))
        }
      case 'custom':
        if (customStartDate && customEndDate) {
          return {
            start: startOfDay(new Date(customStartDate)),
            end: endOfDay(new Date(customEndDate))
          }
        }
        return {
          start: startOfMonth(now),
          end: endOfMonth(now)
        }
      default:
        return {
          start: startOfMonth(now),
          end: endOfMonth(now)
        }
    }
  }, [filterPreset, customStartDate, customEndDate])

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

  // Query de pedidos com filtro de data
  const { data: pedidos, isLoading: isLoadingPedidos } = useQuery({
    queryKey: ['montador-pedidos', montadorId, dateRange.start.toISOString(), dateRange.end.toISOString()],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('v_pedidos_kanban')
        .select('*')
        .eq('montador_id', montadorId)
        .gte('created_at', dateRange.start.toISOString())
        .lte('created_at', dateRange.end.toISOString())
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as Pedido[]
    },
  })

  // Stats filtrados por período
  const filteredStats = useMemo(() => {
    if (!pedidos) return { total: 0, concluidos: 0, em_andamento: 0, tempo_medio: 0 }
    
    const concluidos = pedidos.filter(p => p.data_montagem_concluida !== null)
    const em_andamento = pedidos.filter(p => !p.data_montagem_concluida && p.data_enviado_montagem)
    
    const tempos = concluidos
      .filter(p => p.tempo_montagem_horas !== null)
      .map(p => p.tempo_montagem_horas!)
    
    const tempo_medio = tempos.length > 0
      ? tempos.reduce((sum, t) => sum + t, 0) / tempos.length
      : 0

    return {
      total: pedidos.length,
      concluidos: concluidos.length,
      em_andamento: em_andamento.length,
      tempo_medio
    }
  }, [pedidos])

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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/montagens">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                {getInitials(montador.nome)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">{montador.nome}</h1>
              <div className="flex items-center gap-2">
                <Badge variant={montador.tipo === 'INTERNO' ? 'default' : 'secondary'}>
                  {montador.tipo}
                </Badge>
                {montador.laboratorio_nome && (
                  <span className="text-sm text-muted-foreground">
                    {montador.laboratorio_nome}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'cards' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('cards')}
          >
            <LayoutGrid className="h-4 w-4 mr-2" />
            Cards
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4 mr-2" />
            Lista
          </Button>
        </div>
      </div>

      {/* Stats Cards - Global */}
      <div className="grid gap-4 md:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold mt-2">{stat.value}</p>
                  </div>
                  <div className={cn('p-3 rounded-lg', stat.bgColor)}>
                    <Icon className={cn('h-6 w-6', stat.color)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros de Período
            </CardTitle>
            <Badge variant="outline">
              {format(dateRange.start, 'dd/MM/yyyy', { locale: ptBR })} - {format(dateRange.end, 'dd/MM/yyyy', { locale: ptBR })}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {/* Preset Selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Período</label>
              <Select value={filterPreset} onValueChange={(v) => setFilterPreset(v as FilterPreset)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hoje">Hoje</SelectItem>
                  <SelectItem value="ontem">Ontem</SelectItem>
                  <SelectItem value="esta_semana">Esta Semana</SelectItem>
                  <SelectItem value="semana_passada">Semana Passada</SelectItem>
                  <SelectItem value="este_mes">Este Mês</SelectItem>
                  <SelectItem value="mes_passado">Mês Passado</SelectItem>
                  <SelectItem value="custom">Personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Custom Date Inputs */}
            {filterPreset === 'custom' && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Data Início</label>
                  <Input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Data Fim</label>
                  <Input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                  />
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats do Período Filtrado */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground">Total no Período</div>
            <div className="text-2xl font-bold mt-2">{filteredStats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground">Concluídos</div>
            <div className="text-2xl font-bold mt-2 text-green-600">{filteredStats.concluidos}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground">Em Andamento</div>
            <div className="text-2xl font-bold mt-2 text-blue-600">{filteredStats.em_andamento}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground">Tempo Médio</div>
            <div className="text-2xl font-bold mt-2 text-orange-600">
              {filteredStats.tempo_medio > 0 ? `${filteredStats.tempo_medio.toFixed(1)}h` : '-'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pedidos - Cards ou Lista */}
      <Card>
        <CardHeader>
          <CardTitle>
            Montagens {isLoadingPedidos && '(Carregando...)'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingPedidos ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : !pedidos || pedidos.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma montagem encontrada no período selecionado</p>
            </div>
          ) : viewMode === 'cards' ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pedidos.map((pedido) => (
                <Card key={pedido.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="text-sm text-muted-foreground">OS #{pedido.numero_sequencial}</div>
                        <div className="font-semibold mt-1">{pedido.cliente_nome}</div>
                      </div>
                      <Badge
                        variant={
                          pedido.status === 'ENTREGUE' || pedido.data_montagem_concluida
                            ? 'default'
                            : 'secondary'
                        }
                      >
                        {pedido.status}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      {pedido.data_enviado_montagem && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          Enviado: {format(new Date(pedido.data_enviado_montagem), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                        </div>
                      )}
                      {pedido.data_montagem_concluida && (
                        <div className="flex items-center gap-2 text-green-600">
                          <Award className="h-3 w-3" />
                          Concluído: {format(new Date(pedido.data_montagem_concluida), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                        </div>
                      )}
                      {pedido.tempo_montagem_horas !== null && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <TrendingUp className="h-3 w-3" />
                          Tempo: {pedido.tempo_montagem_horas.toFixed(1)}h
                        </div>
                      )}
                      {pedido.prioridade && pedido.prioridade !== 'NORMAL' && (
                        <Badge variant="destructive" className="text-xs">
                          {pedido.prioridade}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <MontagemTable montadorId={montadorId} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
