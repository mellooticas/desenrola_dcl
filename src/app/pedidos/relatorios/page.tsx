 'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
// import { Calendar } from '@/components/ui/calendar'
// import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { 
  // BarChart, 
  // Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts'
import { 
  Download, 
  // Calendar as CalendarIcon, 
  TrendingUp, 
  // TrendingDown, 
  DollarSign,
  Clock,
  Package,
  // AlertTriangle
} from 'lucide-react'
import { supabaseHelpers } from '@/lib/supabase/helpers'
import type { StatusPedido } from '@/lib/types/database'
import { isStatusValido } from '@/lib/types/database'
import { toast } from 'sonner'
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface RelatorioData {
  periodo: {
    inicio: string
    fim: string
  }
  resumo: {
    total_pedidos: number
    valor_total: number
    ticket_medio: number
    sla_compliance: number
  }
  por_status: Array<{
    status: string
    quantidade: number
    percentual: number
    cor: string
  }>
  por_laboratorio: Array<{
    nome: string
    quantidade: number
    valor_total: number
    sla_compliance: number
  }>
  por_loja: Array<{
    nome: string
    quantidade: number
    valor_total: number
  }>
  tendencia_diaria: Array<{
    data: string
    pedidos: number
    valor: number
  }>
  top_classes: Array<{
    nome: string
    quantidade: number
    percentual: number
  }>
}

export default function RelatoriosPage() {
  const [loading, setLoading] = useState(false)
  const [dadosRelatorio, setDadosRelatorio] = useState<RelatorioData | null>(null)
  const [filtros, setFiltros] = useState({
    data_inicio: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    data_fim: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
    loja_id: '',
    laboratorio_id: '',
    status: ''
  })
  
  const [lojas] = useState<Array<{id: string, nome: string}>>([])
  const [laboratorios] = useState<Array<{id: string, nome: string}>>([])


  // useEffect inicial movido para após a declaração de gerarRelatorio

  type PedidoRel = {
    valor_pedido: number | null
    dias_para_vencer_sla: number | null
    data_pedido: string
    status: string
    laboratorio_nome: string
    loja_nome: string
    classe_nome: string
  }

  const processarDadosRelatorio = useCallback((pedidos: PedidoRel[], filtros: { data_inicio: string; data_fim: string }): RelatorioData => {
    const total_pedidos = pedidos.length
    const valor_total = pedidos.reduce((sum, p) => sum + (p.valor_pedido || 0), 0)
    const ticket_medio = total_pedidos > 0 ? valor_total / total_pedidos : 0

    // SLA Compliance
    const pedidos_com_sla = pedidos.filter(p => p.dias_para_vencer_sla !== null)
  const pedidos_no_prazo = pedidos_com_sla.filter(p => (p.dias_para_vencer_sla ?? -1) >= 0)
    const sla_compliance = pedidos_com_sla.length > 0 ? (pedidos_no_prazo.length / pedidos_com_sla.length) * 100 : 100

    // Por Status
    const statusCores: Record<string, string> = {
      'REGISTRADO': '#94A3B8',
      'AG_PAGAMENTO': '#F59E0B',
      'PAGO': '#10B981',
      'PRODUCAO': '#3B82F6',
      'PRONTO': '#8B5CF6',
      'ENVIADO': '#EF4444',
      'CHEGOU': '#06B6D4',
      'ENTREGUE': '#10B981',
      'CANCELADO': '#6B7280'
    }

    const por_status = Object.entries(
      pedidos.reduce((acc, p) => {
        acc[p.status] = (acc[p.status] || 0) + 1
        return acc
      }, {} as Record<string, number>)
    ).map(([status, quantidade]) => ({
      status,
      quantidade: Number(quantidade),
      percentual: (Number(quantidade) / total_pedidos) * 100,
      cor: statusCores[status] || '#6B7280'
    }))

    // Por Laboratório
    const por_laboratorio = Object.entries(
      pedidos.reduce((acc, p) => {
        const key = p.laboratorio_nome
        if (!acc[key]) {
          acc[key] = { quantidade: 0, valor_total: 0, no_prazo: 0, total_sla: 0 }
        }
        acc[key].quantidade++
        acc[key].valor_total += p.valor_pedido || 0
        
        if (p.dias_para_vencer_sla !== null) {
          acc[key].total_sla++
          if (p.dias_para_vencer_sla >= 0) {
            acc[key].no_prazo++
          }
        }
        return acc
      }, {} as Record<string, { quantidade: number; valor_total: number; no_prazo: number; total_sla: number }>)
    ).map(([nome, dados]) => ({
      nome,
      quantidade: dados.quantidade,
      valor_total: dados.valor_total,
      sla_compliance: dados.total_sla > 0 ? (dados.no_prazo / dados.total_sla) * 100 : 100
    }))

    // Por Loja
    const por_loja = Object.entries(
      pedidos.reduce((acc, p) => {
        const key = p.loja_nome
        if (!acc[key]) {
          acc[key] = { quantidade: 0, valor_total: 0 }
        }
        acc[key].quantidade++
        acc[key].valor_total += p.valor_pedido || 0
        return acc
      }, {} as Record<string, { quantidade: number; valor_total: number }>)
    ).map(([nome, dados]) => ({
      nome,
      quantidade: dados.quantidade,
      valor_total: dados.valor_total
    }))

    // Tendência Diária (últimos 30 dias)
    const dias = []
    for (let i = 29; i >= 0; i--) {
      const data = format(subDays(new Date(), i), 'yyyy-MM-dd')
      const pedidos_do_dia = pedidos.filter(p => p.data_pedido === data)
      dias.push({
        data: format(subDays(new Date(), i), 'dd/MM', { locale: ptBR }),
        pedidos: pedidos_do_dia.length,
        valor: pedidos_do_dia.reduce((sum, p) => sum + (p.valor_pedido || 0), 0)
      })
    }

    // Top Classes
    const por_classe = Object.entries(
      pedidos.reduce((acc, p) => {
        acc[p.classe_nome] = (acc[p.classe_nome] || 0) + 1
        return acc
      }, {} as Record<string, number>)
    ).map(([nome, quantidade]) => ({
      nome,
      quantidade: Number(quantidade),
      percentual: (Number(quantidade) / total_pedidos) * 100
    })).sort((a, b) => b.quantidade - a.quantidade).slice(0, 5)

    return {
      periodo: {
        inicio: filtros.data_inicio,
        fim: filtros.data_fim
      },
      resumo: {
        total_pedidos,
        valor_total,
        ticket_medio,
        sla_compliance
      },
      por_status,
      por_laboratorio,
      por_loja,
      tendencia_diaria: dias,
      top_classes: por_classe
    }
  }, [])

  const gerarRelatorio = useCallback(async () => {
    setLoading(true)
    try {
      // Buscar dados via API server-side (evita RLS/401)
      const lojaFilter = filtros.loja_id && filtros.loja_id !== 'all' ? filtros.loja_id : undefined
      const labFilter = filtros.laboratorio_id && filtros.laboratorio_id !== 'all' ? filtros.laboratorio_id : undefined
      const statusFilter: StatusPedido | undefined = filtros.status !== 'all' && isStatusValido(filtros.status)
        ? (filtros.status as StatusPedido)
        : undefined

      const pedidos = await supabaseHelpers.getPedidosKanban({
        data_inicio: filtros.data_inicio,
        data_fim: filtros.data_fim,
        loja_id: lojaFilter,
        laboratorio_id: labFilter,
        status: statusFilter,
      })

      // Processar dados para o relatório
      const relatorio = processarDadosRelatorio(pedidos || [], filtros)
      setDadosRelatorio(relatorio)
    } catch (error) {
      console.error('Erro ao gerar relatório:', error)
      toast.error('Erro ao gerar relatório')
    } finally {
      setLoading(false)
    }
  }, [filtros, processarDadosRelatorio])

  const exportarRelatorio = () => {
    if (!dadosRelatorio) return

    const csvContent = [
      ['Relatório de Pedidos'],
      [`Período: ${format(new Date(dadosRelatorio.periodo.inicio), 'dd/MM/yyyy')} a ${format(new Date(dadosRelatorio.periodo.fim), 'dd/MM/yyyy')}`],
      [''],
      ['RESUMO'],
      ['Total de Pedidos', dadosRelatorio.resumo.total_pedidos],
      ['Valor Total', `R$ ${dadosRelatorio.resumo.valor_total.toFixed(2)}`],
      ['Ticket Médio', `R$ ${dadosRelatorio.resumo.ticket_medio.toFixed(2)}`],
      ['SLA Compliance', `${dadosRelatorio.resumo.sla_compliance.toFixed(1)}%`],
      [''],
      ['POR STATUS'],
      ['Status', 'Quantidade', 'Percentual'],
      ...dadosRelatorio.por_status.map(s => [s.status, s.quantidade, `${s.percentual.toFixed(1)}%`]),
      [''],
      ['POR LABORATÓRIO'],
      ['Laboratório', 'Quantidade', 'Valor Total', 'SLA Compliance'],
      ...dadosRelatorio.por_laboratorio.map(l => [
        l.nome, 
        l.quantidade, 
        `R$ ${l.valor_total.toFixed(2)}`, 
        `${l.sla_compliance.toFixed(1)}%`
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `relatorio-pedidos-${format(new Date(), 'yyyy-MM-dd')}.csv`
    link.click()
    
    toast.success('Relatório exportado com sucesso!')
  }

  const setPeriodoRapido = (dias: number) => {
    const hoje = new Date()
    const inicio = subDays(hoje, dias - 1)
    
    setFiltros({
      ...filtros,
      data_inicio: format(inicio, 'yyyy-MM-dd'),
      data_fim: format(hoje, 'yyyy-MM-dd')
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto p-6 space-y-6">
        <div className="backdrop-blur-xl bg-white/30 border-white/20 shadow-xl rounded-lg p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Relatórios</h1>
              <p className="text-slate-600">
                Análise detalhada dos pedidos e performance
              </p>
            </div>
            
            <Button onClick={exportarRelatorio} disabled={!dadosRelatorio} className="backdrop-blur-sm bg-white/50 border-white/30 shadow-lg hover:bg-white/70">
              <Download className="w-4 h-4 mr-2" />
              Exportar CSV
            </Button>
          </div>
        </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label>Data Início</Label>
              <Input
                type="date"
                value={filtros.data_inicio}
                onChange={(e) => setFiltros({ ...filtros, data_inicio: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Data Fim</Label>
              <Input
                type="date"
                value={filtros.data_fim}
                onChange={(e) => setFiltros({ ...filtros, data_fim: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Loja</Label>
              <Select value={filtros.loja_id} onValueChange={(value) => setFiltros({ ...filtros, loja_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as lojas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as lojas</SelectItem>
                  {lojas.map(loja => (
                    <SelectItem key={loja.id} value={loja.id}>{loja.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Laboratório</Label>
              <Select value={filtros.laboratorio_id} onValueChange={(value) => setFiltros({ ...filtros, laboratorio_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os labs" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os laboratórios</SelectItem>
                  {laboratorios.map(lab => (
                    <SelectItem key={lab.id} value={lab.id}>{lab.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex space-x-2 mt-4">
            <Button variant="outline" onClick={() => setPeriodoRapido(7)}>
              Últimos 7 dias
            </Button>
            <Button variant="outline" onClick={() => setPeriodoRapido(30)}>
              Últimos 30 dias
            </Button>
            <Button variant="outline" onClick={() => setPeriodoRapido(90)}>
              Últimos 90 dias
            </Button>
            <Button onClick={gerarRelatorio} disabled={loading}>
              {loading ? 'Gerando...' : 'Gerar Relatório'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {dadosRelatorio && (
        <Tabs defaultValue="resumo" className="space-y-6">
          <TabsList>
            <TabsTrigger value="resumo">Resumo</TabsTrigger>
            <TabsTrigger value="graficos">Gráficos</TabsTrigger>
            <TabsTrigger value="detalhado">Detalhado</TabsTrigger>
          </TabsList>

          <TabsContent value="resumo" className="space-y-6">
            {/* Cards de Resumo */}
            <div className="grid gap-6 md:grid-cols-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <Package className="w-8 h-8 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total de Pedidos</p>
                      <p className="text-2xl font-bold">{dadosRelatorio.resumo.total_pedidos}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-8 h-8 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Valor Total</p>
                      <p className="text-2xl font-bold">
                        R$ {dadosRelatorio.resumo.valor_total.toFixed(2).replace('.', ',')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-8 h-8 text-purple-600" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Ticket Médio</p>
                      <p className="text-2xl font-bold">
                        R$ {dadosRelatorio.resumo.ticket_medio.toFixed(2).replace('.', ',')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <Clock className={`w-8 h-8 ${dadosRelatorio.resumo.sla_compliance >= 95 ? 'text-green-600' : 'text-red-600'}`} />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">SLA Compliance</p>
                      <p className="text-2xl font-bold">
                        {dadosRelatorio.resumo.sla_compliance.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="graficos" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Gráfico por Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Pedidos por Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={dadosRelatorio.por_status}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        // label custom removido para compatibilidade de tipos; pode-se usar dataKey com tickFormatter
                        label={undefined}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="quantidade"
                      >
                        {dadosRelatorio.por_status.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.cor} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Gráfico Tendência */}
              <Card>
                <CardHeader>
                  <CardTitle>Tendência Diária</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={dadosRelatorio.tendencia_diaria}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="data" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="pedidos" stroke="#3B82F6" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="detalhado" className="space-y-6">
            {/* Tabelas Detalhadas */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Performance por Laboratório</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {dadosRelatorio.por_laboratorio.map((lab, index) => (
                      <div key={index} className="flex justify-between items-center p-3 border rounded">
                        <div>
                          <p className="font-medium">{lab.nome}</p>
                          <p className="text-sm text-muted-foreground">
                            {lab.quantidade} pedidos • R$ {lab.valor_total.toFixed(2)}
                          </p>
                        </div>
                        <Badge variant={lab.sla_compliance >= 95 ? 'default' : 'destructive'}>
                          {lab.sla_compliance.toFixed(0)}% SLA
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Classes de Lente</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {dadosRelatorio.top_classes.map((classe, index) => (
                      <div key={index} className="flex justify-between items-center p-3 border rounded">
                        <div>
                          <p className="font-medium">{classe.nome}</p>
                          <p className="text-sm text-muted-foreground">
                            {classe.quantidade} pedidos
                          </p>
                        </div>
                        <Badge variant="outline">
                          {classe.percentual.toFixed(1)}%
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      )}
      </div>
    </div>
  )
}