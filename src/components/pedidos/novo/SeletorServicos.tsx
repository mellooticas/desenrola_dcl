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

  // Atualizar dados quando servico/desconto mudam
  useEffect(() => {
    if (!servicoSelecionado) {
      onServicoSelecionado(null)
      return
    }

    const preco_final = calcularPrecoFinal(
      servicoSelecionado.preco_venda,
      descontoPercentual
    )

    onServicoSelecionado({
      servico: servicoSelecionado,
      preco_final,
      desconto_percentual: descontoPercentual
    })
  }, [servicoSelecionado, descontoPercentual])

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
  }

  function limparSelecao() {
    setServicoSelecionado(null)
    setDescontoPercentual(0)
    setBuscaTexto('')
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

            {/* Campo de Desconto */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="desconto">Desconto (%)</Label>
                <Input
                  id="desconto"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={descontoPercentual}
                  onChange={(e) => setDescontoPercentual(Number(e.target.value))}
                  placeholder="0"
                />
              </div>

              <div>
                <Label>Preço Final</Label>
                <div className="h-10 flex items-center px-3 bg-muted rounded-md">
                  <span className="font-bold text-lg">
                    R$ {calcularPrecoFinal(
                      servicoSelecionado.preco_venda,
                      descontoPercentual
                    ).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Info de Preços */}
            <div className="flex gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Preço Tabela: </span>
                <span className="font-medium">
                  R$ {servicoSelecionado.preco_venda.toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Custo: </span>
                <span className="font-medium">
                  R$ {servicoSelecionado.custo.toFixed(2)}
                </span>
              </div>
              {descontoPercentual > 0 && (
                <div>
                  <span className="text-muted-foreground">Economia: </span>
                  <span className="font-medium text-green-600">
                    R$ {(servicoSelecionado.preco_venda - calcularPrecoFinal(
                      servicoSelecionado.preco_venda,
                      descontoPercentual
                    )).toFixed(2)}
                  </span>
                </div>
              )}
            </div>

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
