import type { Notificacao } from '@/lib/stores/notifications'
// ======= HOOK PARA NOTIFICAÇÕES =======

// lib/hooks/useNotifications.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { useAuthStore } from '@/lib/stores/auth'
import { useEffect } from 'react'
import { toast } from 'sonner'

export function useNotifications() {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()

  // Buscar notificações do usuário
  const { data: notifications = [], refetch } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      if (!user?.id) return []

      const { data, error } = await supabase
        .from('notificacoes')
        .select('*')
        .contains('destinatarios', [user.id])
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error
      return data
    },
    enabled: !!user?.id,
    refetchInterval: 30000, // Atualizar a cada 30s
  })

  // Marcar como lida
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('notificacoes')
        .update({ lida: true })
        .eq('id', notificationId)
      
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    }
  })

  // Marcar todas como lidas
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) return

      const { error } = await supabase
        .from('notificacoes')
        .update({ lida: true })
        .contains('destinatarios', [user.id])
        .eq('lida', false)
      
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      toast.success('Todas as notificações foram marcadas como lidas')
    }
  })

  // Deletar notificação
  const deleteNotificationMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('notificacoes')
        .delete()
        .eq('id', notificationId)
      
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    }
  })

  // Real-time: escutar novas notificações
  useEffect(() => {
    if (!user?.id) return

    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notificacoes',
          filter: `destinatarios.cs.[${user.id}]`
        },
        (payload) => {
          // Mostrar toast para notificação em tempo real
          const notif = payload.new as Notificacao
          
          toast(notif.titulo, {
            description: notif.mensagem,
            duration: 5000,
          })

          // Invalidar cache para atualizar lista
          queryClient.invalidateQueries({ queryKey: ['notifications'] })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user?.id, queryClient])

  const unreadCount = notifications.filter(n => !n.lida).length

  return {
    notifications,
    unreadCount,
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
    deleteNotification: deleteNotificationMutation.mutate,
    refetch
  }
}