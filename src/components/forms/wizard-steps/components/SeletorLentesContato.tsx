/**
 * 🔍 Componente: SeletorLentesContato
 * 
 * Seletor de lentes de contato por fornecedor
 * Estrutura baseada na view REAL v_lentes_contato
 */

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Building2, Package, Search, ChevronRight, Clock, Eye, Droplets } from 'lucide-react'
import { lentesClient } from '@/lib/supabase/lentes-client'
import { cn } from '@/lib/utils'
import { FiltrosLentesContato, type FiltrosLentesContato as FiltrosLentesContatoType } from './FiltrosLentesContato'

// ============================================================
// TIPOS (Estrutura REAL da view v_lentes_contato)
// ============================================================

interface Fornecedor {
  id: string
  nome: string
  razao_social?: string
  total_lentes?: number
}

interface LenteContato {
  id: string
  sku: string
  nome_produto: string
  nome_canonizado?: string
  
  // Marca
  marca_id?: string
  marca_nome: string
  marca_premium?: boolean
  
  // Tipo
  tipo_lente_contato: string
  material_contato?: string
  finalidade?: string
  
  // Especificações
  diametro_mm?: number
  curvatura_base?: number
  dk_t?: number
  teor_agua_percentual?: number
  
  // Graus
  esferico_min?: number
  esferico_max?: number
  cilindrico_min?: number
  cilindrico_max?: number
  adicao_min?: number
  adicao_max?: number
  
  // Características
  tem_protecao_uv?: boolean
  eh_colorida?: boolean
  cor_disponivel?: string
  
  // Uso
  dias_uso?: number
  horas_uso_diario?: number
  qtd_por_caixa: number
  
  // Preços (NOMES REAIS!)
  preco_custo: number
  preco_tabela: number
  
  // Logística
  prazo_entrega_dias: number
  estoque_disponivel?: number
  ativo: boolean
}

interface SeletorLentesContatoProps {
  onSelecionarLente: (
    lenteId: string,
    fornecedorId: string,
    precoCusto: number,
    precoTabela: number,
    prazo: number,
    nomeLente: string,
    fornecedorNome: string,
    precoVendaReal: number
  ) => void
  lenteSelecionadaId?: string | null
  className?: string
}

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export function SeletorLentesContato({
  onSelecionarLente,
  lenteSelecionadaId,
  className,
}: SeletorLentesContatoProps) {
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([])
  const [fornecedorSelecionado, setFornecedorSelecionado] = useState<Fornecedor | null>(null)
  const [lentes, setLentes] = useState<LenteContato[]>([])
  const [lenteSelecionada, setLenteSelecionada] = useState<LenteContato | null>(null)
  const [precoVendaReal, setPrecoVendaReal] = useState<number>(0)
  const [isLoadingFornecedores, setIsLoadingFornecedores] = useState(true)
  const [isLoadingLentes, setIsLoadingLentes] = useState(false)
  const [busca, setBusca] = useState('')
  const [filtros, setFiltros] = useState<FiltrosLentesContatoType>({})

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
      console.log('[SeletorLentesContato] Buscando fornecedores...')

      const { data, error } = await lentesClient
        .from('v_lentes_contato')
        .select('fornecedor_id, fornecedor_nome, fornecedor_razao_social')
        .eq('ativo', true)

      if (error) {
        console.error('[SeletorLentesContato] Erro ao buscar fornecedores:', error)
        setFornecedores([])
        return
      }

      // Agrupar manualmente por fornecedor_id
      const fornecedoresMap = new Map<string, Fornecedor>()
      
      data?.forEach((item) => {
        if (item.fornecedor_id) {
          if (!fornecedoresMap.has(item.fornecedor_id)) {
            fornecedoresMap.set(item.fornecedor_id, {
              id: item.fornecedor_id,
              nome: item.fornecedor_nome || 'Sem nome',
              razao_social: item.fornecedor_razao_social,
              total_lentes: 1,
            })
          } else {
            const forn = fornecedoresMap.get(item.fornecedor_id)!
            forn.total_lentes = (forn.total_lentes || 0) + 1
          }
        }
      })

      const fornecedoresList = Array.from(fornecedoresMap.values()).sort(
        (a, b) => (b.total_lentes || 0) - (a.total_lentes || 0)
      )

      console.log(`[SeletorLentesContato] ${fornecedoresList.length} fornecedores encontrados`)
      setFornecedores(fornecedoresList)
    } catch (err) {
      console.error('[SeletorLentesContato] Erro:', err)
      setFornecedores([])
    } finally {
      setIsLoadingFornecedores(false)
    }
  }

  const buscarLentesFornecedor = async (fornecedorId: string) => {
    try {
      setIsLoadingLentes(true)
      console.log(`[SeletorLentesContato] Buscando lentes do fornecedor ${fornecedorId}...`)

      let query = lentesClient
        .from('v_lentes_contato')
        .select('*')
        .eq('fornecedor_id', fornecedorId)
        .eq('ativo', true)

      // Aplicar filtros
      if (filtros.tipo_lente_contato) {
        query = query.eq('tipo_lente_contato', filtros.tipo_lente_contato)
      }
      if (filtros.material_contato) {
        query = query.eq('material_contato', filtros.material_contato)
      }
      if (filtros.finalidade) {
        query = query.eq('finalidade', filtros.finalidade)
      }
      if (filtros.tem_protecao_uv !== undefined) {
        query = query.eq('tem_protecao_uv', filtros.tem_protecao_uv)
      }
      if (filtros.eh_colorida !== undefined) {
        query = query.eq('eh_colorida', filtros.eh_colorida)
      }
      if (filtros.preco_min !== undefined) {
        query = query.gte('preco_tabela', filtros.preco_min)
      }
      if (filtros.preco_max !== undefined) {
        query = query.lte('preco_tabela', filtros.preco_max)
      }

      const { data, error } = await query.order('marca_nome').order('nome_produto')

      if (error) {
        console.error('[SeletorLentesContato] Erro ao buscar lentes:', error)
        setLentes([])
        return
      }

      console.log(`[SeletorLentesContato] ${data?.length || 0} lentes encontradas`)
      setLentes(data || [])
    } catch (err) {
      console.error('[SeletorLentesContato] Erro:', err)
      setLentes([])
    } finally {
      setIsLoadingLentes(false)
    }
  }

  // ============================================================
  // HANDLERS
  // ============================================================

  const handleSelecionarFornecedor = (fornecedor: Fornecedor) => {
    console.log('[SeletorLentesContato] Fornecedor selecionado:', fornecedor.nome)
    setFornecedorSelecionado(fornecedor)
    setLenteSelecionada(null)
    setBusca('')
  }

  const handleVoltarFornecedores = () => {
    setFornecedorSelecionado(null)
    setLentes([])
    setLenteSelecionada(null)
    setBusca('')
    setFiltros({})
  }

  // ============================================================
  // FILTRO DE BUSCA LOCAL
  // ============================================================

  const lentesFiltradas = lentes.filter((lente) => {
    if (!busca) return true

    const termo = busca.toLowerCase()
    return (
      (lente.nome_produto?.toLowerCase() || '').includes(termo) ||
      (lente.marca_nome?.toLowerCase() || '').includes(termo) ||
      (lente.sku?.toLowerCase() || '').includes(termo)
    )
  })

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
                  Nenhum fornecedor de lentes de contato encontrado
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Aguardando cadastro de produtos no sistema
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
                          {fornecedor.nome}
                        </CardTitle>
                        {fornecedor.razao_social && fornecedor.razao_social !== fornecedor.nome && (
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
              Voltar aos Fornecedores
            </Button>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <Badge variant="outline" className="font-normal">
              {fornecedorSelecionado.nome}
            </Badge>
          </div>

          {/* Filtros */}
          <FiltrosLentesContato filtros={filtros} onChange={setFiltros} />

          {/* Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, marca ou SKU..."
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
                    lenteSelecionada?.id === lente.id && 'border-primary bg-primary/5'
                  )}
                  onClick={() => {
                    setLenteSelecionada(lente)
                    setPrecoVendaReal(lente.preco_tabela)
                  }}
                >
                  <CardContent className="py-4">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1 flex-1">
                          <h4 className="font-medium text-sm">{lente.nome_produto}</h4>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="outline" className="text-xs">
                              {lente.marca_nome}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {lente.tipo_lente_contato?.replace('_', ' ')}
                            </Badge>
                            {lente.material_contato && (
                              <Badge variant="secondary" className="text-xs">
                                {lente.material_contato.replace('_', ' ')}
                              </Badge>
                            )}
                            {lente.tem_protecao_uv && (
                              <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">
                                UV
                              </Badge>
                            )}
                            {lente.eh_colorida && (
                              <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                                Colorida
                              </Badge>
                            )}
                          </div>
                        </div>
                        {lenteSelecionada?.id === lente.id && (
                          <Badge className="ml-2">✓ Selecionada</Badge>
                        )}
                      </div>

                      {/* Especificações */}
                      <div className="grid grid-cols-4 gap-2 pt-2 border-t text-xs">
                        {lente.dias_uso && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span>{lente.dias_uso} dias</span>
                          </div>
                        )}
                        {lente.diametro_mm && (
                          <div className="flex items-center gap-1">
                            <Eye className="h-3 w-3 text-muted-foreground" />
                            <span>{lente.diametro_mm}mm</span>
                          </div>
                        )}
                        {lente.teor_agua_percentual && (
                          <div className="flex items-center gap-1">
                            <Droplets className="h-3 w-3 text-muted-foreground" />
                            <span>{lente.teor_agua_percentual}%</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Package className="h-3 w-3 text-muted-foreground" />
                          <span>{lente.qtd_por_caixa} un.</span>
                        </div>
                      </div>

                      {/* Preços */}
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
                            }).format(lente.preco_tabela)}
                          </p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Prazo</Label>
                          <p className="font-semibold">{lente.prazo_entrega_dias} dias</p>
                        </div>
                      </div>

                      <p className="text-xs text-muted-foreground pt-1">
                        SKU: {lente.sku}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* FASE 3: Configuração de Preços */}
          {lenteSelecionada && (
            <Card className="border-primary">
              <CardHeader>
                <CardTitle className="text-base">Configurar Preço de Venda</CardTitle>
                <CardDescription>
                  {lenteSelecionada.nome_produto}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Grid de Preços */}
                <div className="grid grid-cols-3 gap-4">
                  {/* Preço de Custo */}
                  <div>
                    <Label className="text-xs text-muted-foreground">Preço de Custo</Label>
                    <div className="mt-1 p-3 bg-orange-50 rounded-md border border-orange-200">
                      <p className="text-sm font-semibold text-orange-700">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(lenteSelecionada.preco_custo)}
                      </p>
                    </div>
                  </div>

                  {/* Preço Tabela */}
                  <div>
                    <Label className="text-xs text-muted-foreground">Preço Tabela</Label>
                    <div className="mt-1 p-3 bg-blue-50 rounded-md border border-blue-200">
                      <p className="text-sm font-semibold text-blue-700">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(lenteSelecionada.preco_tabela)}
                      </p>
                    </div>
                  </div>

                  {/* Preço de Venda Real */}
                  <div>
                    <Label htmlFor="preco-venda-real" className="text-xs text-muted-foreground">
                      Preço de Venda Real *
                    </Label>
                    <Input
                      id="preco-venda-real"
                      type="number"
                      step="0.01"
                      min="0"
                      value={precoVendaReal}
                      onChange={(e) => setPrecoVendaReal(parseFloat(e.target.value) || 0)}
                      className="mt-1"
                    />
                  </div>
                </div>

                {/* Cálculos de Margem e Lucro */}
                {precoVendaReal > 0 && (
                  <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                    <div>
                      <Label className="text-xs text-muted-foreground">Margem de Lucro</Label>
                      <p className="text-lg font-bold text-green-600">
                        {precoVendaReal > 0
                          ? (((precoVendaReal - lenteSelecionada.preco_custo) / precoVendaReal) * 100).toFixed(1)
                          : '0.0'}
                        %
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Lucro Bruto</Label>
                      <p className="text-lg font-bold text-green-600">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(precoVendaReal - lenteSelecionada.preco_custo)}
                      </p>
                    </div>
                  </div>
                )}

                {/* Botão Confirmar */}
                <Button
                  onClick={() => {
                    if (lenteSelecionada && fornecedorSelecionado) {
                      onSelecionarLente(
                        lenteSelecionada.id,
                        fornecedorSelecionado.id,
                        lenteSelecionada.preco_custo,
                        lenteSelecionada.preco_tabela,
                        lenteSelecionada.prazo_entrega_dias,
                        lenteSelecionada.nome_produto,
                        fornecedorSelecionado.nome,
                        precoVendaReal
                      )
                    }
                  }}
                  className="w-full"
                  disabled={precoVendaReal <= 0}
                >
                  Confirmar Seleção
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
