'use client'

import { useState, useEffect } from 'react'
import { Search, Package, Plus, Minus, ShoppingBag, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { getCrmErpClient } from '@/lib/supabase/crm-erp-client'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface Acessorio {
  produto_id: string
  sku_visual: string
  descricao: string
  preco_venda: number
  custo: number
}

interface AcessorioSelecionado {
  acessorio: Acessorio
  quantidade: number
  preco_real_unitario: number // Preço real unitário (pode ter desconto ou acréscimo)
  subtotal: number // preco_real_unitario * quantidade
}

interface SeletorAcessoriosProps {
  onAcessoriosSelecionados: (acessorios: AcessorioSelecionado[]) => void
  lojaId?: string
  acessoriosIniciais?: AcessorioSelecionado[]
}

export function SeletorAcessorios({
  onAcessoriosSelecionados,
  lojaId,
  acessoriosIniciais = []
}: SeletorAcessoriosProps) {
  const [acessorios, setAcessorios] = useState<Acessorio[]>([])
  const [acessoriosFiltrados, setAcessoriosFiltrados] = useState<Acessorio[]>([])
  const [selecionados, setSelecionados] = useState<AcessorioSelecionado[]>(acessoriosIniciais)
  const [buscaTexto, setBuscaTexto] = useState('')
  const [carregando, setCarregando] = useState(true)
  const [mostrarTodos, setMostrarTodos] = useState(false)

  // Buscar acessórios
  useEffect(() => {
    buscarAcessorios()
  }, [])

  // Aplicar filtro
  useEffect(() => {
    if (!buscaTexto.trim()) {
      setAcessoriosFiltrados(acessorios)
      return
    }

    const termo = buscaTexto.toLowerCase()
    const filtrados = acessorios.filter(a =>
      a.descricao.toLowerCase().includes(termo) ||
      a.sku_visual.toLowerCase().includes(termo)
    )
    setAcessoriosFiltrados(filtrados)
  }, [buscaTexto, acessorios])

  // Notificar mudanças
  useEffect(() => {
    onAcessoriosSelecionados(selecionados)
  }, [selecionados])

  async function buscarAcessorios() {
    try {
      setCarregando(true)
      const crmErpClient = getCrmErpClient()

      // Buscar produtos tipo NULL que são acessórios
      const { data, error } = await crmErpClient
        .from('vw_estoque_completo')
        .select('produto_id, sku_visual, descricao, preco_venda, custo')
        .is('tipo_produto', null)
        .eq('ativo', true)
        .or('descricao.ilike.%estojo%,descricao.ilike.%cordao%,descricao.ilike.%cordão%,descricao.ilike.%flanela%,descricao.ilike.%limpeza%,descricao.ilike.%spray%,descricao.ilike.%kit%,descricao.ilike.%pano%')
        .order('descricao')

      if (error) throw error

      setAcessorios(data || [])
      setAcessoriosFiltrados(data || [])
    } catch (error) {
      console.error('Erro ao buscar acessórios:', error)
      toast.error('Erro ao carregar acessórios')
    } finally {
      setCarregando(false)
    }
  }

  function adicionarAcessorio(acessorio: Acessorio) {
    const jaExiste = selecionados.find(s => s.acessorio.produto_id === acessorio.produto_id)
    
    if (jaExiste) {
      // Incrementar quantidade
      setSelecionados(prev => prev.map(s =>
        s.acessorio.produto_id === acessorio.produto_id
          ? {
              ...s,
              quantidade: s.quantidade + 1,
              subtotal: (s.quantidade + 1) * s.preco_real_unitario
            }
          : s
      ))
    } else {
      // Adicionar novo com preço real = preço tabela inicialmente
      setSelecionados(prev => [
        ...prev,
        {
          acessorio,
          quantidade: 1,
          preco_real_unitario: acessorio.preco_venda,
          subtotal: acessorio.preco_venda
        }
      ])
    }
  }

  function removerAcessorio(produtoId: string) {
    setSelecionados(prev => prev.filter(s => s.acessorio.produto_id !== produtoId))
  }

  function atualizarQuantidade(produtoId: string, quantidade: number) {
    if (quantidade <= 0) {
      removerAcessorio(produtoId)
      return
    }

    setSelecionados(prev => prev.map(s =>
      s.acessorio.produto_id === produtoId
        ? {
            ...s,
            quantidade,
            subtotal: quantidade * s.preco_real_unitario
          }
        : s
    ))
  }
  
  function atualizarPrecoRealUnitario(produtoId: string, precoReal: number) {
    setSelecionados(prev => prev.map(s =>
      s.acessorio.produto_id === produtoId
        ? {
            ...s,
            preco_real_unitario: precoReal,
            subtotal: s.quantidade * precoReal
          }
        : s
    ))
  }

  function limparTodos() {
    setSelecionados([])
  }

  const totalGeral = selecionados.reduce((acc, s) => acc + s.subtotal, 0)
  const quantidadeTotal = selecionados.reduce((acc, s) => acc + s.quantidade, 0)

  if (carregando) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
        <span className="ml-2 text-sm text-muted-foreground">Carregando acessórios...</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header com resumo */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-primary" />
            Acessórios Opcionais
          </h3>
          <p className="text-sm text-muted-foreground">
            {selecionados.length === 0 ? (
              'Nenhum acessório selecionado'
            ) : (
              <>
                {selecionados.length} {selecionados.length === 1 ? 'item' : 'itens'} • {quantidadeTotal} {quantidadeTotal === 1 ? 'unidade' : 'unidades'}
              </>
            )}
          </p>
        </div>
        {selecionados.length > 0 && (
          <div className="text-right">
            <p className="text-2xl font-bold text-primary">
              R$ {totalGeral.toFixed(2)}
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={limparTodos}
              className="h-auto p-0 text-xs text-muted-foreground hover:text-destructive"
            >
              Limpar todos
            </Button>
          </div>
        )}
      </div>

      {/* Itens Selecionados */}
      {selecionados.length > 0 && (
        <Card className="border-primary/50">
          <CardContent className="p-4">
            <div className="space-y-3">
              {selecionados.map((item) => {
                const descontoPercentual = item.acessorio.preco_venda > 0
                  ? ((item.acessorio.preco_venda - item.preco_real_unitario) / item.acessorio.preco_venda * 100)
                  : 0
                
                return (
                  <div
                    key={item.acessorio.produto_id}
                    className="p-3 rounded-lg bg-muted/50 space-y-2"
                  >
                    {/* Linha 1: Nome e remover */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {item.acessorio.descricao}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          SKU: {item.acessorio.sku_visual}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() => removerAcessorio(item.acessorio.produto_id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Linha 2: Preços e quantidade */}
                    <div className="grid grid-cols-4 gap-2 items-end">
                      <div>
                        <Label htmlFor={`preco-tabela-${item.acessorio.produto_id}`} className="text-xs">
                          Tabela
                        </Label>
                        <div className="h-8 flex items-center px-2 bg-background rounded text-xs font-medium">
                          R$ {item.acessorio.preco_venda.toFixed(2)}
                        </div>
                      </div>

                      <div>
                        <Label htmlFor={`preco-real-${item.acessorio.produto_id}`} className="text-xs">
                          Preço Real *
                        </Label>
                        <Input
                          id={`preco-real-${item.acessorio.produto_id}`}
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.preco_real_unitario}
                          onChange={(e) => atualizarPrecoRealUnitario(
                            item.acessorio.produto_id,
                            Number(e.target.value)
                          )}
                          className="h-8 text-xs font-bold"
                        />
                      </div>

                      <div>
                        <Label className="text-xs">Qtd.</Label>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => atualizarQuantidade(
                              item.acessorio.produto_id,
                              item.quantidade - 1
                            )}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center text-xs font-medium">
                            {item.quantidade}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => atualizarQuantidade(
                              item.acessorio.produto_id,
                              item.quantidade + 1
                            )}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      <div>
                        <Label className="text-xs">Subtotal</Label>
                        <div className="h-8 flex items-center justify-end px-2 bg-primary/10 rounded">
                          <span className="font-bold text-sm text-primary">
                            R$ {item.subtotal.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Linha 3: Indicador de desconto/acréscimo */}
                    {descontoPercentual !== 0 && (
                      <div className={`text-xs px-2 py-1 rounded ${descontoPercentual > 0 ? 'bg-green-500/10 text-green-700' : 'bg-orange-500/10 text-orange-700'}`}>
                        {descontoPercentual > 0 ? '🔽' : '🔼'} {Math.abs(descontoPercentual).toFixed(1)}% 
                        {descontoPercentual > 0 ? ' de desconto' : ' de acréscimo'}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar acessório..."
          value={buscaTexto}
          onChange={(e) => setBuscaTexto(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Catálogo */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {acessoriosFiltrados.length} {acessoriosFiltrados.length === 1 ? 'acessório disponível' : 'acessórios disponíveis'}
          </span>
          {acessoriosFiltrados.length > 10 && !mostrarTodos && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMostrarTodos(true)}
            >
              Ver todos
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {(mostrarTodos ? acessoriosFiltrados : acessoriosFiltrados.slice(0, 10)).map((acessorio) => {
            const jaSelecionado = selecionados.find(
              s => s.acessorio.produto_id === acessorio.produto_id
            )

            return (
              <Card
                key={acessorio.produto_id}
                className={cn(
                  'cursor-pointer hover:border-primary transition-all',
                  jaSelecionado && 'border-primary bg-primary/5'
                )}
                onClick={() => adicionarAcessorio(acessorio)}
              >
                <CardContent className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm line-clamp-2">
                        {acessorio.descricao}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {acessorio.sku_visual}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-primary">
                        R$ {acessorio.preco_venda.toFixed(2)}
                      </p>
                      {jaSelecionado && (
                        <Badge variant="secondary" className="mt-1">
                          {jaSelecionado.quantidade}x
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {acessoriosFiltrados.length === 0 && (
          <Card>
            <CardContent className="py-8">
              <div className="text-center">
                <Package className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground text-sm">
                  {buscaTexto ? `Nenhum acessório encontrado para "${buscaTexto}"` : 'Nenhum acessório disponível'}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
