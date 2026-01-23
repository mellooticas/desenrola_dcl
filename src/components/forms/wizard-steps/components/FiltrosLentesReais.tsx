/**
 * 🔍 Componente: FiltrosLentesReais
 * 
 * Filtros para busca de lentes reais (não canônicas)
 */

'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Filter, X } from 'lucide-react'

export interface FiltrosLentesReais {
  tipo_lente?: string
  material?: string
  indice_refracao?: string
  categoria?: string
  tem_ar?: boolean
  tem_blue?: boolean
  tem_uv?: boolean
  tratamento_foto?: string
  preco_min?: number
  preco_max?: number
}

interface FiltrosLentesReaisProps {
  filtros: FiltrosLentesReais
  onChange: (filtros: FiltrosLentesReais) => void
}

export function FiltrosLentesReais({ filtros, onChange }: FiltrosLentesReaisProps) {
  const [mostrarFiltros, setMostrarFiltros] = useState(false)

  const limparFiltros = () => {
    onChange({})
  }

  const contarFiltrosAtivos = () => {
    return Object.keys(filtros).filter(key => {
      const valor = filtros[key as keyof FiltrosLentesReais]
      return valor !== undefined && valor !== null && valor !== ''
    }).length
  }

  const filtrosAtivos = contarFiltrosAtivos()

  return (
    <div className="space-y-3">
      {/* Toggle Filtros */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setMostrarFiltros(!mostrarFiltros)}
          className="gap-2"
        >
          <Filter className="h-4 w-4" />
          Filtros
          {filtrosAtivos > 0 && (
            <Badge variant="secondary" className="ml-1">
              {filtrosAtivos}
            </Badge>
          )}
        </Button>

        {filtrosAtivos > 0 && (
          <Button variant="ghost" size="sm" onClick={limparFiltros} className="gap-2">
            <X className="h-4 w-4" />
            Limpar
          </Button>
        )}
      </div>

      {/* Painel de Filtros */}
      {mostrarFiltros && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Tipo de Lente */}
              <div className="space-y-2">
                <Label htmlFor="tipo-lente">Tipo de Lente</Label>
                <Select
                  value={filtros.tipo_lente}
                  onValueChange={(v) => onChange({ ...filtros, tipo_lente: v === 'todos' ? undefined : v })}
                >
                  <SelectTrigger id="tipo-lente">
                    <SelectValue placeholder="Todos os tipos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os tipos</SelectItem>
                    <SelectItem value="visao_simples">Visão Simples</SelectItem>
                    <SelectItem value="multifocal">Multifocal</SelectItem>
                    <SelectItem value="bifocal">Bifocal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Material */}
              <div className="space-y-2">
                <Label htmlFor="material">Material</Label>
                <Select
                  value={filtros.material}
                  onValueChange={(v) => onChange({ ...filtros, material: v === 'todos' ? undefined : v })}
                >
                  <SelectTrigger id="material">
                    <SelectValue placeholder="Todos os materiais" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os materiais</SelectItem>
                    <SelectItem value="resina">Resina</SelectItem>
                    <SelectItem value="policarbonato">Policarbonato</SelectItem>
                    <SelectItem value="trivex">Trivex</SelectItem>
                    <SelectItem value="cristal">Cristal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Índice de Refração */}
              <div className="space-y-2">
                <Label htmlFor="indice">Índice de Refração</Label>
                <Select
                  value={filtros.indice_refracao}
                  onValueChange={(v) => onChange({ ...filtros, indice_refracao: v === 'todos' ? undefined : v })}
                >
                  <SelectTrigger id="indice">
                    <SelectValue placeholder="Todos os índices" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os índices</SelectItem>
                    <SelectItem value="1.50">1.50</SelectItem>
                    <SelectItem value="1.56">1.56</SelectItem>
                    <SelectItem value="1.59">1.59</SelectItem>
                    <SelectItem value="1.60">1.60</SelectItem>
                    <SelectItem value="1.67">1.67</SelectItem>
                    <SelectItem value="1.74">1.74</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Tratamentos */}
            <div className="space-y-2">
              <Label>Tratamentos</Label>
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant={filtros.tem_ar ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => onChange({ ...filtros, tem_ar: !filtros.tem_ar ? true : undefined })}
                >
                  Antirreflexo
                </Badge>
                <Badge
                  variant={filtros.tem_blue ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => onChange({ ...filtros, tem_blue: !filtros.tem_blue ? true : undefined })}
                >
                  Blue Light
                </Badge>
                <Badge
                  variant={filtros.tem_uv ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => onChange({ ...filtros, tem_uv: !filtros.tem_uv ? true : undefined })}
                >
                  UV400
                </Badge>
              </div>
            </div>

            {/* Faixa de Preço */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="preco-min">Preço Mínimo</Label>
                <Input
                  id="preco-min"
                  type="number"
                  placeholder="0.00"
                  value={filtros.preco_min || ''}
                  onChange={(e) =>
                    onChange({ ...filtros, preco_min: e.target.value ? parseFloat(e.target.value) : undefined })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="preco-max">Preço Máximo</Label>
                <Input
                  id="preco-max"
                  type="number"
                  placeholder="0.00"
                  value={filtros.preco_max || ''}
                  onChange={(e) =>
                    onChange({ ...filtros, preco_max: e.target.value ? parseFloat(e.target.value) : undefined })
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
