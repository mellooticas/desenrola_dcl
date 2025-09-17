import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { Loja } from '@/lib/types/database'

export function useLojas() {
  return useQuery({
    queryKey: ['lojas'],
    queryFn: async (): Promise<Loja[]> => {
      const { data, error } = await supabase
        .from('lojas')
        .select('*')
        .eq('ativo', true)
        .order('nome')

      if (error) {
        console.error('Error fetching lojas:', error)
        throw error
      }

      return data || []
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}