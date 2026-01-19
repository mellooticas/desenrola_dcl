// src/components/pedidos/ArmacaoSelector.tsx
'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Search, X, Package } from 'lucide-react'

interface Armacao {
  id: string
  sku_visual: string
  cod: string
  descricao: string
  custo: number
  preco_venda: number
  tamanho: string
}

interface ArmacaoSelectorProps {
  value?: string | null // UUID da armação selecionada
  onChange: (armacao: Armacao | null) => void
  lojaId?: string
}

export function ArmacaoSelector({ value, onChange, lojaId }: ArmacaoSelectorProps) {
  const [busca, setBusca] = useState('')
  const [opcoes, setOpcoes] = useState<Armacao[]>([])
  const [loading, setLoading] = useState(false)
  const [selecionada, setSelecionada] = useState<Armacao | null>(null)
  const [aberto, setAberto] = useState(false)
  const debounceTimer = useRef<NodeJS.Timeout>()

  // Buscar armações na API com debounce manual
  const buscarArmacoes = useCallback(async (termo: string) => {
    if (!termo || termo.length < 2) {
      setOpcoes([])
      return
    }

    setLoading(true)
    try {
      const params = new URLSearchParams({
        tipo: 'armacao',
        nome: termo,
        limite: '10',
      })

      if (lojaId) params.append('loja_id', lojaId)

      const response = await fetch(`/api/produtos/buscar?${params}`)
      const data = await response.json()

      if (data.success) {
        setOpcoes(data.data)
      } else {
        console.error('Erro ao buscar armações:', data.error)
        setOpcoes([])
      }
    } catch (error) {
      console.error('Erro na busca:', error)
      setOpcoes([])
    } finally {
      setLoading(false)
    }
  }, [lojaId])

  // Debounce para evitar muitas requisições
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    debounceTimer.current = setTimeout(() => {
      buscarArmacoes(busca)
    }, 300)

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }
    }
  }, [busca, buscarArmacoes])

  // Selecionar armação
  const handleSelect = (armacao: Armacao) => {
    setSelecionada(armacao)
    setBusca('')
    setAberto(false)
    onChange(armacao)
  }

  // Limpar seleção
  const handleClear = () => {
    setSelecionada(null)
    setBusca('')
    setOpcoes([])
    onChange(null)
  }

  return (
    <div className="relative">
      {/* Campo de busca ou armação selecionada */}
      {selecionada ? (
        <div className="flex items-center gap-2 p-3 bg-blue-50 border-2 border-blue-300 rounded-lg">
          <Package className="w-5 h-5 text-blue-600" />
          <div className="flex-1">
            <div className="font-medium text-gray-900">
              {selecionada.cod} - {selecionada.sku_visual}
            </div>
            <div className="text-sm text-gray-600">{selecionada.descricao}</div>
            <div className="text-sm text-blue-600 font-medium mt-1">
              R$ {selecionada.preco_venda.toFixed(2)}
            </div>
          </div>
          <button
            type="button"
            onClick={handleClear}
            className="p-1 hover:bg-blue-100 rounded transition-colors"
            title="Remover armação"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      ) : (
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={busca}
              onChange={(e) => {
                setBusca(e.target.value)
                setAberto(true)
              }}
              onFocus={() => setAberto(true)}
              placeholder="Buscar armação por nome, código ou SKU..."
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
            />
            {loading && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>

          {/* Dropdown de opções */}
          {aberto && opcoes.length > 0 && (
            <div className="absolute z-50 w-full mt-2 bg-white border-2 border-gray-300 rounded-lg shadow-lg max-h-96 overflow-y-auto">
              {opcoes.map((armacao) => (
                <button
                  key={armacao.id}
                  type="button"
                  onClick={() => handleSelect(armacao)}
                  className="w-full p-3 text-left hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-start gap-3">
                    <Package className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">
                        {armacao.cod} - {armacao.sku_visual}
                      </div>
                      <div className="text-sm text-gray-600 truncate">
                        {armacao.descricao}
                      </div>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-sm text-gray-500">
                          Tamanho: {armacao.tamanho}
                        </span>
                        <span className="text-sm font-medium text-blue-600">
                          R$ {armacao.preco_venda.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Mensagem quando não encontrar */}
          {aberto && busca.length >= 2 && !loading && opcoes.length === 0 && (
            <div className="absolute z-50 w-full mt-2 bg-white border-2 border-gray-300 rounded-lg shadow-lg p-4 text-center text-gray-500">
              Nenhuma armação encontrada
            </div>
          )}
        </div>
      )}

      {/* Dica de uso */}
      {!selecionada && !busca && (
        <p className="mt-2 text-sm text-gray-500">
          Digite o nome, código ou SKU da armação para buscar
        </p>
      )}
    </div>
  )
}
