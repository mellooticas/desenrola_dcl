import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'

export interface Montador {
  id: string
  nome: string
  tipo: 'INTERNO' | 'LABORATORIO'
  laboratorio_id: string | null
  ativo: boolean
  created_at: string
}

export function useMontadores() {
  return useQuery({
    queryKey: ['montadores'],
    queryFn: async () => {
      console.log('🔍 useMontadores: Buscando montadores...')
      
      const { data, error } = await supabase
        .from('montadores')
        .select('*')
        .eq('ativo', true)
        .order('nome')

      console.log('🔍 useMontadores: Resultado', { 
        data, 
        error,
        count: data?.length 
      })

      if (error) {
        console.error('❌ useMontadores: Erro', error)
        throw error
      }
      
      return data as Montador[]
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  })
}
