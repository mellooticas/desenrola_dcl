// components/kanban/TermometroUrgencia.tsx
'use client'

import React from 'react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { 
  calcularUrgenciaPagamento, 
  formatarDiasRestantes,
  type UrgenciaInfo 
} from '@/lib/utils/urgencia-pagamento'

interface TermometroUrgenciaProps {
  dataSlaLab: string | Date | null
  dataPedido?: string | Date
  dataPrometida?: string | Date | null
  valorPedido?: number | null
  compact?: boolean // Versão compacta para cards pequenos
  className?: string
}

export function TermometroUrgencia({
  dataSlaLab,
  dataPedido,
  dataPrometida,
  valorPedido,
  compact = false,
  className
}: TermometroUrgenciaProps) {
  const urgencia = calcularUrgenciaPagamento(dataSlaLab, dataPedido)

  // Formato compacto (apenas badge)
  if (compact) {
    return (
      <Badge
        variant="outline"
        className={cn(
          'font-semibold border-2 transition-all duration-300',
          urgencia.corBg,
          urgencia.cor,
          urgencia.pulsante && 'animate-pulse',
          className
        )}
      >
        {urgencia.icon} {urgencia.label} • {formatarDiasRestantes(urgencia.diasRestantes)}
      </Badge>
    )
  }

  // Formato completo com termômetro visual
  return (
    <div className={cn('space-y-2 rounded-lg border-2 p-3', urgencia.corBg, className)}>
      {/* Header com Badge de Status */}
      <div className="flex items-center justify-between">
        <Badge
          variant="outline"
          className={cn(
            'text-xs font-bold border-2',
            urgencia.cor,
            urgencia.pulsante && 'animate-pulse'
          )}
        >
          {urgencia.icon} {urgencia.label}
        </Badge>
        <span className={cn('text-sm font-semibold', urgencia.cor)}>
          {formatarDiasRestantes(urgencia.diasRestantes)}
        </span>
      </div>

      {/* Barra de Progresso (Termômetro) */}
      <div className="space-y-1">
        <div className="h-3 w-full bg-gray-200 rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full bg-gradient-to-r transition-all duration-500 ease-out',
              urgencia.corBarra,
              urgencia.pulsante && 'animate-pulse'
            )}
            style={{ width: `${Math.min(100, urgencia.percentualUrgencia)}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-600">
          <span>Urgência: {urgencia.percentualUrgencia}%</span>
          {urgencia.dataLimite && (
            <span className="font-medium">
              Limite: {urgencia.dataLimite.toLocaleDateString('pt-BR')}
            </span>
          )}
        </div>
      </div>

      {/* Informações Adicionais */}
      {(dataPrometida || valorPedido) && (
        <div className="flex items-center justify-between text-xs border-t pt-2 mt-2">
          {dataPrometida && (
            <div className="flex items-center gap-1">
              <span className="text-gray-500">SLA Lab:</span>
              <span className="font-medium">
                {typeof dataPrometida === 'string' 
                  ? new Date(dataPrometida).toLocaleDateString('pt-BR')
                  : dataPrometida.toLocaleDateString('pt-BR')
                }
              </span>
            </div>
          )}
          {valorPedido && (
            <div className="flex items-center gap-1">
              <span className="text-gray-500">💰</span>
              <span className="font-semibold">
                {valorPedido.toLocaleString('pt-BR', { 
                  style: 'currency', 
                  currency: 'BRL' 
                })}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Alerta Crítico */}
      {urgencia.nivel === 'CRITICO' && urgencia.diasRestantes <= 0 && (
        <div className="bg-red-100 border border-red-400 rounded px-2 py-1 text-xs font-bold text-red-800 text-center animate-pulse">
          🚨 PRAZO DO LABORATÓRIO VENCIDO! PAGAR URGENTE!
        </div>
      )}

      {urgencia.nivel === 'CRITICO' && urgencia.diasRestantes > 0 && urgencia.diasRestantes <= 1 && (
        <div className="bg-red-50 border border-red-300 rounded px-2 py-1 text-xs font-semibold text-red-700 text-center">
          ⚠️ Pagar com urgência para não perder prazo do lab!
        </div>
      )}
    </div>
  )
}

// Componente de Badge Simples (para usar em outras views)
export function BadgeUrgencia({
  dataSlaLab,
  dataPedido,
  showDias = true,
  className
}: {
  dataSlaLab: string | Date | null
  dataPedido?: string | Date
  showDias?: boolean
  className?: string
}) {
  const urgencia = calcularUrgenciaPagamento(dataSlaLab, dataPedido)

  return (
    <Badge
      variant="outline"
      className={cn(
        'text-xs font-semibold border-2 transition-all',
        urgencia.corBg,
        urgencia.cor,
        urgencia.pulsante && 'animate-pulse',
        className
      )}
    >
      {urgencia.icon} {urgencia.label}
      {showDias && ` • ${formatarDiasRestantes(urgencia.diasRestantes)}`}
    </Badge>
  )
}
