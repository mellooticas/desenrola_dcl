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
  }, [filters])

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <main className="container mx-auto py-6 px-4">
        <div className="space-y-6">
          
          {/* Header do Centro de Comando */}
          <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 flex items-center gap-3">
                <span className="text-emerald-600">🎛️</span>
                Centro de Comando DCL
              </h1>
              <p className="text-slate-600 mt-2 text-lg">
                {greeting}! Monitoramento executivo com dados em tempo real
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <Button 
                onClick={carregarDadosComandoCenter} 
                disabled={loadingData}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {loadingData ? '🔄 Atualizando...' : '🔄 Atualizar'}
              </Button>
            </div>
          </div>

          {/* Filtros Dinâmicos */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200">
            <FiltrosPeriodo filters={filters} onFiltersChange={setFilters} />
          </div>

          {/* Status de Conexão */}
          <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-emerald-800 font-medium">Sistema Online</span>
              {Object.keys(filters).some(key => filters[key as keyof DashboardFilters]) && (
                <Badge variant="outline" className="ml-2">Filtros Ativos</Badge>
              )}
            </div>
            <span className="text-emerald-700 text-sm">
              Última atualização: {new Date().toLocaleTimeString('pt-BR')}
            </span>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="comando">🎛️ Comando</TabsTrigger>
              <TabsTrigger value="alertas">🚨 Alertas {alertas.length > 0 && `(${alertas.length})`}</TabsTrigger>
              <TabsTrigger value="operacional">📊 Operacional</TabsTrigger>
              <TabsTrigger value="financeiro">💰 Financeiro</TabsTrigger>
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
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <span>🚨</span> Status Crítico
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {alertas.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="text-6xl mb-4">✅</div>
                        <p className="text-slate-500 font-medium">Sistema Operacional</p>
                        <p className="text-sm text-slate-400">Nenhum alerta crítico ativo</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {alertas.slice(0, 3).map((alerta) => (
                          <Alert key={alerta.id} className={getSeverityColor(alerta.severidade)}>
                            <AlertDescription>
                              <div className="flex items-start justify-between">
                                <div>
                                  <strong>{alerta.titulo}</strong>
                                  <p className="text-sm mt-1">{alerta.descricao}</p>
                                </div>
                                <Badge variant="outline">
                                  {alerta.severidade ? alerta.severidade.toUpperCase() : 'INDEFINIDO'}
                                </Badge>
                              </div>
                            </AlertDescription>
                          </Alert>
                        ))}
                        {alertas.length > 3 && (
                          <p className="text-center text-sm text-slate-500">
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
              <AlertsSection />
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
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span>🏭</span> Performance Detalhada - Laboratórios
                  </CardTitle>
                  <CardDescription>
                    Análise completa de performance, SLA e capacidade por laboratório
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {performanceLabs.map((lab) => (
                      <div key={lab.laboratorio_id} className="border border-slate-200 rounded-lg p-6 bg-gradient-to-r from-white to-slate-50">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-xl font-semibold flex items-center gap-2">
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
                            <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-2">
                              <span className="text-2xl">📊</span>
                            </div>
                            <p className="text-sm text-slate-600">Total Pedidos</p>
                            <p className="text-2xl font-bold text-blue-600">{lab.total_pedidos}</p>
                          </div>
                          <div className="text-center">
                            <div className="bg-emerald-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-2">
                              <span className="text-2xl">✅</span>
                            </div>
                            <p className="text-sm text-slate-600">Entregues</p>
                            <p className="text-2xl font-bold text-emerald-600">{lab.pedidos_entregues}</p>
                          </div>
                          <div className="text-center">
                            <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-2">
                              <span className="text-2xl">⏰</span>
                            </div>
                            <p className="text-sm text-slate-600">Atrasados</p>
                            <p className="text-2xl font-bold text-red-600">{lab.pedidos_atrasados}</p>
                          </div>
                          <div className="text-center">
                            <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-2">
                              <span className="text-2xl">💰</span>
                            </div>
                            <p className="text-sm text-slate-600">Valor Total</p>
                            <p className="text-xl font-bold text-purple-600">{formatCurrency(lab.valor_total)}</p>
                          </div>
                        </div>
                        
                        <div className="mt-6 space-y-3">
                          <div>
                            <div className="flex items-center justify-between text-sm text-slate-600 mb-1">
                              <span>Taxa de Entrega</span>
                              <span>{lab.taxa_entrega.toFixed(1)}%</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-3">
                              <div 
                                className="bg-gradient-to-r from-emerald-400 to-emerald-600 h-3 rounded-full transition-all duration-1000" 
                                style={{ width: `${Math.min(lab.taxa_entrega, 100)}%` }}
                              ></div>
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center justify-between text-sm text-slate-600 mb-1">
                              <span>SLA Compliance</span>
                              <span>{lab.sla_compliance.toFixed(1)}%</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-3">
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

            {/* ABA FINANCEIRO - Dashboard Financeiro Completo */}
            <TabsContent value="financeiro" className="space-y-6">
              <DashboardFinanceiroCompleto filters={filters} />
            </TabsContent>

          </Tabs>
        </div>
      </main>
    </div>
  )
}

export default DashboardPage