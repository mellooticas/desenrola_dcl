
// ================================================================
// src/components/dashboard/RankingTable.tsx
// ================================================================

'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Eye, TrendingUp, TrendingDown } from 'lucide-react'
import type { RankingLaboratorio } from '@/lib/types/dashboard-bi'

interface RankingTableProps {
  laboratorios: RankingLaboratorio[]
  showActions?: boolean
  maxRows?: number
}

export function RankingTable({ laboratorios, showActions = true, maxRows }: RankingTableProps) {
  const dados = maxRows ? laboratorios.slice(0, maxRows) : laboratorios

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'BAIXO': return 'bg-green-100 text-green-800'
      case 'MÉDIO': return 'bg-yellow-100 text-yellow-800'
      case 'ALTO': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTendenciaIcon = (tendencia: string) => {
    switch (tendencia) {
      case 'SUBINDO': return <TrendingUp className="w-4 h-4 text-green-600" />
      case 'DESCENDO': return <TrendingDown className="w-4 h-4 text-red-600" />
      default: return <span className="w-4 h-4 text-gray-400">—</span>
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left p-3 font-medium">#</th>
            <th className="text-left p-3 font-medium">Laboratório</th>
            <th className="text-right p-3 font-medium">Score</th>
            <th className="text-right p-3 font-medium">SLA</th>
            <th className="text-right p-3 font-medium">Lead Time</th>
            <th className="text-right p-3 font-medium">Pedidos</th>
            <th className="text-center p-3 font-medium">Risco</th>
            <th className="text-center p-3 font-medium">Tendência</th>
            {showActions && <th className="text-center p-3 font-medium">Ações</th>}
          </tr>
        </thead>
        <tbody>
          {dados.map((lab) => (
            <tr key={lab.laboratorio_codigo} className="border-b hover:bg-gray-50">
              <td className="p-3">
                <div className="flex items-center">
                  <span className="font-bold text-lg">{lab.posicao}</span>
                  {lab.posicao <= 3 && <span className="ml-2">🏆</span>}
                </div>
              </td>
              
              <td className="p-3">
                <div>
                  <div className="font-medium">{lab.laboratorio_nome}</div>
                  <div className="text-sm text-gray-500">{lab.laboratorio_codigo}</div>
                </div>
              </td>
              
              <td className="p-3 text-right">
                <span className="font-bold text-lg">{lab.score_geral}</span>
              </td>
              
              <td className="p-3 text-right">
                <span className={`font-medium ${lab.sla_compliance >= 95 ? 'text-green-600' : lab.sla_compliance >= 90 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {lab.sla_compliance.toFixed(1)}%
                </span>
              </td>
              
              <td className="p-3 text-right">
                <span className="font-medium">{lab.lead_time_medio.toFixed(1)}d</span>
              </td>
              
              <td className="p-3 text-right">
                <div>
                  <span className="font-medium">{lab.total_pedidos}</span>
                  <div className="text-xs text-gray-500">
                    Semana: {lab.pedidos_ultima_semana}
                  </div>
                </div>
              </td>
              
              <td className="p-3 text-center">
                <Badge className={getStatusColor(lab.status_risco)}>
                  {lab.status_risco}
                </Badge>
              </td>
              
              <td className="p-3 text-center">
                {getTendenciaIcon(lab.tendencia)}
              </td>
              
              {showActions && (
                <td className="p-3 text-center">
                  <Button size="sm" variant="outline">
                    <Eye className="w-4 h-4" />
                  </Button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}