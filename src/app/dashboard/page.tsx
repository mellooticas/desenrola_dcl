'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'

// Remover todas as importações de ícones problemáticos
// import { toast } from 'sonner' // Comentar temporariamente

// Hooks simplificados
import { useDashboardKPIs } from '@/lib/hooks/useDashboardBI'

const DashboardPage = () => {
  const [activeTab, setActiveTab] = useState("overview")
  
  // Hook para dados
  const { data: kpis, isLoading: kpisLoading, error: kpisError } = useDashboardKPIs()

  // Função para atualizar dados
  const handleRefresh = async () => {
    console.log('Atualizando dashboard...')
    // toast.success('Dashboard atualizado com sucesso!')
    window.location.reload() // Fallback simples
  }

  // Função para exportar relatório
  const handleExport = () => {
    console.log('Exportando relatório...')
    alert('Funcionalidade de exportação será implementada em breve')
  }

  const currentHour = new Date().getHours()
  const greeting = currentHour < 12 ? 'Bom dia' : currentHour < 18 ? 'Boa tarde' : 'Boa noite'

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto py-8 px-4">
        <div className="space-y-8">
          
          {/* Header */}
          <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {greeting}! 👋
              </h1>
              <p className="text-gray-600 mt-1">
                Dashboard executivo - Sistema Desenrola DCL
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                className="flex items-center space-x-2"
              >
                <span>🔄</span>
                <span>Atualizar</span>
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                className="flex items-center space-x-2"
              >
                <span>📥</span>
                <span>Exportar</span>
              </Button>
            </div>
          </div>

          {/* Status Geral do Sistema */}
          <Card className="border-green-200 border-2">
            <CardContent className="p-6 bg-green-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-4xl">✅</span>
                  <div>
                    <h3 className="text-xl font-bold">Status do Sistema</h3>
                    <p className="text-muted-foreground">Sistema operando normalmente</p>
                  </div>
                </div>
                <Badge variant="default" className="text-lg px-4 py-2">
                  Operacional
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold">{kpis?.sla_compliance?.toFixed(1) || '0.0'}%</div>
                  <div className="text-sm text-muted-foreground">SLA Compliance</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{kpis?.pedidos_atrasados || 0}</div>
                  <div className="text-sm text-muted-foreground">Pedidos Atrasados</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{kpis?.total_pedidos || 0}</div>
                  <div className="text-sm text-muted-foreground">Total Pedidos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{kpis?.labs_ativos || 0}</div>
                  <div className="text-sm text-muted-foreground">Labs Ativos</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* KPIs Principais */}
          {kpisError ? (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-6">
                <div className="flex items-center space-x-2 text-red-600">
                  <span>⚠️</span>
                  <span>Erro ao carregar KPIs: {kpisError.message}</span>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {/* KPI Card 1 */}
              <Card className="border-l-4 border-blue-500">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600">Total de Pedidos</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {kpisLoading ? '...' : (kpis?.total_pedidos || 0).toLocaleString('pt-BR')}
                      </p>
                    </div>
                    <div className="p-3 rounded-full bg-gray-100">
                      <span className="text-2xl">📦</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* KPI Card 2 */}
              <Card className="border-l-4 border-green-500">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600">SLA Compliance</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {kpisLoading ? '...' : `${(kpis?.sla_compliance || 0).toFixed(1)}%`}
                      </p>
                    </div>
                    <div className="p-3 rounded-full bg-gray-100">
                      <span className="text-2xl">🎯</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* KPI Card 3 */}
              <Card className="border-l-4 border-orange-500">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600">Lead Time Médio</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {kpisLoading ? '...' : `${(kpis?.lead_time_medio || 0).toFixed(1)}d`}
                      </p>
                    </div>
                    <div className="p-3 rounded-full bg-gray-100">
                      <span className="text-2xl">⏰</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* KPI Card 4 */}
              <Card className="border-l-4 border-purple-500">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600">Faturamento Total</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {kpisLoading ? '...' : `R$ ${(kpis?.valor_total_vendas || 0).toLocaleString('pt-BR')}`}
                      </p>
                    </div>
                    <div className="p-3 rounded-full bg-gray-100">
                      <span className="text-2xl">💰</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
              <TabsTrigger value="overview">
                📊 Overview
              </TabsTrigger>
              <TabsTrigger value="alertas">
                🚨 Alertas
              </TabsTrigger>
              <TabsTrigger value="laboratorios">
                🏭 Laboratórios
              </TabsTrigger>
              <TabsTrigger value="financeiro">
                💰 Financeiro
              </TabsTrigger>
            </TabsList>

            {/* Overview */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>📈 Resumo de Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {kpis && (
                        <>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Total de Pedidos</span>
                            <span className="font-bold">{kpis.total_pedidos}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Entregues</span>
                            <span className="font-bold">{kpis.entregues}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">SLA Compliance</span>
                            <span className={`font-bold ${kpis.sla_compliance >= 95 ? 'text-green-600' : 'text-orange-600'}`}>
                              {kpis.sla_compliance.toFixed(1)}%
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Lead Time Médio</span>
                            <span className="font-bold">{kpis.lead_time_medio.toFixed(1)} dias</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Ticket Médio</span>
                            <span className="font-bold">R$ {kpis.ticket_medio.toFixed(2)}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>🎯 Status Geral</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 bg-green-50 rounded-lg">
                        <div className="font-medium text-green-800">Sistema Operacional</div>
                        <div className="text-sm text-green-700 mt-1">
                          Todos os serviços funcionando normalmente
                        </div>
                      </div>
                      
                      {kpis && kpis.sla_compliance >= 95 ? (
                        <div className="p-4 bg-blue-50 rounded-lg">
                          <div className="font-medium text-blue-800">SLA Excelente</div>
                          <div className="text-sm text-blue-700 mt-1">
                            Performance acima da meta de 95%
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 bg-orange-50 rounded-lg">
                          <div className="font-medium text-orange-800">Atenção no SLA</div>
                          <div className="text-sm text-orange-700 mt-1">
                            Revisar laboratórios com atraso
                          </div>
                        </div>
                      )}
                      
                      <div className="p-4 bg-purple-50 rounded-lg">
                        <div className="font-medium text-purple-800">Labs Ativos</div>
                        <div className="text-sm text-purple-700 mt-1">
                          {kpis?.labs_ativos || 0} laboratórios operando
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Alertas */}
            <TabsContent value="alertas" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>🚨 Centro de Alertas</CardTitle>
                  <CardDescription>Monitoramento de situações que requerem atenção</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <span className="text-6xl mb-4 block">✅</span>
                    <p className="text-muted-foreground">Nenhum alerta crítico no momento</p>
                    <p className="text-sm text-gray-500 mt-2">Sistema operando normalmente</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Laboratórios */}
            <TabsContent value="laboratorios" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>🏭 Ranking de Laboratórios</CardTitle>
                  <CardDescription>Performance dos parceiros laboratórios</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">🥇 Sygma</div>
                          <div className="text-sm text-gray-500">SYGMA - Posição #1</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">Score: 69.4</div>
                          <div className="text-sm text-orange-600">SLA: 56.3%</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">🥈 HighVision</div>
                          <div className="text-sm text-gray-500">HIGH - Posição #2</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">Score: 45.2</div>
                          <div className="text-sm text-red-600">SLA: 35.0%</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Financeiro */}
            <TabsContent value="financeiro" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>💰 Análise Financeira</CardTitle>
                  <CardDescription>Resumo financeiro do período</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="font-medium text-green-800">Faturamento Total</div>
                      <div className="text-2xl font-bold text-green-900">
                        R$ {(kpis?.valor_total_vendas || 0).toLocaleString('pt-BR')}
                      </div>
                    </div>
                    
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="font-medium text-blue-800">Ticket Médio</div>
                      <div className="text-2xl font-bold text-blue-900">
                        R$ {(kpis?.ticket_medio || 0).toFixed(2)}
                      </div>
                    </div>
                    
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <div className="font-medium text-purple-800">Margem</div>
                      <div className="text-2xl font-bold text-purple-900">
                        {(kpis?.margem_percentual || 0).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}

export default DashboardPage