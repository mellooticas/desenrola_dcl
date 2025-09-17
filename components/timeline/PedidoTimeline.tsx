'use client'

import { TimelineEvent } from './TimelineEvent'
import { StatusMarker } from './StatusMarker'
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

interface PedidoTimelineProps {
  timeline: TimelineEntry[]
  className?: string
}

export function PedidoTimeline({ timeline, className = '' }: PedidoTimelineProps) {
  if (!timeline || timeline.length === 0) {
    return (
      <div className={`text-center py-8 text-gray-500 ${className}`}>
        <p>Nenhum evento encontrado na timeline deste pedido.</p>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {timeline.map((entry, index) => (
        <div key={entry.id} className="relative">
          {/* Linha conectora vertical */}
          {index < timeline.length - 1 && (
            <div className="absolute left-5 top-12 w-0.5 h-16 bg-gray-200"></div>
          )}
          
          <div className="flex items-start space-x-4">
            {/* Marcador de status */}
            <StatusMarker 
              status={entry.status_novo}
              stepNumber={index + 1}
            />
            
            {/* Evento da timeline */}
            <TimelineEvent 
              entry={entry}
              isLast={index === timeline.length - 1}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
