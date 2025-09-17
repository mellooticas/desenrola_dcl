'use client'

import { FinanceChart } from '@/components/dashboard/FinanceChart'
import { useAnaliseFinanceira } from '@/lib/hooks/useDashboardBI'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DollarSign, TrendingUp, Package, Target } from 'lucide-react'
import { useState } from 'react'

export function FinanceSection() {
  const { data: dadosFinanceiros = [], isLoading, error } = useAnaliseFinanceira()
  const [metricaSelecionada, setMetricaSelecionada] = useState<'faturamento' | 'volume' | 'ticket_medio'>('faturamento')
  const [tipoGrafico, setTipoGrafico] = useState<'bar' | 'pie'>('bar')
  
  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        <div className="h-80 bg-gray-100 animate-pulse rounded-lg" />
        <div className="h-80 bg-gray-100 animate-pulse rounded-lg" />
      </div>
    )
  }
  
  if (error) { 
    return ( 
      <Card>
        <CardHeader>
          <CardTitle>Análise Financeira</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">Erro ao carregar análise financeira</p>
        </CardContent>
      </Card>
    )
  }
  
  const totalFaturamento = dadosFinanceiros.reduce((acc, item) => acc + item.faturamento_total, 0)
  const totalVolume = dadosFinanceiros.reduce((acc, item) => acc + item.volume_pedidos, 0)
  const ticketMedioGeral = totalFaturamento / totalVolume
  
  // Categoria mais rentável
  const categoriaMaisRentavel = dadosFinanceiros.reduce((prev, current) => 
    prev.ticket_medio > current.ticket_medio ? prev : current
  )
  
  // Categoria com maior volume
  const categoriaMaiorVolume = dadosFinanceiros.reduce((prev, current) => 
    prev.volume_pedidos > current.volume_pedidos ? prev : current
  )
  
  return (
    <div className="space-y-6">
      {/* Resumo Financeiro */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <DollarSign className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Faturamento Total</p>
                <p className="text-2xl font-bold">R$ {(totalFaturamento || 0).toLocaleString('pt-BR')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Package className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Volume Total</p>
                <p className="text-2xl font-bold">{totalVolume}</p>
                <p className="text-xs text-muted-foreground">pedidos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Target className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ticket Médio</p>
                <p className="text-2xl font-bold">R$ {(ticketMedioGeral || 0).toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-8 h-8 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Categorias</p>
                <p className="text-2xl font-bold">{dadosFinanceiros.length}</p>
                <p className="text-xs text-muted-foreground">ativas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        {/* Gráfico Principal */}
        <div className="space-y-4">
          {/* Controles do Gráfico */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Análise por Categoria</CardTitle>
                  <CardDescription>Performance financeira por tipo de lente</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={tipoGrafico === 'bar' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTipoGrafico('bar')}
                  >
                    Barras
                  </Button>
                  <Button
                    variant={tipoGrafico === 'pie' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTipoGrafico('pie')}
                  >
                    Pizza
                  </Button>
                </div>
              </div>
              
              <div className="flex gap-2 mt-2">
                <Button
                  variant={metricaSelecionada === 'faturamento' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setMetricaSelecionada('faturamento')}
                >
                  Faturamento
                </Button>
                <Button
                  variant={metricaSelecionada === 'volume' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setMetricaSelecionada('volume')}
                >
                  Volume
                </Button>
                <Button
                  variant={metricaSelecionada === 'ticket_medio' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setMetricaSelecionada('ticket_medio')}
                >
                  Ticket Médio
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <FinanceChart
                data={dadosFinanceiros}
                type={tipoGrafico}
                metric={metricaSelecionada}
                height={250}
              />
            </CardContent>
          </Card>
        </div>
        
        {/* Detalhes por Categoria */}
        <Card>
          <CardHeader>
            <CardTitle>Detalhes por Categoria</CardTitle>
            <CardDescription>Análise detalhada de cada tipo</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dadosFinanceiros.map((categoria, index) => (
                <div key={categoria.categoria} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">{categoria.categoria}</h4>
                    <Badge variant="outline">
                      #{index + 1}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Volume:</span>
                      <span className="ml-2 font-medium">{categoria.volume_pedidos}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Faturamento:</span>
                      <span className="ml-2 font-medium">R$ {(categoria.faturamento_total || 0).toLocaleString('pt-BR')}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Ticket Médio:</span>
                      <span className="ml-2 font-medium">R$ {(categoria.ticket_medio || 0).toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">SLA:</span>
                      <span className="ml-2 font-medium">{categoria.sla_compliance}%</span>
                    </div>
                  </div>
                  
                  <div className="mt-2 text-xs text-muted-foreground">
                    Lab principal: {categoria.laboratorio_mais_usado}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Insights Financeiros */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50">
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4">💡 Insights Financeiros</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-medium text-green-700 mb-2">Oportunidades</h4>
              <ul className="space-y-1 text-sm">
                <li>• <strong>{categoriaMaisRentavel.categoria}</strong> tem maior ticket médio (R$ {(categoriaMaisRentavel.ticket_medio || 0).toFixed(2)})</li>
                <li>• <strong>{categoriaMaiorVolume.categoria}</strong> representa {(((categoriaMaiorVolume.volume_pedidos || 0) / (totalVolume || 1)) * 100).toFixed(1)}% do volume</li>
                <li>• Ticket médio geral pode aumentar focando em {categoriaMaisRentavel.categoria}</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-blue-700 mb-2">Recomendações</h4>
              <ul className="space-y-1 text-sm">
                <li>• Ampliar parceria com {categoriaMaisRentavel.laboratorio_mais_usado}</li>
                <li>• Promover {categoriaMaisRentavel.categoria} para aumentar margem</li>
                <li>• Revisar pricing de categorias com menor ticket</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}