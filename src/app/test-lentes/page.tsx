/**
 * 🧪 Página de Teste - LenteSelector
 * 
 * Teste visual do componente de seleção de lentes
 * URL: http://localhost:3000/test-lentes
 */

'use client'

import React, { useState } from 'react'
import { LenteSelector } from '@/components/lentes/LenteSelector'
import { ArrowLeft, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function TestLentesPage() {
  const [lenteSelecionada, setLenteSelecionada] = useState<{
    grupo_canonico_id: string
    nome_grupo: string
    fornecedor_id: string
    fornecedor_nome: string
    preco_medio: number
    tipo_lente: string
  } | null>(null)

  const handleSelect = (data: any) => {
    setLenteSelecionada(data)
    console.log('🔍 Lente selecionada:', data)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href="/kanban"
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                Voltar para Kanban
              </Link>
              <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                🧪 Teste: Seletor de Lentes
              </h1>
            </div>
            
            {lenteSelecionada && (
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Lente selecionada</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Coluna Esquerda: LenteSelector */}
          <div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Selecione uma Lente
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Catálogo com <strong>461 grupos canônicos</strong> e <strong>1.411 lentes</strong> disponíveis.
              </p>
              
              <LenteSelector
                onSelect={handleSelect}
                grupoSelecionadoId={lenteSelecionada?.grupo_canonico_id}
              />
            </div>
          </div>

          {/* Coluna Direita: Dados Selecionados */}
          <div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                📋 Dados Retornados
              </h2>

              {!lenteSelecionada ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <p className="mb-2">Nenhuma lente selecionada ainda.</p>
                  <p className="text-sm">
                    Selecione uma lente ao lado para ver os dados.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Preview Card */}
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                      {lenteSelecionada.nome_grupo}
                    </h3>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="px-2 py-1 bg-white dark:bg-gray-800 rounded-full text-gray-700 dark:text-gray-300">
                        {lenteSelecionada.tipo_lente === 'visao_simples' ? 'Visão Simples' : 
                         lenteSelecionada.tipo_lente === 'multifocal' ? 'Multifocal' : 'Bifocal'}
                      </span>
                      <span className="font-semibold text-blue-700 dark:text-blue-300">
                        R$ {lenteSelecionada.preco_medio.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Dados Técnicos */}
                  <div className="space-y-3">
                    <DataField
                      label="Grupo Canônico ID"
                      value={lenteSelecionada.grupo_canonico_id}
                      copyable
                    />
                    
                    <DataField
                      label="Nome do Grupo"
                      value={lenteSelecionada.nome_grupo}
                    />
                    
                    <DataField
                      label="Tipo de Lente"
                      value={lenteSelecionada.tipo_lente}
                      badge
                    />
                    
                    <DataField
                      label="Preço Médio"
                      value={`R$ ${lenteSelecionada.preco_medio.toFixed(2)}`}
                      highlight
                    />
                    
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                        🏭 Fornecedor (= Laboratório)
                      </p>
                      
                      <DataField
                        label="Fornecedor ID"
                        value={lenteSelecionada.fornecedor_id}
                        copyable
                        highlight
                      />
                      
                      <DataField
                        label="Nome do Fornecedor"
                        value={lenteSelecionada.fornecedor_nome}
                      />
                      
                      <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                        <p className="text-sm text-green-800 dark:text-green-300 font-medium">
                          ✅ Este <code className="px-1 py-0.5 bg-green-100 dark:bg-green-800/50 rounded">fornecedor_id</code> será usado como{' '}
                          <code className="px-1 py-0.5 bg-green-100 dark:bg-green-800/50 rounded">laboratorio_id</code> no pedido!
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* JSON Completo */}
                  <div className="pt-4">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(JSON.stringify(lenteSelecionada, null, 2))
                        alert('JSON copiado para área de transferência!')
                      }}
                      className="w-full px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                    >
                      📋 Copiar JSON Completo
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Instruções */}
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
                💡 Como funciona
              </h3>
              <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
                <li>• Busque lentes por nome</li>
                <li>• Use filtros para refinar (tipo, preço, material)</li>
                <li>• Clique em uma lente para selecioná-la</li>
                <li>• O <code className="px-1 bg-blue-100 dark:bg-blue-800 rounded">fornecedor_id</code> é automaticamente o <code className="px-1 bg-blue-100 dark:bg-blue-800 rounded">laboratorio_id</code></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// COMPONENTE: DataField
// ============================================================

interface DataFieldProps {
  label: string
  value: string
  copyable?: boolean
  badge?: boolean
  highlight?: boolean
}

function DataField({ label, value, copyable, badge, highlight }: DataFieldProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex items-start justify-between gap-2">
      <div className="flex-1">
        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
          {label}
        </label>
        {badge ? (
          <span className="inline-block px-2 py-1 text-sm font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded">
            {value}
          </span>
        ) : (
          <p className={`text-sm break-all ${
            highlight 
              ? 'font-semibold text-gray-900 dark:text-gray-100' 
              : 'text-gray-700 dark:text-gray-300'
          }`}>
            {value}
          </p>
        )}
      </div>
      {copyable && (
        <button
          onClick={handleCopy}
          className="flex-shrink-0 px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
        >
          {copied ? '✓ Copiado' : 'Copiar'}
        </button>
      )}
    </div>
  )
}
