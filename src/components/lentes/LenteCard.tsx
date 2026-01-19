/**
 * 💳 LenteCard - Card de Lente com Laboratório
 * 
 * Mostra informações de uma lente específica com seu fornecedor/laboratório.
 * Usado no modal de seleção após escolher o grupo canônico.
 */

'use client'

import { Building2, Clock, Tag, TrendingDown } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { LenteComLaboratorio } from '@/lib/hooks/useLentesCatalogo'

interface LenteCardProps {
  lente: LenteComLaboratorio
  isMelhorCusto: boolean
  onSelect: () => void
}

export function LenteCard({ lente, isMelhorCusto, onSelect }: LenteCardProps) {
  return (
    <Card 
      className={cn(
        "p-4 hover:shadow-lg transition-all cursor-pointer",
        isMelhorCusto && "border-2 border-green-500 bg-green-50/50 dark:bg-green-900/10"
      )}
      onClick={onSelect}
    >
      <div className="flex items-center justify-between gap-4">
        {/* Lado Esquerdo: Informações */}
        <div className="flex-1 space-y-2">
          {/* Laboratório */}
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="font-semibold text-lg text-gray-900 dark:text-white">
              {lente.fornecedor_nome}
            </span>
            {isMelhorCusto && (
              <Badge className="bg-green-600 text-white">
                <TrendingDown className="h-3 w-3 mr-1" />
                Melhor Custo
              </Badge>
            )}
          </div>

          {/* Marca */}
          {lente.marca_nome && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Tag className="h-3 w-3" />
              <span>Marca: <span className="font-medium">{lente.marca_nome}</span></span>
            </div>
          )}

          {/* Prazo */}
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Clock className="h-3 w-3" />
            <span>
              Prazo: <span className="font-medium">{lente.prazo_dias} dias úteis</span>
              {lente.prazo_dias <= 3 && (
                <Badge variant="outline" className="ml-2 text-orange-600 border-orange-300">
                  ⚡ Rápido
                </Badge>
              )}
            </span>
          </div>

          {/* Nome canônico (menor) */}
          <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            {lente.nome_canonizado}
          </div>
        </div>

        {/* Lado Direito: Preço e Botão */}
        <div className="text-right space-y-2">
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              Custo
            </div>
            <div className={cn(
              "text-2xl font-bold",
              isMelhorCusto 
                ? "text-green-600 dark:text-green-400" 
                : "text-gray-900 dark:text-white"
            )}>
              R$ {lente.preco_custo.toFixed(2)}
            </div>
          </div>
          <Button 
            onClick={(e) => {
              e.stopPropagation()
              onSelect()
            }}
            size="sm"
            className={cn(
              isMelhorCusto && "bg-green-600 hover:bg-green-700"
            )}
          >
            Selecionar
          </Button>
        </div>
      </div>
    </Card>
  )
}
