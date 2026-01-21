/**
 * 🔍 Componente: FiltrosLentes
 * 
 * Painel de filtros avançados para seleção de grupos de lentes
 * Filtra por: tipo, material, índice, tratamentos, preço, prazo
 */

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Filter, X, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { FiltrosLente } from '@/lib/hooks/useLentesCatalogo'

// ============================================================
// TIPOS
// ============================================================

interface FiltrosLentesProps {
  filtros: FiltrosLente
  onChange: (filtros: FiltrosLente) => void
  className?: string
}

// ============================================================
// CONSTANTES: Opções de Filtros
// ============================================================

const TIPOS_LENTE = [
  { value: 'visao_simples', label: 'Visão Simples' },
  { value: 'multifocal', label: 'Multifocal' },
  { value: 'bifocal', label: 'Bifocal' },
]

const MATERIAIS = [
  { value: 'CR39', label: 'Resina CR-39' },
  { value: 'POLICARBONATO', label: 'Policarbonato' },
  { value: 'TRIVEX', label: 'Trivex' },
  { value: 'MINERAL', label: 'Mineral (Cristal)' },
  { value: 'HIGH_INDEX', label: 'Alto Índice' },
]

const INDICES_REFRACAO = [
  { value: '1.50', label: '1.50' },
  { value: '1.56', label: '1.56' },
  { value: '1.59', label: '1.59' },
  { value: '1.60', label: '1.60' },
  { value: '1.67', label: '1.67' },
  { value: '1.74', label: '1.74' },
]

const TRATAMENTOS_FOTO = [
  { value: 'nenhum', label: 'Sem Fotossensível' },
  { value: 'fotocromático', label: 'Fotocromático' },
  { value: 'polarizado', label: 'Polarizado' },
]

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export function FiltrosLentes({ filtros, onChange, className }: FiltrosLentesProps) {
  const [open, setOpen] = useState(false)

  // Contador de filtros ativos
  const contadorFiltros = Object.keys(filtros).filter(
    (key) => key !== 'is_premium' && filtros[key as keyof FiltrosLente] !== undefined
  ).length

  const handleLimparFiltros = () => {
    onChange({})
  }

  const handleToggleTratamento = (campo: keyof FiltrosLente, valor: boolean) => {
    onChange({
      ...filtros,
      [campo]: valor ? true : undefined,
    })
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filtros
            {contadorFiltros > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 text-xs">
                {contadorFiltros}
              </Badge>
            )}
          </Button>
        </SheetTrigger>

        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Filtrar Lentes</SheetTitle>
            <SheetDescription>
              Ajuste os filtros para encontrar as lentes ideais
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-6">
            {/* Tipo de Lente */}
            <div className="space-y-2">
              <Label>Tipo de Lente</Label>
              <Select
                value={filtros.tipo_lente || undefined}
                onValueChange={(value) =>
                  onChange({
                    ...filtros,
                    tipo_lente: value ? (value as any) : undefined,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos os tipos" />
                </SelectTrigger>
                <SelectContent>
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
              <Label>Material</Label>
              <Select
                value={filtros.material || undefined}
                onValueChange={(value) =>
                  onChange({
                    ...filtros,
                    material: value || undefined,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos os materiais" />
                </SelectTrigger>
                <SelectContent>
                  {MATERIAIS.map((material) => (
                    <SelectItem key={material.value} value={material.value}>
                      {material.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Índice de Refração */}
            <div className="space-y-2">
              <Label>Índice de Refração</Label>
              <Select
                value={filtros.indice_refracao || undefined}
                onValueChange={(value) =>
                  onChange({
                    ...filtros,
                    indice_refracao: value || undefined,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos os índices" />
                </SelectTrigger>
                <SelectContent>
                  {INDICES_REFRACAO.map((indice) => (
                    <SelectItem key={indice.value} value={indice.value}>
                      {indice.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tratamentos (Checkboxes) */}
            <div className="space-y-3">
              <Label>Tratamentos</Label>
              
              {/* Antirreflexo */}
              <div
                className={cn(
                  'flex items-center justify-between rounded-lg border p-3 cursor-pointer transition-colors',
                  filtros.tem_antirreflexo
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:bg-muted/50'
                )}
                onClick={() =>
                  handleToggleTratamento('tem_antirreflexo', !filtros.tem_antirreflexo)
                }
              >
                <span className="text-sm font-medium">Antirreflexo (AR)</span>
                {filtros.tem_antirreflexo && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </div>

              {/* UV */}
              <div
                className={cn(
                  'flex items-center justify-between rounded-lg border p-3 cursor-pointer transition-colors',
                  filtros.tem_uv
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:bg-muted/50'
                )}
                onClick={() => handleToggleTratamento('tem_uv', !filtros.tem_uv)}
              >
                <span className="text-sm font-medium">Proteção UV400</span>
                {filtros.tem_uv && <Check className="h-4 w-4 text-primary" />}
              </div>

              {/* Blue Light */}
              <div
                className={cn(
                  'flex items-center justify-between rounded-lg border p-3 cursor-pointer transition-colors',
                  filtros.tem_blue_light
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:bg-muted/50'
                )}
                onClick={() =>
                  handleToggleTratamento('tem_blue_light', !filtros.tem_blue_light)
                }
              >
                <span className="text-sm font-medium">Blue Light</span>
                {filtros.tem_blue_light && <Check className="h-4 w-4 text-primary" />}
              </div>

              {/* Antirrisco */}
              <div
                className={cn(
                  'flex items-center justify-between rounded-lg border p-3 cursor-pointer transition-colors',
                  filtros.tem_antirrisco
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:bg-muted/50'
                )}
                onClick={() =>
                  handleToggleTratamento('tem_antirrisco', !filtros.tem_antirrisco)
                }
              >
                <span className="text-sm font-medium">Antirrisco</span>
                {filtros.tem_antirrisco && <Check className="h-4 w-4 text-primary" />}
              </div>
            </div>

            {/* Tratamento Fotossensível */}
            <div className="space-y-2">
              <Label>Tratamento Fotossensível</Label>
              <Select
                value={filtros.tratamento_foto || undefined}
                onValueChange={(value) =>
                  onChange({
                    ...filtros,
                    tratamento_foto: value ? (value as any) : undefined,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Qualquer um" />
                </SelectTrigger>
                <SelectContent>
                  {TRATAMENTOS_FOTO.map((trat) => (
                    <SelectItem key={trat.value} value={trat.value}>
                      {trat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Faixa de Preço */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Faixa de Preço</Label>
                {(filtros.preco_min || filtros.preco_max) && (
                  <span className="text-sm text-muted-foreground">
                    {filtros.preco_min
                      ? `R$ ${filtros.preco_min}`
                      : 'R$ 0'}{' '}
                    -{' '}
                    {filtros.preco_max
                      ? `R$ ${filtros.preco_max}`
                      : 'R$ 1000+'}
                  </span>
                )}
              </div>
              
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Preço Mínimo</Label>
                <Slider
                  value={[filtros.preco_min || 0]}
                  onValueChange={([value]) =>
                    onChange({
                      ...filtros,
                      preco_min: value > 0 ? value : undefined,
                    })
                  }
                  max={1000}
                  step={10}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Preço Máximo</Label>
                <Slider
                  value={[filtros.preco_max || 1000]}
                  onValueChange={([value]) =>
                    onChange({
                      ...filtros,
                      preco_max: value < 1000 ? value : undefined,
                    })
                  }
                  max={1000}
                  step={10}
                  className="w-full"
                />
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="flex gap-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={handleLimparFiltros}
                className="flex-1 gap-2"
                disabled={contadorFiltros === 0}
              >
                <X className="h-4 w-4" />
                Limpar
              </Button>
              <Button onClick={() => setOpen(false)} className="flex-1">
                Aplicar Filtros
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Badges de filtros ativos */}
      {contadorFiltros > 0 && (
        <div className="flex flex-wrap gap-1">
          {filtros.tipo_lente && (
            <Badge variant="secondary" className="gap-1">
              {TIPOS_LENTE.find((t) => t.value === filtros.tipo_lente)?.label}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => onChange({ ...filtros, tipo_lente: undefined })}
              />
            </Badge>
          )}
          {filtros.material && (
            <Badge variant="secondary" className="gap-1">
              {MATERIAIS.find((m) => m.value === filtros.material)?.label}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => onChange({ ...filtros, material: undefined })}
              />
            </Badge>
          )}
          {filtros.indice_refracao && (
            <Badge variant="secondary" className="gap-1">
              Índice {filtros.indice_refracao}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => onChange({ ...filtros, indice_refracao: undefined })}
              />
            </Badge>
          )}
          {filtros.tem_antirreflexo && (
            <Badge variant="secondary" className="gap-1">
              AR
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => onChange({ ...filtros, tem_antirreflexo: undefined })}
              />
            </Badge>
          )}
          {filtros.tem_uv && (
            <Badge variant="secondary" className="gap-1">
              UV
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => onChange({ ...filtros, tem_uv: undefined })}
              />
            </Badge>
          )}
          {filtros.tem_blue_light && (
            <Badge variant="secondary" className="gap-1">
              Blue Light
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => onChange({ ...filtros, tem_blue_light: undefined })}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}
