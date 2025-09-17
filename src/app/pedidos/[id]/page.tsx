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
  Shield
} from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toast } from 'sonner'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { PedidoHeader } from '@/components/pedidos/PedidoHeader'
import { KPICard } from '@/components/dashboard/KPICard'
import type { StatusPedido, PrioridadeLevel } from '@/lib/types/database'

interface PedidoDetalhes {
  id: string
  numero_sequencial: number
  numero_os_fisica: string | null
  numero_pedido_laboratorio: string | null
  status: StatusPedido
  prioridade: PrioridadeLevel
  cliente_nome: string
  cliente_telefone: string | null
  valor_pedido: number | null
  custo_lentes: number | null
  eh_garantia: boolean
  observacoes: string | null
  observacoes_garantia: string | null
  data_prevista_pronto: string | null
  created_at: string
  updated_at: string | null
  // Dados relacionados
  loja_nome: string
  laboratorio_nome: string
  classe_nome: string
}

export default function PedidoDetalhesPage() {
  const router = useRouter()
  const params = useParams()
  const { userProfile, loading: authLoading } = useAuth()
  
  const [pedido, setPedido] = useState<PedidoDetalhes | null>(null)
  const [loading, setLoading] = useState(true)

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
      
    } catch (error) {
      console.error('Erro ao carregar dados do pedido:', error)
      toast.error('Erro ao carregar pedido')
    } finally {
      setLoading(false)
    }
  }, [pedidoId])

  useEffect(() => {
    if (!pedidoId || !userProfile) return
    carregarPedido()
  }, [pedidoId, userProfile, carregarPedido])

  const getStatusColor = (status: StatusPedido): string => {
    const colors = {
      'REGISTRADO': 'bg-gray-500',
      'AG_PAGAMENTO': 'bg-yellow-500', 
      'PAGO': 'bg-blue-500',
      'PRODUCAO': 'bg-purple-500',
      'PRONTO': 'bg-indigo-500',
      'ENVIADO': 'bg-cyan-500',
      'CHEGOU': 'bg-orange-500',
      'ENTREGUE': 'bg-green-500',
      'CANCELADO': 'bg-red-500'
    }
    return colors[status] || 'bg-gray-500'
  }

  const getStatusLabel = (status: StatusPedido): string => {
    const labels = {
      'REGISTRADO': 'Registrado',
      'AG_PAGAMENTO': 'Aguardando Pagamento',
      'PAGO': 'Pago',
      'PRODUCAO': 'Em Produção',
      'PRONTO': 'Pronto no DCL',
      'ENVIADO': 'Enviado para Loja',
      'CHEGOU': 'Chegou na Loja',
      'ENTREGUE': 'Entregue ao Cliente',
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

  if (!userProfile) {
    return <LoadingSpinner />
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="backdrop-blur-xl bg-white/30 border-white/20 shadow-xl">
          <CardContent className="flex items-center justify-center p-8">
            <LoadingSpinner />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!pedido) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="backdrop-blur-xl bg-white/30 border-b border-white/20">
          <PedidoHeader 
            mode="details"
            pedidoId={pedidoId}
          />
        </div>
        
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <Card className="backdrop-blur-xl bg-white/30 border-white/20 shadow-xl max-w-md w-full text-center">
              <CardContent className="pt-6">
                <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-4">Pedido não encontrado</h2>
                <p className="text-muted-foreground mb-6">
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="backdrop-blur-xl bg-white/30 border-b border-white/20">
        <PedidoHeader 
          mode="details"
          pedidoId={pedidoId}
          numeroSequencial={pedido.numero_sequencial}
          status={pedido.status}
          prioridade={pedido.prioridade}
        />
      </div>

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* KPIs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <KPICard 
              title="Valor do Pedido"
              value={pedido.valor_pedido || 0}
              format="currency"
              className="backdrop-blur-xl bg-white/30 border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300"
            />
            <KPICard 
              title="Custo das Lentes"
              value={pedido.custo_lentes || 0}
              format="currency"
              className="backdrop-blur-xl bg-white/30 border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300"
            />
            <KPICard 
              title="Margem"
              value={pedido.valor_pedido && pedido.custo_lentes ? pedido.valor_pedido - pedido.custo_lentes : 0}
              format="currency"
              className="backdrop-blur-xl bg-white/30 border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300"
            />
            <KPICard 
              title="Margem %"
              value={pedido.valor_pedido && pedido.custo_lentes && pedido.valor_pedido > 0 
                ? Math.round(((pedido.valor_pedido - pedido.custo_lentes) / pedido.valor_pedido) * 100)
                : 0}
              format="percentage"
              className="backdrop-blur-xl bg-white/30 border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300"
            />
          </div>

          {/* Informações Detalhadas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Informações Gerais */}
            <Card className="backdrop-blur-xl bg-white/30 border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    <span>Informações do Cliente</span>
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
                <CardDescription>
                  Dados básicos do cliente e contato
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Nome do Cliente</p>
                    <p className="text-lg font-semibold">{pedido.cliente_nome}</p>
                  </div>
                  
                  {pedido.cliente_telefone && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Telefone</p>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <p>{pedido.cliente_telefone}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pedido.numero_os_fisica && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">OS Física</p>
                      <p>{pedido.numero_os_fisica}</p>
                    </div>
                  )}
                  
                  {pedido.numero_pedido_laboratorio && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Pedido Lab</p>
                      <p>{pedido.numero_pedido_laboratorio}</p>
                    </div>
                  )}
                </div>

                {pedido.eh_garantia && (
                  <div className="bg-blue-50/50 backdrop-blur-sm border border-blue-200/50 rounded-lg p-3">
                    <p className="text-sm font-medium text-blue-800 flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Pedido em Garantia
                    </p>
                    {pedido.observacoes_garantia && (
                      <p className="text-sm text-blue-600 mt-1">{pedido.observacoes_garantia}</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Estabelecimentos */}
            <Card className="backdrop-blur-xl bg-white/30 border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  <span>Estabelecimentos</span>
                </CardTitle>
                <CardDescription>
                  Loja e laboratório envolvidos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Loja</p>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <p className="text-lg">{pedido.loja_nome}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground">Laboratório</p>
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-gray-400" />
                    <p className="text-lg">{pedido.laboratorio_nome}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground">Classe de Lente</p>
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-gray-400" />
                    <p className="text-lg">{pedido.classe_nome}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Datas e Prazos */}
            <Card className="backdrop-blur-xl bg-white/30 border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <span>Datas e Prazos</span>
                </CardTitle>
                <CardDescription>
                  Controle de datas importantes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Data de Criação</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <p>{format(parseISO(pedido.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</p>
                  </div>
                </div>

                {pedido.data_prevista_pronto && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Previsão de Pronto</p>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-400" />
                      <p>{format(parseISO(pedido.data_prevista_pronto), 'dd/MM/yyyy', { locale: ptBR })}</p>
                    </div>
                  </div>
                )}

                {pedido.updated_at && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Última Atualização</p>
                    <p className="text-sm text-gray-600">
                      {format(parseISO(pedido.updated_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Observações - Se existirem */}
            {pedido.observacoes && (
              <Card className="backdrop-blur-xl bg-white/30 border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardHeader>
                  <CardTitle>Observações</CardTitle>
                  <CardDescription>
                    Anotações sobre o pedido
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50/50 backdrop-blur-sm rounded-lg p-4">
                    <p className="whitespace-pre-wrap">{pedido.observacoes}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}