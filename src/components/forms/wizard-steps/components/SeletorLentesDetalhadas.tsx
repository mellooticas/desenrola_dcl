/**
 * 🔍 Componente: SeletorLentesDetalhadas
 * 
 * Lista as lentes individuais de um grupo canônico
 * Permite seleção de fornecedor/laboratório específico
 */

'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Loader2, Building2, Package, Clock, DollarSign, Check } from 'lucide-react'
import { useLentesDoGrupo } from '@/lib/hooks/useLentesCatalogo'
import { cn } from '@/lib/utils'

// ============================================================
// TIPOS
// ============================================================

interface SeletorLentesDetalhadasProps {
  grupoCanonicoId: string | null
  lenteSelecionadaId?: string | null
  onSelecionarLente: (
    lenteId: string, 
    fornecedorId: string, 
    precoCusto: number, 
    precoTabela: number,
    prazo: number,
    nomeLente: string,
    fornecedorNome: string
  ) => void
  className?: string
}

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export function SeletorLentesDetalhadas({
  grupoCanonicoId,
  lenteSelecionadaId,
  onSelecionarLente,
  className,
}: SeletorLentesDetalhadasProps) {
  const { data: lentes = [], isLoading } = useLentesDoGrupo(grupoCanonicoId)

  if (!grupoCanonicoId) {
    return (
      <Card className={className}>
        <CardContent className="py-12 text-center">
          <Package className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
          <p className="mt-4 text-sm text-muted-foreground">
            Selecione um grupo de lentes para ver as opções disponíveis
          </p>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  if (lentes.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="py-12 text-center">
          <Package className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
          <p className="mt-4 text-sm text-muted-foreground">
            Nenhuma lente disponível neste grupo
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Lentes Disponíveis</h3>
          <p className="text-sm text-muted-foreground">
            {lentes.length} {lentes.length === 1 ? 'opção encontrada' : 'opções encontradas'}
          </p>
        </div>
      </div>

      <div className="grid gap-3">
        {lentes.map((lente: any) => {
          // Processar preços antes de passar
          const precoCusto = lente.preco_custo || lente.custo_base || 0
          const precoVendaSugerido = lente.preco_venda_sugerido || lente.preco_tabela || lente.preco_fabricante || 0
          
          return (
            <CardLenteDetalhada
              key={lente.id}
              lente={lente}
              isSelected={lenteSelecionadaId === lente.id}
              onSelect={() =>
                onSelecionarLente(
                  lente.id || '',
                  lente.fornecedor_id || '',
                  precoCusto,
                  precoVendaSugerido,
                  lente.prazo_dias || lente.lead_time_dias || 7,
                  lente.nome_lente || lente.nome_canonizado || 'Lente sem nome',
                  lente.fornecedor_nome || 'Fornecedor Desconhecido'
                )
              }
            />
          )
        })}
      </div>
    </div>
  )
}

// ============================================================
// COMPONENTE: Card de Lente Detalhada
// ============================================================

interface CardLenteDetalhadaProps {
  lente: any
  isSelected: boolean
  onSelect: () => void
}

function CardLenteDetalhada({ lente, isSelected, onSelect }: CardLenteDetalhadaProps) {
  // Debug: ver estrutura da lente
  console.log('[CardLenteDetalhada] Lente recebida:', lente)
  
  // Buscar preços com fallbacks
  const precoCusto = lente.preco_custo || lente.custo_base || 0
  const precoVendaSugerido = lente.preco_venda_sugerido || lente.preco_tabela || lente.preco_fabricante || 0
  const prazo = lente.prazo_dias || lente.lead_time_dias || lente.prazo_entrega || 7

  console.log('[CardLenteDetalhada] Preços processados:', { 
    precoCusto, 
    precoVendaSugerido, 
    prazo,
    campos_disponiveis: {
      preco_custo: lente.preco_custo,
      custo_base: lente.custo_base,
      preco_venda_sugerido: lente.preco_venda_sugerido,
      preco_tabela: lente.preco_tabela,
      preco_fabricante: lente.preco_fabricante
    }
  })

  // Badge de prazo
  const badgePrazo = prazo <= 3 ? 'express' : prazo <= 7 ? 'normal' : 'economico'
  const badgePrazoColor =
    badgePrazo === 'express'
      ? 'bg-green-500/10 text-green-700 border-green-500/20'
      : badgePrazo === 'normal'
      ? 'bg-blue-500/10 text-blue-700 border-blue-500/20'
      : 'bg-gray-500/10 text-gray-700 border-gray-500/20'

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all hover:shadow-md',
        isSelected && 'ring-2 ring-primary'
      )}
      onClick={onSelect}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 space-y-1">
            <CardTitle className="text-base leading-tight">
              {lente.nome_lente || lente.nome_canonizado || 'Lente Sem Nome'}
            </CardTitle>
            <CardDescription className="flex items-center gap-2 text-xs">
              <Building2 className="h-3 w-3" />
              {lente.fornecedor_nome || 'Fornecedor Desconhecido'}
              {lente.marca_nome && (
                <>
                  <span>•</span>
                  <span>{lente.marca_nome}</span>
                </>
              )}
            </CardDescription>
          </div>
          {isSelected && (
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Check className="h-4 w-4" />
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Tratamentos */}
        <div className="flex flex-wrap gap-1">
          {lente.tem_ar && (
            <Badge variant="outline" className="text-xs">
              Antirreflexo
            </Badge>
          )}
          {lente.tem_uv && (
            <Badge variant="outline" className="text-xs">
              UV400
            </Badge>
          )}
          {lente.tem_blue && (
            <Badge variant="outline" className="text-xs">
              Blue Light
            </Badge>
          )}
          {lente.tratamento_foto && lente.tratamento_foto !== 'nenhum' && (
            <Badge variant="outline" className="text-xs capitalize">
              {lente.tratamento_foto}
            </Badge>
          )}
        </div>

        {/* Informações principais */}
        <div className="grid grid-cols-2 gap-3 border-t pt-3">
          {/* Preço Custo */}
          <div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <DollarSign className="h-3 w-3" />
              <span>Custo</span>
            </div>
            <p className="mt-1 text-sm font-semibold text-orange-600 dark:text-orange-400">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format(precoCusto)}
            </p>
          </div>

          {/* Preço Venda Sugerido */}
          <div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <DollarSign className="h-3 w-3" />
              <span>Tabela</span>
            </div>
            <p className="mt-1 text-sm font-semibold text-green-600 dark:text-green-400">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format(precoVendaSugerido)}
            </p>
          </div>
        </div>

        {/* Prazo */}
        <div className="border-t pt-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>Prazo de Entrega</span>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold">{prazo} dias úteis</p>
              <Badge variant="outline" className={cn('text-[10px]', badgePrazoColor)}>
                {badgePrazo === 'express' ? '⚡ Express' : badgePrazo === 'normal' ? '📦 Normal' : '🐌 Econômico'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Botão de seleção */}
        <Button
          className="w-full"
          variant={isSelected ? 'default' : 'outline'}
          onClick={(e) => {
            e.stopPropagation()
            onSelect()
          }}
        >
          {isSelected ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Selecionada
            </>
          ) : (
            'Selecionar Esta Lente'
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
