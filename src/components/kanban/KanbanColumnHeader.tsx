'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { PedidoCompleto } from '@/lib/types/database'
import { calcularUrgenciaPagamento, type NivelUrgencia } from '@/lib/utils/urgencia-pagamento'

interface UrgenciaStats {
  criticos: number
  urgentes: number
  atencao: number
  folga: number
}

interface KanbanColumnHeaderProps {
  title: string
  count: number
  icon: React.ComponentType<any>
  gradient: string
  color: string
  // Novo: props para alertas de urgência (AG_PAGAMENTO)
  pedidos?: PedidoCompleto[]
  showUrgenciaAlerts?: boolean
  onFilterUrgencia?: (nivel: NivelUrgencia | null) => void // Callback para filtrar
  filtroAtivo?: NivelUrgencia | null // Filtro ativo atualmente
}

function calcularUrgenciaStats(pedidos: PedidoCompleto[]): UrgenciaStats {
  const stats: UrgenciaStats = {
    criticos: 0,
    urgentes: 0,
    atencao: 0,
    folga: 0
  }

  pedidos.forEach(pedido => {
    if (pedido.data_prometida) {
      const urgencia = calcularUrgenciaPagamento(pedido.data_prometida, pedido.data_pedido)
      switch (urgencia.nivel) {
        case 'CRITICO':
          stats.criticos++
          break
        case 'URGENTE':
          stats.urgentes++
          break
        case 'ATENCAO':
          stats.atencao++
          break
        case 'FOLGA':
          stats.folga++
          break
      }
    }
  })

  return stats
}

export function KanbanColumnHeader({ 
  title, 
  count, 
  icon: Icon,
  gradient,
  color,
  pedidos = [],
  showUrgenciaAlerts = false,
  onFilterUrgencia,
  filtroAtivo = null
}: KanbanColumnHeaderProps) {
  
  const urgenciaStats = showUrgenciaAlerts && pedidos.length > 0 
    ? calcularUrgenciaStats(pedidos) 
    : null

  const temAlertas = urgenciaStats && (urgenciaStats.criticos > 0 || urgenciaStats.urgentes > 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative"
    >
      {/* Glow effect */}
      <div className={cn(
        "absolute inset-0 bg-gradient-to-r opacity-10 blur-xl rounded-xl",
        gradient
      )} />

      {/* Header content */}
      <div className={cn(
        "relative bg-gradient-to-r p-4 rounded-xl shadow-lg border",
        gradient,
        "border-opacity-20"
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg 
                          flex items-center justify-center">
              <Icon size={20} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">{title}</h3>
              <p className="text-xs text-white/80">Etapa do processo</p>
            </div>
          </div>
          
          {/* Animated counter */}
          <motion.div
            key={count}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="min-w-[2.5rem] h-10 bg-white/20 backdrop-blur-sm rounded-lg 
                     flex items-center justify-center px-3"
          >
            <span className="text-xl font-bold text-white">{count}</span>
          </motion.div>
        </div>

        {/* Alertas de Urgência (somente AG_PAGAMENTO) */}
        {showUrgenciaAlerts && urgenciaStats && (temAlertas || filtroAtivo) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-3 pt-3 border-t border-white/20"
          >
            <div className="flex items-center gap-2 flex-wrap">
              {urgenciaStats.criticos > 0 && (
                <Badge 
                  variant="outline" 
                  onClick={() => onFilterUrgencia?.(filtroAtivo === 'CRITICO' ? null : 'CRITICO')}
                  className={cn(
                    "cursor-pointer transition-all duration-200 font-semibold",
                    filtroAtivo === 'CRITICO' 
                      ? "bg-red-600 text-white border-red-400 ring-2 ring-white shadow-lg scale-105" 
                      : "bg-red-500/90 text-white border-red-300 hover:bg-red-600 hover:scale-105",
                    urgenciaStats.criticos > 0 && filtroAtivo !== 'CRITICO' && "animate-pulse"
                  )}
                >
                  🚨 {urgenciaStats.criticos} CRÍTICO{urgenciaStats.criticos > 1 ? 'S' : ''}
                </Badge>
              )}
              
              {urgenciaStats.urgentes > 0 && (
                <Badge 
                  variant="outline" 
                  onClick={() => onFilterUrgencia?.(filtroAtivo === 'URGENTE' ? null : 'URGENTE')}
                  className={cn(
                    "cursor-pointer transition-all duration-200 font-semibold",
                    filtroAtivo === 'URGENTE'
                      ? "bg-orange-600 text-white border-orange-400 ring-2 ring-white shadow-lg scale-105"
                      : "bg-orange-500/90 text-white border-orange-300 hover:bg-orange-600 hover:scale-105"
                  )}
                >
                  ⚠️ {urgenciaStats.urgentes} URGENTE{urgenciaStats.urgentes > 1 ? 'S' : ''}
                </Badge>
              )}
              
              {urgenciaStats.atencao > 0 && (
                <Badge 
                  variant="outline" 
                  onClick={() => onFilterUrgencia?.(filtroAtivo === 'ATENCAO' ? null : 'ATENCAO')}
                  className={cn(
                    "cursor-pointer transition-all duration-200 font-semibold",
                    filtroAtivo === 'ATENCAO'
                      ? "bg-yellow-600 text-white border-yellow-400 ring-2 ring-white shadow-lg scale-105"
                      : "bg-yellow-500/80 text-white border-yellow-300 hover:bg-yellow-600 hover:scale-105"
                  )}
                >
                  🟡 {urgenciaStats.atencao} ATENÇÃO
                </Badge>
              )}
              
              {/* Botão Limpar Filtro - SEMPRE VISÍVEL quando há filtro */}
              {filtroAtivo && (
                <Badge 
                  variant="outline"
                  onClick={() => onFilterUrgencia?.(null)}
                  className="cursor-pointer bg-white/90 text-gray-700 border-gray-300 hover:bg-white hover:scale-110 hover:shadow-lg transition-all duration-200 font-bold text-sm"
                >
                  ✕ Limpar Filtro
                </Badge>
              )}
            </div>
            
            {/* Indicador de filtro ativo */}
            {filtroAtivo && (
              <div className="mt-2 text-xs text-white/90 flex items-center gap-1">
                <span>🔍 Filtrando:</span>
                <span className="font-semibold">{filtroAtivo}</span>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
