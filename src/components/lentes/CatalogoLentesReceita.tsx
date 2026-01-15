/**
 * Exemplo de Catálogo de Lentes - Busca por Receita
 * 
 * Demonstra integração completa com o banco de lentes:
 * 1. Cliente informa receita (graus)
 * 2. Sistema busca grupos compatíveis
 * 3. Mostra 3 opções: econômica, intermediária, premium
 * 4. Permite aplicar filtros
 * 5. Sugere upgrades
 */

'use client'

import { useState } from 'react'
import { useGruposPorReceita, useSugestoesUpgrade } from '@/hooks/useLentes'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertCircle, TrendingUp, Sparkles } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

export function CatalogoLentesReceita() {
  const [receita, setReceita] = useState({
    grauEsferico: undefined as number | undefined,
    grauCilindrico: undefined as number | undefined,
    adicao: undefined as number | undefined,
  })

  const [grupoSelecionado, setGrupoSelecionado] = useState<string | null>(null)

  // Query: Buscar grupos compatíveis com a receita
  const { data: grupos, isLoading, error } = useGruposPorReceita(receita, {
    enabled: Boolean(receita.grauEsferico || receita.grauCilindrico),
  })

  // Query: Sugestões de upgrade (se houver grupo selecionado)
  const { data: upgrades } = useSugestoesUpgrade(grupoSelecionado || '', {
    enabled: Boolean(grupoSelecionado),
  })

  // Categorizar grupos por faixa de preço
  const gruposPorCategoria = {
    economica: grupos?.filter(g => g.preco_medio < 150),
    intermediaria: grupos?.filter(g => g.preco_medio >= 150 && g.preco_medio < 400),
    premium: grupos?.filter(g => g.preco_medio >= 400),
  }

  return (
    <div className="space-y-8">
      {/* Formulário de Receita */}
      <Card>
        <CardHeader>
          <CardTitle>Buscar Lentes por Receita</CardTitle>
          <CardDescription>
            Informe os graus da receita para encontrar lentes compatíveis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="esferico">Grau Esférico</Label>
              <Input
                id="esferico"
                type="number"
                step="0.25"
                placeholder="-5.00"
                value={receita.grauEsferico ?? ''}
                onChange={(e) =>
                  setReceita(prev => ({
                    ...prev,
                    grauEsferico: e.target.value ? parseFloat(e.target.value) : undefined,
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cilindrico">Grau Cilíndrico</Label>
              <Input
                id="cilindrico"
                type="number"
                step="0.25"
                placeholder="-2.00"
                value={receita.grauCilindrico ?? ''}
                onChange={(e) =>
                  setReceita(prev => ({
                    ...prev,
                    grauCilindrico: e.target.value ? parseFloat(e.target.value) : undefined,
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="adicao">Adição (Multifocal)</Label>
              <Input
                id="adicao"
                type="number"
                step="0.25"
                placeholder="2.00"
                value={receita.adicao ?? ''}
                onChange={(e) =>
                  setReceita(prev => ({
                    ...prev,
                    adicao: e.target.value ? parseFloat(e.target.value) : undefined,
                  }))
                }
              />
            </div>
          </div>

          <Button
            className="mt-4"
            onClick={() => {
              // Força recarregar com valores atuais
              setReceita({ ...receita })
            }}
          >
            Buscar Lentes
          </Button>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Erro ao buscar lentes: {error.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Resultados: 3 Opções */}
      {grupos && grupos.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">
              {grupos.length} opções encontradas
            </h2>
            <Badge variant="secondary">
              {receita.adicao ? 'Multifocal' : 'Visão Simples'}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Opção Econômica */}
            {gruposPorCategoria.economica?.[0] && (
              <GrupoCard
                grupo={gruposPorCategoria.economica[0]}
                badge="Econômica"
                badgeColor="green"
                onSelect={setGrupoSelecionado}
              />
            )}

            {/* Opção Intermediária */}
            {gruposPorCategoria.intermediaria?.[0] && (
              <GrupoCard
                grupo={gruposPorCategoria.intermediaria[0]}
                badge="Intermediária"
                badgeColor="blue"
                onSelect={setGrupoSelecionado}
                destaque
              />
            )}

            {/* Opção Premium */}
            {gruposPorCategoria.premium?.[0] && (
              <GrupoCard
                grupo={gruposPorCategoria.premium[0]}
                badge="Premium"
                badgeColor="purple"
                onSelect={setGrupoSelecionado}
              />
            )}
          </div>
        </div>
      )}

      {/* Sugestões de Upgrade */}
      {upgrades && upgrades.length > 0 && (
        <Card className="border-primary">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <CardTitle>Melhorias Disponíveis</CardTitle>
            </div>
            <CardDescription>
              Por um valor adicional, você pode ter mais benefícios
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upgrades.map((upgrade: any) => (
                <div
                  key={upgrade.grupo_upgrade_id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <h4 className="font-semibold">{upgrade.grupo_upgrade_nome}</h4>
                    <p className="text-sm text-muted-foreground">
                      {upgrade.beneficios}
                    </p>
                    <div className="flex gap-2 mt-2">
                      {upgrade.tratamentos_adicionais?.map((trat: string) => (
                        <Badge key={trat} variant="secondary">
                          {trat}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-sm text-muted-foreground">
                      +R$ {upgrade.diferenca_preco.toFixed(2)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      (+{upgrade.diferenca_percentual}%)
                    </div>
                    <Button size="sm" className="mt-2">
                      Adicionar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Componente auxiliar: Card de Grupo
function GrupoCard({
  grupo,
  badge,
  badgeColor,
  onSelect,
  destaque = false,
}: {
  grupo: any
  badge: string
  badgeColor: string
  onSelect: (id: string) => void
  destaque?: boolean
}) {
  return (
    <Card className={destaque ? 'border-primary shadow-lg' : ''}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <Badge variant={badgeColor as any}>{badge}</Badge>
          {grupo.is_premium && (
            <Badge variant="outline">
              <Sparkles className="h-3 w-3 mr-1" />
              Premium
            </Badge>
          )}
        </div>
        <CardTitle className="text-lg mt-2">{grupo.nome_grupo}</CardTitle>
        <CardDescription>
          {grupo.material} • {grupo.indice_refracao}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Tratamentos */}
        <div className="flex flex-wrap gap-2">
          {grupo.antirreflexo && <Badge variant="secondary">Antirreflexo</Badge>}
          {grupo.blue_light && <Badge variant="secondary">Blue Light</Badge>}
          {grupo.fotossensiveis !== 'nenhum' && (
            <Badge variant="secondary">{grupo.fotossensiveis}</Badge>
          )}
        </div>

        {/* Preço */}
        <div className="space-y-1">
          <div className="text-3xl font-bold">
            R$ {grupo.preco_medio.toFixed(2)}
          </div>
          <div className="text-sm text-muted-foreground">
            Faixa: R$ {grupo.preco_minimo.toFixed(2)} - R$ {grupo.preco_maximo.toFixed(2)}
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-3 gap-2 text-center text-sm">
          <div>
            <div className="font-semibold">{grupo.total_lentes}</div>
            <div className="text-xs text-muted-foreground">Opções</div>
          </div>
          <div>
            <div className="font-semibold">{grupo.total_fornecedores}</div>
            <div className="text-xs text-muted-foreground">Fornecedores</div>
          </div>
          <div>
            <div className="font-semibold">{grupo.total_marcas}</div>
            <div className="text-xs text-muted-foreground">Marcas</div>
          </div>
        </div>

        {/* Ação */}
        <div className="space-y-2">
          <Button className="w-full" onClick={() => onSelect(grupo.grupo_id)}>
            Selecionar
          </Button>
          <Button variant="outline" className="w-full" size="sm">
            <TrendingUp className="h-4 w-4 mr-2" />
            Ver Melhorias
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
