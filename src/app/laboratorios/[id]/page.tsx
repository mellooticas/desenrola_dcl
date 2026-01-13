'use client'

import { use, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  ArrowLeft, 
  Building2, 
  Users, 
  Package, 
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Wrench,
  Phone,
  Mail,
  MapPin
} from 'lucide-react'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { toast } from 'sonner'

interface Laboratorio {
  id: string
  nome: string
  codigo: string | null
  endereco: string | null
  telefone: string | null
  email: string | null
  sla_padrao_dias: number
  trabalha_sabado: boolean
  especialidades: string[] | null
  observacoes: string | null
  ativo: boolean
}

interface LaboratorioKPIs {
  total_pedidos: number
  em_producao: number
  concluidos_mes: number
  tempo_medio_dias: number | null
  taxa_atraso: number | null
  total_montadores: number
}

export default function LaboratorioDetalhesPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const router = useRouter()
  const { id } = use(params)
  const [activeTab, setActiveTab] = useState('overview')

  // Buscar dados do laboratório
  const { data: laboratorio, isLoading: loadingLab } = useQuery({
    queryKey: ['laboratorio', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('laboratorios')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return data as Laboratorio
    }
  })

  // Buscar KPIs do laboratório
  const { data: kpis, isLoading: loadingKPIs } = useQuery({
    queryKey: ['laboratorio-kpis', id],
    queryFn: async () => {
      // Pedidos do laboratório
      const { data: pedidos, error: pedidosError } = await supabase
        .from('pedidos')
        .select('id, status, created_at, updated_at')
        .eq('laboratorio_id', id)

      if (pedidosError) throw pedidosError

      // Montadores do laboratório
      const { data: montadores, error: montadoresError } = await supabase
        .from('montadores')
        .select('id')
        .eq('laboratorio_id', id)
        .eq('ativo', true)

      if (montadoresError) throw montadoresError

      // Calcular KPIs
      const now = new Date()
      const mesAtual = new Date(now.getFullYear(), now.getMonth(), 1)

      const emProducao = pedidos?.filter(p => p.status === 'PRODUCAO').length || 0
      const concluidosMes = pedidos?.filter(p => {
        const updated = new Date(p.updated_at)
        return updated >= mesAtual && ['PRONTO', 'ENVIADO'].includes(p.status)
      }).length || 0

      // Tempo médio (simplificado)
      const tempoMedio = pedidos && pedidos.length > 0
        ? pedidos.reduce((acc, p) => {
            const diff = new Date(p.updated_at).getTime() - new Date(p.created_at).getTime()
            return acc + (diff / (1000 * 60 * 60 * 24))
          }, 0) / pedidos.length
        : null

      return {
        total_pedidos: pedidos?.length || 0,
        em_producao: emProducao,
        concluidos_mes: concluidosMes,
        tempo_medio_dias: tempoMedio ? Math.round(tempoMedio) : null,
        taxa_atraso: null, // Calcular depois se necessário
        total_montadores: montadores?.length || 0
      } as LaboratorioKPIs
    },
    staleTime: 30000
  })

  // Buscar montadores do laboratório
  const { data: montadores, isLoading: loadingMontadores } = useQuery({
    queryKey: ['laboratorio-montadores', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('view_kpis_montadores')
        .select('*')
        .eq('laboratorio_id', id)
        .order('total_montagens', { ascending: false })

      if (error) throw error
      return data
    },
    staleTime: 30000
  })

  // Buscar pedidos recentes
  const { data: pedidosRecentes, isLoading: loadingPedidos } = useQuery({
    queryKey: ['laboratorio-pedidos', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('v_pedidos_kanban')
        .select('*')
        .eq('laboratorio_id', id)
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) throw error
      return data
    },
    staleTime: 30000
  })

  if (loadingLab) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!laboratorio) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">Laboratório não encontrado</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <Building2 className="w-8 h-8 text-primary" />
              <div>
                <h1 className="text-3xl font-bold">{laboratorio.nome}</h1>
                {laboratorio.codigo && (
                  <p className="text-sm text-muted-foreground">Código: {laboratorio.codigo}</p>
                )}
              </div>
            </div>
          </div>
        </div>
        <Badge variant={laboratorio.ativo ? 'default' : 'secondary'}>
          {laboratorio.ativo ? 'Ativo' : 'Inativo'}
        </Badge>
      </div>

      {/* KPIs Rápidos */}
      {kpis && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Pedidos</p>
                  <p className="text-2xl font-bold">{kpis.total_pedidos}</p>
                </div>
                <Package className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Em Produção</p>
                  <p className="text-2xl font-bold">{kpis.em_producao}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Concluídos (Mês)</p>
                  <p className="text-2xl font-bold">{kpis.concluidos_mes}</p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Montadores</p>
                  <p className="text-2xl font-bold">{kpis.total_montadores}</p>
                </div>
                <Users className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="montadores">
            Montadores ({kpis?.total_montadores || 0})
          </TabsTrigger>
          <TabsTrigger value="pedidos">
            Pedidos ({kpis?.total_pedidos || 0})
          </TabsTrigger>
        </TabsList>

        {/* Visão Geral */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Informações do Laboratório */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Informações
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">SLA Padrão:</span>
                  <span className="font-medium">{laboratorio.sla_padrao_dias} dias</span>
                </div>

                {laboratorio.trabalha_sabado && (
                  <div className="flex items-center gap-3 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span className="text-muted-foreground">Trabalha aos sábados</span>
                  </div>
                )}

                {laboratorio.telefone && (
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">{laboratorio.telefone}</span>
                  </div>
                )}

                {laboratorio.email && (
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">{laboratorio.email}</span>
                  </div>
                )}

                {laboratorio.endereco && (
                  <div className="flex items-start gap-3 text-sm">
                    <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <span className="font-medium">{laboratorio.endereco}</span>
                  </div>
                )}

                {laboratorio.especialidades && laboratorio.especialidades.length > 0 && (
                  <div className="pt-3 border-t">
                    <p className="text-sm text-muted-foreground mb-2">Especialidades:</p>
                    <div className="flex flex-wrap gap-2">
                      {laboratorio.especialidades.map((esp, idx) => (
                        <Badge key={idx} variant="outline">
                          {esp}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {laboratorio.observacoes && (
                  <div className="pt-3 border-t">
                    <p className="text-sm text-muted-foreground mb-1">Observações:</p>
                    <p className="text-sm">{laboratorio.observacoes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Estatísticas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Estatísticas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {kpis && (
                  <>
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <span className="text-sm text-muted-foreground">Total de Pedidos</span>
                      <span className="text-xl font-bold">{kpis.total_pedidos}</span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-purple-500/10 rounded-lg">
                      <span className="text-sm text-muted-foreground">Em Produção</span>
                      <span className="text-xl font-bold text-purple-600">{kpis.em_producao}</span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg">
                      <span className="text-sm text-muted-foreground">Concluídos no Mês</span>
                      <span className="text-xl font-bold text-green-600">{kpis.concluidos_mes}</span>
                    </div>

                    {kpis.tempo_medio_dias && (
                      <div className="flex items-center justify-between p-3 bg-blue-500/10 rounded-lg">
                        <span className="text-sm text-muted-foreground">Tempo Médio</span>
                        <span className="text-xl font-bold text-blue-600">
                          {kpis.tempo_medio_dias} dias
                        </span>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Montadores */}
        <TabsContent value="montadores">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="w-5 h-5" />
                Montadores do Laboratório
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingMontadores ? (
                <div className="flex justify-center p-8">
                  <LoadingSpinner />
                </div>
              ) : montadores && montadores.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {montadores.map((montador) => (
                    <Card key={montador.id} className="cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => router.push(`/montagens/${montador.id}`)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-semibold">{montador.nome}</h3>
                          <Badge variant="outline">{montador.tipo}</Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <p className="text-muted-foreground">Em andamento</p>
                            <p className="text-lg font-bold text-blue-600">
                              {montador.em_montagem_atual}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Total</p>
                            <p className="text-lg font-bold">
                              {montador.total_montagens}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum montador vinculado a este laboratório
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pedidos */}
        <TabsContent value="pedidos">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Pedidos Recentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingPedidos ? (
                <div className="flex justify-center p-8">
                  <LoadingSpinner />
                </div>
              ) : pedidosRecentes && pedidosRecentes.length > 0 ? (
                <div className="space-y-2">
                  {pedidosRecentes.map((pedido) => (
                    <div
                      key={pedido.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => router.push(`/pedidos/${pedido.id}`)}
                    >
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="font-medium">#{pedido.numero_sequencial}</p>
                          <p className="text-sm text-muted-foreground">{pedido.cliente_nome}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge>{pedido.status}</Badge>
                        {pedido.montador_nome && (
                          <Badge variant="outline">
                            <Wrench className="w-3 h-3 mr-1" />
                            {pedido.montador_nome}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum pedido encontrado
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
