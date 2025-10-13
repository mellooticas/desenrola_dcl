import { PedidoCompleto } from '@/lib/types/database'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Eye,
  ChevronLeft,
  ChevronRight,
  Beaker,
  Sparkles,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Calendar
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface KanbanCardProps {
  pedido: PedidoCompleto
  onClick: () => void
  isDragging?: boolean
  onMoveLeft?: () => void
  onMoveRight?: () => void
  canMoveLeft?: boolean
  canMoveRight?: boolean
}

// 🎨 SISTEMA DE CORES INTELIGENTE BASEADO EM SLA
function getSlaStatus(pedido: PedidoCompleto) {
  const hoje = new Date()
  const dataSlaLab = pedido.data_sla_laboratorio ? new Date(pedido.data_sla_laboratorio) : null
  const dataPromessaCliente = pedido.data_prometida ? new Date(pedido.data_prometida) : null
  
  // Usar campos calculados da view se disponíveis
  const slaAtrasado = pedido.sla_atrasado ?? (dataSlaLab ? dataSlaLab < hoje : false)
  const slaAlerta = pedido.sla_alerta ?? (dataSlaLab ? dataSlaLab <= new Date(hoje.getTime() + 24 * 60 * 60 * 1000) : false)
  
  const diasParaSla = pedido.dias_para_sla ?? (dataSlaLab ? Math.ceil((dataSlaLab.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24)) : null)
  const diasParaPromessa = pedido.dias_para_promessa ?? (dataPromessaCliente ? Math.ceil((dataPromessaCliente.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24)) : null)
  
  return {
    slaAtrasado,
    slaAlerta,
    diasParaSla,
    diasParaPromessa,
    dataSlaLab,
    dataPromessaCliente
  }
}

function getCardStyles(pedido: PedidoCompleto, slaStatus: ReturnType<typeof getSlaStatus>) {
  const { slaAtrasado, slaAlerta } = slaStatus
  
  // GARANTIA sempre laranja/amber
  if (pedido.eh_garantia) {
    return {
      cardClass: "bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300 hover:border-amber-400 shadow-amber-100",
      headerClass: "bg-gradient-to-r from-amber-500 via-orange-500 to-red-500",
      badgeClass: "bg-gradient-to-r from-amber-600 to-orange-600 text-white"
    }
  }
  
  // SLA ATRASADO - Vermelho intenso
  if (slaAtrasado) {
    return {
      cardClass: "bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-400 hover:border-red-500 shadow-red-100",
      headerClass: "bg-gradient-to-r from-red-500 via-red-600 to-red-700",
      badgeClass: "bg-gradient-to-r from-red-600 to-red-700 text-white"
    }
  }
  
  // SLA EM ALERTA - Amarelo/laranja
  if (slaAlerta) {
    return {
      cardClass: "bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-400 hover:border-orange-400 shadow-yellow-100",
      headerClass: "bg-gradient-to-r from-yellow-500 via-orange-500 to-yellow-600",
      badgeClass: "bg-gradient-to-r from-yellow-600 to-orange-600 text-white"
    }
  }
  
  // STATUS NORMAL - Verde/azul
  return {
    cardClass: "bg-gradient-to-br from-green-50 to-blue-50 border border-green-200 hover:border-blue-300 shadow-green-50",
    headerClass: "bg-gradient-to-r from-green-500 via-blue-500 to-indigo-500",
    badgeClass: "bg-gradient-to-r from-green-600 to-blue-700 text-white"
  }
}

export function KanbanCard({ 
  pedido, 
  onClick, 
  isDragging,
  onMoveLeft,
  onMoveRight,
  canMoveLeft = false,
  canMoveRight = false
}: KanbanCardProps) {
  
  const slaStatus = getSlaStatus(pedido)
  const cardStyles = getCardStyles(pedido, slaStatus)

  return (
    <Card
      className={cn(
        "group relative cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-[1.02]",
        isDragging && "opacity-50 rotate-2 scale-95 shadow-xl",
        cardStyles.cardClass,
        "rounded-lg overflow-hidden"
      )}
      onClick={onClick}
    >
      {/* Header colorido com gradiente inteligente */}
      <div className={cn("h-1.5", cardStyles.headerClass)}></div>
      
      {/* Indicador de status SLA */}
      {(slaStatus.slaAtrasado || slaStatus.slaAlerta) && (
        <div className="absolute top-2 right-2 z-10">
          {slaStatus.slaAtrasado ? (
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-lg"></div>
          ) : (
            <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse shadow-lg"></div>
          )}
        </div>
      )}
      
      <CardContent className="p-3">
        
        {/* Header com OS Principal */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Badge 
              variant="secondary" 
              className={cn(
                "text-xs font-mono font-bold px-3 py-1 shadow-sm",
                cardStyles.badgeClass
              )}
            >
              OS #{pedido.numero_sequencial}
            </Badge>
            
            {pedido.eh_garantia && (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                <Badge className="text-xs bg-amber-500 text-white px-2 py-0.5 font-semibold shadow-sm">
                  <Sparkles className="w-3 h-3 mr-1" />
                  GARANTIA
                </Badge>
              </div>
            )}
          </div>
          <Eye className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
        </div>

        {/* OS da Loja e Laboratório - Layout horizontal compacto */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          {pedido.numero_os_fisica && (
            <div className={cn(
              "rounded-md px-2 py-1.5 border-l-3",
              pedido.eh_garantia
                ? "bg-amber-50 border-l-amber-400"
                : "bg-gray-50 border-l-gray-400"
            )}>
              <div className={cn(
                "text-xs font-medium",
                pedido.eh_garantia ? "text-amber-600" : "text-gray-500"
              )}>
                LOJA
              </div>
              <div className={cn(
                "text-xs font-mono font-semibold",
                pedido.eh_garantia ? "text-amber-700" : "text-gray-700"
              )}>
                {pedido.numero_os_fisica}
              </div>
            </div>
          )}
          
          {pedido.numero_pedido_laboratorio && (
            <div className={cn(
              "rounded-md px-2 py-1.5 border-l-3",
              pedido.eh_garantia
                ? "bg-orange-50 border-l-orange-400"
                : "bg-blue-50 border-l-blue-400"
            )}>
              <div className={cn(
                "text-xs font-medium",
                pedido.eh_garantia ? "text-orange-600" : "text-blue-600"
              )}>
                LAB
              </div>
              <div className={cn(
                "text-xs font-mono font-semibold",
                pedido.eh_garantia ? "text-orange-700" : "text-blue-700"
              )}>
                {pedido.numero_pedido_laboratorio}
              </div>
            </div>
          )}
        </div>

        {/* Nome do Cliente com ícone */}
        <div className={cn(
          "mb-3 p-2 rounded-lg border",
          pedido.eh_garantia
            ? "bg-gradient-to-r from-amber-50 to-orange-100 border-amber-200"
            : "bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200"
        )}>
          <div className="flex items-start gap-2">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
              pedido.eh_garantia
                ? "bg-gradient-to-br from-amber-500 to-orange-600"
                : "bg-gradient-to-br from-blue-500 to-blue-600"
            )}>
              <span className="text-white text-xs font-bold">
                {(pedido.cliente_nome || 'C').charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-gray-900 leading-tight line-clamp-2">
                {pedido.cliente_nome || 'Cliente não informado'}
              </p>
            </div>
          </div>
        </div>

        {/* Laboratório com badge estilizado */}
        <div className="mb-3">
          <div className={cn(
            "inline-flex items-center rounded-full px-3 py-1.5 border",
            pedido.eh_garantia
              ? "bg-gradient-to-r from-amber-100 to-orange-200 border-amber-300"
              : "bg-gradient-to-r from-purple-100 to-purple-200 border-purple-300"
          )}>
            <Beaker className={cn(
              "w-3 h-3 mr-2",
              pedido.eh_garantia ? "text-amber-700" : "text-purple-700"
            )} />
            <span className={cn(
              "text-xs font-semibold",
              pedido.eh_garantia ? "text-amber-800" : "text-purple-800"
            )}>
              {pedido.laboratorio_nome || pedido.laboratorio_codigo || 'Lab não definido'}
            </span>
          </div>
        </div>

        {/* 🚀 SEÇÃO PREMIUM: DATAS SLA vs PROMESSA */}
        <div className="mb-3">
          {/* Barra de Progresso Visual SLA */}
          {slaStatus.diasParaSla !== null && (
            <div className="mb-2">
              <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                <div 
                  className={cn(
                    "h-full transition-all duration-500",
                    slaStatus.slaAtrasado 
                      ? "bg-gradient-to-r from-red-500 to-red-600" 
                      : slaStatus.slaAlerta 
                        ? "bg-gradient-to-r from-yellow-500 to-orange-500"
                        : "bg-gradient-to-r from-blue-500 to-green-500"
                  )}
                  style={{
                    width: `${Math.min(100, Math.max(0, (10 - Math.abs(slaStatus.diasParaSla)) * 10))}%`
                  }}
                />
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-2">
            {/* SLA Lab - Controle Interno */}
            {slaStatus.dataSlaLab && (
              <div className={cn(
                "rounded-lg p-2 border text-center",
                slaStatus.slaAtrasado 
                  ? "bg-red-100 border-red-300" 
                  : slaStatus.slaAlerta 
                    ? "bg-yellow-100 border-yellow-300"
                    : "bg-blue-100 border-blue-300"
              )}>
                <div className="flex items-center justify-center gap-1 mb-1">
                  {slaStatus.slaAtrasado ? (
                    <AlertTriangle className="w-3 h-3 text-red-600" />
                  ) : slaStatus.slaAlerta ? (
                    <Clock className="w-3 h-3 text-yellow-600" />
                  ) : (
                    <CheckCircle2 className="w-3 h-3 text-blue-600" />
                  )}
                  <span className={cn(
                    "text-xs font-medium",
                    slaStatus.slaAtrasado ? "text-red-600" : slaStatus.slaAlerta ? "text-yellow-600" : "text-blue-600"
                  )}>
                    SLA Lab
                  </span>
                </div>
                <div className={cn(
                  "text-xs font-bold",
                  slaStatus.slaAtrasado ? "text-red-700" : slaStatus.slaAlerta ? "text-yellow-700" : "text-blue-700"
                )}>
                  {slaStatus.diasParaSla !== null ? (
                    slaStatus.diasParaSla < 0 ? 
                      `${Math.abs(slaStatus.diasParaSla)}d atraso` :
                      `${slaStatus.diasParaSla}d restam`
                  ) : (
                    slaStatus.dataSlaLab.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
                  )}
                </div>
              </div>
            )}

            {/* Promessa Cliente */}
            {slaStatus.dataPromessaCliente && (
              <div className="bg-green-100 border border-green-300 rounded-lg p-2 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Calendar className="w-3 h-3 text-green-600" />
                  <span className="text-xs font-medium text-green-600">Cliente</span>
                </div>
                <div className="text-xs font-bold text-green-700">
                  {slaStatus.diasParaPromessa !== null ? (
                    slaStatus.diasParaPromessa < 0 ? 
                      `${Math.abs(slaStatus.diasParaPromessa)}d atraso` :
                      `${slaStatus.diasParaPromessa}d restam`
                  ) : (
                    slaStatus.dataPromessaCliente.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Botões de Ação - Layout melhorado */}
        <div className="flex items-center justify-between pt-3 mt-3 border-t border-gray-100">
          <div className="flex items-center gap-1">
            {canMoveLeft && (
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0 rounded-full bg-gray-100 hover:bg-blue-100 hover:text-blue-600 transition-colors"
                onClick={(e) => {
                  e.stopPropagation()
                  onMoveLeft?.()
                }}
              >
                <ChevronLeft className="h-3 w-3" />
              </Button>
            )}
            
            {canMoveRight && (
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 hover:text-blue-700 transition-colors"
                onClick={(e) => {
                  e.stopPropagation()
                  onMoveRight?.()
                }}
              >
                <ChevronRight className="h-3 w-3" />
              </Button>
            )}
          </div>
          
          <Button
            size="sm"
            variant="ghost"
            className="h-7 px-3 text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 rounded-full transition-colors font-medium"
            onClick={(e) => {
              e.stopPropagation()
              onClick()
            }}
          >
            <Eye className="h-3 w-3 mr-1" />
            Ver
          </Button>
        </div>

      </CardContent>
    </Card>
  )
}