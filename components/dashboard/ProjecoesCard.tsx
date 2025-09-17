'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, DollarSign, Package, Clock } from 'lucide-react'
import type { Projecoes } from '@/lib/types/dashboard-bi'

interface ProjecoesCardProps {
  projecoes: Projecoes
  title?: string
}

export function ProjecoesCard({ 
  projecoes, 
  title = "Projeções Próximo Mês" 
}: ProjecoesCardProps) {
  
  const getTrendIcon = (percent: number) => {
    if (percent > 0) return <TrendingUp className="w-4 h-4 text-green-600" />
    if (percent < 0) return <TrendingDown className="w-4 h-4 text-red-600" />
    return null
  }
  
  const getTrendColor = (percent: number) => {
    if (percent > 0) return 'text-green-600'
    if (percent < 0) return 'text-red-600'
    return 'text-gray-600'
  }
  
  const formatCurrency = (value: number) => {
    return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          {title}
        </CardTitle>
        <Badge variant="outline">
          Baseado em tendências históricas
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Pedidos Projetados */}
          <div className="p-4 border rounded-lg bg-blue-50">
            <div className="flex items-center gap-2 mb-2">
              <Package className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium">Pedidos Estimados</span>
            </div>
            <div className="text-2xl font-bold text-blue-700">
              {projecoes.pedidos_projetados}
            </div>
            {projecoes.crescimento_percentual_mensal !== 0 && (
              <div className={`flex items-center gap-1 text-sm ${getTrendColor(projecoes.crescimento_percentual_mensal)}`}>
                {getTrendIcon(projecoes.crescimento_percentual_mensal)}
                <span>{Math.abs(projecoes.crescimento_percentual_mensal)}% vs mês atual</span>
              </div>
            )}
          </div>
          
          {/* Faturamento Projetado */}
          <div className="p-4 border rounded-lg bg-green-50">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium">Faturamento Estimado</span>
            </div>
            <div className="text-2xl font-bold text-green-700">
              {formatCurrency(projecoes.faturamento_projetado)}
            </div>
            <div className="text-xs text-gray-600 mt-1">
              Ticket médio: {formatCurrency(projecoes.ticket_projetado)}
            </div>
          </div>
          
          {/* Lead Time Projetado */}
          <div className="p-4 border rounded-lg bg-orange-50">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-orange-600" />
              <span className="text-sm font-medium">Lead Time Esperado</span>
            </div>
            <div className="text-2xl font-bold text-orange-700">
              {projecoes.lead_time_projetado} dias
            </div>
            <div className="text-xs text-gray-600 mt-1">
              Baseado em tendência histórica
            </div>
          </div>
          
          {/* Insights de Crescimento */}
          <div className="p-4 border rounded-lg bg-purple-50">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium">Tendência</span>
            </div>
            <div className="space-y-1">
              <div className="text-sm">
                <span className="font-medium">Crescimento: </span>
                <span className={getTrendColor(projecoes.crescimento_percentual_mensal)}>
                  {projecoes.crescimento_percentual_mensal > 0 ? '+' : ''}{projecoes.crescimento_percentual_mensal}%
                </span>
              </div>
              <div className="text-xs text-gray-600">
                {projecoes.crescimento_percentual_mensal > 5 ? 'Crescimento acelerado' :
                 projecoes.crescimento_percentual_mensal > 0 ? 'Crescimento estável' :
                 projecoes.crescimento_percentual_mensal > -5 ? 'Ligeira queda' :
                 'Queda significativa'}
              </div>
            </div>
          </div>
        </div>
        
        {/* Disclaimer */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg border-l-4 border-blue-500">
          <p className="text-xs text-gray-600">
            <strong>Nota:</strong> Projeções baseadas em análise de tendências dos últimos 6 meses. 
            Resultados reais podem variar devido a fatores sazonais e mudanças no mercado.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}