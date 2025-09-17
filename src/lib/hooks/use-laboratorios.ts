import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { Laboratorio } from '@/lib/types/database'

export function useLaboratorios() {
  return useQuery({
    queryKey: ['laboratorios'],
    queryFn: async (): Promise<Laboratorio[]> => {
      const { data, error } = await supabase
        .from('laboratorios')
        .select('*')
        .eq('ativo', true)
        .order('nome')

      if (error) {
        console.error('Error fetching laboratorios:', error)
        throw error
      }

      return data || []
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}