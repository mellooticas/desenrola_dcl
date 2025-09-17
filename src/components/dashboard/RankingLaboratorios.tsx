// components/dashboard/RankingLaboratorios.tsx
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Award, TrendingUp, Clock } from 'lucide-react'


import type { DashboardFilters } from './FiltrosPeriodo'

interface RankingLaboratoriosProps {
  filters: DashboardFilters
}

export function RankingLaboratorios({ filters }: RankingLaboratoriosProps) {
  const ranking = [
    { 
      posicao: 1, 
      nome: 'Essilor do Brasil', 
      slaCompliance: 98.2, 
      leadTime: 3.2, 
      pedidos: 145, 
      faturamento: 45620 
    },
    {  
      posicao: 2, 
      nome: 'Zeiss Vision Care', 
      slaCompliance: 96.8, 
      leadTime: 4.1, 
      pedidos: 128, 
      faturamento: 38950 
    },
    { 
      posicao: 3, 
      nome: 'Hoya Lens Brasil', 
      slaCompliance: 94.5, 
      leadTime: 5.2, 
      pedidos: 89, 
      faturamento: 28740 
    },
    { 
      posicao: 4, 
      nome: 'Transitions Optical', 
      slaCompliance: 91.2, 
      leadTime: 6.1, 
      pedidos: 67, 
      faturamento: 22180 
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="w-5 h-5" />
          Ranking de Laboratórios
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {ranking.map((lab) => (
            <div key={lab.posicao} className="flex items-center gap-4 p-4 border rounded-lg">
              <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full font-bold">
                {lab.posicao}
              </div>
              
              <div className="flex-1">
                <h4 className="font-medium">{lab.nome}</h4>
                <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {lab.leadTime}d
                  </span>
                  <span>{lab.pedidos} pedidos</span>
                  <span>R$ {(lab.faturamento / 1000).toFixed(0)}k</span>
                </div>
              </div>
              
              <div className="text-right">
                <Badge 
                  variant={lab.slaCompliance >= 95 ? "default" : "secondary"}
                  className="mb-1"
                >
                  {lab.slaCompliance}% SLA
                </Badge>
                {lab.posicao === 1 && (
                  <div className="flex items-center gap-1 text-xs text-green-600">
                    <TrendingUp className="w-3 h-3" />
                    Líder
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}