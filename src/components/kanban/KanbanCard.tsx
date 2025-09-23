import { PedidoCompleto } from '@/lib/types/database'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Eye,
  ChevronLeft,
  ChevronRight,
  Beaker,
  Sparkles
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

export function KanbanCard({ 
  pedido, 
  onClick, 
  isDragging,
  onMoveLeft,
  onMoveRight,
  canMoveLeft = false,
  canMoveRight = false
}: KanbanCardProps) {

  return (
    <Card
      className={cn(
        "group relative cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02]",
        isDragging && "opacity-50 rotate-2 scale-95 shadow-xl",
        pedido.eh_garantia 
          ? "bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300 hover:border-amber-400 shadow-amber-100" 
          : "bg-white border border-gray-200 hover:border-blue-300",
        "rounded-lg overflow-hidden"
      )}
      onClick={onClick}
    >
      {/* Header colorido com gradiente - Diferente para garantia */}
      <div className={cn(
        "h-1",
        pedido.eh_garantia 
          ? "bg-gradient-to-r from-amber-500 via-orange-500 to-red-500" 
          : "bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500"
      )}></div>
      
      <CardContent className="p-3">
        
        {/* Header com OS Principal */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Badge 
              variant="secondary" 
              className={cn(
                "text-xs font-mono font-bold px-3 py-1 shadow-sm",
                pedido.eh_garantia
                  ? "bg-gradient-to-r from-amber-600 to-orange-600 text-white"
                  : "bg-gradient-to-r from-blue-600 to-blue-700 text-white"
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