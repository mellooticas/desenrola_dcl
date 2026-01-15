'use client'

import type { StatusPedido } from '@/lib/types/database'

interface StatusMarkerProps {
  status: StatusPedido
  stepNumber: number
  className?: string
}

// Função para obter a cor do status
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
    'CANCELADO': 'bg-red-500'
  }
  return colors[status] || 'bg-gray-500'
}

export function StatusMarker({ status, stepNumber, className = '' }: StatusMarkerProps) {
  return (
    <div 
      className={`
        w-10 h-10 rounded-full flex items-center justify-center
        ${getStatusColor(status)} text-white text-xs font-bold
        shadow-lg border-2 border-white
        ${className}
      `}
    >
      {stepNumber}
    </div>
  )
}
