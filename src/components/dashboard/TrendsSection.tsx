'use client'

import { TrendsChart } from '@/components/dashboard/TrendsChart'
import { ProjecoesCard } from '@/components/dashboard/ProjecoesCard'
import { InsightsPanel } from '@/components/dashboard/InsightsPanel'
import { useEvolucaoMensal, useProjecoes, useInsights } from '@/lib/hooks/useDashboardBI'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TrendingUp, Calendar, Brain } from 'lucide-react'
import { useState } from 'react'

export function TrendsSection() {
  const { data: evolucao = [], isLoading: loadingEvolucao } = useEvolucaoMensal()
  const { data: projecoes, isLoading: loadingProjecoes } = useProjecoes()
  const { data: insights, isLoading: loadingInsights } = useInsights()
  
  const [periodoSelecionado, setPeriodoSelecionado] = useState<'3m' | '6m' | '12m'>('6m')
  
  // Filtrar dados baseado no período selecionado
  const filtrarPorPeriodo = (dados: typeof evolucao) => {
    const mesesAtras = periodoSelecionado === '3m' ? 3 : periodoSelecionado === '6m' ? 6 : 12
    const dataCorte = new Date()
    dataCorte.setMonth(dataCorte.getMonth() - mesesAtras)
    
    return dados.filter(item => {
      const [ano, mes] = item.ano_mes.split('-').map(Number)
      const dataItem = new Date(ano, mes - 1)
      return dataItem >= dataCorte
    })
  }
  
  const dadosFiltrados = filtrarPorPeriodo(evolucao)
  
  if (loadingEvolucao || loadingProjecoes || loadingInsights) {
    return (
      <div className="grid gap-6">
        <div className="h-80 bg-gray-100 animate-pulse rounded-lg" />
        <div className="grid gap-6 md:grid-cols-2">
          <div className="h-60 bg-gray-100 animate-pulse rounded-lg" />
          <div className="h-60 bg-gray-100 animate-pulse rounded-lg" />
        </div>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      {/* Gráfico de Tendências Principais */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Evolução Temporal
              </CardTitle>
            </div>
            <div className="flex gap-2">
              <Button
                variant={periodoSelecionado === '3m' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPeriodoSelecionado('3m')}
              >
                3 meses
              </Button>
              <Button
                variant={periodoSelecionado === '6m' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPeriodoSelecionado('6m')}
              >
                6 meses
              </Button>
              <Button
                variant={periodoSelecionado === '12m' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPeriodoSelecionado('12m')}
              >
                12 meses
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <TrendsChart 
            data={dadosFiltrados}
            title=""
            description={`Tendências dos últimos ${periodoSelecionado === '3m' ? '3' : periodoSelecionado === '6m' ? '6' : '12'} meses`}
            type="composed"
            showSLA={true}
            height={350}
          />
        </CardContent>
      </Card>
      
      <div className="grid gap-6 md:grid-cols-2">
        {/* Projeções */}
        <div className="space-y-6">
          {projecoes && projecoes.length > 0 && <ProjecoesCard projecoes={projecoes[0]} />}
          
          {/* Análise de Sazonalidade */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-600" />
                Análise Sazonal
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dadosFiltrados.length > 0 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {Math.max(...dadosFiltrados.map(d => d.total_pedidos))}
                      </div>
                      <div className="text-sm text-blue-600">Pico de Volume</div>
                      <div className="text-xs text-gray-600 mt-1">
                        {dadosFiltrados.find(d => d.total_pedidos === Math.max(...dadosFiltrados.map(d => d.total_pedidos)))?.ano_mes}
                      </div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {Math.max(...dadosFiltrados.map(d => d.sla_compliance)).toFixed(1)}%
                      </div>
                      <div className="text-sm text-green-600">Melhor SLA</div>
                      <div className="text-xs text-gray-600 mt-1">
                        {dadosFiltrados.find(d => d.sla_compliance === Math.max(...dadosFiltrados.map(d => d.sla_compliance)))?.ano_mes}
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <h4 className="font-medium mb-2">Tendência Geral</h4>
                    <div className="text-sm space-y-1">
                      {dadosFiltrados.length >= 2 && (
                        <>
                          <div>
                            Volume: {dadosFiltrados[dadosFiltrados.length - 1].total_pedidos > dadosFiltrados[0].total_pedidos ? '📈 Crescendo' : '📉 Declinando'}
                          </div>
                          <div>
                            SLA: {dadosFiltrados[dadosFiltrados.length - 1].sla_compliance > dadosFiltrados[0].sla_compliance ? '📈 Melhorando' : '📉 Piorando'}
                          </div>
                          <div>
                            Lead Time: {dadosFiltrados[dadosFiltrados.length - 1].lead_time_medio < dadosFiltrados[0].lead_time_medio ? '📈 Melhorando' : '📉 Piorando'}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Insights Automáticos */}
        <div>
          {insights && (
            <InsightsPanel 
              insights={insights.insights || []}
              title="Insights Automáticos"
              maxInsights={8}
            />
          )}
        </div>
      </div>
      
      {/* Análise Comparativa */}
      {dadosFiltrados.length >= 2 && (
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-600" />
              Análise Comparativa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-1">Variação Volume</div>
                <div className={`text-2xl font-bold ${
                  dadosFiltrados[dadosFiltrados.length - 1].total_pedidos > dadosFiltrados[0].total_pedidos 
                    ? 'text-green-600' : 'text-red-600'
                }`}>
                  {(((dadosFiltrados[dadosFiltrados.length - 1].total_pedidos - dadosFiltrados[0].total_pedidos) / dadosFiltrados[0].total_pedidos) * 100).toFixed(1)}%
                </div>
                <div className="text-xs text-gray-500">vs início do período</div>
              </div>
              
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-1">Variação SLA</div>
                <div className={`text-2xl font-bold ${
                  dadosFiltrados[dadosFiltrados.length - 1].sla_compliance > dadosFiltrados[0].sla_compliance 
                    ? 'text-green-600' : 'text-red-600'
                }`}>
                  {(dadosFiltrados[dadosFiltrados.length - 1].sla_compliance - dadosFiltrados[0].sla_compliance).toFixed(1)}pp
                </div>
                <div className="text-xs text-gray-500">pontos percentuais</div>
              </div>
              
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-1">Variação Lead Time</div>
                <div className={`text-2xl font-bold ${
                  dadosFiltrados[dadosFiltrados.length - 1].lead_time_medio < dadosFiltrados[0].lead_time_medio 
                    ? 'text-green-600' : 'text-red-600'
                }`}>
                  {(dadosFiltrados[dadosFiltrados.length - 1].lead_time_medio - dadosFiltrados[0].lead_time_medio).toFixed(1)}d
                </div>
                <div className="text-xs text-gray-500">dias de diferença</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}