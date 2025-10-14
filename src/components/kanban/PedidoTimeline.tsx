'use client'

import { PedidoCompleto } from '@/lib/types/database'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Package,
  CreditCard,
  Truck,
  FileText
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface PedidoTimelineProps {
  pedido: PedidoCompleto
}

interface TimelineEvent {
  id: string
  titulo: string
  data: string | null
  status: 'completed' | 'current' | 'upcoming' | 'warning' | 'overdue'
  icone: React.ReactNode
  descricao?: string
  isSlaDate?: boolean
}

export function PedidoTimeline({ pedido }: PedidoTimelineProps) {
  const formatDate = (date: string | null) => {
    if (!date) return null
    try {
      return format(parseISO(date), 'dd/MM/yyyy', { locale: ptBR })
    } catch {
      return null
    }
  }

  const isDatePassed = (date: string | null): boolean => {
    if (!date) return false
    try {
      return new Date(date) < new Date()
    } catch {
      return false
    }
  }

  const getDaysUntil = (date: string | null): number | null => {
    if (!date) return null
    try {
      const targetDate = new Date(date)
      const today = new Date()
      return Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    } catch {
      return null
    }
  }

  // Construir eventos da timeline
  const events: TimelineEvent[] = [
    {
      id: 'pedido',
      titulo: 'Pedido Criado',
      data: pedido.data_pedido,
      status: 'completed' as const,
      icone: <FileText className="w-4 h-4" />,
      descricao: `OS #${pedido.numero_sequencial}`
    },
    
    // SLA Laboratório (controle interno)
    ...(pedido.data_sla_laboratorio ? [{
      id: 'sla_lab',
      titulo: 'SLA Laboratório',
      data: pedido.data_sla_laboratorio,
      status: (isDatePassed(pedido.data_sla_laboratorio)
        ? (pedido.status === 'ENTREGUE' ? 'completed' as const : 'overdue' as const)
        : (getDaysUntil(pedido.data_sla_laboratorio)! <= 2 ? 'warning' as const : 'upcoming' as const)),
      icone: <Package className="w-4 h-4" />,
      descricao: 'Meta interna do laboratório',
      isSlaDate: true
    }] : []),

    {
      id: 'previsto',
      titulo: 'Data Prevista',
      data: pedido.data_prevista_pronto,
      status: (isDatePassed(pedido.data_prevista_pronto) 
        ? (pedido.status === 'ENTREGUE' ? 'completed' as const : 'warning' as const)
        : 'upcoming' as const),
      icone: <Calendar className="w-4 h-4" />,
      descricao: 'Previsão inicial de conclusão'
    },

    {
      id: 'promessa',
      titulo: 'Promessa ao Cliente',
      data: pedido.data_prometida,
      status: (isDatePassed(pedido.data_prometida) 
        ? (pedido.status === 'ENTREGUE' ? 'completed' as const : 'overdue' as const)
        : (getDaysUntil(pedido.data_prometida)! <= 3 ? 'warning' as const : 'upcoming' as const)),
      icone: <Truck className="w-4 h-4" />,
      descricao: `Data prometida (${pedido.margem_seguranca_dias || 2}d margem)`
    },

    // Eventos de pagamento
    ...(pedido.data_pagamento ? [{
      id: 'pagamento',
      titulo: 'Pagamento',
      data: pedido.data_pagamento,
      status: 'completed' as const,
      icone: <CreditCard className="w-4 h-4" />,
      descricao: `${pedido.forma_pagamento || 'N/A'}`
    }] : []),

    // Entrega (se status for ENTREGUE)
    ...(pedido.status === 'ENTREGUE' ? [{
      id: 'entregue',
      titulo: 'Entregue',
      data: pedido.updated_at || new Date().toISOString(),
      status: 'completed' as const,
      icone: <CheckCircle2 className="w-4 h-4" />,
      descricao: 'Pedido concluído com sucesso'
    }] : [])
  ].filter(event => event.data) // Remove eventos sem data

  const getStatusColor = (status: TimelineEvent['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-500 text-white'
      case 'current': return 'bg-blue-500 text-white'
      case 'warning': return 'bg-yellow-500 text-white'
      case 'overdue': return 'bg-red-500 text-white'
      case 'upcoming': return 'bg-gray-300 text-gray-600'
      default: return 'bg-gray-300 text-gray-600'
    }
  }

  const getStatusBadge = (status: TimelineEvent['status'], data: string | null) => {
    const days = getDaysUntil(data)
    
    switch (status) {
      case 'completed': 
        return <Badge className="bg-green-500 text-white text-xs">✓ Concluído</Badge>
      case 'warning': 
        return <Badge className="bg-yellow-500 text-white text-xs">⚠ {days}d restam</Badge>
      case 'overdue': 
        return <Badge className="bg-red-500 text-white text-xs animate-pulse">🚨 {Math.abs(days!)}d atraso</Badge>
      case 'upcoming': 
        return <Badge className="bg-gray-400 text-white text-xs">{days}d restam</Badge>
      default: 
        return <Badge className="bg-gray-300 text-gray-600 text-xs">Pendente</Badge>
    }
  }

  // Ordenar eventos por data
  const sortedEvents = events.sort((a, b) => {
    if (!a.data || !b.data) return 0
    return new Date(a.data).getTime() - new Date(b.data).getTime()
  })

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-600" />
          Timeline do Pedido
          <Badge variant="outline" className="ml-auto">
            {events.filter(e => e.status === 'completed').length}/{events.length} etapas
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Linha vertical */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
          
          {/* Eventos */}
          <div className="space-y-4">
            {sortedEvents.map((event, index) => (
              <div key={event.id} className="relative flex items-start gap-4">
                {/* Ícone */}
                <div className={`
                  relative z-10 flex items-center justify-center w-8 h-8 rounded-full border-2 border-white shadow-sm
                  ${getStatusColor(event.status)}
                  ${event.isSlaDate ? 'ring-2 ring-blue-300' : ''}
                `}>
                  {event.icone}
                </div>
                
                {/* Conteúdo */}
                <div className="flex-1 min-w-0 pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className={`text-sm font-medium ${
                        event.isSlaDate ? 'text-blue-700' : 'text-gray-900'
                      }`}>
                        {event.titulo}
                        {event.isSlaDate && (
                          <span className="ml-2 text-xs text-blue-600 font-bold">[SLA]</span>
                        )}
                      </h4>
                      <p className="text-xs text-gray-500 mt-0.5">{event.descricao}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-sm font-mono text-gray-700">
                        {formatDate(event.data)}
                      </span>
                      {getStatusBadge(event.status, event.data)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Resumo SLA */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h5 className="font-medium text-blue-800 mb-2">📊 Resumo SLA Intelligence</h5>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-blue-600">Margem de Segurança:</span>
              <div className="font-bold text-blue-800">{pedido.margem_seguranca_dias || 2} dias</div>
            </div>
            <div>
              <span className="text-blue-600">Status Geral:</span>
              <div className={`font-bold ${
                events.some(e => e.status === 'overdue') ? 'text-red-600' :
                events.some(e => e.status === 'warning') ? 'text-yellow-600' : 'text-green-600'
              }`}>
                {events.some(e => e.status === 'overdue') ? '🚨 Crítico' :
                 events.some(e => e.status === 'warning') ? '⚠ Atenção' : '✅ No Prazo'}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}