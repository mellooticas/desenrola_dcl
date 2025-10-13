'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  TrendingUp, 
  TrendingDown,
  Target,
  Zap,
  Brain,
  Calendar,
  BarChart3,
  Settings
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface SLAIntelligenceProps {
  filters: any
}

interface MetricasSLA {
  total_pedidos: number
  sla_lab_cumprido: number
  promessas_cumpridas: number
  taxa_sla_lab: number
  taxa_promessa_cliente: number
  economia_margem: number
  custo_atrasos: number
}

interface PerformanceLab {
  laboratorio_id: string
  laboratorio_nome: string
  total_pedidos: number
  sla_cumprido: number
  sla_atrasado: number
  taxa_sla: number
  dias_medio_real: number
  dias_sla_prometido: number
  economia_potencial: number
  tendencia: 'up' | 'down' | 'stable'
}

interface AlertaSLA {
  id: string
  tipo: 'atraso_critico' | 'alerta_proximo' | 'sugestao_melhoria'
  titulo: string
  descricao: string
  pedido_os?: string
  laboratorio?: string
  acao_sugerida: string
  severidade: 'baixa' | 'media' | 'alta' | 'critica'
  dias_restantes?: number
}

interface InsightIA {
  tipo: 'economia' | 'risco' | 'oportunidade' | 'configuracao'
  titulo: string
  descricao: string
  impacto_estimado: string
  acao_recomendada: string
  icone: string
}

export default function SLAIntelligenceDashboard({ filters }: SLAIntelligenceProps) {
  const [loading, setLoading] = useState(true)
  const [metricas, setMetricas] = useState<MetricasSLA | null>(null)
  const [performanceLabs, setPerformanceLabs] = useState<PerformanceLab[]>([])
  const [alertasSLA, setAlertasSLA] = useState<AlertaSLA[]>([])
  const [insights, setInsights] = useState<InsightIA[]>([])
  const [proximosDias, setProximosDias] = useState<any[]>([])

  useEffect(() => {
    carregarDadosSLA()
  }, [filters])

  const carregarDadosSLA = async () => {
    setLoading(true)
    try {
      // Simular dados (implementar APIs reais depois)
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Métricas simuladas
      setMetricas({
        total_pedidos: 145,
        sla_lab_cumprido: 132,
        promessas_cumpridas: 141,
        taxa_sla_lab: 91.0,
        taxa_promessa_cliente: 97.2,
        economia_margem: 2400,
        custo_atrasos: 800
      })

      // Performance por lab
      setPerformanceLabs([
        {
          laboratorio_id: '1',
          laboratorio_nome: 'Lab Zeiss Premium',
          total_pedidos: 45,
          sla_cumprido: 42,
          sla_atrasado: 3,
          taxa_sla: 93.3,
          dias_medio_real: 4.2,
          dias_sla_prometido: 5.0,
          economia_potencial: 1200,
          tendencia: 'up'
        },
        {
          laboratorio_id: '2', 
          laboratorio_nome: 'Essilor Vision',
          total_pedidos: 38,
          sla_cumprido: 33,
          sla_atrasado: 5,
          taxa_sla: 86.8,
          dias_medio_real: 5.8,
          dias_sla_prometido: 6.0,
          economia_potencial: -400,
          tendencia: 'down'
        },
        {
          laboratorio_id: '3',
          laboratorio_nome: 'Varilux Express',
          total_pedidos: 62,
          sla_cumprido: 57,
          sla_atrasado: 5,
          taxa_sla: 91.9,
          dias_medio_real: 3.8,
          dias_sla_prometido: 4.5,
          economia_potencial: 800,
          tendencia: 'up'
        }
      ])

      // Alertas críticos
      setAlertasSLA([
        {
          id: '1',
          tipo: 'atraso_critico',
          titulo: 'SLA Crítico - 2 dias de atraso',
          descricao: 'OS #1234 - Lab Essilor - Cliente VIP',
          pedido_os: '#1234',
          laboratorio: 'Essilor Vision',
          acao_sugerida: 'Contatar lab imediatamente + compensação cliente',
          severidade: 'critica',
          dias_restantes: -2
        },
        {
          id: '2',
          tipo: 'alerta_proximo',
          titulo: 'SLA vence hoje',
          descricao: 'OS #1267 - Lab Zeiss - Progressiva premium',
          pedido_os: '#1267',
          laboratorio: 'Lab Zeiss Premium',
          acao_sugerida: 'Acompanhar status de produção',
          severidade: 'alta',
          dias_restantes: 0
        },
        {
          id: '3',
          tipo: 'sugestao_melhoria',
          titulo: 'Margem otimizável detectada',
          descricao: 'Lab Varilux 15% mais rápido que SLA',
          laboratorio: 'Varilux Express',
          acao_sugerida: 'Reduzir margem de 3d → 2d',
          severidade: 'media'
        }
      ])

      // Insights de IA
      setInsights([
        {
          tipo: 'economia',
          titulo: 'Economia de R$ 2.400/mês identificada',
          descricao: 'Lab Zeiss está 20% mais rápido que SLA. Reduzir margem pode acelerar promessas sem risco.',
          impacto_estimado: '+R$ 2.400/mês',
          acao_recomendada: 'Ajustar margem de segurança: 3d → 2d',
          icone: '💰'
        },
        {
          tipo: 'risco',
          titulo: 'Lab Essilor com tendência de atraso',
          descricao: 'Aumento de 15% nos atrasos nas últimas 2 semanas. Risco de impacto na satisfação.',
          impacto_estimado: 'Risco: R$ 1.200 em compensações',
          acao_recomendada: 'Aumentar margem temporariamente: 2d → 3d',
          icone: '⚠️'
        },
        {
          tipo: 'oportunidade',
          titulo: 'Oportunidade de diferenciação competitiva',
          descricao: 'Com otimizações, 85% dos pedidos podem ter prazo menor que concorrência.',
          impacto_estimado: '+15% conversão estimada',
          acao_recomendada: 'Implementar prazos dinâmicos por classe',
          icone: '🚀'
        }
      ])

      // Timeline próximos dias (simulado)
      setProximosDias([
        { dia: 'SEG', sla_vencendo: 2, promessas_vencendo: 0, status: 'ok' },
        { dia: 'TER', sla_vencendo: 5, promessas_vencendo: 2, status: 'atencao' },
        { dia: 'QUA', sla_vencendo: 12, promessas_vencendo: 15, status: 'pico' },
        { dia: 'QUI', sla_vencendo: 8, promessas_vencendo: 10, status: 'ok' },
        { dia: 'SEX', sla_vencendo: 4, promessas_vencendo: 6, status: 'ok' },
        { dia: 'SAB', sla_vencendo: 0, promessas_vencendo: 0, status: 'folga' },
        { dia: 'DOM', sla_vencendo: 0, promessas_vencendo: 0, status: 'folga' }
      ])

    } catch (error) {
      console.error('Erro ao carregar dados SLA:', error)
    } finally {
      setLoading(false)
    }
  }

  const getSeverityColor = (severidade: string) => {
    switch (severidade) {
      case 'critica': return 'border-red-500 bg-red-50 text-red-800'
      case 'alta': return 'border-orange-500 bg-orange-50 text-orange-800'  
      case 'media': return 'border-yellow-500 bg-yellow-50 text-yellow-800'
      default: return 'border-blue-500 bg-blue-50 text-blue-800'
    }
  }

  const getTendenciaIcon = (tendencia: string) => {
    switch (tendencia) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-600" />
      case 'down': return <TrendingDown className="w-4 h-4 text-red-600" />
      default: return <BarChart3 className="w-4 h-4 text-gray-600" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Analisando dados de SLA...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      
      {/* Header Premium */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold flex items-center gap-3">
              <Target className="w-8 h-8" />
              SLA Intelligence
            </h2>
            <p className="text-blue-100 mt-2 text-lg">
              Análise inteligente de prazos e otimização de promessas
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">
              {metricas?.taxa_promessa_cliente.toFixed(1)}%
            </div>
            <div className="text-sm text-blue-100">
              Taxa de Satisfação
            </div>
          </div>
        </div>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">SLA Lab</p>
                <p className="text-2xl font-bold text-green-700">
                  {metricas?.taxa_sla_lab.toFixed(1)}%
                </p>
                <p className="text-xs text-green-600">
                  {metricas?.sla_lab_cumprido}/{metricas?.total_pedidos}
                </p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Promessas</p>
                <p className="text-2xl font-bold text-blue-700">
                  {metricas?.taxa_promessa_cliente.toFixed(1)}%
                </p>
                <p className="text-xs text-blue-600">
                  {metricas?.promessas_cumpridas}/{metricas?.total_pedidos}
                </p>
              </div>
              <Target className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-emerald-600 font-medium">Economia</p>
                <p className="text-2xl font-bold text-emerald-700">
                  R$ {metricas?.economia_margem.toLocaleString()}
                </p>
                <p className="text-xs text-emerald-600">Potencial/mês</p>
              </div>
              <TrendingUp className="w-8 h-8 text-emerald-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-50 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600 font-medium">Custos</p>
                <p className="text-2xl font-bold text-red-700">
                  R$ {metricas?.custo_atrasos.toLocaleString()}
                </p>
                <p className="text-xs text-red-600">Atrasos/mês</p>
              </div>
              <Clock className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Performance dos Laboratórios */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Performance por Laboratório
            </CardTitle>
            <CardDescription>
              Análise comparativa de SLA real vs prometido
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {performanceLabs.map((lab) => (
              <div key={lab.laboratorio_id} className="p-4 border rounded-lg bg-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{lab.laboratorio_nome}</h4>
                    {getTendenciaIcon(lab.tendencia)}
                  </div>
                  <Badge variant={lab.taxa_sla >= 90 ? "default" : "destructive"}>
                    {lab.taxa_sla.toFixed(1)}%
                  </Badge>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <p className="text-gray-600">Real Médio</p>
                    <p className="font-bold text-blue-600">{lab.dias_medio_real}d</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-600">SLA Prometido</p>
                    <p className="font-bold text-gray-700">{lab.dias_sla_prometido}d</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-600">Economia</p>
                    <p className={cn(
                      "font-bold",
                      lab.economia_potencial >= 0 ? "text-green-600" : "text-red-600"
                    )}>
                      R$ {lab.economia_potencial}
                    </p>
                  </div>
                </div>
                
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>SLA Compliance</span>
                    <span>{lab.taxa_sla.toFixed(1)}%</span>
                  </div>
                  <Progress value={lab.taxa_sla} className="h-2" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Alertas Críticos SLA */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Alertas Críticos SLA
            </CardTitle>
            <CardDescription>
              Ações urgentes e oportunidades identificadas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {alertasSLA.map((alerta) => (
              <Alert key={alerta.id} className={getSeverityColor(alerta.severidade)}>
                <AlertDescription>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <strong>{alerta.titulo}</strong>
                        {alerta.dias_restantes !== undefined && (
                          <Badge variant="outline" className="text-xs">
                            {alerta.dias_restantes < 0 
                              ? `${Math.abs(alerta.dias_restantes)}d atraso`
                              : alerta.dias_restantes === 0 
                                ? 'Vence hoje'
                                : `${alerta.dias_restantes}d restam`
                            }
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm mb-2">{alerta.descricao}</p>
                      <div className="bg-white/50 rounded px-2 py-1">
                        <p className="text-xs font-medium">💡 Ação: {alerta.acao_sugerida}</p>
                      </div>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Insights de IA */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600" />
            Insights de IA - Otimização Automática
          </CardTitle>
          <CardDescription>
            Análise inteligente com sugestões baseadas em padrões históricos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {insights.map((insight, index) => (
              <div key={index} className="p-4 border rounded-lg bg-gradient-to-br from-purple-50 to-indigo-50">
                <div className="flex items-start gap-3 mb-3">
                  <div className="text-2xl">{insight.icone}</div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm mb-1">{insight.titulo}</h4>
                    <p className="text-xs text-gray-600 mb-2">{insight.descricao}</p>
                  </div>
                </div>
                
                <div className="bg-white/50 rounded p-2 mb-2">
                  <p className="text-xs font-medium text-green-700">
                    📈 {insight.impacto_estimado}
                  </p>
                </div>
                
                <div className="bg-blue-100 rounded p-2">
                  <p className="text-xs font-medium text-blue-800">
                    🎯 {insight.acao_recomendada}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Timeline Preditiva */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600" />
            Timeline Preditiva - Próximos 7 Dias
          </CardTitle>
          <CardDescription>
            Previsão de vencimentos SLA e promessas para planejamento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {proximosDias.map((dia, index) => (
              <div key={index} className={cn(
                "text-center p-3 rounded-lg border-2",
                dia.status === 'pico' 
                  ? "bg-red-50 border-red-300"
                  : dia.status === 'atencao'
                    ? "bg-yellow-50 border-yellow-300"
                    : dia.status === 'folga'
                      ? "bg-gray-50 border-gray-200"
                      : "bg-green-50 border-green-300"
              )}>
                <div className="font-bold text-sm mb-2">{dia.dia}</div>
                <div className="space-y-1">
                  <div className={cn(
                    "text-xs px-2 py-1 rounded",
                    dia.sla_vencendo > 0 ? "bg-blue-200 text-blue-800" : "bg-gray-200 text-gray-600"
                  )}>
                    🔧 {dia.sla_vencendo}
                  </div>
                  <div className={cn(
                    "text-xs px-2 py-1 rounded",
                    dia.promessas_vencendo > 0 ? "bg-green-200 text-green-800" : "bg-gray-200 text-gray-600"
                  )}>
                    🤝 {dia.promessas_vencendo}
                  </div>
                </div>
                {dia.status === 'pico' && (
                  <div className="text-xs mt-1 text-red-600 font-medium">
                    ⚠️ PICO
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-blue-500 rounded"></div>
                  <span>🔧 SLA Lab</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span>🤝 Promessa Cliente</span>
                </div>
              </div>
              <div className="text-blue-600 font-medium">
                💡 Quarta-feira: sugerir reforço na equipe
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  )
}