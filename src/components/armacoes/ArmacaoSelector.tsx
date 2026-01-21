'use client'

import { useState, useEffect } from 'react'
import { Search, Package, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useArmacoes } from '@/lib/hooks/useArmacoes'
import { cn } from '@/lib/utils'

interface ArmacaoSelectorProps {
  lojaId: string
  armacaoSelecionada?: string | null
  clienteTrouxeArmacao?: boolean
  onArmacaoSelect?: (armacaoId: string | null) => void
  onClienteTrouxeChange?: (trouxe: boolean) => void
}

export function ArmacaoSelector({
  lojaId,
  armacaoSelecionada,
  clienteTrouxeArmacao = false,
  onArmacaoSelect,
  onClienteTrouxeChange,
}: ArmacaoSelectorProps) {
  const [busca, setBusca] = useState('')
  const [buscaDebounced, setBuscaDebounced] = useState('')
  const [apenasEmEstoque, setApenasEmEstoque] = useState(true)

  // Debounce da busca (350ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setBuscaDebounced(busca)
    }, 350)
    return () => clearTimeout(timer)
  }, [busca])

  const { data: armacoesRaw, isLoading, error } = useArmacoes({
    loja_id: lojaId,
    busca: buscaDebounced || undefined,
    apenas_em_estoque: apenasEmEstoque,
  })

  // Remover duplicatas baseado em produto_id (pode vir duplicado por OR na query)
  const armacoes = armacoesRaw
    ? Array.from(
        new Map(armacoesRaw.map(item => [item.produto_id, item])).values()
      )
    : []

  const handleClienteTrouxeToggle = (checked: boolean) => {
    onClienteTrouxeChange?.(checked)
    if (checked) {
      // Se cliente trouxe, limpa seleção de armação do estoque
      onArmacaoSelect?.(null)
    }
  }

  const handleArmacaoClick = (produtoId: string) => {
    if (clienteTrouxeArmacao) return // Não permite seleção se cliente trouxe

    const novaSelecao = armacaoSelecionada === produtoId ? null : produtoId
    onArmacaoSelect?.(novaSelecao)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'NORMAL':
        return (
          <Badge variant="default" className="bg-green-500/10 text-green-700 hover:bg-green-500/20">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Em Estoque
          </Badge>
        )
      case 'CRITICO':
        return (
          <Badge variant="default" className="bg-yellow-500/10 text-yellow-700 hover:bg-yellow-500/20">
            <AlertCircle className="w-3 h-3 mr-1" />
            Estoque Crítico
          </Badge>
        )
      case 'SEM_ESTOQUE':
        return (
          <Badge variant="secondary" className="opacity-60">
            Sem Estoque
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-4">
      {/* Checkbox: Cliente trouxe armação */}
      <div className="flex items-center space-x-2 p-4 bg-muted/50 rounded-lg">
        <Checkbox
          id="cliente-trouxe"
          checked={clienteTrouxeArmacao}
          onCheckedChange={handleClienteTrouxeToggle}
        />
        <Label
          htmlFor="cliente-trouxe"
          className="text-sm font-medium cursor-pointer"
        >
          Cliente trouxe armação própria
        </Label>
      </div>

      {/* Se cliente trouxe, não mostra busca */}
      {clienteTrouxeArmacao ? (
        <div className="text-center py-8 text-muted-foreground">
          <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm">
            Cliente trouxe sua própria armação. Nenhuma seleção de estoque necessária.
          </p>
        </div>
      ) : (
        <>
          {/* Busca e filtros */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por SKU, código de barras ou descrição..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="apenas-estoque"
                checked={apenasEmEstoque}
                onCheckedChange={(checked) => setApenasEmEstoque(checked as boolean)}
              />
              <Label htmlFor="apenas-estoque" className="text-sm cursor-pointer">
                Apenas com estoque disponível
              </Label>
            </div>
          </div>

          {/* Lista de armações */}
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {isLoading ? (
              <>
                {[1, 2, 3].map((i) => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <Skeleton className="h-4 w-3/4 mb-2" />
                      <Skeleton className="h-3 w-1/2" />
                    </CardContent>
                  </Card>
                ))}
              </>
            ) : error ? (
              <div className="text-center py-8 text-destructive">
                <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm">Erro ao carregar armações</p>
              </div>
            ) : !armacoes || armacoes.length === 0 ? (
              <div className="text-center py-8 space-y-3">
                <Package className="w-12 h-12 mx-auto mb-2 opacity-50 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Nenhuma armação encontrada</p>
                  {buscaDebounced && (
                    <p className="text-xs mt-1 text-muted-foreground">
                      Tente ajustar os filtros ou termos de busca
                    </p>
                  )}
                  {!buscaDebounced && (
                    <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900 rounded-lg text-left">
                      <p className="text-xs text-yellow-800 dark:text-yellow-200">
                        <strong>ℹ️ Banco CRM_ERP separado:</strong> As armações vêm de um banco de dados diferente 
                        ({armacoes?.length || 0} produtos carregados). Se não aparecer nada, pode ser que sua loja 
                        ainda não tenha produtos cadastrados neste banco.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              armacoes.map((armacao) => {
                const isSelected = armacaoSelecionada === armacao.produto_id
                const temEstoque = (armacao.quantidade_atual ?? 0) > 0

                return (
                  <Card
                    key={armacao.produto_id}
                    className={cn(
                      'cursor-pointer transition-all hover:shadow-md',
                      isSelected && 'ring-2 ring-primary',
                      !temEstoque && 'opacity-50'
                    )}
                    onClick={() => handleArmacaoClick(armacao.produto_id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          {/* SKU Visual em destaque */}
                          <div className="flex items-center gap-2 mb-1">
                            <code className="text-xs font-mono bg-muted px-2 py-0.5 rounded">
                              {armacao.sku_visual || armacao.sku}
                            </code>
                            {armacao.status_estoque && getStatusBadge(armacao.status_estoque)}
                          </div>

                          {/* Descrição */}
                          <p className="text-sm font-medium truncate" title={armacao.descricao}>
                            {armacao.descricao}
                          </p>

                          {/* Informações adicionais */}
                          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                            {armacao.marca_nome && (
                              <span>Marca: {armacao.marca_nome}</span>
                            )}
                            <span>Qtd: {armacao.quantidade_atual ?? 0}</span>
                            {armacao.preco_venda && (
                              <span className="font-medium text-foreground">
                                R$ {armacao.preco_venda.toFixed(2)}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Indicador de seleção */}
                        {isSelected && (
                          <div className="flex-shrink-0">
                            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                              <CheckCircle2 className="w-4 h-4 text-primary-foreground" />
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>

          {/* Resumo da seleção */}
          {armacaoSelecionada && !clienteTrouxeArmacao && (
            <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
              <p className="text-sm text-primary font-medium">
                ✓ Armação selecionada
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
