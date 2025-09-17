// components/dashboard/RankingClasses.tsx
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Package, TrendingUp } from 'lucide-react'


import type { DashboardFilters } from './FiltrosPeriodo'

interface RankingClassesProps {
  filters: DashboardFilters
}

export function RankingClasses({ filters }: RankingClassesProps) {
  const ranking = [
    { 
      posicao: 1, 
      nome: 'Multifocal Premium', 
      categoria: 'multifocal',
      pedidos: 256, 
      faturamento: 68420, 
      ticketMedio: 267.30,
      cor: '#D97706'
    },
    { 
      posicao: 2, 
      nome: 'Transitions Signature', 
      categoria: 'transitions',
      pedidos: 189, 
      faturamento: 52180, 
      ticketMedio: 276.10,
      cor: '#8B5CF6'
    },
    { 
      posicao: 3, 
      nome: 'Monofocal CR-39', 
      categoria: 'monofocal',
      pedidos: 345, 
      faturamento: 34520, 
      ticketMedio: 100.05,
      cor: '#10B981'
    },
    { 
      posicao: 4, 
      nome: 'Antirreflexo Premium', 
      categoria: 'tratamento',
      pedidos: 167, 
      faturamento: 25080, 
      ticketMedio: 150.18,
      cor: '#3B82F6'
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="w-5 h-5" />
          Ranking de Classes de Lente
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {ranking.map((classe) => (
            <div key={classe.posicao} className="flex items-center gap-4 p-4 border rounded-lg">
              <div className="flex items-center justify-center w-8 h-8 bg-green-100 text-green-600 rounded-full font-bold">
                {classe.posicao}
              </div>
              
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: classe.cor }}
              />
              
              <div className="flex-1">
                <h4 className="font-medium">{classe.nome}</h4>
                <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                  <span>{classe.pedidos} pedidos</span>
                  <span>Ticket: R$ {classe.ticketMedio.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="text-right">
                <p className="font-bold text-green-600">
                  R$ {(classe.faturamento / 1000).toFixed(0)}k
                </p>
                {classe.posicao === 1 && (
                  <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
                    <TrendingUp className="w-3 h-3" />
                    Top Revenue
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