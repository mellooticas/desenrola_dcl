/**
 * 🏭 Componente: SeletorLaboratoriosDirecto
 * 
 * Seletor direto de lentes por laboratório/fornecedor
 * Bypass dos grupos canônicos para escolha direta
 */

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Building2, Package, Search, ChevronRight } from 'lucide-react'
import { lentesClient } from '@/lib/supabase/lentes-client'
import { cn } from '@/lib/utils'
import { FiltrosLentesReais, type FiltrosLentesReais as FiltrosLentesReaisType } from './FiltrosLentesReais'

// ============================================================
// TIPOS
// ============================================================

interface Fornecedor {
  id: string
  nome_fantasia: string
  razao_social: string
  total_lentes?: number
}

interface LenteFornecedor {
  id: string
  nome_lente: string
  nome_comercial: string
  sku_fornecedor: string
  marca_nome?: string
  tipo_lente: string
  categoria: string
  material: string
  indice_refracao: string
  preco_custo: number
  preco_venda_sugerido: number
  prazo_dias: number
  tem_ar: boolean
  tem_blue: boolean
  tem_uv: boolean
  tratamento_foto: string
  ativo: boolean
}

interface SeletorLaboratoriosDirectoProps {
  onSelecionarLente: (
    lenteId: string,
    fornecedorId: string,
    precoCusto: number,
    precoTabela: number,
    prazo: number,
    nomeLente: string,
    fornecedorNome: string
  ) => void
  lenteSelecionadaId?: string | null
  className?: string
}

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export function SeletorLaboratoriosDirecto({
  onSelecionarLente,
  lenteSelecionadaId,
  className,
}: SeletorLaboratoriosDirectoProps) {
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([])
  const [fornecedorSelecionado, setFornecedorSelecionado] = useState<Fornecedor | null>(null)
  const [lentes, setLentes] = useState<LenteFornecedor[]>([])
  const [isLoadingFornecedores, setIsLoadingFornecedores] = useState(true)
  const [isLoadingLentes, setIsLoadingLentes] = useState(false)
  const [busca, setBusca] = useState('')
  const [filtros, setFiltros] = useState<FiltrosLentesReaisType>({})

  // Buscar fornecedores ao montar
  useEffect(() => {
    buscarFornecedores()
  }, [])

  // Buscar lentes quando selecionar fornecedor OU quando filtros mudarem
  useEffect(() => {
    if (fornecedorSelecionado) {
      buscarLentesFornecedor(fornecedorSelecionado.id)
    }
  }, [fornecedorSelecionado, filtros])

  // ============================================================
  // QUERIES
  // ============================================================

  const buscarFornecedores = async () => {
    try {
      setIsLoadingFornecedores(true)

      console.log('🔍 Buscando lentes e agrupando por fornecedor...')

      // Buscar todas as lentes da view v_lentes
      const { data: lentesData, error: lentesError } = await lentesClient
        .from('v_lentes')
        .select('fornecedor_id, fornecedor_nome')
        .eq('ativo', true)

      if (lentesError) {
        console.error('❌ Erro ao buscar lentes:', lentesError)
        throw lentesError
      }

      if (!lentesData || lentesData.length === 0) {
        console.log('⚠️ Nenhuma lente encontrada')
        setFornecedores([])
        return
      }

      console.log('✅ Lentes encontradas:', lentesData.length)

      // Agrupar por fornecedor e contar lentes
      const fornecedoresMap = new Map<string, { nome: string; total: number }>()
      
      lentesData.forEach((lente: any) => {
        if (!lente.fornecedor_id) return
        
        const existing = fornecedoresMap.get(lente.fornecedor_id)
        if (existing) {
          existing.total++
        } else {
          fornecedoresMap.set(lente.fornecedor_id, {
            nome: lente.fornecedor_nome || 'Sem nome',
            total: 1
          })
        }
      })

      console.log('✅ Fornecedores únicos:', fornecedoresMap.size)

      // Converter para array formatado
      const fornecedoresFormatados = Array.from(fornecedoresMap.entries()).map(([id, data]) => ({
        id,
        nome_fantasia: data.nome,
        razao_social: data.nome,
        total_lentes: data.total,
      }))

      // Ordenar por nome
      fornecedoresFormatados.sort((a, b) => a.nome_fantasia.localeCompare(b.nome_fantasia))

      setFornecedores(fornecedoresFormatados)
    } catch (error) {
      console.error('Erro ao buscar fornecedores:', error)
    } finally {
      setIsLoadingFornecedores(false)
    }
  }

  const buscarLentesFornecedor = async (fornecedorId: string) => {
    try {
      setIsLoadingLentes(true)

      console.log('🔍 Buscando lentes do fornecedor:', fornecedorId)

      // Buscar da view v_lentes (schema public)
      let query = lentesClient
        .from('v_lentes')
        .select('*')
        .eq('fornecedor_id', fornecedorId)
        .eq('ativo', true)

      // Aplicar filtros
      if (filtros.tipo_lente) {
        query = query.eq('tipo_lente', filtros.tipo_lente)
      }
      if (filtros.material) {
        query = query.eq('material', filtros.material)
      }
      if (filtros.indice_refracao) {
        query = query.eq('indice_refracao', filtros.indice_refracao)
      }
      if (filtros.categoria) {
        query = query.eq('categoria', filtros.categoria)
      }
      if (filtros.tem_ar) {
        query = query.eq('tem_ar', true)
      }
      if (filtros.tem_blue) {
        query = query.eq('tem_blue', true)
      }
      if (filtros.tem_uv) {
        query = query.eq('tem_uv', true)
      }
      if (filtros.preco_min) {
        query = query.gte('preco_venda_sugerido', filtros.preco_min)
      }
      if (filtros.preco_max) {
        query = query.lte('preco_venda_sugerido', filtros.preco_max)
      }

      query = query.order('preco_venda_sugerido')

      const { data, error } = await query

      if (error) {
        console.error('❌ Erro ao buscar lentes:', error)
        throw error
      }

      console.log('✅ Lentes encontradas:', data?.length || 0)

      // View já retorna marca_nome, não precisa mapear
      setLentes((data || []) as LenteFornecedor[])
    } catch (error) {
      console.error('Erro ao buscar lentes:', error)
    } finally {
      setIsLoadingLentes(false)
    }
  }

  // ============================================================
  // HANDLERS
  // ============================================================

  const handleSelecionarFornecedor = (fornecedor: Fornecedor) => {
    setFornecedorSelecionado(fornecedor)
    setBusca('')
  }

  const handleVoltarFornecedores = () => {
    setFornecedorSelecionado(null)
    setLentes([])
    setBusca('')
  }

  // Filtrar lentes por busca
  const lentesFiltradas = lentes.filter(lente =>
    (lente.nome_comercial?.toLowerCase() || '').includes(busca.toLowerCase()) ||
    (lente.sku_fornecedor?.toLowerCase() || '').includes(busca.toLowerCase()) ||
    (lente.marca_nome?.toLowerCase() || '').includes(busca.toLowerCase())
  )

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className={cn('w-full space-y-4', className)}>
      {/* FASE 1: Lista de Fornecedores */}
      {!fornecedorSelecionado && (
        <div className="space-y-3">
          {isLoadingFornecedores ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : fornecedores.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Building2 className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                <p className="mt-4 text-sm text-muted-foreground">
                  Nenhum laboratório encontrado
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {fornecedores.map((fornecedor) => (
                <Card
                  key={fornecedor.id}
                  className="cursor-pointer hover:border-primary transition-all hover:shadow-md group"
                  onClick={() => handleSelecionarFornecedor(fornecedor)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <CardTitle className="text-base flex items-center gap-2 group-hover:text-primary transition-colors">
                          <Building2 className="h-4 w-4" />
                          {fornecedor.nome_fantasia}
                        </CardTitle>
                        {fornecedor.razao_social !== fornecedor.nome_fantasia && (
                          <CardDescription className="text-xs">
                            {fornecedor.razao_social}
                          </CardDescription>
                        )}
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center gap-2">
                      <Package className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {fornecedor.total_lentes} lentes disponíveis
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* FASE 2: Lista de Lentes do Fornecedor */}
      {fornecedorSelecionado && (
        <div className="space-y-4">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleVoltarFornecedores}
              className="h-auto py-1 px-2 hover:bg-background"
            >
              <Building2 className="h-4 w-4 mr-1" />
              Voltar aos Laboratórios
            </Button>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <Badge variant="outline" className="font-normal">
              {fornecedorSelecionado.nome_fantasia}
            </Badge>
          </div>

          {/* Filtros */}
          <FiltrosLentesReais filtros={filtros} onChange={setFiltros} />

          {/* Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, SKU ou marca..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Lista de Lentes */}
          {isLoadingLentes ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : lentesFiltradas.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Package className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                <p className="mt-4 text-sm text-muted-foreground">
                  {busca ? 'Nenhuma lente encontrada com esse termo' : 'Nenhuma lente disponível'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {lentesFiltradas.map((lente) => (
                <Card
                  key={lente.id}
                  className={cn(
                    'cursor-pointer hover:border-primary transition-all',
                    lenteSelecionadaId === lente.id && 'border-primary bg-primary/5'
                  )}
                  onClick={() =>
                    onSelecionarLente(
                      lente.id,
                      fornecedorSelecionado.id,
                      lente.preco_custo,
                      lente.preco_venda_sugerido,
                      lente.prazo_dias,
                      lente.nome_lente || lente.nome_comercial,
                      fornecedorSelecionado.nome_fantasia
                    )
                  }
                >
                  <CardContent className="py-4">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1 flex-1">
                          <h4 className="font-medium text-sm">{lente.nome_lente || lente.nome_comercial}</h4>
                          <div className="flex flex-wrap gap-2">
                            {lente.marca_nome && (
                              <Badge variant="outline" className="text-xs">
                                {lente.marca_nome}
                              </Badge>
                            )}
                            <Badge variant="secondary" className="text-xs">
                              {lente.material} {lente.indice_refracao}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {lente.tipo_lente?.replace('_', ' ')}
                            </Badge>
                            {lente.tem_ar && (
                              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                AR
                              </Badge>
                            )}
                            {lente.tem_blue && (
                              <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                                Blue
                              </Badge>
                            )}
                            {lente.tem_uv && (
                              <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">
                                UV
                              </Badge>
                            )}
                          </div>
                        </div>
                        {lenteSelecionadaId === lente.id && (
                          <Badge className="ml-2">✓ Selecionada</Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-4 pt-2 border-t text-sm">
                        <div>
                          <Label className="text-xs text-muted-foreground">Custo</Label>
                          <p className="font-semibold text-orange-600">
                            {new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL',
                            }).format(lente.preco_custo)}
                          </p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Tabela</Label>
                          <p className="font-semibold text-blue-600">
                            {new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL',
                            }).format(lente.preco_venda_sugerido)}
                          </p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Prazo</Label>
                          <p className="font-semibold">{lente.prazo_dias} dias</p>
                        </div>
                      </div>

                      <p className="text-xs text-muted-foreground pt-1">
                        SKU: {lente.sku_fornecedor}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
