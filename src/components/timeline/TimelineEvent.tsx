'use client'

import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Badge } from '@/components/ui/badge'
import { User, Clock, MessageSquare } from 'lucide-react'
import type { StatusPedido } from '@/lib/types/database'

interface TimelineEntry {
  id: string
  pedido_id: string
  status_anterior?: StatusPedido | null
  status_novo: StatusPedido
  responsavel_id?: string | null
  observacoes?: string | null
  created_at: string
  responsavel_nome?: string
  tempo_na_etapa?: number // em horas
}

interface TimelineEventProps {
  entry: TimelineEntry
  isLast: boolean
  className?: string
}

// Função para obter o label do status
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

// Função para formatar tempo
const formatTempo = (horas: number): string => {
  if (horas < 24) {
    return `${Math.round(horas)}h`
  }
  const dias = Math.floor(horas / 24)
  const horasRestantes = Math.round(horas % 24)
  return horasRestantes > 0 ? `${dias}d ${horasRestantes}h` : `${dias}d`
}

export function TimelineEvent({ entry, isLast, className = '' }: TimelineEventProps) {
  return (
    <div className={`flex-1 min-w-0 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-lg text-gray-900">
            {getStatusLabel(entry.status_novo)}
          </h3>
          <p className="text-sm text-gray-600 flex items-center space-x-1">
            <Clock className="w-4 h-4" />
            <span>
              {format(parseISO(entry.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
            </span>
          </p>
        </div>
        
        {/* Tempo na etapa anterior */}
        {entry.tempo_na_etapa && entry.tempo_na_etapa > 0 && (
          <Badge variant="outline" className="text-xs">
            <Clock className="w-3 h-3 mr-1" />
            {formatTempo(entry.tempo_na_etapa)}
          </Badge>
        )}
      </div>
      
      {/* Responsável */}
      {entry.responsavel_nome && (
        <div className="mt-2 flex items-center space-x-2 text-sm text-gray-600">
          <User className="w-4 h-4" />
          <span>Responsável: {entry.responsavel_nome}</span>
        </div>
      )}
      
      {/* Observações */}
      {entry.observacoes && (
        <div className="mt-2 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-start space-x-2">
            <MessageSquare className="w-4 h-4 mt-0.5 text-gray-600" />
            <div>
              <p className="text-xs font-medium text-gray-600 mb-1">Observações:</p>
              <p className="text-sm text-gray-800">{entry.observacoes}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Separador - apenas se não for o último */}
      {!isLast && (
        <div className="mt-6 border-b border-gray-100"></div>
      )}
    </div>
  )
}
