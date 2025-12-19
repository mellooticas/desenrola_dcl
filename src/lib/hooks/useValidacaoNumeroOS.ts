// =====================================================
// HOOK: Validação de Número de OS Único
// =====================================================
// Previne duplicidade de número de OS antes de salvar
// Integra com constraint do banco de dados

import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'

interface ValidacaoOSResult {
  isValid: boolean
  mensagem?: string
  pedidoExistente?: {
    id: string
    numero_sequencial: number
    cliente_nome: string
    status: string
  }
}

interface ProximoNumeroResult {
  numero: string | null
  erro?: string
}

export function useValidacaoNumeroOS() {
  const [validando, setValidando] = useState(false)

  /**
   * Valida se um número de OS já está em uso na loja
   */
  const validarNumeroOS = useCallback(async (
    numeroOS: string,
    lojaId: string,
    pedidoIdAtual?: string // Para ignorar em updates
  ): Promise<ValidacaoOSResult> => {
    // Se número vazio, é válido (campo opcional)
    if (!numeroOS || numeroOS.trim() === '') {
      return { isValid: true }
    }

    try {
      setValidando(true)

      // Buscar pedidos com este número de OS na mesma loja
      let query = supabase
        .from('pedidos')
        .select('id, numero_sequencial, cliente_nome, status')
        .eq('loja_id', lojaId)
        .eq('numero_os_fisica', numeroOS.trim())
        .limit(1)

      // Se é update, ignorar o pedido atual
      if (pedidoIdAtual) {
        query = query.neq('id', pedidoIdAtual)
      }

      const { data, error } = await query.single()

      if (error) {
        // Se não encontrou (PGRST116), é válido
        if (error.code === 'PGRST116') {
          return { isValid: true }
        }
        throw error
      }

      // Se encontrou, é inválido
      if (data) {
        return {
          isValid: false,
          mensagem: `Este número de OS já está em uso no pedido #${data.numero_sequencial} (${data.cliente_nome} - ${data.status})`,
          pedidoExistente: data
        }
      }

      return { isValid: true }
    } catch (error) {
      console.error('Erro ao validar número de OS:', error)
      return {
        isValid: false,
        mensagem: 'Erro ao validar número de OS. Tente novamente.'
      }
    } finally {
      setValidando(false)
    }
  }, [])

  /**
   * Busca o próximo número de OS disponível para uma loja
   */
  const buscarProximoNumero = useCallback(async (
    lojaId: string,
    prefixo?: string
  ): Promise<ProximoNumeroResult> => {
    try {
      const { data, error } = await supabase
        .rpc('proximo_numero_os_disponivel', {
          p_loja_id: lojaId,
          p_prefixo: prefixo || null
        })

      if (error) throw error

      return { numero: data }
    } catch (error) {
      console.error('Erro ao buscar próximo número:', error)
      return {
        numero: null,
        erro: 'Não foi possível gerar o próximo número'
      }
    }
  }, [])

  /**
   * Valida em tempo real enquanto o usuário digita (com debounce)
   */
  const validarNumeroOSDebounced = useCallback(
    async (
      numeroOS: string,
      lojaId: string,
      pedidoIdAtual?: string,
      delay: number = 500
    ): Promise<ValidacaoOSResult> => {
      return new Promise((resolve) => {
        setTimeout(async () => {
          const resultado = await validarNumeroOS(numeroOS, lojaId, pedidoIdAtual)
          resolve(resultado)
        }, delay)
      })
    },
    [validarNumeroOS]
  )

  return {
    validarNumeroOS,
    buscarProximoNumero,
    validarNumeroOSDebounced,
    validando
  }
}

/**
 * Hook para listar números de OS em uso (útil para autocomplete)
 */
export function useNumerosOSEmUso(lojaId?: string) {
  const [numerosOS, setNumerosOS] = useState<string[]>([])
  const [carregando, setCarregando] = useState(false)

  const carregarNumerosOS = useCallback(async () => {
    if (!lojaId) return

    try {
      setCarregando(true)

      const { data, error } = await supabase
        .from('v_numeros_os_em_uso')
        .select('numero_os_fisica')
        .eq('loja_id', lojaId)
        .order('numero_os_numerico', { ascending: false, nullsFirst: false })
        .limit(100)

      if (error) throw error

      const numeros = data?.map(item => item.numero_os_fisica) || []
      setNumerosOS(numeros)
    } catch (error) {
      console.error('Erro ao carregar números de OS:', error)
    } finally {
      setCarregando(false)
    }
  }, [lojaId])

  return {
    numerosOS,
    carregando,
    carregarNumerosOS
  }
}
