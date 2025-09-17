import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { Alerta } from '@/lib/types/database'
import { toast } from 'sonner'

export function useAlertas(lojaId?: string) {
  return useQuery({
    queryKey: ['alertas', lojaId],
    queryFn: async (): Promise<Alerta[]> => {
      let query = supabase
        .from('alertas')
        .select(`
          *,
          pedidos!inner(numero_sequencial, cliente_nome),
          lojas(nome, codigo)
        `)
        .order('created_at', { ascending: false })

      // Filter by loja if specified
      if (lojaId) {
        query = query.eq('loja_id', lojaId)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching alertas:', error)
        throw error
      }

      return data || []
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  })
}

export function useMarkAlertaAsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (alertaId: string) => {
      const { error } = await supabase
        .from('alertas')
        .update({ lido: true })
        .eq('id', alertaId)

      if (error) {
        console.error('Error marking alerta as read:', error)
        throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alertas'] })
    },
    onError: (error: any) => {
      console.error('Error marking alerta as read:', error)
      toast.error('Erro ao marcar alerta como lido')
    },
  })
}

export function useMarkAllAlertasAsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (lojaId?: string) => {
      let query = supabase
        .from('alertas')
        .update({ lido: true })
        .eq('lido', false)

      if (lojaId) {
        query = query.eq('loja_id', lojaId)
      }

      const { error } = await query

      if (error) {
        console.error('Error marking all alertas as read:', error)
        throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alertas'] })
      toast.success('Todos os alertas foram marcados como lidos')
    },
    onError: (error: any) => {
      console.error('Error marking all alertas as read:', error)
      toast.error('Erro ao marcar alertas como lidos')
    },
  })
}