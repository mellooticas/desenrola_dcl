'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// Componentes do dashboard profissionais
import { FiltrosPeriodo, type DashboardFilters } from '@/components/dashboard/FiltrosPeriodo'
import { MetricasGeraisReal } from '@/components/dashboard/MetricasGeraisReal'
import { GraficoLeadTimeReal } from '@/components/dashboard/GraficoLeadTimeReal'
import { TrendsChartReal } from '@/components/dashboard/TrendsChartReal'
import { EvolucaoTemporalMelhorada } from '@/components/dashboard/EvolucaoTemporalMelhorada'
import { DashboardFinanceiroCompleto } from '@/components/dashboard/DashboardFinanceiroCompleto'
import { RankingLaboratoriosReal } from '@/components/dashboard/RankingLaboratoriosReal'
import { FinanceChart } from '@/components/dashboard/FinanceChart'
import { AlertsSection } from '@/components/dashboard/AlertsSection'
import SLAIntelligenceDashboard from '@/components/dashboard/SLAIntelligenceDashboard'

// Hook para KPIs (mantendo o existente por compatibilidade)
import { useDashboardKPIs } from '@/lib/hooks/useDashboardBI'

// Tipos para as APIs especializadas
interface AlertaCritico {
  id: string
  tipo: string
  titulo: string
  descricao: string
  severidade: 'baixa' | 'media' | 'alta' | 'critica'
  data_criacao: string
  pedido_id?: string
  loja_id?: string
  laboratorio_id?: string
}

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

interface MetricasFinanceiras {
  receita_total: number
  custo_total: number
  margem_bruta: number
  percentual_margem: number
  quantidade_pedidos: number
  quantidade_total: number
  quantidade_sem_valor: number
  ticket_medio: number
}

const DashboardPage = () => {
  const [activeTab, setActiveTab] = useState("comando")
  
  // Estado para filtros dinâmicos
  const [filters, setFilters] = useState<DashboardFilters>({
    dataInicio: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    dataFim: new Date().toISOString().split('T')[0],
    laboratorio: '',
    classe: '',
    loja: ''
  })
  
  // Estados para as APIs especializadas
  const [alertas, setAlertas] = useState<AlertaCritico[]>([])
  const [performanceLabs, setPerformanceLabs] = useState<PerformanceLab[]>([])
  const [metricas, setMetricas] = useState<MetricasFinanceiras | null>(null)
  const [evolucaoTemporal, setEvolucaoTemporal] = useState([])
  const [loadingData, setLoadingData] = useState(true)
  const [lojas, setLojas] = useState<Array<{ id: string; nome: string }>>([])
  
  // Hook legado (mantido para compatibilidade)
  const { data: kpis, isLoading: kpisLoading, error: kpisError } = useDashboardKPIs()

  // Função para carregar dados das APIs especializadas
  const carregarDadosComandoCenter = async () => {
    try {
      setLoadingData(true)
      
      // Calcular período em dias para compatibilidade com APIs existentes
      const inicio = new Date(filters.dataInicio)
      const fim = new Date(filters.dataFim)
      const periodo = Math.ceil((fim.getTime() - inicio.getTime()) / (1000 * 3600 * 24))
      
      // Construir query params com filtros
      const params = new URLSearchParams({
        periodo: periodo.toString()
      })
      
      if (filters.loja) params.append('loja_id', filters.loja)
      if (filters.laboratorio) params.append('laboratorio_id', filters.laboratorio)
      
      const [alertasRes, performanceRes, financeiroRes] = await Promise.all([
        fetch('/api/dashboard/alertas-criticos'),
        fetch(`/api/dashboard/performance?${params.toString()}`),
        fetch(`/api/dashboard/financeiro?${params.toString()}`)
      ])
      
      if (alertasRes.ok) {
        const alertasData = await alertasRes.json()
        setAlertas(alertasData.alertas || [])
      }
      
      if (performanceRes.ok) {
        const perfData = await performanceRes.json()
        setPerformanceLabs(perfData.performance_laboratorios || [])
      }
      
      if (financeiroRes.ok) {
        const finData = await financeiroRes.json()
        setMetricas(finData.metricas_principais || null)
        setEvolucaoTemporal(finData.evolucao_temporal || [])
      }
      
    } catch (error) {
      console.error('Erro ao carregar dados do comando center:', error)
    } finally {
      setLoadingData(false)
    }
  }

  // Carregar dados na inicialização e quando mudar filtros
  useEffect(() => {
    carregarDadosComandoCenter()
    carregarLojas()
  }, [filters])

  // Carregar lista de lojas
  const carregarLojas = async () => {
    try {
      const response = await fetch('/api/lojas')
      if (response.ok) {
        const data = await response.json()
        setLojas(data.lojas || [])
      }
    } catch (error) {
      console.error('Erro ao carregar lojas:', error)
    }
  }

  // Auto-refresh a cada 60 segundos (reduzido para não sobrecarregar)
  useEffect(() => {
    const interval = setInterval(carregarDadosComandoCenter, 60000)
    return () => clearInterval(interval)
  }, [filters])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const getSeverityColor = (severidade?: string) => {
    switch (severidade) {
      case 'critica': return 'bg-red-100 border-red-500 text-red-800'
      case 'alta': return 'bg-orange-100 border-orange-500 text-orange-800'
      case 'media': return 'bg-yellow-100 border-yellow-500 text-yellow-800'
      default: return 'bg-blue-100 border-blue-500 text-blue-800'
    }
  }

  const currentHour = new Date().getHours()
  const greeting = currentHour < 12 ? 'Bom dia' : currentHour < 18 ? 'Boa tarde' : 'Boa noite'

  return (
    <div className="space-y-6">
          
          {/* Header do Centro de Comando */}
          <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <span className="text-2xl">🎛️</span>
                Centro de Comando DCL
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                {greeting}! Monitoramento executivo com dados em tempo real
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <Button 
                onClick={carregarDadosComandoCenter} 
                disabled={loadingData}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-md"
              >
                {loadingData ? '🔄 Atualizando...' : '🔄 Atualizar'}
              </Button>
            </div>
          </div>

          {/* Filtros Dinâmicos */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
            <FiltrosPeriodo filters={filters} onFiltersChange={setFilters} />
          </div>

          {/* Status de Conexão */}
          <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-xl">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-800 dark:text-green-300 font-medium">Sistema Online</span>
              {Object.keys(filters).some(key => filters[key as keyof DashboardFilters]) && (
                <Badge variant="outline" className="ml-2">Filtros Ativos</Badge>
              )}
            </div>
            <span className="text-green-700 dark:text-green-400 text-sm">
              Última atualização: {new Date().toLocaleTimeString('pt-BR')}
            </span>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-1 rounded-xl">
              <TabsTrigger value="comando" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white data-[state=active]:shadow-md">🎛️ Comando</TabsTrigger>
              <TabsTrigger value="alertas" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white data-[state=active]:shadow-md">🚨 Alertas {alertas.length > 0 && `(${alertas.length})`}</TabsTrigger>
              <TabsTrigger value="sla" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white data-[state=active]:shadow-md">🎯 SLA Intelligence</TabsTrigger>
              <TabsTrigger value="operacional" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white data-[state=active]:shadow-md">📊 Operacional</TabsTrigger>
              <TabsTrigger value="financeiro" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white data-[state=active]:shadow-md">💰 Financeiro</TabsTrigger>
            </TabsList>

            {/* ABA CENTRO DE COMANDO - Visão Consolidada com Gráficos */}
            <TabsContent value="comando" className="space-y-6">
              
              {/* Métricas Principais Profissionais */}
              <MetricasGeraisReal metricas={metricas || undefined} performanceLabs={performanceLabs} />
              
              {/* Grid de Gráficos Principais */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Evolução Temporal Melhorada */}
                <EvolucaoTemporalMelhorada filters={filters} />

                {/* Lead Time por Laboratório */}
                <GraficoLeadTimeReal filters={filters} performanceLabs={performanceLabs} />

              </div>

              {/* Ranking e Performance */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RankingLaboratoriosReal filters={filters} performanceLabs={performanceLabs} />
                
                {/* Alertas Críticos */}
                <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                      <span>🚨</span> Status Crítico
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {alertas.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="text-6xl mb-4">✅</div>
                        <p className="text-gray-600 dark:text-gray-400 font-medium">Sistema Operacional</p>
                        <p className="text-sm text-gray-500 dark:text-gray-500">Nenhum alerta crítico ativo</p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent">
                        {alertas.slice(0, 3).map((alerta) => (
                          <Alert key={alerta.id} className={`${getSeverityColor(alerta.severidade)} dark:opacity-90`}>
                            <AlertDescription>
                              <div className="flex items-start justify-between">
                                <div>
                                  <strong className="dark:text-white">{alerta.titulo}</strong>
                                  <p className="text-sm mt-1 dark:text-gray-300">{alerta.descricao}</p>
                                </div>
                                <Badge variant="outline" className="dark:border-white/20 dark:text-white">
                                  {alerta.severidade ? alerta.severidade.toUpperCase() : 'INDEFINIDO'}
                                </Badge>
                              </div>
                            </AlertDescription>
                          </Alert>
                        ))}
                        {alertas.length > 3 && (
                          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                            +{alertas.length - 3} alertas adicionais na aba Alertas
                          </p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

            </TabsContent>

            {/* ABA ALERTAS - Seção Profissional */}
            <TabsContent value="alertas" className="space-y-6">
              <AlertsSection filters={filters} />
            </TabsContent>

            {/* ABA OPERACIONAL - Com Gráficos e Rankings */}
            <TabsContent value="operacional" className="space-y-6">
              
              {/* Grid de Análise Operacional */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <GraficoLeadTimeReal filters={filters} performanceLabs={performanceLabs} />
                </div>
                <div>
                  <RankingLaboratoriosReal filters={filters} performanceLabs={performanceLabs} />
                </div>
              </div>

              {/* Performance Detalhada dos Laboratórios */}
              <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                    <span>🏭</span> Performance Detalhada - Laboratórios
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Análise completa de performance, SLA e capacidade por laboratório
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {performanceLabs.map((lab) => (
                      <div key={lab.laboratorio_id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-gradient-to-r from-white to-gray-50 dark:from-gray-900/50 dark:to-gray-800/50">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-xl font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
                            🏭 {lab.laboratorio_nome}
                          </h3>
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant={lab.sla_compliance >= 95 ? "default" : lab.sla_compliance >= 80 ? "secondary" : "destructive"}
                              className="text-sm px-3 py-1"
                            >
                              SLA {lab.sla_compliance.toFixed(1)}%
                            </Badge>
                            <Badge variant="outline">
                              {lab.total_pedidos} pedidos
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                          <div className="text-center">
                            <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-2">
                              <span className="text-2xl">📊</span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Total Pedidos</p>
                            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{lab.total_pedidos}</p>
                          </div>
                          <div className="text-center">
                            <div className="bg-emerald-100 dark:bg-emerald-900/30 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-2">
                              <span className="text-2xl">✅</span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Entregues</p>
                            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{lab.pedidos_entregues}</p>
                          </div>
                          <div className="text-center">
                            <div className="bg-red-100 dark:bg-red-900/30 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-2">
                              <span className="text-2xl">⏰</span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Atrasados</p>
                            <p className="text-2xl font-bold text-red-600 dark:text-red-400">{lab.pedidos_atrasados}</p>
                          </div>
                          <div className="text-center">
                            <div className="bg-purple-100 dark:bg-purple-900/30 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-2">
                              <span className="text-2xl">💰</span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Valor Total</p>
                            <p className="text-xl font-bold text-purple-600 dark:text-purple-400">{formatCurrency(lab.valor_total)}</p>
                          </div>
                        </div>
                        
                        <div className="mt-6 space-y-3">
                          <div>
                            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                              <span>Taxa de Entrega</span>
                              <span>{lab.taxa_entrega.toFixed(1)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                              <div 
                                className="bg-gradient-to-r from-emerald-400 to-emerald-600 h-3 rounded-full transition-all duration-1000" 
                                style={{ width: `${Math.min(lab.taxa_entrega, 100)}%` }}
                              ></div>
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                              <span>SLA Compliance</span>
                              <span>{lab.sla_compliance.toFixed(1)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                              <div 
                                className={`h-3 rounded-full transition-all duration-1000 ${
                                  lab.sla_compliance >= 95 ? 'bg-gradient-to-r from-emerald-400 to-emerald-600' :
                                  lab.sla_compliance >= 80 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                                  'bg-gradient-to-r from-red-400 to-red-600'
                                }`}
                                style={{ width: `${Math.min(lab.sla_compliance, 100)}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

            </TabsContent>

            {/* 🎯 ABA SLA INTELLIGENCE - Nova funcionalidade premium */}
            <TabsContent value="sla" className="space-y-6">
              <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 dark:from-blue-950/30 dark:via-purple-950/30 dark:to-indigo-950/30 rounded-xl p-6 border-2 border-blue-200/50 dark:border-blue-800/50">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                    <span className="text-3xl">🎯</span>
                    SLA Intelligence Dashboard
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">
                    Análise inteligente de prazos com insights automáticos e otimização de promessas
                  </p>
                </div>
                
                <SLAIntelligenceDashboard filters={filters} />
              </div>
            </TabsContent>

            {/* ABA FINANCEIRO - Dashboard Financeiro Completo */}
            <TabsContent value="financeiro" className="space-y-6">
              <DashboardFinanceiroCompleto filters={filters} />
            </TabsContent>

          </Tabs>
    </div>
  )
}

export default DashboardPage