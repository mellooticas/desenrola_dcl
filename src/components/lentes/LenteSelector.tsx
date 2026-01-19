/**
 * 🔍 LenteSelector - Seletor de Lentes do Catálogo Best Lens (2 Passos)
 * 
 * PASSO 1: Escolhe grupo canônico (com filtros)
 * PASSO 2: Modal mostra laboratórios disponíveis para escolha manual
 * 
 * Permite escolher lente do catálogo de 1.411 lentes (461 grupos)
 * Ao selecionar → retorna lente_id, grupo_canonico_id, fornecedor_id, custo
 */

'use client'

import React, { useState, useMemo } from 'react'
import { Search, Filter, X, Check, ChevronRight } from 'lucide-react'
import { useGruposCanonicos, type GrupoCanonicoCompleto, type FiltrosLente, type LenteComLaboratorio } from '@/lib/hooks/useLentesCatalogo'
import { cn } from '@/lib/utils'
import { LenteDetalhesModal } from './LenteDetalhesModal'

// ============================================================
// TIPOS
// ============================================================

interface LenteSelectorProps {
  onSelect: (data: {
    // IDs principais
    lente_id: string
    grupo_canonico_id: string
    fornecedor_id: string // ID do fornecedor (= laboratorio_id)
    
    // Dados de exibição
    nome_lente: string
    nome_grupo: string
    fornecedor_nome: string
    slug: string
    
    // Dados de custo/prazo
    preco_custo: number // ← Custo real do laboratório escolhido
    prazo_dias: number
    
    // Classificação
    tipo_lente: string
    marca_nome: string | null
  }) => void
  grupoSelecionadoId?: string | null
  className?: string
}

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export function LenteSelector({ onSelect, grupoSelecionadoId, className }: LenteSelectorProps) {
  const [filtros, setFiltros] = useState<FiltrosLente>({})
  const [busca, setBusca] = useState('')
  const [mostrarFiltros, setMostrarFiltros] = useState(false)
  
  // ⚡ Estado para modal de 2º passo
  const [grupoSelecionado, setGrupoSelecionado] = useState<GrupoCanonicoCompleto | null>(null)

  const { data: grupos, isLoading, error } = useGruposCanonicos({ ...filtros, busca })

  // Grupos filtrados por busca local
  const gruposFiltrados = useMemo(() => {
    if (!grupos) return []
    return grupos
  }, [grupos])

  // ⚡ PASSO 1: Clicar no grupo abre modal
  const handleClickGrupo = (grupo: GrupoCanonicoCompleto) => {
    console.log('[LenteSelector] Grupo selecionado - abrindo modal:', grupo.nome_grupo)
    setGrupoSelecionado(grupo)
  }

  // ⚡ PASSO 2: Selecionar lente específica no modal
  const handleSelectLente = (lente: LenteComLaboratorio) => {
    console.log('[LenteSelector] Lente final selecionada:', {
      lente_id: lente.lente_id,
      fornecedor: lente.fornecedor_nome,
      custo: lente.preco_custo
    })
    
    onSelect({
      lente_id: lente.lente_id,
      grupo_canonico_id: lente.grupo_canonico_id,
      fornecedor_id: lente.fornecedor_id,
      
      nome_lente: lente.lente_nome,
      nome_grupo: grupoSelecionado?.nome_grupo || '',
      fornecedor_nome: lente.fornecedor_nome,
      slug: lente.lente_slug,
      
      preco_custo: lente.preco_custo,
      prazo_dias: lente.prazo_dias,
      
      tipo_lente: lente.tipo_lente,
      marca_nome: lente.marca_nome
    })
    
    // Fechar modal
    setGrupoSelecionado(null)
  }

  const limparFiltros = () => {
    setFiltros({})
    setBusca('')
  }

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {/* Busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar lente por nome..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Botão de Filtros */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setMostrarFiltros(!mostrarFiltros)}
          className="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <Filter className="h-4 w-4" />
          Filtros
          {Object.keys(filtros).length > 0 && (
            <span className="ml-1 px-1.5 py-0.5 text-xs bg-blue-500 text-white rounded-full">
              {Object.keys(filtros).length}
            </span>
          )}
        </button>

        {Object.keys(filtros).length > 0 && (
          <button
            onClick={limparFiltros}
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
          >
            Limpar filtros
          </button>
        )}
      </div>

      {/* Painel de Filtros */}
      {mostrarFiltros && (
        <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50 space-y-4">
          {/* Tipo de Lente */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tipo de Lente
            </label>
            <div className="flex gap-2">
              {(['visao_simples', 'multifocal', 'bifocal'] as const).map((tipo) => (
                <button
                  key={tipo}
                  onClick={() => setFiltros(prev => ({ ...prev, tipo_lente: prev.tipo_lente === tipo ? undefined : tipo }))}
                  className={cn(
                    'px-3 py-1.5 text-sm rounded-lg border transition-colors',
                    filtros.tipo_lente === tipo
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                  )}
                >
                  {tipo === 'visao_simples' ? 'Visão Simples' : tipo === 'multifocal' ? 'Multifocal' : 'Bifocal'}
                </button>
              ))}
            </div>
          </div>

          {/* Faixa de Preço */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Faixa de Preço (R$)
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={filtros.preco_min || ''}
                onChange={(e) => setFiltros(prev => ({ ...prev, preco_min: e.target.value ? Number(e.target.value) : undefined }))}
                placeholder="Mín"
                className="w-24 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
              />
              <span className="text-gray-400">até</span>
              <input
                type="number"
                value={filtros.preco_max || ''}
                onChange={(e) => setFiltros(prev => ({ ...prev, preco_max: e.target.value ? Number(e.target.value) : undefined }))}
                placeholder="Máx"
                className="w-24 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
              />
            </div>
          </div>

          {/* Premium */}
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filtros.is_premium || false}
                onChange={(e) => setFiltros(prev => ({ ...prev, is_premium: e.target.checked ? true : undefined }))}
                className="h-4 w-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Apenas lentes premium</span>
            </label>
          </div>

          {/* ⚡ NOVOS FILTROS: Tratamentos */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tratamentos
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filtros.tratamento_antirreflexo || false}
                  onChange={(e) => setFiltros(prev => ({ ...prev, tratamento_antirreflexo: e.target.checked ? true : undefined }))}
                  className="h-4 w-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Antirreflexo</span>
              </label>
              
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filtros.tratamento_antirrisco || false}
                  onChange={(e) => setFiltros(prev => ({ ...prev, tratamento_antirrisco: e.target.checked ? true : undefined }))}
                  className="h-4 w-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Antirrisco</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filtros.tratamento_uv || false}
                  onChange={(e) => setFiltros(prev => ({ ...prev, tratamento_uv: e.target.checked ? true : undefined }))}
                  className="h-4 w-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Proteção UV</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filtros.tratamento_blue_light || false}
                  onChange={(e) => setFiltros(prev => ({ ...prev, tratamento_blue_light: e.target.checked ? true : undefined }))}
                  className="h-4 w-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Blue Light (Luz Azul)</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-8 text-gray-500">
          Carregando lentes...
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
          Erro ao carregar lentes. Tente novamente.
        </div>
      )}

      {/* Lista de Grupos */}
      {!isLoading && !error && (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {gruposFiltrados.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhuma lente encontrada com esses filtros.
            </div>
          ) : (
            gruposFiltrados.map((grupo) => (
              <GrupoCard
                key={grupo.id}
                grupo={grupo}
                isSelected={grupo.id === grupoSelecionadoId}
                onSelect={() => handleClickGrupo(grupo)}
              />
            ))
          )}
        </div>
      )}

      {/* Contador */}
      {!isLoading && !error && gruposFiltrados.length > 0 && (
        <div className="text-sm text-gray-500 dark:text-gray-400 text-center">
          {gruposFiltrados.length} {gruposFiltrados.length === 1 ? 'lente encontrada' : 'lentes encontradas'}
        </div>
      )}

      {/* ⚡ MODAL DE ESCOLHA DE LABORATÓRIO (Passo 2) */}
      <LenteDetalhesModal
        grupo={grupoSelecionado}
        isOpen={!!grupoSelecionado}
        onClose={() => setGrupoSelecionado(null)}
        onSelect={handleSelectLente}
      />
    </div>
  )
}

// ============================================================
// CARD DE GRUPO CANÔNICO
// ============================================================

interface GrupoCardProps {
  grupo: GrupoCanonicoCompleto
  isSelected: boolean
  onSelect: () => void
}

function GrupoCard({ grupo, isSelected, onSelect }: GrupoCardProps) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        'w-full p-4 border rounded-lg text-left transition-all hover:shadow-md',
        isSelected
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-300 dark:hover:border-blue-700'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Nome e Tipo */}
          <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1 truncate">
            {grupo.nome_grupo}
          </h3>

          {/* Badges */}
          <div className="flex flex-wrap gap-1.5 mb-2">
            {/* Tipo */}
            <span className={cn(
              'px-2 py-0.5 text-xs font-medium rounded-full',
              grupo.tipo_lente === 'visao_simples' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                grupo.tipo_lente === 'multifocal' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' :
                  'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
            )}>
              {grupo.tipo_lente === 'visao_simples' ? 'VS' : grupo.tipo_lente === 'multifocal' ? 'Multi' : 'Bifocal'}
            </span>

            {/* Material */}
            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
              {grupo.material} {grupo.indice_refracao}
            </span>

            {/* Premium */}
            {grupo.is_premium && (
              <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300">
                ⭐ Premium
              </span>
            )}
          </div>

          {/* Preço e Fornecedores */}
          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              R$ {grupo.preco_medio.toFixed(2)}
            </span>
            <span>
              {grupo.total_lentes} {grupo.total_lentes === 1 ? 'opção' : 'opções'}
            </span>
            <span>
              {grupo.fornecedores_disponiveis.length} {grupo.fornecedores_disponiveis.length === 1 ? 'fornecedor' : 'fornecedores'}
            </span>
          </div>
        </div>

        {/* Ícone de Seleção */}
        <div className="flex-shrink-0">
          {isSelected ? (
            <div className="h-6 w-6 rounded-full bg-blue-500 text-white flex items-center justify-center">
              <Check className="h-4 w-4" />
            </div>
          ) : (
            <ChevronRight className="h-5 w-5 text-gray-400" />
          )}
        </div>
      </div>
    </button>
  )
}
