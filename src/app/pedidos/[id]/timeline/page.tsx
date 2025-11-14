'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'
import { 
  Clock,  
  Building, 
  AlertTriangle,
  CheckCircle,
  Bell,
  User,
  Package,
  CreditCard,
  Truck,
  MapPin,
  Check,
  Zap,
  Eye,
  Edit
} from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { differenceInDays, differenceInHours, parseISO } from 'date-fns'
import { toast } from 'sonner'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { PedidoTimeline } from '@/components/timeline/PedidoTimeline'
import { PedidoHeader } from '@/components/pedidos/PedidoHeader'
import { KPICard } from '@/components/dashboard/KPICard'
import type { StatusPedido } from '@/lib/types/database'

// Tipos de componentes
interface TimelineEventProps {
  event: TimelineEntry
  isLast: boolean
}

interface PedidoData {
  id: string
  numero_sequencial: number
  cliente_nome: string
  status: StatusPedido
  created_at: string
  loja_nome: string
  laboratorio_nome: string
  classe_nome: string
  valor_pedido?: number
  prioridade?: string
}

interface PedidoCompleto {
  id: string
  numero_sequencial: number
  cliente_nome: string
  loja_nome: string
  laboratorio_nome: string
  status: StatusPedido
  created_at: string
  classe_nome?: string
  valor_pedido?: number
  prioridade?: string
}

interface TimelineEntry {
  id: string
  pedido_id: string
  status_anterior: StatusPedido | null
  status_novo: StatusPedido
  responsavel_id: string
  responsavel_nome?: string
  observacoes?: string
  created_at: string
  tempo_na_etapa?: number
  responsavel?: {
    nome: string
  }
}

interface LeadTimeMetrics {
  total_dias: number
  total_horas: number
  por_etapa: {
    [key in StatusPedido]?: {
      tempo_horas: number
      tempo_dias: number
      percentual_total: number
    }
  }
  comparativo: {
    media_laboratorio: number
    media_classe: number
    media_geral: number
    posicao_ranking: 'rapido' | 'normal' | 'lento'
  }
}

// Configuração de status com design híbrido
const STATUS_CONFIG: Record<StatusPedido, {
  color: string
  bg: string
  border: string
  icon: React.ElementType
  label: string
}> = {
  'REGISTRADO': { 
    color: '#94A3B8', 
    bg: 'rgba(148, 163, 184, 0.1)', 
    border: 'rgba(148, 163, 184, 0.3)',
    icon: Package,
    label: 'Registrado'
  },
  'AG_PAGAMENTO': { 
    color: '#F59E0B', 
    bg: 'rgba(245, 158, 11, 0.1)', 
    border: 'rgba(245, 158, 11, 0.3)',
    icon: CreditCard,
    label: 'Ag. Pagamento'
  },
  'PAGO': { 
    color: '#10B981', 
    bg: 'rgba(16, 185, 129, 0.1)', 
    border: 'rgba(16, 185, 129, 0.3)',
    icon: CheckCircle,
    label: 'Pago'
  },
  'PRODUCAO': { 
    color: '#3B82F6', 
    bg: 'rgba(59, 130, 246, 0.1)', 
    border: 'rgba(59, 130, 246, 0.3)',
    icon: Building,
    label: 'Produção'
  },
  'PRONTO': { 
    color: '#8B5CF6', 
    bg: 'rgba(139, 92, 246, 0.1)', 
    border: 'rgba(139, 92, 246, 0.3)',
    icon: Check,
    label: 'Pronto'
  },
  'ENVIADO': { 
    color: '#EF4444', 
    bg: 'rgba(239, 68, 68, 0.1)', 
    border: 'rgba(239, 68, 68, 0.3)',
    icon: Truck,
    label: 'Enviado'
  },
  'CHEGOU': { 
    color: '#06B6D4', 
    bg: 'rgba(6, 182, 212, 0.1)', 
    border: 'rgba(6, 182, 212, 0.3)',
    icon: MapPin,
    label: 'Chegou'
  },
  'ENTREGUE': { 
    color: '#10B981', 
    bg: 'rgba(16, 185, 129, 0.1)', 
    border: 'rgba(16, 185, 129, 0.3)',
    icon: Check,
    label: 'Entregue'
  },
  'CANCELADO': { 
    color: '#6B7280', 
    bg: 'rgba(107, 114, 128, 0.1)', 
    border: 'rgba(107, 114, 128, 0.3)',
    icon: AlertTriangle,
    label: 'Cancelado'
  }
}

// Componente Timeline Event híbrido
const TimelineEventHybrid: React.FC<TimelineEventProps> = ({ event, isLast }) => {
  const config = STATUS_CONFIG[event.status_novo as StatusPedido] || STATUS_CONFIG.REGISTRADO
  const Icon = config.icon
  
  // Detectar dark mode
  const isDark = typeof window !== 'undefined' && document.documentElement.classList.contains('dark')
  
  return (
    <div style={{
      position: 'relative',
      paddingBottom: isLast ? '0' : '32px',
      marginLeft: '16px'
    }}>
      <div style={{
        position: 'absolute',
        left: '-47px',
        top: '8px',
        width: '32px',
        height: '32px',
        background: isDark ? '#1f2937' : 'white',
        border: `3px solid ${config.color}`,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: config.color,
        boxShadow: isDark ? '0 2px 8px rgba(0, 0, 0, 0.3)' : '0 2px 8px rgba(0, 0, 0, 0.1)',
        zIndex: 10
      }}>
        <Icon size={14} />
      </div>

      <div style={{
        background: isDark ? `${config.color}20` : config.bg,
        border: `1px solid ${isDark ? config.color + '40' : config.border}`,
        borderRadius: '12px',
        padding: '16px',
        transition: 'all 0.2s ease'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
          <h4 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: isDark ? '#f3f4f6' : '#1f2937',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            Status alterado para: {config.label}
            {isLast && (
              <span style={{
                background: '#10b981',
                color: 'white',
                padding: '2px 8px',
                borderRadius: '12px',
                fontSize: '10px',
                fontWeight: '500',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Atual
              </span>
            )}
          </h4>
          <span style={{
            fontSize: '12px',
            color: isDark ? '#9ca3af' : '#64748b',
            fontWeight: '500'
          }}>
            {new Date(event.created_at).toLocaleDateString('pt-BR', { 
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <User size={14} color={isDark ? '#9ca3af' : '#64748b'} />
          <span style={{ fontSize: '14px', color: isDark ? '#d1d5db' : '#374151', fontWeight: '500' }}>
            {event.responsavel_nome || 'Sistema'}
          </span>
        </div>

        {event.observacoes && (
          <p style={{
            fontSize: '14px',
            color: isDark ? '#d1d5db' : '#4b5563',
            margin: 0,
            padding: '8px 12px',
            background: isDark ? 'rgba(55, 65, 81, 0.5)' : 'rgba(255, 255, 255, 0.7)',
            borderRadius: '8px',
            border: `1px solid ${isDark ? 'rgba(75, 85, 99, 0.5)' : 'rgba(255, 255, 255, 0.8)'}`
          }}>
            {event.observacoes}
          </p>
        )}
      </div>
    </div>
  )
}

export default function PedidoTimelinePage() {
  const router = useRouter()
  const params = useParams()
  const { userProfile, loading: authLoading } = useAuth()
  
  const [pedido, setPedido] = useState<PedidoCompleto | null>(null)
  const [timeline, setTimeline] = useState<TimelineEntry[]>([])
  const [leadTimeMetrics, setLeadTimeMetrics] = useState<LeadTimeMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [, setThemeChanged] = useState(0) // Para forçar re-render quando tema muda

  const pedidoId = params?.id as string

  // Observar mudanças de tema para re-render inline styles
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          setThemeChanged(prev => prev + 1)
        }
      })
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    })

    return () => observer.disconnect()
  }, [])

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !userProfile) {
      router.push('/login')
    }
  }, [authLoading, userProfile, router])

  const carregarDadosPedido = useCallback(async () => {
    try {
      setLoading(true)
      
      // Carregar dados do pedido da view correta
      const { data: pedidoData, error: pedidoError } = await supabase
        .from('v_pedidos_kanban')
        .select('*')
        .eq('id', pedidoId)
        .single()

      if (pedidoError) {
        console.error('Erro ao carregar pedido:', pedidoError)
        throw pedidoError
      }

      setPedido(pedidoData)

      // Carregar timeline do pedido usando a view otimizada
      const { data: timelineData, error: timelineError } = await supabase
        .from('v_pedido_timeline_completo')
        .select('*')
        .eq('pedido_id', pedidoId)
        .order('created_at', { ascending: true })

      if (timelineError) {
        console.error('Erro ao carregar timeline:', timelineError)
        setTimeline([])
      } else {
        // Os dados já vêm com responsavel_nome
        const timelineFormatted = timelineData.map((entry: TimelineEntry) => ({
          ...entry,
          responsavel_nome: entry.responsavel_nome || 'Sistema'
        }))
        setTimeline(timelineFormatted)
      }

      // Calcular métricas de lead time
      await calcularLeadTimeMetrics(pedidoData, timelineData || [])
      
    } catch (error) {
      console.error('Erro ao carregar dados do pedido:', error)
      toast.error('Erro ao carregar dados do pedido')
    } finally {
      setLoading(false)
    }
  }, [pedidoId])

  const calcularLeadTimeMetrics = async (pedidoData: PedidoData, timelineData: TimelineEntry[]) => {
    try {
      const dataInicio = parseISO(pedidoData.created_at)
      const dataAtual = new Date()
      
      const totalHoras = differenceInHours(dataAtual, dataInicio)
      const totalDias = differenceInDays(dataAtual, dataInicio)

      // Calcular tempo por etapa
      const porEtapa: LeadTimeMetrics['por_etapa'] = {}
      
      if (timelineData.length > 0) {
        for (let i = 0; i < timelineData.length; i++) {
          const entry = timelineData[i]
          const proximaEntry = timelineData[i + 1]
          
          const inicioEtapa = parseISO(entry.created_at)
          const fimEtapa = proximaEntry ? parseISO(proximaEntry.created_at) : dataAtual
          
          const tempoHoras = differenceInHours(fimEtapa, inicioEtapa)
          const tempoDias = differenceInDays(fimEtapa, inicioEtapa)
          
          porEtapa[entry.status_novo] = {
            tempo_horas: tempoHoras,
            tempo_dias: tempoDias,
            percentual_total: totalHoras > 0 ? (tempoHoras / totalHoras) * 100 : 0
          }
        }
      }

      // Comparativo com métricas gerais
      const posicaoRanking: 'rapido' | 'normal' | 'lento' = totalHoras <= 72 ? 'rapido' : totalHoras <= 168 ? 'normal' : 'lento'
      
      const comparativo = {
        media_laboratorio: 120, // 5 dias
        media_classe: 96, // 4 dias  
        media_geral: 144, // 6 dias
        posicao_ranking: posicaoRanking
      }

      setLeadTimeMetrics({
        total_dias: totalDias,
        total_horas: totalHoras,
        por_etapa: porEtapa,
        comparativo
      })
      
    } catch (error) {
      console.error('Erro ao calcular métricas:', error)
    }
  }

  useEffect(() => {
    if (!pedidoId || !userProfile) return
    carregarDadosPedido()
  }, [pedidoId, userProfile, carregarDadosPedido])

  const formatarTempo = (horas: number): string => {
    if (horas < 24) {
      return `${Math.round(horas)}h`
    } else {
      const dias = Math.floor(horas / 24)
      const horasRestantes = Math.round(horas % 24)
      return horasRestantes > 0 ? `${dias}d ${horasRestantes}h` : `${dias}d`
    }
  }

  // Detectar dark mode para inline styles
  const isDark = typeof window !== 'undefined' && document.documentElement.classList.contains('dark')

  if (!userProfile) {
    return <LoadingSpinner />
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="backdrop-blur-xl bg-white/30 dark:bg-gray-800/30 border-white/20 dark:border-gray-700/20 shadow-xl rounded-lg">
          <div className="flex items-center justify-center p-8">
            <LoadingSpinner />
          </div>
        </div>
      </div>
    )
  }

  if (!pedido) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="backdrop-blur-xl bg-white/30 dark:bg-gray-800/30 border-b border-white/20 dark:border-gray-700/20">
          <PedidoHeader 
            mode="timeline"
            pedidoId={pedidoId}
          />
        </div>
        
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="backdrop-blur-xl bg-white/30 dark:bg-gray-800/30 border-white/20 dark:border-gray-700/20 shadow-xl rounded-lg max-w-md w-full text-center p-8">
              <AlertTriangle size={64} color="#ef4444" className="mx-auto mb-4 dark:opacity-80" />
              <h2 className="text-2xl font-bold mb-4 dark:text-white">
                Pedido não encontrado
              </h2>
              <p className="text-muted-foreground dark:text-gray-400 mb-6">
                O pedido com ID &quot;{pedidoId}&quot; não foi encontrado ou você não tem permissão para visualizá-lo.
              </p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  const currentStatusConfig = STATUS_CONFIG[pedido.status] || STATUS_CONFIG.REGISTRADO

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="backdrop-blur-xl bg-white/30 dark:bg-gray-800/30 border-b border-white/20 dark:border-gray-700/20">
        <PedidoHeader 
          mode="timeline"
          pedidoId={pedidoId}
          numeroSequencial={pedido.numero_sequencial}
          status={pedido.status}
          prioridade={pedido.prioridade}
        />
      </div>

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* KPIs Section - Grid responsivo com glassmorphism */}
          {leadTimeMetrics && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <KPICard
                title="Lead Time Total"
                value={leadTimeMetrics.total_horas}
                unit=" horas"
                trend={leadTimeMetrics.total_dias > 5 ? 'down' : leadTimeMetrics.total_dias < 3 ? 'up' : 'stable'}
                className="backdrop-blur-xl bg-white/30 dark:bg-gray-800/30 border-white/20 dark:border-gray-700/20 shadow-xl hover:shadow-2xl transition-all duration-300"
              />
              <KPICard
                title="vs. Média Lab"
                value={leadTimeMetrics.comparativo.media_laboratorio}
                unit=" horas"
                trend={leadTimeMetrics.total_horas <= leadTimeMetrics.comparativo.media_laboratorio ? 'up' : 'down'}
                className="backdrop-blur-xl bg-white/30 dark:bg-gray-800/30 border-white/20 dark:border-gray-700/20 shadow-xl hover:shadow-2xl transition-all duration-300"
              />
              <KPICard
                title="Performance"
                value={leadTimeMetrics.comparativo.posicao_ranking === 'rapido' ? '🚀 Excelente' : leadTimeMetrics.comparativo.posicao_ranking === 'normal' ? '✅ Normal' : '⚠️ Atenção'}
                trend={
                  leadTimeMetrics.comparativo.posicao_ranking === 'rapido' ? 'up' :
                  leadTimeMetrics.comparativo.posicao_ranking === 'normal' ? 'stable' : 'down'
                }
                className="backdrop-blur-xl bg-white/30 dark:bg-gray-800/30 border-white/20 dark:border-gray-700/20 shadow-xl hover:shadow-2xl transition-all duration-300"
              />
              <KPICard
                title="Eventos"
                value={timeline.length}
                unit=" mudanças"
                trend="stable"
                className="backdrop-blur-xl bg-white/30 dark:bg-gray-800/30 border-white/20 dark:border-gray-700/20 shadow-xl hover:shadow-2xl transition-all duration-300"
              />
            </div>
          )}

          {/* Timeline com glassmorphism */}
          <div className="backdrop-blur-xl bg-white/30 dark:bg-gray-800/30 border-white/20 dark:border-gray-700/20 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-lg overflow-hidden">
            <div className="p-6 border-b border-white/20 dark:border-gray-700/20 bg-gradient-to-r from-white/40 dark:from-gray-700/40 to-white/20 dark:to-gray-800/20">
              <div className="flex items-center gap-3 mb-2">
                <Clock size={20} className="text-slate-700 dark:text-gray-300" />
                <h2 className="text-xl font-semibold text-slate-800 dark:text-white">
                  Timeline do Pedido
                </h2>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100/50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border border-blue-200/50 dark:border-blue-700 rounded-full text-xs font-medium uppercase">
                  {React.createElement(currentStatusConfig.icon, { size: 12 })}
                  {currentStatusConfig.label}
                </div>
              </div>
              <p className="text-sm text-slate-600 dark:text-gray-400">
                Histórico completo de mudanças de status e eventos do pedido
              </p>
            </div>

            <div className="p-6">
              {timeline.length > 0 ? (
                <div className="relative pl-8">
                  {/* Linha conectora */}
                  <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-gradient-to-b from-blue-400 to-purple-400 rounded-full" />

                  {timeline.map((event, index) => (
                    <TimelineEventHybrid 
                      key={event.id}
                      event={event}
                      isLast={index === timeline.length - 1}
                    />
                  ))}
                </div>
              ) : (
                <PedidoTimeline timeline={timeline} />
              )}
            </div>
          </div>

          {/* Distribuição de Tempo por Etapa com glassmorphism */}
          {leadTimeMetrics && Object.keys(leadTimeMetrics.por_etapa).length > 0 && (
            <div className="backdrop-blur-xl bg-white/30 dark:bg-gray-800/30 border-white/20 dark:border-gray-700/20 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-lg overflow-hidden">
              <div className="p-6 border-b border-white/20 dark:border-gray-700/20 bg-gradient-to-r from-white/40 dark:from-gray-700/40 to-white/20 dark:to-gray-800/20">
                <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">
                  Distribuição de Tempo por Etapa
                </h3>
                <p className="text-sm text-slate-600 dark:text-gray-400">
                  Tempo gasto em cada status do pedido
                </p>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                {Object.entries(leadTimeMetrics.por_etapa).map(([status, etapaMetrics]) => {
                  const config = STATUS_CONFIG[status as StatusPedido] || STATUS_CONFIG.REGISTRADO
                  if (!etapaMetrics) return null
                  
                  // Detectar dark mode
                  const isDark = typeof window !== 'undefined' && document.documentElement.classList.contains('dark')
                  
                  return (
                    <div key={status} style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '16px',
                      border: `2px solid ${isDark ? config.color + '40' : config.border}`,
                      borderRadius: '12px',
                      background: isDark ? `${config.color}15` : config.bg,
                      transition: 'all 0.2s ease'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 12px',
                          background: config.color,
                          color: 'white',
                          borderRadius: '20px',
                          fontSize: '11px',
                          fontWeight: '500',
                          textTransform: 'uppercase'
                        }}>
                          {React.createElement(config.icon, { size: 10 })}
                          {config.label}
                        </div>
                        <span style={{ fontSize: '16px', fontWeight: '600', color: isDark ? '#f3f4f6' : '#374151' }}>
                          {formatarTempo(etapaMetrics.tempo_horas)}
                        </span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '14px', color: isDark ? '#9ca3af' : '#64748b', marginBottom: '4px' }}>
                          {etapaMetrics.percentual_total.toFixed(1)}% do total
                        </div>
                        <div style={{
                          width: '120px',
                          height: '8px',
                          background: isDark ? '#374151' : '#f1f5f9',
                          borderRadius: '4px',
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            height: '100%',
                            background: `linear-gradient(90deg, ${config.color}, ${config.color}dd)`,
                            width: `${Math.min(etapaMetrics.percentual_total, 100)}%`,
                            borderRadius: '4px',
                            transition: 'width 0.3s ease'
                          }} />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* Ações Rápidas */}
        <div style={{
          background: isDark ? '#1f2937' : 'white',
          borderRadius: '16px',
          boxShadow: isDark ? '0 4px 6px rgba(0, 0, 0, 0.3)' : '0 1px 3px rgba(0, 0, 0, 0.1)',
          border: isDark ? '1px solid #374151' : '1px solid #e2e8f0',
          padding: '24px'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: isDark ? '#f3f4f6' : '#1C3B5A', margin: '0 0 16px 0' }}>
            Ações Rápidas
          </h3>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              background: 'linear-gradient(135deg, #1C3B5A, #3182f6)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(28, 59, 90, 0.4)'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'none'
              e.currentTarget.style.boxShadow = 'none'
            }}>
              <CheckCircle size={16} />
              Avançar Status
            </button>
            
            <button style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              background: 'linear-gradient(135deg, #CC6B2F, #f26724)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(204, 107, 47, 0.4)'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'none'
              e.currentTarget.style.boxShadow = 'none'
            }}>
              <Bell size={16} />
              Contatar Cliente
            </button>
            
            <button style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              background: 'transparent',
              color: '#1C3B5A',
              border: '2px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = '#f8fafc'
              e.currentTarget.style.borderColor = '#1C3B5A'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.borderColor = '#e2e8f0'
            }}>
              <Building size={16} />
              Contatar Lab
            </button>

            <button style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              background: 'transparent',
              color: '#10B981',
              border: '2px solid rgba(16, 185, 129, 0.2)',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(16, 185, 129, 0.1)'
              e.currentTarget.style.borderColor = '#10B981'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.2)'
            }}>
              <Edit size={16} />
              Editar Pedido
            </button>
            
            <button style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              background: 'transparent',
              color: '#ef4444',
              border: '2px solid rgba(239, 68, 68, 0.2)',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'
              e.currentTarget.style.borderColor = '#ef4444'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.2)'
            }}>
              <Zap size={16} />
              Marcar Urgente
            </button>

            <button style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              background: 'transparent',
              color: '#64748b',
              border: '2px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = '#f1f5f9'
              e.currentTarget.style.borderColor = '#64748b'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.borderColor = '#e2e8f0'
            }}>
              <Eye size={16} />
              Ver Detalhes
            </button>
          </div>
        </div>

        {/* Detalhes do Pedido */}
        <div style={{
          background: isDark ? '#1f2937' : 'white',
          borderRadius: '16px',
          boxShadow: isDark ? '0 4px 6px rgba(0, 0, 0, 0.3)' : '0 1px 3px rgba(0, 0, 0, 0.1)',
          border: isDark ? '1px solid #374151' : '1px solid #e2e8f0',
          overflow: 'hidden'
        }}>
          <div style={{ 
            padding: '24px',
            borderBottom: isDark ? '1px solid #374151' : '1px solid #f1f5f9',
            background: isDark ? 'linear-gradient(135deg, #374151, #1f2937)' : 'linear-gradient(135deg, #f8fafc, #f1f5f9)'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: isDark ? '#f3f4f6' : '#1C3B5A', margin: 0, marginBottom: '8px' }}>
              Detalhes do Pedido
            </h3>
            <p style={{ fontSize: '14px', color: isDark ? '#9ca3af' : '#64748b', margin: 0 }}>
              Informações completas sobre o pedido e especificações
            </p>
          </div>

          <div style={{ padding: '24px' }}>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
              gap: '20px' 
            }}>
              <div>
                <label style={{ 
                  fontSize: '12px', 
                  fontWeight: '500', 
                  color: isDark ? '#9ca3af' : '#64748b', 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.5px',
                  display: 'block',
                  marginBottom: '4px'
                }}>
                  Cliente
                </label>
                <p style={{ fontSize: '16px', fontWeight: '600', color: isDark ? '#f3f4f6' : '#374151', margin: 0 }}>
                  {pedido.cliente_nome}
                </p>
              </div>
              
              <div>
                <label style={{ 
                  fontSize: '12px', 
                  fontWeight: '500', 
                  color: isDark ? '#9ca3af' : '#64748b', 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.5px',
                  display: 'block',
                  marginBottom: '4px'
                }}>
                  Loja
                </label>
                <p style={{ fontSize: '16px', fontWeight: '600', color: isDark ? '#f3f4f6' : '#374151', margin: 0 }}>
                  {pedido.loja_nome}
                </p>
              </div>
              
              <div>
                <label style={{ 
                  fontSize: '12px', 
                  fontWeight: '500', 
                  color: isDark ? '#9ca3af' : '#64748b', 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.5px',
                  display: 'block',
                  marginBottom: '4px'
                }}>
                  Laboratório
                </label>
                <p style={{ fontSize: '16px', fontWeight: '600', color: isDark ? '#f3f4f6' : '#374151', margin: 0 }}>
                  {pedido.laboratorio_nome}
                </p>
              </div>

              {pedido.classe_nome && (
                <div>
                  <label style={{ 
                    fontSize: '12px', 
                    fontWeight: '500', 
                    color: isDark ? '#9ca3af' : '#64748b', 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.5px',
                    display: 'block',
                    marginBottom: '4px'
                  }}>
                    Classe de Lente
                  </label>
                  <p style={{ fontSize: '16px', fontWeight: '600', color: isDark ? '#f3f4f6' : '#374151', margin: 0 }}>
                    {pedido.classe_nome}
                  </p>
                </div>
              )}
              
              {pedido.valor_pedido && (
                <div>
                  <label style={{ 
                    fontSize: '12px', 
                    fontWeight: '500', 
                    color: isDark ? '#9ca3af' : '#64748b', 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.5px',
                    display: 'block',
                    marginBottom: '4px'
                  }}>
                    Valor do Pedido
                  </label>
                  <p style={{ fontSize: '16px', fontWeight: '600', color: isDark ? '#34d399' : '#10B981', margin: 0 }}>
                    R$ {pedido.valor_pedido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              )}

              {pedido.prioridade && (
                <div>
                  <label style={{ 
                    fontSize: '12px', 
                    fontWeight: '500', 
                    color: isDark ? '#9ca3af' : '#64748b', 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.5px',
                    display: 'block',
                    marginBottom: '4px'
                  }}>
                    Prioridade
                  </label>
                  <div style={{ marginTop: '4px' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '4px 12px',
                      background: pedido.prioridade === 'URGENTE' 
                        ? (isDark ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.1)')
                        : (isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)'),
                      color: pedido.prioridade === 'URGENTE' 
                        ? (isDark ? '#fca5a5' : '#dc2626') 
                        : (isDark ? '#93c5fd' : '#2563eb'),
                      border: pedido.prioridade === 'URGENTE' 
                        ? (isDark ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(239, 68, 68, 0.2)')
                        : (isDark ? '1px solid rgba(59, 130, 246, 0.4)' : '1px solid rgba(59, 130, 246, 0.2)'),
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '500',
                      textTransform: 'uppercase'
                    }}>
                      {pedido.prioridade === 'URGENTE' && <Zap size={10} />}
                      {pedido.prioridade}
                    </span>
                  </div>
                </div>
              )}

              <div>
                <label style={{ 
                  fontSize: '12px', 
                  fontWeight: '500', 
                  color: isDark ? '#9ca3af' : '#64748b', 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.5px',
                  display: 'block',
                  marginBottom: '4px'
                }}>
                  Data do Pedido
                </label>
                <p style={{ fontSize: '16px', fontWeight: '600', color: isDark ? '#f3f4f6' : '#374151', margin: 0 }}>
                  {new Date(pedido.created_at).toLocaleDateString('pt-BR', { 
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
        </div>
      </main>
    </div>
  )
}