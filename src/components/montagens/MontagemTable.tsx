'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Loader2 } from 'lucide-react'

interface Montagem {
  id: string
  numero_sequencial: number
  cliente_nome: string
  montador_nome: string
  laboratorio_nome: string
  status: string
  status_legivel: string
  horas_em_montagem: number
  data_enviado_montagem: string
  loja_nome: string
}

interface MontagemTableProps {
  montadorId?: string
  status?: string
  limit?: number
}

export function MontagemTable({ montadorId, status, limit }: MontagemTableProps) {
  const { data: montagens = [], isLoading } = useQuery({
    queryKey: ['montagens', montadorId, status],
    queryFn: async () => {
      let query = supabase
        .from('view_relatorio_montagens')
        .select('*')
        .order('data_enviado_montagem', { ascending: false })

      if (montadorId) {
        query = query.eq('montador_id', montadorId)
      }

      if (status) {
        query = query.eq('status', status)
      }

      if (limit) {
        query = query.limit(limit)
      }

      const { data, error } = await query

      if (error) throw error
      return data as Montagem[]
    },
    staleTime: 30 * 1000,
  })

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      ENVIADO: { variant: 'default', label: 'Em Montagem' },
      CHEGOU: { variant: 'success', label: 'Concluído' },
      ENTREGUE: { variant: 'secondary', label: 'Entregue' },
    }

    const config = variants[status] || { variant: 'default', label: status }
    return <Badge variant={config.variant as any}>{config.label}</Badge>
  }

  const formatTempo = (horas: number) => {
    if (!horas) return '-'
    if (horas < 1) return `${Math.round(horas * 60)}min`
    return `${horas.toFixed(1)}h`
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  if (montagens.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Montagens</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-32 text-muted-foreground">
          Nenhuma montagem encontrada
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Montagens ({montagens.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>OS</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Laboratório</TableHead>
              <TableHead>Montador</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Tempo</TableHead>
              <TableHead>Enviado há</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {montagens.map((montagem) => (
              <TableRow key={montagem.id}>
                <TableCell className="font-medium">
                  #{montagem.numero_sequencial}
                </TableCell>
                <TableCell>{montagem.cliente_nome}</TableCell>
                <TableCell>
                  <span className="text-sm">{montagem.laboratorio_nome}</span>
                </TableCell>
                <TableCell>
                  <span className="text-sm font-medium">
                    {montagem.montador_nome}
                  </span>
                </TableCell>
                <TableCell>{getStatusBadge(montagem.status)}</TableCell>
                <TableCell>
                  <span className="font-mono text-sm">
                    {formatTempo(montagem.horas_em_montagem)}
                  </span>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {montagem.data_enviado_montagem
                    ? formatDistanceToNow(new Date(montagem.data_enviado_montagem), {
                        addSuffix: true,
                        locale: ptBR,
                      })
                    : '-'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
