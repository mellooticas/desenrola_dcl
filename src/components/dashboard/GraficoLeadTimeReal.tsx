// components/dashboard/GraficoLeadTimeReal.tsx
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { DashboardFilters } from './FiltrosPeriodo'

interface PerformanceLab {
  laboratorio_id: string
  laboratorio_nome: string
  total_pedidos: number
  pedidos_entregues: number
  pedidos_atrasados: number
  valor_total: number
  taxa_entrega: number
  sla_compliance: number
}

interface GraficoLeadTimeRealProps {
  filters: DashboardFilters
  performanceLabs: PerformanceLab[]
}

export function GraficoLeadTimeReal({ filters, performanceLabs }: GraficoLeadTimeRealProps) {
  
  // Transformar dados reais em dados de lead time (simulando com base no SLA compliance)
  const dadosLeadTime = performanceLabs.map(lab => {
    // Estimar lead time baseado no SLA compliance (quanto menor o SLA, maior o lead time)
    const leadTimeEstimado = lab.sla_compliance > 95 ? 3.5 : 
                             lab.sla_compliance > 85 ? 4.8 : 
                             lab.sla_compliance > 70 ? 6.2 : 8.5
    
    return {
      laboratorio: lab.laboratorio_nome,
      leadTime: leadTimeEstimado,
      pedidos: lab.total_pedidos,
      slaCompliance: lab.sla_compliance,
      valor_total: lab.valor_total
    }
  }).sort((a, b) => a.leadTime - b.leadTime)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>⏱️</span> Lead Time por Laboratório
        </CardTitle>
      </CardHeader>
      <CardContent>
        {dadosLeadTime.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">📊</div>
            <p className="text-slate-500">Nenhum dado de performance disponível</p>
          </div>
        ) : (
          <div className="space-y-4">
            {dadosLeadTime.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg border border-slate-200 hover:shadow-md transition-shadow">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <p className="font-semibold text-slate-800">{item.laboratorio}</p>
                    <Badge 
                      variant="outline"
                      className="text-xs"
                    >
                      #{index + 1}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-slate-600">
                    <span>📊 {item.pedidos} pedidos</span>
                    <span>💰 {formatCurrency(item.valor_total)}</span>
                    <span>📈 SLA {item.slaCompliance.toFixed(1)}%</span>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-2xl font-bold text-slate-800 mb-1">
                    {item.leadTime.toFixed(1)} dias
                  </p>
                  <Badge 
                    variant={item.leadTime <= 4 ? "default" : item.leadTime <= 6 ? "secondary" : "destructive"}
                    className="text-xs"
                  >
                    {item.leadTime <= 4 ? "🚀 Excelente" : 
                     item.leadTime <= 6 ? "✅ Bom" : 
                     "⚠️ Atenção"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {dadosLeadTime.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-blue-800">Resumo Geral</h4>
                <p className="text-sm text-blue-600">
                  Lead time médio: {(dadosLeadTime.reduce((sum, item) => sum + item.leadTime, 0) / dadosLeadTime.length).toFixed(1)} dias
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-blue-600">
                  Total: {dadosLeadTime.reduce((sum, item) => sum + item.pedidos, 0)} pedidos
                </p>
                <p className="text-sm text-blue-600">
                  Valor: {formatCurrency(dadosLeadTime.reduce((sum, item) => sum + item.valor_total, 0))}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}