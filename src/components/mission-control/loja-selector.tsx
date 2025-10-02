'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MapPin, Lock, Package, AlertTriangle } from 'lucide-react'

interface Loja {
  id: string
  nome: string
  codigo: string
  endereco?: string
  total_pedidos?: number
  pedidos_atrasados?: number
  status_operacao: 'ok' | 'atencao' | 'critico'
}

interface LojaSelectProps {
  onLojaSelected: (lojaId: string, lojaNome: string) => void
  selectedLoja?: { id: string, nome: string }
  locked?: boolean
}

export function LojaSelector({ onLojaSelected, selectedLoja, locked = false }: LojaSelectProps) {
  const [lojas, setLojas] = useState<Loja[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLojas = async () => {
      try {
        setLoading(true)
        
        const response = await fetch('/api/lojas')
        
        if (!response.ok) {
          throw new Error(`Erro ao carregar lojas: ${response.statusText}`)
        }
        
        const result = await response.json()
        
        if (!result.lojas || result.lojas.length === 0) {
          throw new Error('Nenhuma loja encontrada')
        }
        
        console.log(`✅ ${result.lojas.length} lojas carregadas`)
        setLojas(result.lojas)
        setError(null)
        
      } catch (err) {
        console.error('❌ Erro ao carregar lojas:', err)
        setError(err instanceof Error ? err.message : 'Erro desconhecido')
        
        // Dados de fallback baseados no sistema DCL - usando UUIDs reais
        setLojas([
          {
            id: 'e5915ba4-fdb4-4fa7-b9d5-c71d3c704c55',
            nome: 'Suzano',
            codigo: 'DCL001',
            endereco: 'Suzano - SP',
            total_pedidos: 31,
            pedidos_atrasados: 2,
            status_operacao: 'ok'
          },
          {
            id: '2', 
            nome: 'DCL Shopping',
            codigo: 'DCL002',
            endereco: 'Shopping Ibirapuera',
            total_pedidos: 32,
            pedidos_atrasados: 5,
            status_operacao: 'atencao'
          },
          {
            id: '3',
            nome: 'DCL Vila Madalena', 
            codigo: 'DCL003',
            endereco: 'Rua Harmonia, 456',
            total_pedidos: 28,
            pedidos_atrasados: 0,
            status_operacao: 'ok'
          },
          {
            id: '4',
            nome: 'DCL Campinas',
            codigo: 'DCL101', 
            endereco: 'Av. Francisco Glicério, 500',
            total_pedidos: 15,
            pedidos_atrasados: 8,
            status_operacao: 'critico'
          }
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchLojas()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critico': return 'bg-red-100 text-red-800 border-red-200'
      case 'atencao': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default: return 'bg-green-100 text-green-800 border-green-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'critico': return 'Crítico'
      case 'atencao': return 'Atenção'
      default: return 'Normal'
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-12">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-3"></div>
          <p className="text-gray-600">Carregando lojas...</p>
        </div>
      </div>
    )
  }

  if (selectedLoja && locked) {
    return (
      <div className="container mx-auto px-6 py-8">
        <Card className="max-w-md mx-auto border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-green-500 p-2 rounded-full">
                <Lock className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-green-800">Loja Ativa</div>
                <div className="text-sm text-green-700">{selectedLoja.nome}</div>
              </div>
              <Badge className="bg-green-100 text-green-800 border-green-300 text-xs">
                Sessão Ativa
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Desenrola DCL
        </h1>
        <p className="text-gray-600">
          Selecione sua loja para acessar o sistema
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-center max-w-2xl mx-auto">
          <div className="text-red-800 text-sm font-medium">{error}</div>
          <div className="text-red-600 text-xs mt-1">
            Usando dados de demonstração
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-6xl mx-auto">
        {lojas.map((loja) => (
          <Card 
            key={loja.id}
            className="cursor-pointer hover:shadow-lg hover:scale-105 hover:border-blue-300 transition-all duration-200 border group"
            onClick={() => onLojaSelected(loja.id, loja.nome)}
          >
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                
                {/* Header com ícone e status */}
                <div className="flex items-center justify-between">
                  <div className="bg-blue-100 group-hover:bg-blue-200 p-3 rounded-full transition-colors">
                    <MapPin className="h-5 w-5 text-blue-600" />
                  </div>
                  <Badge className={`text-xs ${getStatusColor(loja.status_operacao)}`}>
                    {getStatusText(loja.status_operacao)}
                  </Badge>
                </div>

                {/* Nome da loja */}
                <div>
                  <h3 className="font-bold text-gray-800 text-lg group-hover:text-blue-600 transition-colors">
                    {loja.nome}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {loja.codigo}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {loja.endereco}
                  </p>
                </div>

                {/* Métricas */}
                {(loja.total_pedidos !== undefined) && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-blue-500" />
                        <span className="text-sm text-gray-600">Pedidos</span>
                      </div>
                      <span className="font-semibold text-gray-800">
                        {loja.total_pedidos}
                      </span>
                    </div>

                    {loja.pedidos_atrasados !== undefined && loja.pedidos_atrasados > 0 && (
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                          <span className="text-sm text-red-600">Atrasados</span>
                        </div>
                        <span className="font-semibold text-red-600">
                          {loja.pedidos_atrasados}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Botão de ação */}
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                  onClick={(e) => {
                    e.stopPropagation()
                    onLojaSelected(loja.id, loja.nome)
                  }}
                >
                  Selecionar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center mt-8">
        <p className="text-sm text-gray-500 max-w-md mx-auto">
          ⚠️ A loja selecionada será mantida durante toda a sessão de trabalho
        </p>
      </div>
    </div>
  )
}

export default LojaSelector