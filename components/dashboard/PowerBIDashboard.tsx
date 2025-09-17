'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BarChart3, TrendingUp, Target, Users, DollarSign, Activity, Filter } from 'lucide-react'

// Importar todos os componentes PowerBI
import { PowerBITreemap } from './PowerBITreemap'
import { PowerBIHeatmap } from './PowerBIHeatmap'
import { PowerBIGauge } from './PowerBIGauge'
import { PowerBIWaterfall } from './PowerBIWaterfall'
import { PowerBIFunnel } from './PowerBIFunnel'

import type { DashboardFilters } from './FiltrosPeriodo'

interface PowerBIDashboardProps { 
  filters?: DashboardFilters
}

export function PowerBIDashboard({ filters }: PowerBIDashboardProps) {
  return (
    <div className="space-y-6">
      {/* Header PowerBI Style */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-blue-600" />
            Dashboard Analytics PowerBI
          </h1>
          <p className="text-gray-600 mt-1">
            Visualizações avançadas e insights automáticos para gestão de laboratórios
          </p>
        </div>
        
        <div className="flex gap-2">
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Activity className="w-4 h-4 mr-1" />
            Tempo Real
          </Badge>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            ✅ Conectado
          </Badge>
        </div>
      </div>

      {/* Tabs de Visualizações */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="financial" className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Financeiro
          </TabsTrigger>
          <TabsTrigger value="operational" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Operacional
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Avançado
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Visão Geral */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-6 gap-6">
            {/* Gauges de KPIs */}
            <PowerBIGauge filters={filters} />
            
            {/* Treemap de Laboratórios */}
            <PowerBITreemap filters={filters} />
          </div>
        </TabsContent>

        {/* Tab 2: Performance */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {/* Heatmap de Performance Mensal */}
            <PowerBIHeatmap filters={filters} />
            
            {/* Cards de Insights */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="bg-gradient-to-r from-blue-50 to-blue-100">
                <CardHeader>
                  <CardTitle className="text-blue-800 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Tendência de SLA
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-900">📈 +2.3%</div>
                  <p className="text-sm text-blue-700">Melhoria nos últimos 3 meses</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-green-50 to-green-100">
                <CardHeader>
                  <CardTitle className="text-green-800 flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Meta Atingida
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-900">🎯 85%</div>
                  <p className="text-sm text-green-700">dos laboratórios acima de 80%</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-purple-50 to-purple-100">
                <CardHeader>
                  <CardTitle className="text-purple-800 flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Top Performer
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-900">🏆 LAB-001</div>
                  <p className="text-sm text-purple-700">SLA: 96.8% | Lead Time: 2.1d</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Tab 3: Financeiro */}
        <TabsContent value="financial" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {/* Waterfall Chart */}
            <PowerBIWaterfall filters={filters} />
            
            {/* Métricas Financeiras */}
            <div className="grid grid-cols-4 gap-4">
              <Card className="text-center">
                <CardHeader>
                  <CardTitle className="text-green-600">💰 Receita Total</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-800">R$ 2.8M</div>
                  <p className="text-sm text-green-600">+12.5% vs mês anterior</p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <CardTitle className="text-blue-600">📊 Ticket Médio</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-800">R$ 450</div>
                  <p className="text-sm text-blue-600">+3.2% vs mês anterior</p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <CardTitle className="text-purple-600">🎯 Margem</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-800">28.5%</div>
                  <p className="text-sm text-purple-600">Meta: 25%</p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <CardTitle className="text-orange-600">⚡ ROI</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-800">185%</div>
                  <p className="text-sm text-orange-600">Retorno sobre investimento</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Tab 4: Operacional */}
        <TabsContent value="operational" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {/* Funil de Conversão */}
            <PowerBIFunnel filters={filters} />
            
            {/* KPIs Operacionais */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="bg-orange-50">
                <CardHeader>
                  <CardTitle className="text-orange-800">⏱️ Lead Time Médio</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-900">3.2 dias</div>
                  <p className="text-sm text-orange-700">Meta: ≤ 3.5 dias</p>
                  <div className="mt-2 bg-orange-200 rounded-full h-2">
                    <div className="bg-orange-500 h-2 rounded-full" style={{width: '91%'}}></div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-red-50">
                <CardHeader>
                  <CardTitle className="text-red-800">🚨 Pedidos em Atraso</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-900">23</div>
                  <p className="text-sm text-red-700">-15% vs semana anterior</p>
                  <div className="mt-2 bg-red-200 rounded-full h-2">
                    <div className="bg-red-500 h-2 rounded-full" style={{width: '15%'}}></div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-green-50">
                <CardHeader>
                  <CardTitle className="text-green-800">✅ Taxa de Entrega</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-900">94.2%</div>
                  <p className="text-sm text-green-700">Meta: ≥ 90%</p>
                  <div className="mt-2 bg-green-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{width: '94%'}}></div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Tab 5: Análises Avançadas */}
        <TabsContent value="advanced" className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Análises Combinadas */}
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-purple-600" />
                  Matriz de Correlação: Performance vs Volume
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div className="p-4 bg-red-100 rounded">
                    <div className="font-bold text-red-800">Alto Volume</div>
                    <div className="font-bold text-red-800">Baixa Performance</div>
                    <div className="text-sm text-red-600 mt-2">3 laboratórios</div>
                    <div className="text-xs text-red-500">Necessita intervenção</div>
                  </div>
                  
                  <div className="p-4 bg-yellow-100 rounded">
                    <div className="font-bold text-yellow-800">Alto Volume</div>
                    <div className="font-bold text-yellow-800">Alta Performance</div>
                    <div className="text-sm text-yellow-600 mt-2">8 laboratórios</div>
                    <div className="text-xs text-yellow-500">Excelentes parceiros</div>
                  </div>
                  
                  <div className="p-4 bg-blue-100 rounded">
                    <div className="font-bold text-blue-800">Baixo Volume</div>
                    <div className="font-bold text-blue-800">Alta Performance</div>
                    <div className="text-sm text-blue-600 mt-2">12 laboratórios</div>
                    <div className="text-xs text-blue-500">Potencial crescimento</div>
                  </div>
                  
                  <div className="p-4 bg-gray-100 rounded">
                    <div className="font-bold text-gray-800">Baixo Volume</div>
                    <div className="font-bold text-gray-800">Baixa Performance</div>
                    <div className="text-sm text-gray-600 mt-2">5 laboratórios</div>
                    <div className="text-xs text-gray-500">Revisar parceria</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}