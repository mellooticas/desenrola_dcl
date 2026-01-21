'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  AlertTriangle,
  Building,
  User,
  Clock,
  Phone,
  MapPin,
  Calendar,
  Package,
  Shield,
  Eye,
  DollarSign,
  Activity,
  TrendingUp,
  Target,
  FileText,
  Settings,
  AlertCircle,
  CheckCircle2,
  Users,
  Stethoscope
} from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toast } from 'sonner'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { PedidoHeader } from '@/components/pedidos/PedidoHeader'
import { KPICard } from '@/components/dashboard/KPICard'
import type { StatusPedido, PrioridadeLevel, PedidoCompleto } from '@/lib/types/database'

interface PedidoDetalhes {
  // Identificação básica
  id: string
  numero_sequencial: number
  numero_os_fisica: string | null
  numero_pedido_laboratorio: string | null
  
  // IDs para relacionamentos (necessários para PedidoCompleto compatibility)
  loja_id: string
  laboratorio_id: string
  classe_lente_id: string
  montador_id: string | null
  
  // Status e controle
  status: StatusPedido
  tipo_pedido: 'ARMACAO' | 'LENTES' | 'COMPLETO' | 'MONTAGEM' | null
  prioridade: PrioridadeLevel
  pagamento_atrasado: boolean
  producao_atrasada: boolean
  requer_atencao: boolean
  eh_garantia: boolean
  
  // Dados do cliente
  cliente_nome: string
  cliente_telefone: string | null
  
  // Dados financeiros
  valor_pedido: number | null
  custo_lentes: number | null
  forma_pagamento: string | null
  
  // 💰 Preços e Margens - Armação
  preco_armacao: number | null
  custo_armacao: number | null
  margem_armacao_percentual: number | null
  
  // 💰 Preços e Margens - Lente
  preco_lente: number | null
  custo_lente: number | null
  margem_lente_percentual: number | null
  
  // Dados ópticos OD (Olho Direito)
  esferico_od: number | null
  cilindrico_od: number | null
  eixo_od: number | null
  adicao_od: number | null
  
  // Dados ópticos OE (Olho Esquerdo)
  esferico_oe: number | null
  cilindrico_oe: number | null
  eixo_oe: number | null
  adicao_oe: number | null
  
  // Dados adicionais da receita
  distancia_pupilar: number | null
  material_lente: string | null
  indice_refracao: string | null
  
  // Observações
  observacoes: string | null
  observacoes_garantia: string | null
  observacoes_internas: string | null
  
  // Datas
  data_pedido: string
  data_prometida: string | null
  data_limite_pagamento: string | null
  data_prevista_pronto: string | null
  data_prevista_envio: string | null
  data_pagamento: string | null
  data_entregue: string | null
  data_inicio_producao: string | null
  data_conclusao_producao: string | null
  created_at: string | undefined
  updated_at: string | undefined
  
  // Lead time e métricas
  lead_time_producao_horas: number | null
  lead_time_total_horas: number | null
  laboratorio_responsavel_producao: string | null
  
  // Dados relacionados da loja
  loja_nome: string
  loja_codigo: string
  loja_endereco: string | null
  loja_telefone: string | null
  loja_whatsapp: string | null
  margem_seguranca_dias: number
  alerta_sla_dias: number
  
  // Dados relacionados do laboratório
  laboratorio_nome: string
  laboratorio_codigo: string | null
  laboratorio_sla_padrao: number
  laboratorio_trabalha_sabado: boolean
  laboratorio_especialidades?: string[] | null
  
  // Dados relacionados da classe
  classe_nome: string
  classe_codigo: string | null
  classe_categoria: string
  classe_sla_base: number
  classe_cor: string
  
  // Auditoria
  created_by?: string | null
  updated_by?: string | null
  vendedor_id?: string | null
  
  // SLA Intelligence (campos da view v_pedidos_kanban)
  sla_atrasado: boolean
  sla_alerta: boolean
  dias_para_sla: number
  dias_para_promessa: number
  data_sla_laboratorio: string | null
  observacoes_sla: string | null
  
  // Campos adicionais para compatibilidade com PedidoCompleto
  tratamentos_nomes: string
  tratamentos_count: number
  dias_desde_pedido: number
  dias_para_vencer_sla: number | null
  dias_para_vencer_prometido: number | null
  alertas_count: number
  data_montagem: string | null
  custo_montagem: number | null
  montador_nome: string | null
  montador_local: string | null
  montador_contato: string | null
}

export default function PedidoDetalhesPage() {
  const router = useRouter()
  const params = useParams()
  const { userProfile, loading: authLoading } = useAuth()
  
  const [pedido, setPedido] = useState<PedidoDetalhes | null>(null)
  const [tratamentos, setTratamentos] = useState<any[]>([])
  const [alertas, setAlertas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const pedidoId = params?.id as string

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !userProfile) {
      router.push('/login')
    }
  }, [authLoading, userProfile, router])

  const carregarPedido = useCallback(async () => {
    try {
      setLoading(true)
      
      // Buscar pedido completo com dados de preço/margem
      const { data: pedidoData, error: pedidoError } = await supabase
        .from('pedidos')
        .select(`
          *,
          loja:lojas(nome, codigo, endereco, telefone),
          laboratorio:laboratorios(nome, codigo, sla_padrao_dias, trabalha_sabado),
          classe:classes_lente(nome, codigo, categoria, sla_base_dias, cor_badge)
        `)
        .eq('id', pedidoId)
        .single()

      if (pedidoError) {
        console.error('Erro ao carregar pedido:', pedidoError)
        throw pedidoError
      }

      // Extrair dados relacionados da query
      const loja = pedidoData.loja
      const laboratorio = pedidoData.laboratorio
      const classe = pedidoData.classe

      // 💰 Log dados financeiros
      console.log('💰 Dados financeiros do pedido:', {
        preco_armacao: pedidoData.preco_armacao,
        custo_armacao: pedidoData.custo_armacao,
        margem_armacao_percentual: pedidoData.margem_armacao_percentual,
        preco_lente: pedidoData.preco_lente,
        custo_lente: pedidoData.custo_lente,
        margem_lente_percentual: pedidoData.margem_lente_percentual
      })

      // Transformar dados para a interface esperada, com fallbacks seguros
      const pedidoCompleto: PedidoDetalhes = {
        // Campos básicos (sempre existem)
        id: pedidoData.id,
        numero_sequencial: pedidoData.numero_sequencial,
        status: pedidoData.status,
        tipo_pedido: pedidoData.tipo_pedido || null,
        prioridade: pedidoData.prioridade || 'NORMAL',
        cliente_nome: pedidoData.cliente_nome,
        created_at: pedidoData.created_at,
        data_pedido: pedidoData.data_pedido,
        eh_garantia: pedidoData.eh_garantia || false,
        
        // Campos opcionais com fallbacks
        numero_os_fisica: pedidoData.numero_os_fisica || null,
        numero_pedido_laboratorio: pedidoData.numero_pedido_laboratorio || null,
        cliente_telefone: pedidoData.cliente_telefone || null,
        valor_pedido: pedidoData.valor_pedido || null,
        custo_lentes: pedidoData.custo_lentes || null,
        forma_pagamento: pedidoData.forma_pagamento || null,
        
        // 💰 Preços e Margens - Armação
        preco_armacao: pedidoData.preco_armacao || null,
        custo_armacao: pedidoData.custo_armacao || null,
        margem_armacao_percentual: pedidoData.margem_armacao_percentual || null,
        
        // 💰 Preços e Margens - Lente
        preco_lente: pedidoData.preco_lente || null,
        custo_lente: pedidoData.custo_lente || null,
        margem_lente_percentual: pedidoData.margem_lente_percentual || null,
        
        // Dados ópticos
        esferico_od: pedidoData.esferico_od || null,
        cilindrico_od: pedidoData.cilindrico_od || null,
        eixo_od: pedidoData.eixo_od || null,
        adicao_od: pedidoData.adicao_od || null,
        esferico_oe: pedidoData.esferico_oe || null,
        cilindrico_oe: pedidoData.cilindrico_oe || null,
        eixo_oe: pedidoData.eixo_oe || null,
        adicao_oe: pedidoData.adicao_oe || null,
        distancia_pupilar: pedidoData.distancia_pupilar || null,
        material_lente: pedidoData.material_lente || null,
        indice_refracao: pedidoData.indice_refracao || null,
        
        // Flags de controle
        pagamento_atrasado: pedidoData.pagamento_atrasado || false,
        producao_atrasada: pedidoData.producao_atrasada || false,
        requer_atencao: pedidoData.requer_atencao || false,
        
        // Datas opcionais
        data_prometida: pedidoData.data_prometida || null,
        data_limite_pagamento: pedidoData.data_limite_pagamento || null,
        data_prevista_pronto: pedidoData.data_prevista_pronto || null,
        data_prevista_envio: pedidoData.data_prevista_envio || null,
        data_pagamento: pedidoData.data_pagamento || null,
        data_entregue: pedidoData.data_entregue || null,
        data_inicio_producao: pedidoData.data_inicio_producao || null,
        data_conclusao_producao: pedidoData.data_conclusao_producao || null,
        updated_at: pedidoData.updated_at || null,
        
        // Observações
        observacoes: pedidoData.observacoes || null,
        observacoes_garantia: pedidoData.observacoes_garantia || null,
        observacoes_internas: pedidoData.observacoes_internas || null,
        
        // Métricas de tempo
        lead_time_producao_horas: pedidoData.lead_time_producao_horas || null,
        lead_time_total_horas: pedidoData.lead_time_total_horas || null,
        laboratorio_responsavel_producao: pedidoData.laboratorio_responsavel_producao || null,
        
        // Auditoria
        created_by: pedidoData.created_by || null,
        updated_by: pedidoData.updated_by || null,
        vendedor_id: pedidoData.vendedor_id || null,
        
        // SLA Intelligence (campos da view - se disponíveis)
        sla_atrasado: pedidoData.sla_atrasado || false,
        sla_alerta: pedidoData.sla_alerta || false,
        dias_para_sla: pedidoData.dias_para_sla || null,
        dias_para_promessa: pedidoData.dias_para_promessa || null,
        data_sla_laboratorio: pedidoData.data_sla_laboratorio || null,
        margem_seguranca_dias: pedidoData.margem_seguranca_dias || null,
        alerta_sla_dias: pedidoData.alerta_sla_dias || null,
        observacoes_sla: pedidoData.observacoes_sla || null,

        // IDs para relacionamentos (usando dados dos objetos relacionados)
        loja_id: loja?.id || pedidoData.loja_id || '',
        laboratorio_id: laboratorio?.id || pedidoData.laboratorio_id || '',
        classe_lente_id: classe?.id || pedidoData.classe_lente_id || '',
        montador_id: pedidoData.montador_id || null,
        
        // Dados adicionais para compatibilidade
        tratamentos_nomes: pedidoData.tratamentos_nomes || '',
        tratamentos_count: pedidoData.tratamentos_count || 0,
        dias_desde_pedido: pedidoData.dias_desde_pedido || 0,
        dias_para_vencer_sla: pedidoData.dias_para_vencer_sla || null,
        dias_para_vencer_prometido: pedidoData.dias_para_vencer_prometido || null,
        alertas_count: pedidoData.alertas_count || 0,
        data_montagem: pedidoData.data_montagem || null,
        custo_montagem: pedidoData.custo_montagem || null,
        montador_nome: pedidoData.montador_nome || null,
        montador_local: pedidoData.montador_local || null,
        montador_contato: pedidoData.montador_contato || null,
        
        // Dados da loja (com fallbacks seguros)
        loja_nome: loja?.nome || pedidoData.loja_nome || 'Loja não encontrada',
        loja_codigo: loja?.codigo || pedidoData.loja_codigo || undefined,
        loja_endereco: loja?.endereco || null, // View atual não tem endereço
        loja_telefone: loja?.telefone || null, // View atual não tem telefone
        loja_whatsapp: loja?.whatsapp || null, // View atual não tem whatsapp
        
        // Dados do laboratório (com fallbacks seguros)
        laboratorio_nome: laboratorio?.nome || pedidoData.laboratorio_nome || 'Laboratório não encontrado',
        laboratorio_codigo: laboratorio?.codigo || pedidoData.laboratorio_codigo || null,
        laboratorio_sla_padrao: laboratorio?.sla_padrao_dias || pedidoData.sla_padrao_dias || undefined,
        laboratorio_trabalha_sabado: laboratorio?.trabalha_sabado || false, // View atual não tem essa info
        laboratorio_especialidades: laboratorio?.especialidades || null, // View atual não tem essa info
        
        // Dados da classe (com fallbacks seguros)
        classe_nome: classe?.nome || pedidoData.classe_lente_nome || pedidoData.classe_nome || 'Classe não encontrada',
        classe_codigo: classe?.codigo || pedidoData.classe_codigo || null,
        classe_categoria: classe?.categoria || pedidoData.classe_categoria || null,
        classe_sla_base: classe?.sla_base_dias || pedidoData.classe_sla_dias || undefined,
        classe_cor: classe?.cor_badge || pedidoData.classe_cor || undefined
      }

      // Debug: Log dados do montador
      console.log('🔧 Dados do montador:', {
        montador_id: pedidoCompleto.montador_id,
        montador_nome: pedidoCompleto.montador_nome,
        montador_local: pedidoCompleto.montador_local,
        montador_contato: pedidoCompleto.montador_contato,
        custo_montagem: pedidoCompleto.custo_montagem,
        data_montagem: pedidoCompleto.data_montagem
      })

      setPedido(pedidoCompleto)
      
      // Carregar dados relacionados em paralelo (com tratamento de erros individual)
      const [tratamentosResult, alertasResult] = await Promise.allSettled([
        // Tratamentos (pode não existir a tabela)
        supabase
          .from('pedido_tratamentos')
          .select(`
            id,
            pedido_id,
            tratamento_id,
            custo_unitario
          `)
          .eq('pedido_id', pedidoId),
        
        // Alertas (pode não existir a tabela)
        supabase
          .from('alertas')
          .select('*')
          .eq('pedido_id', pedidoId)
          .order('created_at', { ascending: false })
          .limit(10)
      ])

      // Processar resultados com tratamento de erro individual      
      if (tratamentosResult.status === 'fulfilled' && tratamentosResult.value.data) {
        setTratamentos(tratamentosResult.value.data)
      } else {
        console.log('Tabela pedido_tratamentos não existe ou está vazia')
        setTratamentos([])
      }
      
      if (alertasResult.status === 'fulfilled' && alertasResult.value.data) {
        setAlertas(alertasResult.value.data)
      } else {
        console.log('Tabela alertas não existe ou está vazia')
        setAlertas([])
      }
      
    } catch (error) {
      console.error('Erro ao carregar dados do pedido:', error)
      setError('Erro ao carregar pedido')
    } finally {
      setLoading(false)
    }
  }, [pedidoId])

  // Effect para mostrar toast de erro
  useEffect(() => {
    if (error) {
      toast.error(error)
      setError(null)
    }
  }, [error])

  useEffect(() => {
    if (!pedidoId || !userProfile) return
    carregarPedido()
  }, [pedidoId, userProfile, carregarPedido])

  const getStatusColor = (status: StatusPedido): string => {
    const colors = {
      'PENDENTE': 'bg-slate-400',
      'REGISTRADO': 'bg-gray-500',
      'AG_PAGAMENTO': 'bg-yellow-500', 
      'PAGO': 'bg-blue-500',
      'PRODUCAO': 'bg-purple-500',
      'PRONTO': 'bg-indigo-500',
      'ENVIADO': 'bg-cyan-500',
      'CHEGOU': 'bg-orange-500',
      'ENTREGUE': 'bg-green-500',
      'FINALIZADO': 'bg-emerald-700',
      'CANCELADO': 'bg-red-500'
    }
    return colors[status] || 'bg-gray-500'
  }

  const getStatusLabel = (status: StatusPedido): string => {
    const labels = {
      'PENDENTE': 'Pendente - Análise DCL',
      'REGISTRADO': 'Registrado',
      'AG_PAGAMENTO': 'Aguardando Pagamento',
      'PAGO': 'Pago',
      'PRODUCAO': 'Em Produção',
      'PRONTO': 'Pronto no DCL',
      'ENVIADO': 'Enviado para Loja',
      'CHEGOU': 'Chegou na Loja',
      'ENTREGUE': 'Entregue ao Cliente',
      'FINALIZADO': 'Finalizado',
      'CANCELADO': 'Cancelado'
    }
    return labels[status] || status
  }

  const getPrioridadeColor = (prioridade: PrioridadeLevel): string => {
    const colors = {
      'BAIXA': 'bg-gray-100 text-gray-800',
      'NORMAL': 'bg-blue-100 text-blue-800',
      'ALTA': 'bg-yellow-100 text-yellow-800',
      'URGENTE': 'bg-red-100 text-red-800'
    }
    return colors[prioridade] || 'bg-gray-100 text-gray-800'
  }

  // Formatação de graus ópticos
  const formatarGrau = (valor: number | null): string => {
    if (valor === null) return '-'
    return valor > 0 ? `+${valor.toFixed(2)}` : valor.toFixed(2)
  }

  // Calcular dias desde criação
  const calcularDiasDesdePedido = (dataPedido: string): number => {
    const hoje = new Date()
    const pedido = new Date(dataPedido)
    return Math.floor((hoje.getTime() - pedido.getTime()) / (1000 * 60 * 60 * 24))
  }

  // Calcular SLA restante
  const calcularSLARestante = (dataPrevista: string | null): number | null => {
    if (!dataPrevista) return null
    const hoje = new Date()
    const prevista = new Date(dataPrevista)
    return Math.floor((prevista.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))
  }

  // Calcular margem
  const calcularMargem = (valor: number | null, custo: number | null): { valor: number, percentual: number } => {
    if (!valor || !custo) return { valor: 0, percentual: 0 }
    const margem = valor - custo
    const percentual = valor > 0 ? (margem / valor) * 100 : 0
    return { valor: margem, percentual }
  }

  // Formatar percentual com 2 casas decimais
  const formatarPercentual = (valor: number): string => {
    return valor.toFixed(2) + '%'
  }

  if (!userProfile) {
    return <LoadingSpinner />
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <Card className="backdrop-blur-xl bg-white/30 dark:bg-gray-800/30 border-white/20 dark:border-gray-700/20 shadow-xl">
          <CardContent className="flex items-center justify-center p-8">
            <LoadingSpinner />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!pedido) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="backdrop-blur-xl bg-white/30 dark:bg-gray-800/30 border-b border-white/20 dark:border-gray-700/20">
          <PedidoHeader 
            mode="details"
            pedidoId={pedidoId}
          />
        </div>
        
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <Card className="backdrop-blur-xl bg-white/30 dark:bg-gray-800/30 border-white/20 dark:border-gray-700/20 shadow-xl max-w-md w-full text-center">
              <CardContent className="pt-6">
                <AlertTriangle className="w-16 h-16 text-red-500 dark:text-red-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-4 dark:text-white">Pedido não encontrado</h2>
                <p className="text-muted-foreground dark:text-gray-400 mb-6">
                  O pedido com ID &quot;{pedidoId}&quot; não foi encontrado ou você não tem permissão para visualizá-lo.
                </p>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="backdrop-blur-xl bg-white/30 dark:bg-gray-800/30 border-b border-white/20 dark:border-gray-700/20">
        <PedidoHeader 
          mode="details"
          pedidoId={pedidoId}
          numeroSequencial={pedido.numero_sequencial}
          status={pedido.status}
          prioridade={pedido.prioridade}
          pedido={pedido as PedidoCompleto}
        />
      </div>

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* KPIs Expandidos - Armações e Lentes */}
          <div className="space-y-4">
            {/* Armações KPIs */}
            {(pedido.tipo_pedido === 'ARMACAO' || pedido.tipo_pedido === 'COMPLETO') && (
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Armação
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <KPICard 
                    title="Preço Venda"
                    value={pedido.preco_armacao || 0}
                    format="currency"
                    className="backdrop-blur-xl bg-green-50/30 dark:bg-green-950/20 border-green-200/50 dark:border-green-800/50 shadow-xl hover:shadow-2xl transition-all duration-300"
                  />
                  <KPICard 
                    title="Custo"
                    value={pedido.custo_armacao || 0}
                    format="currency"
                    className="backdrop-blur-xl bg-orange-50/30 dark:bg-orange-950/20 border-orange-200/50 dark:border-orange-800/50 shadow-xl hover:shadow-2xl transition-all duration-300"
                  />
                  <KPICard 
                    title="Lucro"
                    value={(pedido.preco_armacao || 0) - (pedido.custo_armacao || 0)}
                    format="currency"
                    className="backdrop-blur-xl bg-blue-50/30 dark:bg-blue-950/20 border-blue-200/50 dark:border-blue-800/50 shadow-xl hover:shadow-2xl transition-all duration-300"
                  />
                  <Card className="backdrop-blur-xl bg-purple-50/30 dark:bg-purple-950/20 border-purple-200/50 dark:border-purple-800/50 shadow-xl hover:shadow-2xl transition-all duration-300">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground dark:text-gray-400 flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        Margem %
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                        {pedido.margem_armacao_percentual 
                          ? formatarPercentual(pedido.margem_armacao_percentual)
                          : calcularMargem(pedido.preco_armacao || 0, pedido.custo_armacao || 0).percentual > 0 
                            ? formatarPercentual(calcularMargem(pedido.preco_armacao || 0, pedido.custo_armacao || 0).percentual)
                            : '-'
                        }
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Lentes KPIs */}
            {(pedido.tipo_pedido === 'LENTES' || pedido.tipo_pedido === 'COMPLETO') && (
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Lentes
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <KPICard 
                    title="Preço Venda"
                    value={pedido.preco_lente || 0}
                    format="currency"
                    className="backdrop-blur-xl bg-green-50/30 dark:bg-green-950/20 border-green-200/50 dark:border-green-800/50 shadow-xl hover:shadow-2xl transition-all duration-300"
                  />
                  <KPICard 
                    title="Custo"
                    value={pedido.custo_lente || 0}
                    format="currency"
                    className="backdrop-blur-xl bg-orange-50/30 dark:bg-orange-950/20 border-orange-200/50 dark:border-orange-800/50 shadow-xl hover:shadow-2xl transition-all duration-300"
                  />
                  <KPICard 
                    title="Lucro"
                    value={(pedido.preco_lente || 0) - (pedido.custo_lente || 0)}
                    format="currency"
                    className="backdrop-blur-xl bg-blue-50/30 dark:bg-blue-950/20 border-blue-200/50 dark:border-blue-800/50 shadow-xl hover:shadow-2xl transition-all duration-300"
                  />
                  <Card className="backdrop-blur-xl bg-purple-50/30 dark:bg-purple-950/20 border-purple-200/50 dark:border-purple-800/50 shadow-xl hover:shadow-2xl transition-all duration-300">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground dark:text-gray-400 flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        Margem %
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                        {pedido.margem_lente_percentual 
                          ? formatarPercentual(pedido.margem_lente_percentual)
                          : calcularMargem(pedido.preco_lente || 0, pedido.custo_lente || 0).percentual > 0
                            ? formatarPercentual(calcularMargem(pedido.preco_lente || 0, pedido.custo_lente || 0).percentual)
                            : '-'
                        }
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Total Consolidado */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Total Consolidado
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard 
                  title="Valor Total"
                  value={pedido.valor_pedido || (pedido.preco_armacao || 0) + (pedido.preco_lente || 0)}
                  format="currency"
                  className="backdrop-blur-xl bg-white/30 border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300"
                />
                <KPICard 
                  title="Custo Total"
                  value={(pedido.custo_armacao || 0) + (pedido.custo_lente || 0)}
                  format="currency"
                  className="backdrop-blur-xl bg-white/30 border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300"
                />
                <KPICard 
                  title="Lucro Total"
                  value={(pedido.valor_pedido || (pedido.preco_armacao || 0) + (pedido.preco_lente || 0)) - ((pedido.custo_armacao || 0) + (pedido.custo_lente || 0))}
                  format="currency"
                  className="backdrop-blur-xl bg-white/30 border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300"
                />
                <Card className="backdrop-blur-xl bg-white/30 border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground dark:text-gray-400 flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      Margem %
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold dark:text-white">
                      {(() => {
                        const valorTotal = pedido.valor_pedido || (pedido.preco_armacao || 0) + (pedido.preco_lente || 0)
                        const custoTotal = (pedido.custo_armacao || 0) + (pedido.custo_lente || 0)
                        return formatarPercentual(calcularMargem(valorTotal, custoTotal).percentual)
                      })()}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Layout Principal em 2 Colunas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Coluna 1: Informações do Cliente e Dados Ópticos */}
            <div className="space-y-6">
              {/* Informações do Cliente */}
              <Card className="backdrop-blur-xl bg-white/30 dark:bg-gray-800/30 border-white/20 dark:border-gray-700/20 shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between dark:text-white">
                    <div className="flex items-center gap-2">
                      <User className="w-5 h-5" />
                      <span>Cliente</span>
                    </div>
                    <div className="flex gap-2">
                      <Badge 
                        variant="outline" 
                        className={`${getStatusColor(pedido.status)} text-white border-transparent`}
                      >
                        {getStatusLabel(pedido.status)}
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className={getPrioridadeColor(pedido.prioridade)}
                      >
                        {pedido.prioridade}
                      </Badge>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground dark:text-gray-400">Nome</p>
                    <p className="text-lg font-semibold dark:text-white">{pedido.cliente_nome}</p>
                  </div>
                  
                  {pedido.cliente_telefone && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground dark:text-gray-400">Telefone</p>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                        <p className="dark:text-gray-300">{pedido.cliente_telefone}</p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    {pedido.numero_os_fisica && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">OS Física</p>
                        <p className="font-mono text-sm">{pedido.numero_os_fisica}</p>
                      </div>
                    )}
                    
                    {pedido.numero_pedido_laboratorio && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Pedido Lab</p>
                        <p className="font-mono text-sm">{pedido.numero_pedido_laboratorio}</p>
                      </div>
                    )}
                  </div>

                  {pedido.eh_garantia && (
                    <div className="bg-blue-50/50 dark:bg-blue-950/30 backdrop-blur-sm border border-blue-200/50 dark:border-blue-800 rounded-lg p-3">
                      <p className="text-sm font-medium text-blue-800 dark:text-blue-300 flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        Pedido em Garantia
                      </p>
                      {pedido.observacoes_garantia && (
                        <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">{pedido.observacoes_garantia}</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Dados Ópticos */}
              <Card className="backdrop-blur-xl bg-white/30 dark:bg-gray-800/30 border-white/20 dark:border-gray-700/20 shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 dark:text-white">
                    <Eye className="w-5 h-5" />
                    <span>Dados Ópticos</span>
                  </CardTitle>
                  <CardDescription className="dark:text-gray-400">Receita do cliente</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Olho Direito */}
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground dark:text-gray-400 mb-2">Olho Direito (OD)</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm dark:text-gray-300">
                      <div>
                        <span className="text-muted-foreground">Esférico:</span>
                        <span className="ml-2 font-mono">{formatarGrau(pedido.esferico_od)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Cilíndrico:</span>
                        <span className="ml-2 font-mono">{formatarGrau(pedido.cilindrico_od)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Eixo:</span>
                        <span className="ml-2 font-mono">{pedido.eixo_od || '-'}°</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Adição:</span>
                        <span className="ml-2 font-mono">{formatarGrau(pedido.adicao_od)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Olho Esquerdo */}
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-2">Olho Esquerdo (OE)</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">Esférico:</span>
                        <span className="ml-2 font-mono">{formatarGrau(pedido.esferico_oe)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Cilíndrico:</span>
                        <span className="ml-2 font-mono">{formatarGrau(pedido.cilindrico_oe)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Eixo:</span>
                        <span className="ml-2 font-mono">{pedido.eixo_oe || '-'}°</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Adição:</span>
                        <span className="ml-2 font-mono">{formatarGrau(pedido.adicao_oe)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Dados Adicionais */}
                  <div className="pt-2 border-t border-gray-200/50">
                    <div className="grid grid-cols-1 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Distância Pupilar:</span>
                        <span className="ml-2 font-mono">{pedido.distancia_pupilar || '-'} mm</span>
                      </div>
                      {pedido.material_lente && (
                        <div>
                          <span className="text-muted-foreground">Material:</span>
                          <span className="ml-2">{pedido.material_lente}</span>
                        </div>
                      )}
                      {pedido.indice_refracao && (
                        <div>
                          <span className="text-muted-foreground">Índice:</span>
                          <span className="ml-2">{pedido.indice_refracao}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tratamentos */}
              {tratamentos && tratamentos.length > 0 && (
                <Card className="backdrop-blur-xl bg-white/30 dark:bg-gray-800/30 border-white/20 dark:border-gray-700/20 shadow-xl hover:shadow-2xl transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 dark:text-white">
                      <Settings className="w-5 h-5" />
                      <span>Tratamentos</span>
                    </CardTitle>
                    <CardDescription className="dark:text-gray-400">{tratamentos.length} tratamento(s) aplicado(s)</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {tratamentos.map((item: any) => (
                        <div key={item.id} className="flex justify-between items-center p-2 bg-gray-50/50 dark:bg-gray-700/50 rounded">
                          <span className="font-medium dark:text-gray-200">{item.tratamento_nome || `Tratamento ID: ${item.tratamento_id}`}</span>
                          {item.custo_unitario && (
                            <span className="text-sm text-green-600 dark:text-green-400">
                              +R$ {item.custo_unitario.toFixed(2)}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Controle de Datas */}
              <Card className="backdrop-blur-xl bg-white/30 dark:bg-gray-800/30 border-white/20 dark:border-gray-700/20 shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 dark:text-white">
                    <Clock className="w-5 h-5" />
                    <span>Controle de Datas</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Pedido</span>
                      <span className="text-sm font-medium">
                        {format(parseISO(pedido.data_pedido), 'dd/MM/yyyy', { locale: ptBR })}
                      </span>
                    </div>

                    {pedido.data_limite_pagamento && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Limite Pagamento</span>
                        <span className="text-sm font-medium">
                          {format(parseISO(pedido.data_limite_pagamento), 'dd/MM/yyyy', { locale: ptBR })}
                        </span>
                      </div>
                    )}

                    {pedido.data_pagamento && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Pagamento</span>
                        <span className="text-sm font-medium text-green-600">
                          {format(parseISO(pedido.data_pagamento), 'dd/MM/yyyy', { locale: ptBR })}
                        </span>
                      </div>
                    )}

                    {pedido.data_prometida && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Data Prometida</span>
                        <span className="text-sm font-medium text-blue-600">
                          {format(parseISO(pedido.data_prometida), 'dd/MM/yyyy', { locale: ptBR })}
                        </span>
                      </div>
                    )}

                    {pedido.data_prevista_pronto && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Previsão Pronto</span>
                        <span className="text-sm font-medium">
                          {format(parseISO(pedido.data_prevista_pronto), 'dd/MM/yyyy', { locale: ptBR })}
                        </span>
                      </div>
                    )}

                    {pedido.data_inicio_producao && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Início Produção</span>
                        <span className="text-sm font-medium">
                          {format(parseISO(pedido.data_inicio_producao), 'dd/MM/yyyy', { locale: ptBR })}
                        </span>
                      </div>
                    )}

                    {pedido.data_conclusao_producao && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Fim Produção</span>
                        <span className="text-sm font-medium text-green-600">
                          {format(parseISO(pedido.data_conclusao_producao), 'dd/MM/yyyy', { locale: ptBR })}
                        </span>
                      </div>
                    )}

                    {pedido.data_entregue && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Entrega</span>
                        <span className="text-sm font-medium text-green-600">
                          {format(parseISO(pedido.data_entregue), 'dd/MM/yyyy', { locale: ptBR })}
                        </span>
                      </div>
                    )}

                    <div className="pt-2 border-t border-gray-200/50">
                      <span className="text-xs text-muted-foreground">Última atualização:</span>
                      <p className="text-xs text-gray-600">
                        {pedido.updated_at 
                          ? format(parseISO(pedido.updated_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })
                          : 'Não atualizado'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Controle de Qualidade */}
              <Card className="backdrop-blur-xl bg-white/30 dark:bg-gray-800/30 border-white/20 dark:border-gray-700/20 shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 dark:text-white">
                    <Target className="w-5 h-5" />
                    <span>Controle de Qualidade</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm dark:text-gray-300">Pagamento em Atraso</span>
                      {pedido.pagamento_atrasado ? (
                        <AlertCircle className="w-4 h-4 text-red-500 dark:text-red-400" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-green-500 dark:text-green-400" />
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm dark:text-gray-300">Produção em Atraso</span>
                      {pedido.producao_atrasada ? (
                        <AlertCircle className="w-4 h-4 text-red-500 dark:text-red-400" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-green-500 dark:text-green-400" />
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm dark:text-gray-300">Requer Atenção</span>
                      {pedido.requer_atencao ? (
                        <AlertCircle className="w-4 h-4 text-yellow-500 dark:text-yellow-400" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-green-500 dark:text-green-400" />
                      )}
                    </div>

                    {pedido.lead_time_producao_horas && (
                      <div className="pt-2 border-t border-gray-200/50 dark:border-gray-700/50">
                        <span className="text-sm text-muted-foreground dark:text-gray-400">Lead Time Produção:</span>
                        <p className="text-sm font-medium dark:text-gray-200">
                          {Math.round(pedido.lead_time_producao_horas / 24)} dias 
                          ({pedido.lead_time_producao_horas}h)
                        </p>
                      </div>
                    )}

                    {pedido.lead_time_total_horas && (
                      <div>
                        <span className="text-sm text-muted-foreground dark:text-gray-400">Lead Time Total:</span>
                        <p className="text-sm font-medium dark:text-gray-200">
                          {Math.round(pedido.lead_time_total_horas / 24)} dias 
                          ({pedido.lead_time_total_horas}h)
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Coluna 2: Estabelecimentos, SLA e Observações */}
            <div className="space-y-6">
              {/* Estabelecimentos Expandidos */}
              <Card className="backdrop-blur-xl bg-white/30 dark:bg-gray-800/30 border-white/20 dark:border-gray-700/20 shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 dark:text-white">
                    <Building className="w-5 h-5" />
                    <span>Estabelecimentos</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Loja Detalhada */}
                  <div className="p-3 bg-blue-50/30 dark:bg-blue-950/30 rounded-lg border dark:border-blue-800">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span className="font-medium text-blue-900 dark:text-blue-300">Loja</span>
                    </div>
                    <p className="font-semibold dark:text-white">{pedido.loja_nome}</p>
                    {pedido.loja_codigo && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">Código: {pedido.loja_codigo}</p>
                    )}
                    {pedido.loja_endereco && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">{pedido.loja_endereco}</p>
                    )}
                    <div className="flex gap-4 mt-2">
                      {pedido.loja_telefone && (
                        <span className="text-sm text-gray-600 dark:text-gray-400">📞 {pedido.loja_telefone}</span>
                      )}
                      {pedido.loja_whatsapp && (
                        <span className="text-sm text-green-600 dark:text-green-400">📱 {pedido.loja_whatsapp}</span>
                      )}
                    </div>
                  </div>

                  {/* Laboratório Detalhado */}
                  <div className="p-3 bg-purple-50/30 dark:bg-purple-950/30 rounded-lg border dark:border-purple-800">
                    <div className="flex items-center gap-2 mb-2">
                      <Stethoscope className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      <span className="font-medium text-purple-900 dark:text-purple-300">Laboratório</span>
                    </div>
                    <p className="font-semibold dark:text-white">{pedido.laboratorio_nome}</p>
                    {pedido.laboratorio_codigo && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">Código: {pedido.laboratorio_codigo}</p>
                    )}
                    <div className="flex gap-4 mt-2 text-sm">
                      {pedido.laboratorio_sla_padrao && (
                        <span className="text-gray-600 dark:text-gray-400">
                          SLA: {pedido.laboratorio_sla_padrao} dias
                        </span>
                      )}
                      {pedido.laboratorio_trabalha_sabado && (
                        <span className="text-green-600 dark:text-green-400">✓ Sábado</span>
                      )}
                    </div>
                    {pedido.laboratorio_especialidades && pedido.laboratorio_especialidades.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-muted-foreground dark:text-gray-400">Especialidades:</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {pedido.laboratorio_especialidades.map((esp, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {esp}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Classe de Lente */}
                  <div className="p-3 bg-green-50/30 dark:bg-green-950/30 rounded-lg border dark:border-green-800">
                    <div className="flex items-center gap-2 mb-2">
                      <Package className="w-4 h-4 text-green-600 dark:text-green-400" />
                      <span className="font-medium text-green-900 dark:text-green-300">Classe de Lente</span>
                    </div>
                    <p className="font-semibold dark:text-white">{pedido.classe_nome}</p>
                    <div className="flex gap-4 mt-2 text-sm">
                      {pedido.classe_categoria && (
                        <span className="text-gray-600 dark:text-gray-400">Categoria: {pedido.classe_categoria}</span>
                      )}
                      {pedido.classe_sla_base && (
                        <span className="text-gray-600 dark:text-gray-400">SLA: {pedido.classe_sla_base} dias</span>
                      )}
                    </div>
                  </div>

                  {/* Montador Responsável */}
                  {(pedido.montador_nome || pedido.montador_id) && (
                    <div className="p-3 bg-cyan-50/30 dark:bg-cyan-950/30 rounded-lg border dark:border-cyan-800">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                        <span className="font-medium text-cyan-900 dark:text-cyan-300">Montador Responsável</span>
                      </div>
                      {pedido.montador_nome ? (
                        <>
                          <p className="font-semibold dark:text-white">{pedido.montador_nome}</p>
                          {pedido.montador_local && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">{pedido.montador_local}</p>
                          )}
                          {pedido.montador_contato && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              📞 {pedido.montador_contato}
                            </p>
                          )}
                          {pedido.custo_montagem && (
                            <p className="text-sm text-cyan-700 dark:text-cyan-400 mt-2 font-medium">
                              💰 R$ {Number(pedido.custo_montagem).toFixed(2)}
                            </p>
                          )}
                          {pedido.data_montagem && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              Atribuído em {format(parseISO(pedido.data_montagem), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                            </p>
                          )}
                        </>
                      ) : (
                        <div className="bg-yellow-50/50 dark:bg-yellow-950/30 border border-yellow-200/50 dark:border-yellow-800 rounded p-2 mt-2">
                          <p className="text-sm text-yellow-800 dark:text-yellow-300">
                            ⚠️ Montador vinculado mas dados incompletos
                          </p>
                          <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                            ID: {pedido.montador_id}
                          </p>
                          <p className="text-xs text-yellow-600 dark:text-yellow-400">
                            Execute o script de atualização para popular os dados
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                </CardContent>
              </Card>

              {/* SLA e Métricas */}
              <Card className="backdrop-blur-xl bg-white/30 dark:bg-gray-800/30 border-white/20 dark:border-gray-700/20 shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 dark:text-white">
                    <TrendingUp className="w-5 h-5" />
                    <span>SLA e Métricas</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {pedido.classe_sla_base && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">SLA Base da Classe</span>
                        <span className="text-sm font-medium">{pedido.classe_sla_base} dias</span>
                      </div>
                    )}
                    
                    {pedido.laboratorio_sla_padrao && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">SLA Padrão Lab</span>
                        <span className="text-sm font-medium">{pedido.laboratorio_sla_padrao} dias</span>
                      </div>
                    )}

                    {pedido.prioridade !== 'NORMAL' && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Prioridade</span>
                        <Badge className={`text-xs ${
                          pedido.prioridade === 'URGENTE' ? 'bg-red-500' :
                          pedido.prioridade === 'ALTA' ? 'bg-orange-500' :
                          pedido.prioridade === 'BAIXA' ? 'bg-gray-500' : 'bg-blue-500'
                        }`}>
                          {pedido.prioridade}
                        </Badge>
                      </div>
                    )}

                    {tratamentos && tratamentos.length > 0 && (
                      <div className="pt-2 border-t border-gray-200/50">
                        <span className="text-sm text-muted-foreground">Impacto Tratamentos:</span>
                        <p className="text-xs text-gray-600">
                          {tratamentos.length} tratamento(s) aplicado(s)
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Alertas */}
              {alertas && alertas.length > 0 && (
                <Card className="backdrop-blur-xl bg-white/30 border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5" />
                      <span>Alertas</span>
                    </CardTitle>
                    <CardDescription>{alertas.length} alerta(s) ativo(s)</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {alertas.map((alerta: any) => (
                        <div 
                          key={alerta.id}
                          className={`p-2 rounded text-sm ${
                            alerta.prioridade === 'alta' 
                              ? 'bg-red-50/50 text-red-800 border border-red-200/50'
                              : 'bg-yellow-50/50 text-yellow-800 border border-yellow-200/50'
                          }`}
                        >
                          <p className="font-medium">{alerta.titulo || 'Alerta'}</p>
                          {alerta.mensagem && (
                            <p className="text-xs mt-1">{alerta.mensagem}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Observações */}
              {(pedido.observacoes || pedido.observacoes_internas) && (
                <Card className="backdrop-blur-xl bg-white/30 border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      <span>Observações</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {pedido.observacoes && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-2">Observações Gerais</p>
                        <div className="bg-gray-50/50 backdrop-blur-sm rounded-lg p-3">
                          <p className="text-sm whitespace-pre-wrap">{pedido.observacoes}</p>
                        </div>
                      </div>
                    )}

                    {pedido.observacoes_internas && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-2">Observações Internas</p>
                        <div className="bg-red-50/50 backdrop-blur-sm rounded-lg p-3 border border-red-200/50">
                          <p className="text-sm whitespace-pre-wrap text-red-800">{pedido.observacoes_internas}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Progresso do Pedido - Full Width */}
          <Card className="backdrop-blur-xl bg-white/30 border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    <span>Progresso do Pedido</span>
                    {pedido.sla_atrasado && (
                      <Badge className="bg-red-500 text-white ml-auto">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        ATRASADO
                      </Badge>
                    )}
                    {pedido.sla_alerta && !pedido.sla_atrasado && (
                      <Badge className="bg-yellow-500 text-white ml-auto">
                        ALERTA
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Barra de Progresso Visual */}
                    <div className="flex items-center gap-2">
                      {['REGISTRADO', 'PAGO', 'PRODUCAO', 'PRONTO', 'ENTREGUE'].map((status, idx) => {
                        const isComplete = ['REGISTRADO', 'PAGO', 'PRODUCAO', 'PRONTO', 'ENTREGUE'].indexOf(pedido.status) >= idx
                        const isCurrent = pedido.status === status
                        return (
                          <div key={status} className="flex-1">
                            <div className={`h-2 rounded-full transition-all duration-300 ${
                              isComplete ? 'bg-green-500 dark:bg-green-400' : 
                              isCurrent ? 'bg-blue-500 dark:bg-blue-400 animate-pulse' :
                              'bg-gray-200 dark:bg-gray-700'
                            }`} />
                            <p className={`text-xs mt-1 text-center ${
                              isCurrent ? 'font-bold text-blue-600 dark:text-blue-400' :
                              isComplete ? 'text-green-600 dark:text-green-400' :
                              'text-gray-400 dark:text-gray-600'
                            }`}>
                              {status === 'REGISTRADO' ? 'Registro' :
                               status === 'PAGO' ? 'Pago' :
                               status === 'PRODUCAO' ? 'Produção' :
                               status === 'PRONTO' ? 'Pronto' : 'Entregue'}
                            </p>
                          </div>
                        )
                      })}
                    </div>

                    {/* Métricas SLA Horizontais */}
                    <div className="grid grid-cols-3 gap-3 pt-3 border-t border-gray-200/50 dark:border-gray-700/50">
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground dark:text-gray-400">Dias no Sistema</p>
                        <p className="text-lg font-bold dark:text-white">{calcularDiasDesdePedido(pedido.data_pedido)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground dark:text-gray-400">SLA Restante</p>
                        <p className={`text-lg font-bold ${
                          pedido.sla_atrasado ? 'text-red-500 dark:text-red-400' :
                          pedido.sla_alerta ? 'text-yellow-500 dark:text-yellow-400' :
                          'text-green-500 dark:text-green-400'
                        }`}>
                          {calcularSLARestante(pedido.data_prevista_pronto) || '-'} dias
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground dark:text-gray-400">Promessa</p>
                        <p className="text-lg font-bold text-blue-500 dark:text-blue-400">
                          {pedido.data_prometida ? format(parseISO(pedido.data_prometida), 'dd/MM', { locale: ptBR }) : '-'}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
        </div>
      </main>
    </div>
  )
}