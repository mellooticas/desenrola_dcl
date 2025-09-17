// components/dashboard/RelatorioSLA.tsx
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Target, AlertTriangle, CheckCircle, Download } from 'lucide-react'


import type { DashboardFilters } from './FiltrosPeriodo'

interface RelatorioSLAProps {
  filters: DashboardFilters
}

export function RelatorioSLA({ filters }: RelatorioSLAProps) {
  const dadosSLA = {
    geral: {
      compliance: 94.2,
      meta: 95,
      totalPedidos: 1247,
      noPrazo: 1175,
      atrasados: 72
    },
    porLaboratorio: [
      { nome: 'Essilor', compliance: 98.2, pedidos: 145, status: 'excelente' },
      { nome: 'Zeiss', compliance: 96.8, pedidos: 128, status: 'bom' },
      { nome: 'Hoya', compliance: 94.5, pedidos: 89, status: 'atencao' },
      { nome: 'Transitions', compliance: 91.2, pedidos: 67, status: 'critico' },
    ]
  }

  return (
    <div className="space-y-6">
      {/* Resumo Geral */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Relatório de SLA
            </CardTitle>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {dadosSLA.geral.compliance}%
              </div>
              <p className="text-sm text-gray-600">SLA Compliance Geral</p>
              <Badge 
                variant={dadosSLA.geral.compliance >= dadosSLA.geral.meta ? "default" : "destructive"}
                className="mt-2"
              >
                Meta: {dadosSLA.geral.meta}%
              </Badge>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {dadosSLA.geral.noPrazo}
              </div>
              <p className="text-sm text-gray-600">Pedidos no Prazo</p>
              <div className="flex items-center justify-center gap-1 mt-2 text-xs text-green-600">
                <CheckCircle className="w-3 h-3" />
                {((dadosSLA.geral.noPrazo / dadosSLA.geral.totalPedidos) * 100).toFixed(1)}%
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">
                {dadosSLA.geral.atrasados}
              </div>
              <p className="text-sm text-gray-600">Pedidos Atrasados</p>
              <div className="flex items-center justify-center gap-1 mt-2 text-xs text-red-600">
                <AlertTriangle className="w-3 h-3" />
                {((dadosSLA.geral.atrasados / dadosSLA.geral.totalPedidos) * 100).toFixed(1)}%
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">
                {dadosSLA.geral.totalPedidos}
              </div>
              <p className="text-sm text-gray-600">Total de Pedidos</p>
              <p className="text-xs text-gray-500 mt-2">Período analisado</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SLA por Laboratório */}
      <Card>
        <CardHeader>
          <CardTitle>Performance por Laboratório</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dadosSLA.porLaboratorio.map((lab, index) => (
              <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{lab.nome}</h4>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold">{lab.compliance}%</span>
                      <Badge 
                        variant={
                          lab.status === 'excelente' ? 'default' :
                          lab.status === 'bom' ? 'secondary' :
                          lab.status === 'atencao' ? 'outline' : 'destructive'
                        }
                        className="text-xs"
                      >
                        {lab.status === 'excelente' ? 'Excelente' :
                         lab.status === 'bom' ? 'Bom' :
                         lab.status === 'atencao' ? 'Atenção' : 'Crítico'}
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Barra de progresso */}
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        lab.compliance >= 95 ? 'bg-green-500' :
                        lab.compliance >= 90 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${lab.compliance}%` }}
                    />
                  </div>
                  
                  <p className="text-sm text-gray-600 mt-1">{lab.pedidos} pedidos analisados</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}