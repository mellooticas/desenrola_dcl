/**
 * 🔍 Componente: SeletorGruposLentes
 * 
 * Seletor de grupos canônicos de lentes com separação premium/genérico
 * Usado no wizard de Nova Ordem (Step 4 - Lentes)
 */

'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Loader2, Package, Sparkles, TrendingUp } from 'lucide-react'
import { useGruposCanonicos, type FiltrosLente } from '@/lib/hooks/useLentesCatalogo'
import { cn } from '@/lib/utils'
import { FiltrosLentes } from './FiltrosLentes'

// ============================================================
// TIPOS
// ============================================================

interface SeletorGruposLentesProps {
  grupoSelecionadoId?: string | null
  onSelecionarGrupo: (grupoId: string, nomeGrupo: string) => void
  className?: string
}

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export function SeletorGruposLentes({
  grupoSelecionadoId,
  onSelecionarGrupo,
  className,
}: SeletorGruposLentesProps) {
  const [tabAtiva, setTabAtiva] = useState<'genericas' | 'premium'>('genericas')
  const [filtrosAtivos, setFiltrosAtivos] = useState<FiltrosLente>({})

  // Buscar grupos genéricos (is_premium = false)
  const {
    data: gruposGenericos = [],
    isLoading: isLoadingGenericos,
  } = useGruposCanonicos({ ...filtrosAtivos, is_premium: false })

  // Buscar grupos premium (is_premium = true)
  const {
    data: gruposPremium = [],
    isLoading: isLoadingPremium,
  } = useGruposCanonicos({ ...filtrosAtivos, is_premium: true })

  const isLoading = isLoadingGenericos || isLoadingPremium

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className={cn('w-full space-y-4', className)}>
      {/* Barra de Filtros */}
      <FiltrosLentes filtros={filtrosAtivos} onChange={setFiltrosAtivos} />

      <Tabs value={tabAtiva} onValueChange={(v) => setTabAtiva(v as 'genericas' | 'premium')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="genericas" className="gap-2">
            <Package className="h-4 w-4" />
            Lentes Genéricas
            {gruposGenericos.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {gruposGenericos.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="premium" className="gap-2">
            <Sparkles className="h-4 w-4" />
            Lentes Premium
            {gruposPremium.length > 0 && (
              <Badge variant="secondary" className="ml-2 bg-yellow-500/20 text-yellow-700">
                {gruposPremium.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* TAB: Lentes Genéricas */}
        <TabsContent value="genericas" className="mt-4 space-y-3">
          {isLoadingGenericos ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : gruposGenericos.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Package className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                <p className="mt-4 text-sm text-muted-foreground">
                  Nenhum grupo de lentes genéricas encontrado
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {gruposGenericos.map((grupo) => (
                <CardGrupoLente
                  key={grupo.id}
                  grupo={grupo}
                  isSelected={grupoSelecionadoId === grupo.id}
                  onSelect={() => onSelecionarGrupo(grupo.id, grupo.nome_grupo)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* TAB: Lentes Premium */}
        <TabsContent value="premium" className="mt-4 space-y-3">
          {isLoadingPremium ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : gruposPremium.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Sparkles className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                <p className="mt-4 text-sm text-muted-foreground">
                  Nenhum grupo de lentes premium encontrado
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {gruposPremium.map((grupo) => (
                <CardGrupoLente
                  key={grupo.id}
                  grupo={grupo}
                  isSelected={grupoSelecionadoId === grupo.id}
                  onSelect={() => onSelecionarGrupo(grupo.id, grupo.nome_grupo)}
                  isPremium
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ============================================================
// COMPONENTE: Card de Grupo de Lente
// ============================================================

interface CardGrupoLenteProps {
  grupo: any // Tipo do grupo canônico
  isSelected: boolean
  onSelect: () => void
  isPremium?: boolean
}

function CardGrupoLente({ grupo, isSelected, onSelect, isPremium = false }: CardGrupoLenteProps) {
  return (
    <Card
      className={cn(
        'cursor-pointer transition-all hover:shadow-md',
        isSelected && 'ring-2 ring-primary',
        isPremium && 'border-yellow-500/50 bg-gradient-to-br from-yellow-50/50 to-white'
      )}
      onClick={onSelect}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 space-y-1">
            <CardTitle className="text-base leading-tight">
              {grupo.nome_grupo || 'Grupo Sem Nome'}
            </CardTitle>
            <CardDescription className="text-xs">
              {grupo.material} • {grupo.indice_refracao}
            </CardDescription>
          </div>
          {isPremium && (
            <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-700">
              <Sparkles className="mr-1 h-3 w-3" />
              Premium
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Tratamentos */}
        <div className="flex flex-wrap gap-1">
          {grupo.tratamento_antirreflexo && (
            <Badge variant="outline" className="text-xs">
              AR
            </Badge>
          )}
          {grupo.tratamento_uv && (
            <Badge variant="outline" className="text-xs">
              UV400
            </Badge>
          )}
          {grupo.tratamento_blue_light && (
            <Badge variant="outline" className="text-xs">
              Blue Light
            </Badge>
          )}
          {grupo.tratamento_fotossensiveis && grupo.tratamento_fotossensiveis !== 'nenhum' && (
            <Badge variant="outline" className="text-xs capitalize">
              {grupo.tratamento_fotossensiveis}
            </Badge>
          )}
        </div>

        {/* Preços */}
        <div className="flex items-baseline justify-between">
          <div>
            <p className="text-xs text-muted-foreground">A partir de</p>
            <p className="text-lg font-bold">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format(grupo.preco_minimo || 0)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Até</p>
            <p className="text-sm font-semibold text-muted-foreground">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format(grupo.preco_maximo || 0)}
            </p>
          </div>
        </div>

        {/* Opções disponíveis */}
        <div className="flex items-center justify-between border-t pt-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <TrendingUp className="h-3 w-3" />
            <span>{grupo.total_lentes || 0} opções</span>
          </div>
          <Button
            size="sm"
            variant={isSelected ? 'default' : 'outline'}
            onClick={(e) => {
              e.stopPropagation()
              onSelect()
            }}
          >
            {isSelected ? 'Selecionado' : 'Selecionar'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
