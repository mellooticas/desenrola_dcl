'use client'

import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, Clock, Package } from 'lucide-react'
import Link from 'next/link'

interface MontadorStats {
  id: string
  nome: string
  tipo: string
  laboratorio_nome: string | null
  em_montagem_atual: number
  concluidos_hoje: number
  concluidos_semana: number
  tempo_medio_horas: number
  total_montagens: number
}

export function MontadorCards() {
  const { data: montadores = [], isLoading } = useQuery({
    queryKey: ['montadores-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('view_kpis_montadores')
        .select('*')
        .order('concluidos_hoje', { ascending: false })

      if (error) throw error
      return data as MontadorStats[]
    },
    staleTime: 30 * 1000,
  })

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="h-24 bg-muted" />
            <CardContent className="h-32 bg-muted/50" />
          </Card>
        ))}
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

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {montadores.map((montador) => (
        <Link key={montador.id} href={`/montagens/${montador.id}`}>
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {getInitials(montador.nome)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-base">{montador.nome}</CardTitle>
                    <p className="text-xs text-muted-foreground">
                      {montador.tipo === 'INTERNO' ? 'Interno' : montador.laboratorio_nome}
                    </p>
                  </div>
                </div>
                <Badge variant={montador.em_montagem_atual > 0 ? 'default' : 'secondary'}>
                  {montador.em_montagem_atual > 0 ? 'Ativo' : 'Livre'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Em montagem */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <Package className="h-4 w-4 text-blue-500" />
                    <span className="text-muted-foreground">Em montagem</span>
                  </div>
                  <span className="font-semibold text-blue-600">
                    {montador.em_montagem_atual}
                  </span>
                </div>

                {/* Concluídos hoje */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-muted-foreground">Hoje</span>
                  </div>
                  <span className="font-semibold text-green-600">
                    {montador.concluidos_hoje}
                  </span>
                </div>

                {/* Tempo médio */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-orange-500" />
                    <span className="text-muted-foreground">Tempo médio</span>
                  </div>
                  <span className="font-semibold text-orange-600 font-mono text-sm">
                    {montador.tempo_medio_horas
                      ? `${montador.tempo_medio_horas.toFixed(1)}h`
                      : '-'}
                  </span>
                </div>

                {/* Total histórico */}
                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Total histórico</span>
                    <span className="font-semibold">{montador.total_montagens}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
