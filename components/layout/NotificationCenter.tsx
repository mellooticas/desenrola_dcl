
// components/layout/NotificationCenter.tsx
'use client'

import { useState, useEffect } from 'react'
import { Bell, X, Check, AlertTriangle, Info, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useNotifications } from '@/lib/hooks/useNotifications'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function NotificationCenter() {
  const [open, setOpen] = useState(false)
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead,
    deleteNotification 
  } = useNotifications()

  const getIcon = (severidade: string) => {
    switch (severidade) {
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-500" />
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />
      default: return <Info className="w-4 h-4 text-blue-500" />
    }
  }

  const getBgColor = (severidade: string, lida: boolean) => {
    if (lida) return 'bg-gray-50'
    
    switch (severidade) {
      case 'error': return 'bg-red-50 border-l-red-500'
      case 'warning': return 'bg-yellow-50 border-l-yellow-500'
      case 'success': return 'bg-green-50 border-l-green-500'
      default: return 'bg-blue-50 border-l-blue-500'
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 px-1 min-w-5 h-5 text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent align="end" className="w-80">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Notificações</h3>
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => markAllAsRead()}
                className="text-xs"
              >
                Marcar todas como lidas
              </Button>
            )}
          </div>

          {/* Lista de notificações */}
          <ScrollArea className="h-96">
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nenhuma notificação</p>
              </div>
            ) : (
              <div className="space-y-2">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`
                      p-3 rounded-lg border-l-4 cursor-pointer transition-colors
                      ${getBgColor(notif.severidade, notif.lida)}
                      hover:bg-gray-100
                    `}
                    onClick={() => !notif.lida && markAsRead(notif.id)}
                  >
                    <div className="flex items-start gap-3">
                      {getIcon(notif.severidade)}
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-sm font-medium leading-tight">
                            {notif.titulo}
                          </h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteNotification(notif.id)
                            }}
                            className="p-1 h-auto opacity-50 hover:opacity-100"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                        
                        <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                          {notif.mensagem}
                        </p>
                        
                        <p className="text-xs text-gray-400 mt-2">
                          {formatDistanceToNow(new Date(notif.created_at), { 
                            addSuffix: true, 
                            locale: ptBR 
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </PopoverContent>
    </Popover>
  )
}