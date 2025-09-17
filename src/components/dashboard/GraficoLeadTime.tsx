// components/dashboard/GraficoLeadTime.tsx
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { Badge } from '@/components/ui/badge'
import type { DashboardFilters } from './FiltrosPeriodo'

interface GraficoLeadTimeProps {
  filters: DashboardFilters
}

export function GraficoLeadTime({ filters }: GraficoLeadTimeProps) {
  // TODO: Implementar gráfico real com recharts
  const dadosLeadTime = [
    { laboratorio: 'Essilor', leadTime: 3.2, pedidos: 45 },
    { laboratorio: 'Zeiss', leadTime: 4.1, pedidos: 38 },
    { laboratorio: 'Hoya', leadTime: 5.2, pedidos: 29 },
    { laboratorio: 'Transitions', leadTime: 6.1, pedidos: 22 },
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Lead Time por Laboratório</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dadosLeadTime.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{item.laboratorio}</p>
                  <p className="text-sm text-gray-600">{item.pedidos} pedidos</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">{item.leadTime} dias</p>
                  <Badge 
                    variant={item.leadTime <= 4 ? "default" : item.leadTime <= 5 ? "secondary" : "destructive"}
                    className="text-xs"
                  >
                    {item.leadTime <= 4 ? "Excelente" : item.leadTime <= 5 ? "Bom" : "Atenção"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Evolução do Lead Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-gray-500">Gráfico de linha - Lead time ao longo do tempo</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}