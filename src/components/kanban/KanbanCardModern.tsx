'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Clock, MapPin, User, Beaker, DollarSign, Sparkles, Eye } from 'lucide-react'

interface KanbanCardModernProps {
  pedido: any
  laboratorioGradient: string
  isDragging?: boolean
  onClick?: () => void
}

export function KanbanCardModern({ 
  pedido, 
  laboratorioGradient,
  isDragging = false,
  onClick 
}: KanbanCardModernProps) {
  
  // Calcular status SLA
  const diasEmStatus = pedido.dias_em_status || 0
  const slaAtrasado = diasEmStatus > 5
  const slaAlerta = diasEmStatus > 3 && diasEmStatus <= 5
  const ehGarantia = pedido.eh_garantia || false
  
  // Cores do card baseado em status
  const getBorderColor = () => {
    if (ehGarantia) return 'border-amber-300 dark:border-amber-700'
    if (slaAtrasado) return 'border-red-300 dark:border-red-700'
    if (slaAlerta) return 'border-yellow-300 dark:border-yellow-700'
    return 'border-gray-200 dark:border-gray-800'
  }
  
  const getBackgroundColor = () => {
    if (ehGarantia) return 'bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20'
    if (slaAtrasado) return 'bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/20 dark:to-red-900/20'
    if (slaAlerta) return 'bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20'
    return 'bg-white dark:bg-gray-900'
  }
  
  const getHeaderBarColor = () => {
    if (ehGarantia) return 'from-amber-500 via-orange-500 to-red-500'
    if (slaAtrasado) return 'from-red-500 via-red-600 to-red-700'
    if (slaAlerta) return 'from-yellow-500 via-orange-500 to-yellow-600'
    return 'from-green-500 via-blue-500 to-indigo-500'
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ 
        y: -4,
        transition: { duration: 0.2 }
      }}
      onClick={onClick}
      className="relative group cursor-pointer"
    >
      {/* Glow effect on hover */}
      <motion.div
        className={cn(
          "absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-20 blur-xl rounded-xl transition-opacity",
          laboratorioGradient
        )}
      />

      {/* Card */}
      <div className={cn(
        "relative rounded-xl border-2 transition-all duration-200 overflow-hidden",
        getBackgroundColor(),
        getBorderColor(),
        isDragging 
          ? "shadow-2xl scale-105" 
          : "shadow-md group-hover:shadow-xl"
      )}>
        
        {/* Header colorido */}
        <div className={cn("h-1.5 bg-gradient-to-r", getHeaderBarColor())}></div>
        
        {/* Indicador SLA */}
        {(slaAtrasado || slaAlerta) && (
          <div className="absolute top-3 right-3 z-10">
            <div className={cn(
              "w-3 h-3 rounded-full animate-pulse shadow-lg",
              slaAtrasado ? "bg-red-500" : "bg-yellow-500"
            )}></div>
          </div>
        )}
        
        <div className="p-3">
          {/* Header com OS e Garantia */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className={cn(
                "text-xs font-mono font-bold px-3 py-1 shadow-sm bg-gradient-to-r",
                laboratorioGradient,
                "text-white"
              )}>
                OS #{pedido.numero_sequencial || pedido.numero_pedido}
              </Badge>
              
              {ehGarantia && (
                <Badge className="text-xs bg-amber-500 text-white px-2 py-0.5 font-semibold shadow-sm flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  GARANTIA
                </Badge>
              )}
            </div>
            <Eye className="w-4 h-4 text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          
          {/* OS Loja e Lab */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            {pedido.numero_os_fisica && (
              <div className={cn(
                "rounded-md px-2 py-1.5 border-l-4",
                ehGarantia
                  ? "bg-amber-50 dark:bg-amber-900/30 border-amber-400"
                  : "bg-gray-50 dark:bg-gray-800 border-gray-400"
              )}>
                <div className={cn(
                  "text-[10px] font-medium uppercase",
                  ehGarantia ? "text-amber-600 dark:text-amber-400" : "text-gray-500 dark:text-gray-400"
                )}>
                  LOJA
                </div>
                <div className={cn(
                  "text-xs font-mono font-semibold",
                  ehGarantia ? "text-amber-700 dark:text-amber-300" : "text-gray-700 dark:text-gray-200"
                )}>
                  {pedido.numero_os_fisica}
                </div>
              </div>
            )}
            
            {pedido.numero_pedido_laboratorio && (
              <div className={cn(
                "rounded-md px-2 py-1.5 border-l-4",
                ehGarantia
                  ? "bg-orange-50 dark:bg-orange-900/30 border-orange-400"
                  : "bg-blue-50 dark:bg-blue-900/30 border-blue-400"
              )}>
                <div className={cn(
                  "text-[10px] font-medium uppercase",
                  ehGarantia ? "text-orange-600 dark:text-orange-400" : "text-blue-600 dark:text-blue-400"
                )}>
                  LAB
                </div>
                <div className={cn(
                  "text-xs font-mono font-semibold",
                  ehGarantia ? "text-orange-700 dark:text-orange-300" : "text-blue-700 dark:text-blue-300"
                )}>
                  {pedido.numero_pedido_laboratorio}
                </div>
              </div>
            )}
          </div>
          
          {/* Cliente com avatar */}
          <div className={cn(
            "mb-3 p-2 rounded-lg border",
            ehGarantia
              ? "bg-gradient-to-r from-amber-50 via-amber-100 to-orange-100 dark:from-amber-900/20 dark:via-amber-900/30 dark:to-orange-900/30 border-amber-200 dark:border-amber-700"
              : "bg-gradient-to-r from-gray-50 via-gray-100 to-gray-50 dark:from-gray-800/30 dark:via-gray-700/50 dark:to-gray-800/30 border-gray-200 dark:border-gray-700"
          )}>
            <div className="flex items-start gap-2">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-gradient-to-br shadow-sm",
                ehGarantia
                  ? "from-amber-500 to-orange-600"
                  : "from-blue-500 to-blue-600"
              )}>
                <span className="text-white text-xs font-bold">
                  {(pedido.cliente_nome || 'C').charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-gray-900 dark:text-white leading-tight line-clamp-2">
                  {pedido.cliente_nome || 'Cliente não informado'}
                </p>
              </div>
            </div>
          </div>
          
          {/* Laboratório com custo */}
          <div className="mb-3">
            <div className={cn(
              "inline-flex items-center rounded-full px-3 py-1.5 border w-full justify-between",
              ehGarantia
                ? "bg-gradient-to-r from-amber-100 via-amber-200 to-orange-200 dark:from-amber-900/20 dark:via-amber-900/40 dark:to-orange-900/40 border-amber-300 dark:border-amber-600"
                : "bg-gradient-to-r from-purple-100 via-purple-200 to-purple-100 dark:from-purple-900/20 dark:via-purple-900/40 dark:to-purple-900/20 border-purple-300 dark:border-purple-600"
            )}>
              <div className="flex items-center gap-2">
                <Beaker className={cn(
                  "w-3 h-3",
                  ehGarantia ? "text-amber-700 dark:text-amber-400" : "text-purple-700 dark:text-purple-400"
                )} />
                <span className={cn(
                  "text-xs font-semibold",
                  ehGarantia ? "text-amber-800 dark:text-amber-300" : "text-purple-800 dark:text-purple-300"
                )}>
                  {pedido.laboratorio_nome || 'Lab não definido'}
                </span>
              </div>
              
              {pedido.custo_lentes && pedido.status === 'AG_PAGAMENTO' && (
                <div className={cn(
                  "flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full border shadow-sm",
                  ehGarantia 
                    ? "bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100 border-amber-400 dark:border-amber-600" 
                    : "bg-purple-200 dark:bg-purple-800 text-purple-900 dark:text-purple-100 border-purple-400 dark:border-purple-600"
                )}>
                  <DollarSign className="w-3 h-3" />
                  <span>
                    {pedido.custo_lentes.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          {/* Informações adicionais */}
          <div className="space-y-2 mb-3">
            {pedido.montador_nome && (
              <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                <User size={12} className="flex-shrink-0" />
                <span className="line-clamp-1">{pedido.montador_nome}</span>
              </div>
            )}
            
            {pedido.loja_nome && (
              <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                <MapPin size={12} className="flex-shrink-0" />
                <span className="line-clamp-1">{pedido.loja_nome}</span>
              </div>
            )}
          </div>
          
          {/* Dias em status */}
          {diasEmStatus > 0 && (
            <div className="mb-3">
              <div className="flex items-center gap-2 text-xs">
                <Clock size={12} />
                <span className={cn(
                  "font-medium",
                  diasEmStatus > 5 
                    ? "text-red-600 dark:text-red-400" 
                    : diasEmStatus > 3
                      ? "text-yellow-600 dark:text-yellow-400"
                      : "text-gray-600 dark:text-gray-400"
                )}>
                  {diasEmStatus} {diasEmStatus === 1 ? 'dia' : 'dias'} neste status
                </span>
              </div>
            </div>
          )}

          {/* Footer com valor */}
          {pedido.valor_total && (
            <div className="pt-3 border-t border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Valor Total</span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  {new Intl.NumberFormat('pt-BR', { 
                    style: 'currency', 
                    currency: 'BRL' 
                  }).format(pedido.valor_total)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
