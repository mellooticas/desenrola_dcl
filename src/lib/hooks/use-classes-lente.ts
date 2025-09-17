import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { ClasseLente } from '@/lib/types/database'

export function useClassesLente() {
  return useQuery({
    queryKey: ['classes-lente'],
    queryFn: async (): Promise<ClasseLente[]> => {
      const { data, error } = await supabase
        .from('classes_lente')
        .select('*')
        .eq('ativa', true)
        .order('nome')

      if (error) {
        console.error('Error fetching classes lente:', error)
        throw error
      }

      return data || []
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}