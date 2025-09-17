'use client'

import { useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alerta } from '@/lib/types/database'
import { 
  AlertTriangle, 
  Clock, 
  DollarSign, 
  Zap,
  Check,
  X,
  Bell
} from 'lucide-react'
import { formatDistanceToNow, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ALERT_TYPES } from '@/lib/utils/constants'

interface AlertasPanelProps {
  alertas: Alerta[]
  onClose: () => void
  onMarkAllAsRead: () => void
}

export function AlertasPanel({ alertas, onClose, onMarkAllAsRead }: AlertasPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null)

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  const getAlertIcon = (tipo: string) => {
    switch (tipo) {
      case ALERT_TYPES.PAYMENT_OVERDUE:
        return <DollarSign className="w-4 h-4 text-amber-600" />
      case ALERT_TYPES.PRODUCTION_DELAYED:
        return <Clock className="w-4 h-4 text-red-600" />
      case ALERT_TYPES.URGENT_ATTENTION:
        return <Zap className="w-4 h-4 text-red-700" />
      case ALERT_TYPES.SLA_WARNING:
        return <AlertTriangle className="w-4 h-4 text-amber-600" />
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-600" />
    }
  }

  const getAlertColor = (tipo: string) => {
    switch (tipo) {
      case ALERT_TYPES.PAYMENT_OVERDUE:
        return 'warning'
      case ALERT_TYPES.PRODUCTION_DELAYED:
        return 'error'
      case ALERT_TYPES.URGENT_ATTENTION:
        return 'error'
      case ALERT_TYPES.SLA_WARNING:
        return 'warning'
      default:
        return 'outline'
    }
  }

  const formatTimeAgo = (date: string) => {
    try {
      return formatDistanceToNow(parseISO(date), {
        addSuffix: true,
        locale: ptBR
      })
    } catch {
      return 'agora'
    }
  }

  return (
    <div className="absolute right-0 top-full mt-2 w-96 z-50" ref={panelRef}>
      <Card className="shadow-lg border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Notificações</CardTitle>
            <div className="flex items-center space-x-2">
              {alertas.length > 0 && (
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={onMarkAllAsRead}
                  className="text-xs"
                >
                  <Check className="w-3 h-3 mr-1" />
                  Marcar todas
                </Button>
              )}
              <Button
                variant="ghost"
                size="xs"
                onClick={onClose}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {alertas.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">Nenhuma notificação</p>
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto custom-scrollbar">
              {alertas.map((alerta) => (
                <div
                  key={alerta.id}
                  className="p-4 border-b hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getAlertIcon(alerta.tipo)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {alerta.titulo}
                          </p>
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                            {alerta.mensagem}
                          </p>
                        </div>
                        
                        <Badge 
                          variant={getAlertColor(alerta.tipo) as any}
                          className="ml-2 text-xs"
                        >
                          {alerta.tipo.replace('_', ' ')}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">
                          {formatTimeAgo(alerta.created_at || '')}
                        </span>
                        
                        {alerta.pedido_id && (
                          <span className="text-xs text-blue-600 hover:text-blue-800">
                            Ver pedido →
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {alertas.length > 0 && (
            <div className="p-3 border-t bg-gray-50">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs text-gray-600"
                onClick={() => {
                  // Navigate to alertas page
                  window.location.href = '/alertas'
                }}
              >
                Ver todas as notificações
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}