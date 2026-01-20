/**
 * 🔍 LenteDetalhesModal - Modal de Escolha de Laboratório
 * 
 * Após selecionar um grupo canônico, mostra todas as opções de laboratórios
 * que fornecem aquela lente, permitindo escolher o melhor custo/prazo.
 * 
 * FLUXO:
 * 1. Recebe grupo canônico selecionado
 * 2. Busca todas as lentes daquele grupo (diferentes labs)
 * 3. Mostra cards ordenados por custo (mais barato primeiro)
 * 4. Destaca "Melhor Custo" e "Rápido"
 * 5. Retorna lente completa com fornecedor_id para salvar
 */

'use client'

import { useMemo } from 'react'
import { X, TrendingDown, Clock, Info } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { useLentesDoGrupo, type GrupoCanonicoCompleto, type LenteComLaboratorio } from '@/lib/hooks/useLentesCatalogo'
import { LenteCard } from './LenteCard'

interface LenteDetalhesModalProps {
  grupo: GrupoCanonicoCompleto | null
  isOpen: boolean
  onClose: () => void
  onSelect: (lente: LenteComLaboratorio) => void
}

export function LenteDetalhesModal({ 
  grupo, 
  isOpen, 
  onClose, 
  onSelect 
}: LenteDetalhesModalProps) {
  // Busca lentes do grupo (retorna array ordenado por preco_custo ASC)
  const { data: lentes, isLoading, error } = useLentesDoGrupo(grupo?.id || null)

  // Identifica melhor custo
  const melhorCusto = useMemo(() => {
    if (!lentes || lentes.length === 0) return null
    return Math.min(...lentes.map(l => l.preco_custo))
  }, [lentes])

  // Calcula range de preços
  const rangePrecos = useMemo(() => {
    if (!lentes || lentes.length === 0) return null
    const min = Math.min(...lentes.map(l => l.preco_custo))
    const max = Math.max(...lentes.map(l => l.preco_custo))
    return { min, max }
  }, [lentes])

  const handleSelectLente = (lente: LenteComLaboratorio) => {
    console.log('[LenteDetalhesModal] Lente selecionada:', {
      lente_id: lente.lente_id,
      grupo_canonico_id: lente.grupo_canonico_id,
      fornecedor: lente.fornecedor_nome,
      custo: lente.preco_custo,
      prazo: lente.prazo_dias
    })
    onSelect(lente)
    onClose()
  }

  if (!grupo) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold mb-2">
                {grupo.nome_grupo}
              </DialogTitle>
              <DialogDescription className="text-base">
                Escolha o laboratório ideal considerando custo e prazo de entrega
              </DialogDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Info do Grupo */}
          <div className="flex items-center gap-4 text-sm">
            <Badge variant="outline" className="capitalize">
              {grupo.tipo_lente?.replace('_', ' ')}
            </Badge>
            {grupo.material && (
              <Badge variant="secondary">{grupo.material}</Badge>
            )}
            {grupo.indice_refracao && (
              <Badge variant="secondary">Índice {grupo.indice_refracao}</Badge>
            )}
            {grupo.is_premium && (
              <Badge className="bg-purple-600 text-white">Premium</Badge>
            )}
          </div>

          {/* Range de preços */}
          {rangePrecos && (
            <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
              <TrendingDown className="h-4 w-4" />
              <span>
                Faixa de custo: <strong>R$ {rangePrecos.min.toFixed(2)}</strong> a <strong>R$ {rangePrecos.max.toFixed(2)}</strong>
              </span>
              <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                {lentes?.length || 0} laboratórios disponíveis
              </span>
            </div>
          )}
        </DialogHeader>

        <Separator />

        {/* Lista de Lentes */}
        <ScrollArea className="h-[500px] px-6">
          <div className="space-y-4 py-4">
            {/* Aviso Temporário - Dados Mock */}
            <Alert className="bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-900">
              <Info className="h-4 w-4 text-yellow-600 dark:text-yellow-500" />
              <AlertDescription className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Modo de Demonstração:</strong> Os laboratórios exibidos são baseados nos dados do grupo. 
                Para ver fornecedores reais, é necessário configurar permissões RLS na view <code className="text-xs bg-yellow-100 dark:bg-yellow-900/40 px-1 rounded">v_lentes_cotacao_compra</code> do banco sis_lens.
              </AlertDescription>
            </Alert>

            {/* Loading */}
            {isLoading && (
              <div className="text-center py-8 text-gray-500">
                Buscando opções de laboratórios...
              </div>
            )}

            {/* Erro */}
            {error && (
              <Alert variant="destructive">
                <AlertDescription>
                  Erro ao buscar lentes: {error.message}
                </AlertDescription>
              </Alert>
            )}

            {/* Sem lentes */}
            {!isLoading && !error && (!lentes || lentes.length === 0) && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Nenhum laboratório disponível para esta lente no momento.
                </AlertDescription>
              </Alert>
            )}

            {/* Cards de lentes */}
            {lentes && lentes.length > 0 && (
              <>
                {/* Dica */}
                <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                  <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <AlertDescription className="text-blue-900 dark:text-blue-100">
                    <strong>💡 Dica:</strong> As opções estão ordenadas por custo. 
                    Considere também o prazo de entrega ao escolher o laboratório.
                  </AlertDescription>
                </Alert>

                {/* Grid de cards */}
                {lentes.map((lente) => (
                  <LenteCard
                    key={`${lente.lente_id}-${lente.fornecedor_id}`}
                    lente={lente}
                    isMelhorCusto={lente.preco_custo === melhorCusto}
                    onSelect={() => handleSelectLente(lente)}
                  />
                ))}
              </>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
