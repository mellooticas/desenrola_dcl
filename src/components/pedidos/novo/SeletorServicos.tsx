'use client'

import { useState, useEffect } from 'react'
import { Search, Wrench, Check, Package, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { getCrmErpClient } from '@/lib/supabase/crm-erp-client'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface Servico {
  produto_id: string
  sku_visual: string
  descricao: string
  preco_venda: number
  custo: number
}

interface ServicoSelecionado {
  servico: Servico
  preco_final: number
  preco_real: number // Preço real de venda (pode ter desconto ou acréscimo)
  desconto_percentual: number
}

interface SeletorServicosProps {
  onServicoSelecionado: (dados: ServicoSelecionado | null) => void
  lojaId?: string
  servicoInicial?: ServicoSelecionado
}

export function SeletorServicos({
  onServicoSelecionado,
  lojaId,
  servicoInicial
}: SeletorServicosProps) {
  const [servicos, setServicos] = useState<Servico[]>([])
  const [servicosFiltrados, setServicosFiltrados] = useState<Servico[]>([])
  const [servicoSelecionado, setServicoSelecionado] = useState<Servico | null>(
    servicoInicial?.servico || null
  )
  const [precoReal, setPrecoReal] = useState<number>(
    servicoInicial?.preco_real || servicoInicial?.servico?.preco_venda || 0
  )
  const [descontoPercentual, setDescontoPercentual] = useState<number>(
    servicoInicial?.desconto_percentual || 0
  )
  const [buscaTexto, setBuscaTexto] = useState('')
  const [carregando, setCarregando] = useState(true)

  // Buscar serviços disponíveis
  useEffect(() => {
    buscarServicos()
  }, [])

  // Aplicar filtro de busca
  useEffect(() => {
    if (!buscaTexto.trim()) {
      setServicosFiltrados(servicos)
      return
    }

    const termo = buscaTexto.toLowerCase()
    const filtrados = servicos.filter(s =>
      s.descricao.toLowerCase().includes(termo) ||
      s.sku_visual.toLowerCase().includes(termo)
    )
    setServicosFiltrados(filtrados)
  }, [buscaTexto, servicos])

  // Atualizar dados quando servico/preco_real/desconto mudam
  useEffect(() => {
    if (!servicoSelecionado) {
      onServicoSelecionado(null)
      return
    }

    // Se precoReal foi alterado manualmente, calcular desconto baseado nele
    const descontoCalculado = servicoSelecionado.preco_venda > 0
      ? ((servicoSelecionado.preco_venda - precoReal) / servicoSelecionado.preco_venda * 100)
      : 0

    onServicoSelecionado({
      servico: servicoSelecionado,
      preco_final: precoReal,
      preco_real: precoReal,
      desconto_percentual: Number(descontoCalculado.toFixed(2))
    })
  }, [servicoSelecionado, precoReal])

  async function buscarServicos() {
    try {
      setCarregando(true)
      const crmErpClient = getCrmErpClient()

      const { data, error } = await crmErpClient
        .from('vw_estoque_completo')
        .select('produto_id, sku_visual, descricao, preco_venda, custo')
        .eq('tipo_produto', 'servico')
        .eq('ativo', true)
        .order('descricao')

      if (error) throw error

      setServicos(data || [])
      setServicosFiltrados(data || [])
    } catch (error) {
      console.error('Erro ao buscar serviços:', error)
      toast.error('Erro ao carregar serviços')
    } finally {
      setCarregando(false)
    }
  }

  function calcularPrecoFinal(preco: number, desconto: number): number {
    if (desconto <= 0) return preco
    return preco * (1 - desconto / 100)
  }

  function selecionarServico(servico: Servico) {
    setServicoSelecionado(servico)
    setPrecoReal(servico.preco_venda) // Inicia com preço de tabela
    setDescontoPercentual(0)
  }

  function limparSelecao() {
    setServicoSelecionado(null)
    setPrecoReal(0)
    setDescontoPercentual(0)
    setBuscaTexto('')
  }
  
  // Atualizar preço real quando desconto percentual muda
  function atualizarDesconto(novoDesconto: number) {
    if (!servicoSelecionado) return
    setDescontoPercentual(novoDesconto)
    const novoPrecoReal = calcularPrecoFinal(servicoSelecionado.preco_venda, novoDesconto)
    setPrecoReal(novoPrecoReal)
  }

  if (carregando) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">Carregando serviços...</span>
      </div>
    )
  }

  if (servicos.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Nenhum serviço cadastrado no sistema
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar serviço por nome ou código..."
          value={buscaTexto}
          onChange={(e) => setBuscaTexto(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Serviço Selecionado */}
      {servicoSelecionado && (
        <Card className="border-primary bg-primary/5">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" />
              Serviço Selecionado
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="font-medium">{servicoSelecionado.descricao}</p>
              <p className="text-sm text-muted-foreground">
                SKU: {servicoSelecionado.sku_visual}
              </p>
            </div>

            {/* Campos de Preço Real e Desconto */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="preco-tabela">Preço Tabela</Label>
                <div className="h-10 flex items-center px-3 bg-muted rounded-md">
                  <span className="font-medium text-sm">
                    R$ {servicoSelecionado.preco_venda.toFixed(2)}
                  </span>
                </div>
              </div>

              <div>
                <Label htmlFor="preco-real">Preço Real *</Label>
                <Input
                  id="preco-real"
                  type="number"
                  min="0"
                  step="0.01"
                  value={precoReal}
                  onChange={(e) => {
                    const novoPrecoReal = Number(e.target.value)
                    setPrecoReal(novoPrecoReal)
                    // Recalcular desconto baseado no preço real
                    if (servicoSelecionado) {
                      const descCalc = ((servicoSelecionado.preco_venda - novoPrecoReal) / servicoSelecionado.preco_venda * 100)
                      setDescontoPercentual(Number(descCalc.toFixed(2)))
                    }
                  }}
                  placeholder="0.00"
                  className="font-bold"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Valor cobrado do cliente
                </p>
              </div>

              <div>
                <Label htmlFor="desconto">Desconto/Acréscimo (%)</Label>
                <Input
                  id="desconto"
                  type="number"
                  step="0.01"
                  value={descontoPercentual}
                  onChange={(e) => atualizarDesconto(Number(e.target.value))}
                  placeholder="0"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {descontoPercentual > 0 ? '🔽 Desconto' : descontoPercentual < 0 ? '🔼 Acréscimo' : '➖ Sem alteração'}
                </p>
              </div>
            </div>

            {/* Info de Economia/Acréscimo */}
            {descontoPercentual !== 0 && (
              <div className={`p-3 rounded-lg ${descontoPercentual > 0 ? 'bg-green-500/10 border border-green-500/20' : 'bg-orange-500/10 border border-orange-500/20'}`}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">
                    {descontoPercentual > 0 ? '💰 Economia para o cliente:' : '💵 Acréscimo cobrado:'}
                  </span>
                  <span className={`font-bold ${descontoPercentual > 0 ? 'text-green-600' : 'text-orange-600'}`}>
                    R$ {Math.abs(servicoSelecionado.preco_venda - precoReal).toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={limparSelecao}
              className="w-full"
            >
              Trocar Serviço
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Lista de Serviços */}
      {!servicoSelecionado && (
        <div className="space-y-2">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">
              {servicosFiltrados.length} {servicosFiltrados.length === 1 ? 'serviço disponível' : 'serviços disponíveis'}
            </p>
            {buscaTexto && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setBuscaTexto('')}
              >
                Limpar busca
              </Button>
            )}
          </div>

          <div className="grid gap-2">
            {servicosFiltrados.map((servico) => (
              <Card
                key={servico.produto_id}
                className="cursor-pointer hover:border-primary hover:bg-primary/5 transition-all"
                onClick={() => selecionarServico(servico)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Wrench className="h-4 w-4 text-primary" />
                        <p className="font-medium">{servico.descricao}</p>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        SKU: {servico.sku_visual}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-primary">
                        R$ {servico.preco_venda.toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Custo: R$ {servico.custo.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {servicosFiltrados.length === 0 && buscaTexto && (
            <Card>
              <CardContent className="py-8">
                <div className="text-center">
                  <Search className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">
                    Nenhum serviço encontrado para "{buscaTexto}"
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
