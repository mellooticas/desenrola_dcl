// components/dashboard/RankingLaboratoriosReal.tsx
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Award, TrendingUp, Clock } from 'lucide-react'
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

interface RankingLaboratoriosRealProps {
  filters: DashboardFilters
  performanceLabs: PerformanceLab[]
}

export function RankingLaboratoriosReal({ filters, performanceLabs }: RankingLaboratoriosRealProps) {
  
  // Criar ranking baseado no SLA compliance (critério principal)
  const ranking = performanceLabs
    .sort((a, b) => b.sla_compliance - a.sla_compliance)
    .map((lab, index) => ({
      posicao: index + 1,
      nome: lab.laboratorio_nome,
      slaCompliance: lab.sla_compliance,
      leadTime: lab.sla_compliance > 95 ? 3.5 : 
                lab.sla_compliance > 85 ? 4.8 : 
                lab.sla_compliance > 70 ? 6.2 : 8.5, // Lead time estimado
      pedidos: lab.total_pedidos,
      faturamento: lab.valor_total,
      taxa_entrega: lab.taxa_entrega,
      pedidos_atrasados: lab.pedidos_atrasados
    }))

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const getMedalIcon = (posicao: number) => {
    switch (posicao) {
      case 1: return '🥇'
      case 2: return '🥈'
      case 3: return '🥉'
      default: return '🏅'
    }
  }

  const getSlaColor = (sla: number) => {
    if (sla >= 95) return 'text-emerald-600 bg-emerald-100'
    if (sla >= 85) return 'text-blue-600 bg-blue-100'
    if (sla >= 70) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-600" />
          Ranking Laboratórios
        </CardTitle>
      </CardHeader>
      <CardContent>
        {ranking.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🏆</div>
            <p className="text-slate-500">Nenhum laboratório com dados disponíveis</p>
          </div>
        ) : (
          <div className="space-y-4">
            {ranking.map((lab) => (
              <div 
                key={lab.nome} 
                className={`p-4 rounded-lg border transition-all hover:shadow-md ${
                  lab.posicao === 1 ? 'bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200' :
                  lab.posicao === 2 ? 'bg-gradient-to-r from-slate-50 to-gray-50 border-slate-200' :
                  lab.posicao === 3 ? 'bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200' :
                  'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">
                      {getMedalIcon(lab.posicao)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-slate-800">{lab.nome}</h3>
                        <Badge variant="outline" className="text-xs">
                          #{lab.posicao}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm text-slate-600">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{lab.leadTime.toFixed(1)} dias</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          <span>{lab.pedidos} pedidos</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <Badge className={`mb-2 ${getSlaColor(lab.slaCompliance)}`}>
                      SLA {lab.slaCompliance.toFixed(1)}%
                    </Badge>
                    <p className="text-sm font-medium text-slate-800">
                      {formatCurrency(lab.faturamento)}
                    </p>
                  </div>
                </div>

                {/* Barra de progresso SLA */}
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                    <span>Performance SLA</span>
                    <span>{lab.slaCompliance.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${
                        lab.slaCompliance >= 95 ? 'bg-gradient-to-r from-emerald-400 to-emerald-600' :
                        lab.slaCompliance >= 85 ? 'bg-gradient-to-r from-blue-400 to-blue-600' :
                        lab.slaCompliance >= 70 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                        'bg-gradient-to-r from-red-400 to-red-600'
                      }`}
                      style={{ width: `${Math.min(lab.slaCompliance, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Métricas adicionais */}
                <div className="mt-3 pt-3 border-t border-slate-200 grid grid-cols-3 gap-2 text-xs text-slate-600">
                  <div className="text-center">
                    <p>Taxa Entrega</p>
                    <p className="font-medium text-slate-800">{lab.taxa_entrega.toFixed(1)}%</p>
                  </div>
                  <div className="text-center">
                    <p>Atrasados</p>
                    <p className="font-medium text-red-600">{lab.pedidos_atrasados}</p>
                  </div>
                  <div className="text-center">
                    <p>Ticket Médio</p>
                    <p className="font-medium text-blue-600">
                      {formatCurrency(lab.pedidos > 0 ? lab.faturamento / lab.pedidos : 0)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {ranking.length > 0 && (
          <div className="mt-6 p-3 bg-blue-50 rounded-lg">
            <div className="text-center">
              <p className="text-sm text-blue-800 font-medium">
                💫 Líder: {ranking[0]?.nome} com {ranking[0]?.slaCompliance.toFixed(1)}% SLA
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Baseado em SLA Compliance • {ranking.reduce((sum, lab) => sum + lab.pedidos, 0)} pedidos totais
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}