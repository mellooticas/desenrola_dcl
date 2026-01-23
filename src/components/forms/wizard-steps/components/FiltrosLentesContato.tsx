/**
 * 🔍 Componente: FiltrosLentesContato
 * 
 * Filtros específicos para lentes de contato
 * Baseado na estrutura REAL da view v_lentes_contato
 */

'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { ChevronDown, ChevronUp, X } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

// ============================================================
// TIPOS
// ============================================================

export interface FiltrosLentesContato {
  tipo_lente_contato?: string
  material_contato?: string
  finalidade?: string
  dias_uso_min?: number
  dias_uso_max?: number
  tem_protecao_uv?: boolean
  eh_colorida?: boolean
  preco_min?: number
  preco_max?: number
}

interface FiltrosLentesContatoProps {
  filtros: FiltrosLentesContato
  onChange: (filtros: FiltrosLentesContato) => void
  className?: string
}

// ============================================================
// CONSTANTES
// ============================================================

const TIPOS_LENTE = [
  { value: 'diaria', label: 'Diária' },
  { value: 'quinzenal', label: 'Quinzenal' },
  { value: 'mensal', label: 'Mensal' },
  { value: 'trimestral', label: 'Trimestral' },
  { value: 'semestral', label: 'Semestral' },
  { value: 'anual', label: 'Anual' },
  { value: 'cosmetica', label: 'Cosmética' },
  { value: 'terapeutica', label: 'Terapêutica' },
]

const MATERIAIS = [
  { value: 'hidrogel', label: 'Hidrogel' },
  { value: 'silicone_hidrogel', label: 'Silicone Hidrogel' },
  { value: 'gas_permeavel', label: 'Gás Permeável' },
  { value: 'rigida', label: 'Rígida' },
]

const FINALIDADES = [
  { value: 'visao_simples', label: 'Visão Simples' },
  { value: 'astigmatismo', label: 'Astigmatismo (Tórica)' },
  { value: 'multifocal', label: 'Multifocal' },
  { value: 'cosmetica', label: 'Cosmética' },
  { value: 'terapeutica', label: 'Terapêutica' },
]

// ============================================================
// COMPONENTE
// ============================================================

export function FiltrosLentesContato({
  filtros,
  onChange,
  className,
}: FiltrosLentesContatoProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  // Contar filtros ativos
  const filtrosAtivos = Object.keys(filtros).filter((key) => {
    const value = filtros[key as keyof FiltrosLentesContato]
    return value !== undefined && value !== '' && value !== null
  }).length

  const handleLimparFiltros = () => {
    onChange({})
  }

  const handleToggleFiltro = (campo: keyof FiltrosLentesContato, valor: any) => {
    onChange({
      ...filtros,
      [campo]: filtros[campo] === valor ? undefined : valor,
    })
  }

  return (
    <div className={cn('border rounded-lg overflow-hidden', className)}>
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 bg-muted/50 flex items-center justify-between hover:bg-muted/70 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">Filtros</span>
          {filtrosAtivos > 0 && (
            <Badge variant="secondary" className="text-xs">
              {filtrosAtivos}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {filtrosAtivos > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                handleLimparFiltros()
              }}
              className="h-6 px-2 text-xs"
            >
              <X className="h-3 w-3 mr-1" />
              Limpar
            </Button>
          )}
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </div>
      </button>

      {/* Conteúdo dos Filtros */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Tipo de Lente */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">Tipo de Lente</Label>
            <Select
              value={filtros.tipo_lente_contato || 'todos'}
              onValueChange={(value) =>
                onChange({
                  ...filtros,
                  tipo_lente_contato: value === 'todos' ? undefined : value,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos os tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os tipos</SelectItem>
                {TIPOS_LENTE.map((tipo) => (
                  <SelectItem key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Material */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">Material</Label>
            <Select
              value={filtros.material_contato || 'todos'}
              onValueChange={(value) =>
                onChange({
                  ...filtros,
                  material_contato: value === 'todos' ? undefined : value,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos os materiais" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os materiais</SelectItem>
                {MATERIAIS.map((material) => (
                  <SelectItem key={material.value} value={material.value}>
                    {material.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Finalidade */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">Finalidade</Label>
            <Select
              value={filtros.finalidade || 'todos'}
              onValueChange={(value) =>
                onChange({
                  ...filtros,
                  finalidade: value === 'todos' ? undefined : value,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Todas as finalidades" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas as finalidades</SelectItem>
                {FINALIDADES.map((finalidade) => (
                  <SelectItem key={finalidade.value} value={finalidade.value}>
                    {finalidade.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Características */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">Características</Label>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={filtros.tem_protecao_uv ? 'default' : 'outline'}
                size="sm"
                onClick={() =>
                  handleToggleFiltro('tem_protecao_uv', !filtros.tem_protecao_uv)
                }
                className="text-xs"
              >
                Proteção UV
              </Button>
              <Button
                variant={filtros.eh_colorida ? 'default' : 'outline'}
                size="sm"
                onClick={() =>
                  handleToggleFiltro('eh_colorida', !filtros.eh_colorida)
                }
                className="text-xs"
              >
                Colorida
              </Button>
            </div>
          </div>

          {/* Faixa de Preço */}
          <div className="space-y-3">
            <Label className="text-xs font-medium">Faixa de Preço</Label>
            <div className="space-y-2">
              <Slider
                value={[
                  filtros.preco_min || 0,
                  filtros.preco_max || 1000,
                ]}
                onValueChange={([min, max]) =>
                  onChange({
                    ...filtros,
                    preco_min: min,
                    preco_max: max,
                  })
                }
                min={0}
                max={1000}
                step={10}
                className="w-full"
              />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format(filtros.preco_min || 0)}
                </span>
                <span>
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format(filtros.preco_max || 1000)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
