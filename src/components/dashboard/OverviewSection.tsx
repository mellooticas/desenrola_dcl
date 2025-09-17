'use client'

import { KPISection } from './KPISection'
import { TrendsChart } from '@/components/dashboard/TrendsChart'
import { useEvolucaoMensal, useDashboardKPIs } from '@/lib/hooks/useDashboardBI'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, AlertTriangle, TrendingUp, Activity } from 'lucide-react'
import type { DashboardFilters } from '@/lib/hooks/useDashboardBI'

interface OverviewSectionProps {
  filters?: DashboardFilters
}

export function OverviewSection({ filters }: OverviewSectionProps) {
  const { data: evolucao = [] } = useEvolucaoMensal(filters)
  const { data: kpis } = useDashboardKPIs(filters)
  
  // Pegar últimos 6 meses para o overview
  const dadosRecentes = evolucao.slice(-6)
  
  // Status geral do sistema
  const getSystemStatus = () => {
    if (!kpis) return 'unknown'
    
    const slaOk = (kpis.sla_compliance || 0) >= 95
    const atrasosOk = (kpis.pedidos_atrasados || 0) <= 5
    const volumeOk = (kpis.total_pedidos || 0) > (kpis.total_pedidos_anterior || 0)
    
    if (slaOk && atrasosOk && volumeOk) return 'excellent'
    if (slaOk && atrasosOk) return 'good'
    if (slaOk || atrasosOk) return 'warning'
    return 'critical'
  }
  
  const systemStatus = getSystemStatus()
  
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'excellent':
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          label: 'Excelente',
          description: 'Sistema operando acima das expectativas'
        }
      case 'good':
        return {
          icon: CheckCircle,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          label: 'Bom',
          description: 'Sistema operando normalmente'
        }
      case 'warning':
        return {
          icon: AlertTriangle,
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          label: 'Atenção',
          description: 'Alguns indicadores precisam de atenção'
        }
      case 'critical':
        return {
          icon: AlertTriangle,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          label: 'Crítico',
          description: 'Ação imediata necessária'
        }
      default:
        return {
          icon: Activity,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          label: 'Desconhecido',
          description: 'Carregando status do sistema'
        }
    }
  }
  
  const statusConfig = getStatusConfig(systemStatus)
  const StatusIcon = statusConfig.icon
  
  return (
    <div className="space-y-6">
      {/* Status Geral do Sistema */}
      <Card className={`${statusConfig.borderColor} border-2`}>
        <CardContent className={`p-6 ${statusConfig.bgColor}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <StatusIcon className={`w-12 h-12 ${statusConfig.color}`} />
              <div>
                <h3 className="text-xl font-bold">Status do Sistema</h3>
                <p className="text-muted-foreground">{statusConfig.description}</p>
              </div>
            </div>
            <Badge 
              variant={systemStatus === 'excellent' || systemStatus === 'good' ? 'default' : 'destructive'}
              className="text-lg px-4 py-2"
            >
              {statusConfig.label}
            </Badge>
          </div>
          
          {kpis && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="text-center">
                <div className="text-2xl font-bold">{(kpis.sla_compliance || 0).toFixed(1)}%</div>
                <div className="text-sm text-muted-foreground">SLA Compliance</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{kpis.pedidos_atrasados || 0}</div>
                <div className="text-sm text-muted-foreground">Pedidos Atrasados</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{(kpis.lead_time_medio || 0).toFixed(1)}d</div>
                <div className="text-sm text-muted-foreground">Lead Time Médio</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{kpis.labs_ativos || 0}</div>
                <div className="text-sm text-muted-foreground">Labs Ativos</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* KPIs Principais */}
      <KPISection />
      
      {/* Gráfico de Tendência Resumido */}
      <div className="grid gap-6 md:grid-cols-2">
        <TrendsChart 
          data={dadosRecentes}
          title="Tendência Recente"
          description="Últimos 6 meses - Volume e SLA"
          type="composed"
          showSLA={true}
          height={250}
        />
        
        <Card> 
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Resumo Executivo
            </CardTitle> 
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {kpis && (
                <>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="font-medium text-blue-800">Performance Geral</div>
                    <div className="text-sm text-blue-700 mt-1">
                      {(kpis.variacao_pedidos || 0) > 0 ? 'Crescimento' : 'Queda'} de {Math.abs(kpis.variacao_pedidos || 0)}% no volume vs mês anterior
                    </div>
                  </div>
                  
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="font-medium text-green-800">Qualidade</div>
                    <div className="text-sm text-green-700 mt-1">
                      SLA de {(kpis.sla_compliance || 0).toFixed(1)}% - {(kpis.sla_compliance || 0) >= 95 ? 'Acima da meta' : 'Abaixo da meta de 95%'}
                    </div>
                  </div>
                  
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <div className="font-medium text-purple-800">Financeiro</div>
                    <div className="text-sm text-purple-700 mt-1">
                      Faturamento de R$ {(kpis.valor_total_vendas || 0).toLocaleString('pt-BR')} no período
                    </div>
                  </div>
                </>
              )}
              
              {dadosRecentes.length > 0 && (
                <div className="p-3 bg-orange-50 rounded-lg">
                  <div className="font-medium text-orange-800">Próximos Passos</div>
                  <div className="text-sm text-orange-700 mt-1">
                    {systemStatus === 'excellent' ? 'Manter performance atual e buscar otimizações' :
                     systemStatus === 'good' ? 'Foco em melhorar indicadores de qualidade' :
                     systemStatus === 'warning' ? 'Revisar processos e alertas ativos' :
                     'Ação imediata necessária - verificar alertas críticos'}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}