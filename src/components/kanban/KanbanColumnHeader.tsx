'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PedidoCompleto } from '@/lib/types/database'
import { calcularUrgenciaPagamento, type NivelUrgencia, type FiltroPrazo, getLabelFiltroPrazo } from '@/lib/utils/urgencia-pagamento'

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
  onFilterUrgencia?: (nivel: NivelUrgencia | null) => void // Callback para filtrar por urgência
  filtroAtivo?: NivelUrgencia | null // Filtro de urgência ativo
  onFilterPrazo?: (prazo: FiltroPrazo) => void // Callback para filtrar por prazo
  filtroPrazoAtivo?: FiltroPrazo // Filtro de prazo ativo
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
  filtroAtivo = null,
  onFilterPrazo,
  filtroPrazoAtivo = null
}: KanbanColumnHeaderProps) {
  
  const urgenciaStats = showUrgenciaAlerts && pedidos.length > 0 
    ? calcularUrgenciaStats(pedidos) 
    : null

  const temAlertas = urgenciaStats && (urgenciaStats.criticos > 0 || urgenciaStats.urgentes > 0)
  const temFiltroAtivo = filtroAtivo || filtroPrazoAtivo

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
        {showUrgenciaAlerts && urgenciaStats && (temAlertas || temFiltroAtivo) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-3 pt-3 border-t border-white/20"
          >
            {/* Filtro de Prazo - Dropdown */}
            <div className="mb-3">
              <Select
                value={filtroPrazoAtivo || 'todos'}
                onValueChange={(value) => onFilterPrazo?.(value === 'todos' ? null : value as FiltroPrazo)}
              >
                <SelectTrigger className="w-full bg-white/90 border-white/40 text-gray-800 font-semibold h-9 text-sm">
                  <SelectValue placeholder="Filtrar por prazo" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="todos" className="font-semibold">📋 Todos os Prazos</SelectItem>
                  <SelectItem value="vencido" className="text-red-700 font-semibold">🔴 Vencidos</SelectItem>
                  <SelectItem value="hoje" className="text-orange-700 font-semibold">⚠️ Vence Hoje</SelectItem>
                  <SelectItem value="amanha" className="text-yellow-700 font-semibold">⏰ Vence Amanhã</SelectItem>
                  <SelectItem value="proximos-3-dias" className="text-blue-700 font-semibold">📅 Próximos 3 dias</SelectItem>
                  <SelectItem value="esta-semana" className="text-green-700 font-semibold">📆 Esta Semana</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Badges de Urgência */}
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
              {temFiltroAtivo && (
                <Badge 
                  variant="outline"
                  onClick={() => {
                    onFilterUrgencia?.(null)
                    onFilterPrazo?.(null)
                  }}
                  className="cursor-pointer bg-white/90 text-gray-700 border-gray-300 hover:bg-white hover:scale-110 hover:shadow-lg transition-all duration-200 font-bold text-sm"
                >
                  ✕ Limpar Filtros
                </Badge>
              )}
            </div>
            
            {/* Indicador de filtro ativo */}
            {temFiltroAtivo && (
              <div className="mt-2 text-xs text-white/90 flex items-center gap-2 flex-wrap">
                <span>🔍 Filtrando:</span>
                {filtroAtivo && <span className="font-semibold bg-white/20 px-2 py-0.5 rounded">{filtroAtivo}</span>}
                {filtroPrazoAtivo && <span className="font-semibold bg-white/20 px-2 py-0.5 rounded">{getLabelFiltroPrazo(filtroPrazoAtivo)}</span>}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
