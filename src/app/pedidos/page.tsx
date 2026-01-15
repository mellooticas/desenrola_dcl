"use client"

import { useState, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Package,
  Download,
  Calendar,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  X
} from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { supabaseHelpers } from '@/lib/supabase/helpers'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { PedidoCompleto, StatusPedido, PrioridadeLevel } from '@/lib/types/database'
import { isStatusValido, isPrioridadeValida } from '@/lib/types/database'
import { useAuth } from '@/components/providers/AuthProvider'
import { usePermissions } from '@/lib/hooks/use-permissions'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { FilterBar, type FiltrosAvancados } from '@/components/pedidos/FilterBar'
import { PrintOrderButton } from '@/components/pedidos/PrintOrderButton'

// Configuração de cores otimizada
const STATUS_CONFIG: Record<StatusPedido, { color: string; label: string; icon: React.ComponentType<{ className?: string }> }> = {
  'PENDENTE': { color: 'bg-slate-100 text-slate-700 border-slate-300', label: 'Pendente', icon: Clock },
  'REGISTRADO': { color: 'bg-slate-100 text-slate-800 border-slate-200', label: 'Registrado', icon: Package },
  'AG_PAGAMENTO': { color: 'bg-amber-100 text-amber-800 border-amber-200', label: 'Aguard. Pagamento', icon: Clock },
  'PAGO': { color: 'bg-emerald-100 text-emerald-800 border-emerald-200', label: 'Pago', icon: CheckCircle },
  'PRODUCAO': { color: 'bg-blue-100 text-blue-800 border-blue-200', label: 'Produção', icon: TrendingUp },
  'PRONTO': { color: 'bg-purple-100 text-purple-800 border-purple-200', label: 'Pronto', icon: CheckCircle },
  'ENVIADO': { color: 'bg-orange-100 text-orange-800 border-orange-200', label: 'Enviado', icon: TrendingUp },
  'CHEGOU': { color: 'bg-cyan-100 text-cyan-800 border-cyan-200', label: 'Chegou', icon: CheckCircle },
  'ENTREGUE': { color: 'bg-green-100 text-green-800 border-green-200', label: 'Entregue', icon: CheckCircle },
  'CANCELADO': { color: 'bg-red-100 text-red-800 border-red-200', label: 'Cancelado', icon: X }
}

const PRIORIDADE_CONFIG: Record<PrioridadeLevel, { color: string; label: string }> = {
  'BAIXA': { color: 'bg-gray-100 text-gray-700 border-gray-200', label: 'Baixa' },
  'NORMAL': { color: 'bg-blue-100 text-blue-700 border-blue-200', label: 'Normal' },
  'ALTA': { color: 'bg-orange-100 text-orange-700 border-orange-200', label: 'Alta' },
  'URGENTE': { color: 'bg-red-100 text-red-700 border-red-200', label: 'Urgente' }
}

export default function PedidosPage() {
  console.log('📦 PedidosPage: Render')

  // const router = useRouter() // Removido porque não estava sendo usado
  const { userProfile, loading: authLoading } = useAuth()
  
  useEffect(() => {
    console.log('📦 PedidosPage: Auth State Changed', { 
      hasProfile: !!userProfile, 
      role: userProfile?.role,
      authLoading 
    })
  }, [userProfile, authLoading])

  const permissions = usePermissions()
  const [isHydrated, setIsHydrated] = useState(false)
  const [pedidos, setPedidos] = useState<PedidoCompleto[]>([])
  const [pedidosOriginais, setPedidosOriginais] = useState<PedidoCompleto[]>([]) // Dataset completo
  const [loading, setLoading] = useState(true)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [filtrosVisiveis, setFiltrosVisiveis] = useState(false)
  const [filtros, setFiltros] = useState<FiltrosAvancados>({
    busca_geral: '',
    numero_os_loja: '',
    numero_os_lab: '',
    numero_pedido: '',
    telefone_cliente: '',
    status: 'all',
    loja_id: 'all',
    laboratorio_id: 'all',
    prioridade: 'all',
    periodo_predefinido: 'todos',
    data_inicio: '',
    data_fim: '',
    situacao_sla: 'todos'
  })

  // Estados de paginação
  const [paginaAtual, setPaginaAtual] = useState(1)
  const [itensPorPagina, setItensPorPagina] = useState(50)
  const [totalItens, setTotalItens] = useState(0)

  // Opções para filtros
  const [lojas, setLojas] = useState<Array<{ id: string, nome: string }>>([])
  const [laboratorios, setLaboratorios] = useState<Array<{ id: string, nome: string }>>([])

  // Estatísticas computadas (baseadas nos dados filtrados, não paginados)
  const estatisticas = useMemo(() => {
    const total = pedidosOriginais.length
    const porStatus = pedidosOriginais.reduce((acc, p) => {
      acc[p.status] = (acc[p.status] || 0) + 1
      return acc
    }, {} as Record<StatusPedido, number>)

    // NOVA LÓGICA: Só calcular valores se permitido
    const valorTotal = permissions.canViewFinancialData()
      ? pedidosOriginais.reduce((sum, p) => sum + (p.valor_pedido || 0), 0)
      : 0
    const atrasados = pedidosOriginais.filter(p => p.dias_para_vencer_sla !== null && p.dias_para_vencer_sla < 0).length
    const urgentes = pedidosOriginais.filter(p => p.prioridade === 'URGENTE').length

    return {
      total,
      porStatus,
      valorTotal,
      atrasados,
      urgentes,
      ticketMedio: total > 0 && permissions.canViewFinancialData() ? valorTotal / total : 0
    }
  }, [pedidosOriginais, permissions])

  // Carrega todos os pedidos do servidor (uma única vez)
  const carregarTodosPedidos = useCallback(async () => {
    console.log('📦 PedidosPage: carregarTodosPedidos START')
    try {
      setLoading(true)
      const data = await supabaseHelpers.getPedidosKanban({}) // Sem filtros = todos os dados
      console.log('📦 PedidosPage: Dados carregados', data?.length)
      setPedidosOriginais(data || [])
      setTotalItens(data?.length || 0)
    } catch (error) {
      console.error('Erro ao carregar todos os pedidos:', error)
      toast.error('Erro ao carregar pedidos do servidor')
    } finally {
      setLoading(false)
      setIsInitialLoading(false)
    }
  }, [])

  // Aplica filtros localmente nos dados carregados
  const pedidosFiltrados = useMemo(() => {
    let resultado = pedidosOriginais

    // ========== BUSCAS ESPECÍFICAS ==========

    // Busca por número da OS da loja
    if (filtros.numero_os_loja) {
      const busca = filtros.numero_os_loja.toLowerCase().trim()
      resultado = resultado.filter(p =>
        p.numero_os_fisica?.toLowerCase().includes(busca)
      )
    }

    // Busca por número da OS do laboratório
    if (filtros.numero_os_lab) {
      const busca = filtros.numero_os_lab.toLowerCase().trim()
      resultado = resultado.filter(p =>
        p.numero_pedido_laboratorio?.toLowerCase().includes(busca)
      )
    }

    // Busca por número do pedido (sequencial)
    if (filtros.numero_pedido) {
      const numero = filtros.numero_pedido.trim()
      resultado = resultado.filter(p =>
        p.numero_sequencial?.toString().includes(numero)
      )
    }

    // Busca por telefone do cliente
    if (filtros.telefone_cliente) {
      const telefone = filtros.telefone_cliente.replace(/\D/g, '') // Remove não-dígitos
      resultado = resultado.filter(p => {
        const tel = p.cliente_telefone?.replace(/\D/g, '') || ''
        return tel.includes(telefone)
      })
    }

    // Busca geral (nome cliente, loja, laboratório)
    if (filtros.busca_geral) {
      const busca = filtros.busca_geral.toLowerCase()
      resultado = resultado.filter(p =>
        p.cliente_nome?.toLowerCase().includes(busca) ||
        p.loja_nome?.toLowerCase().includes(busca) ||
        p.laboratorio_nome?.toLowerCase().includes(busca) ||
        p.classe_nome?.toLowerCase().includes(busca)
      )
    }

    // ========== FILTROS DE CATEGORIA ==========

    if (filtros.status && filtros.status !== 'all' && isStatusValido(filtros.status)) {
      resultado = resultado.filter(p => p.status === filtros.status)
    }

    if (filtros.loja_id && filtros.loja_id !== 'all') {
      resultado = resultado.filter(p => p.loja_id === filtros.loja_id)
    }

    if (filtros.laboratorio_id && filtros.laboratorio_id !== 'all') {
      resultado = resultado.filter(p => p.laboratorio_id === filtros.laboratorio_id)
    }

    if (filtros.prioridade && filtros.prioridade !== 'all' && isPrioridadeValida(filtros.prioridade)) {
      resultado = resultado.filter(p => p.prioridade === filtros.prioridade)
    }

    // ========== FILTROS DE DATA ==========

    if (filtros.data_inicio) {
      resultado = resultado.filter(p => p.data_pedido >= filtros.data_inicio)
    }

    if (filtros.data_fim) {
      resultado = resultado.filter(p => p.data_pedido <= filtros.data_fim)
    }

    // ========== FILTRO DE SLA ==========

    if (filtros.situacao_sla && filtros.situacao_sla !== 'todos') {
      resultado = resultado.filter(p => {
        const dias = p.dias_para_vencer_sla
        if (dias === null || dias === undefined) return false

        switch (filtros.situacao_sla) {
          case 'no_prazo':
            return dias >= 5
          case 'atencao':
            return dias >= 1 && dias <= 4
          case 'atrasado':
            return dias === 0
          case 'critico':
            return dias < 0
          default:
            return true
        }
      })
    }

    return resultado
  }, [pedidosOriginais, filtros])

  // Aplica paginação nos dados filtrados
  const pedidosPaginados = useMemo(() => {
    const inicio = (paginaAtual - 1) * itensPorPagina
    const fim = inicio + itensPorPagina
    return pedidosFiltrados.slice(inicio, fim)
  }, [pedidosFiltrados, paginaAtual, itensPorPagina])

  // Calcular total de páginas
  const totalPaginas = Math.ceil(pedidosFiltrados.length / itensPorPagina)

  // Atualizar pedidos exibidos
  useEffect(() => {
    setPedidos(pedidosPaginados)
  }, [pedidosPaginados])

  // Reset página quando filtros mudam
  useEffect(() => {
    setPaginaAtual(1)
  }, [filtros])

  const carregarOpcoesFiltro = useCallback(async () => {
    try {
      const [lojasRes, labsRes] = await Promise.all([
        supabase.from('lojas').select('id, nome').eq('ativo', true).order('nome'),
        supabase.from('laboratorios').select('id, nome').eq('ativo', true).order('nome')
      ])

      if (lojasRes.data) setLojas(lojasRes.data)
      if (labsRes.data) setLaboratorios(labsRes.data)
    } catch (error) {
      console.error('Erro ao carregar opções:', error)
    }
  }, [])

  useEffect(() => {
    if (!userProfile) return
    carregarOpcoesFiltro()
    carregarTodosPedidos()
  }, [carregarTodosPedidos, carregarOpcoesFiltro, userProfile])

  // ========== EFFECT DE HIDRATAÇÃO ==========
  useEffect(() => {
    setIsHydrated(true)
  }, [])

  // Não precisamos mais de debounce pois a filtragem é local
  // Os filtros aplicam instantaneamente via useMemo

  const exportarCSV = () => {
    const headers = [
      'Número',
      'Cliente',
      'Telefone',
      'Loja',
      'Laboratório',
      'Classe',
      'Status',
      'Prioridade',
      'Data Pedido',
      'Valor',
      'SLA (dias)',
      'Observações'
    ]

    const csvData = pedidos.map(p => [
      p.numero_sequencial,
      p.cliente_nome || '',
      p.cliente_telefone || '',
      p.loja_nome || '',
      p.laboratorio_nome || '',
      p.classe_nome || '',
      p.status,
      p.prioridade,
      format(new Date(p.data_pedido), 'dd/MM/yyyy'),
      permissions.canViewFinancialData() ? (p.valor_pedido ? p.valor_pedido.toFixed(2) : '0,00') : 'N/A',
      p.dias_para_vencer_sla !== null ? p.dias_para_vencer_sla.toString() : 'N/A',
      (p.observacoes || '').replace(/"/g, '""') // Escape quotes
    ])

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `pedidos-${format(new Date(), 'yyyy-MM-dd-HHmm')}.csv`
    link.click()

    toast.success(`Lista de ${pedidos.length} pedidos exportada com sucesso!`)
  }

  if (authLoading) {
    return (
      <div className="w-full h-[60vh] flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <main className="container mx-auto py-8 px-4">
          <div className="space-y-8">

            {/* Header com glassmorphism */}
            <div className="backdrop-blur-xl bg-white/30 dark:bg-gray-800/30 border-white/20 dark:border-gray-700/20 shadow-xl rounded-lg p-6">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg">
                    <Package className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      Gestão de Pedidos
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 text-lg">
                      {isInitialLoading ? 'Carregando...' : (
                        <>
                          {estatisticas.total} pedidos
                          {isHydrated && permissions.canViewFinancialData() && (
                            <> • R$ {estatisticas.valorTotal.toLocaleString('pt-BR')}</>
                          )}
                          {pedidosFiltrados.length !== estatisticas.total && (
                            <span className="text-blue-600 font-medium ml-2">
                              • {pedidosFiltrados.length} filtrados
                            </span>
                          )}
                        </>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setFiltrosVisiveis(!filtrosVisiveis)}
                    className={`backdrop-blur-sm bg-white/50 border-white/30 shadow-lg hover:bg-white/70 ${filtrosVisiveis ? 'bg-blue-50/50 border-blue-200/50' : ''}`}
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    Filtros
                  </Button>

                  <Button
                    variant="outline"
                    onClick={exportarCSV}
                    disabled={pedidos.length === 0}
                    className="backdrop-blur-sm bg-white/50 border-white/30 shadow-lg hover:bg-white/70"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Exportar
                  </Button>

                  <Button asChild className="shadow-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    <Link href="/pedidos/novo">
                      <Plus className="w-4 h-4 mr-2" />
                      Novo Pedido
                    </Link>
                  </Button>
                </div>
              </div>
            </div>

            {/* Cards de Estatísticas com glassmorphism */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card className="backdrop-blur-xl bg-white/30 dark:bg-gray-800/30 border-white/20 dark:border-gray-700/20 shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600 dark:text-gray-300 font-medium">Total de Pedidos</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">{estatisticas.total}</p>
                    </div>
                    <Package className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              {isHydrated && permissions.canViewFinancialData() && (
                <Card className="backdrop-blur-xl bg-white/30 border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-green-600 font-medium">Valor Total</p>
                        <p className="text-2xl font-bold text-green-900">
                          R$ {(estatisticas.valorTotal / 1000).toFixed(0)}k
                        </p>
                      </div>
                      <TrendingUp className="w-8 h-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card className="backdrop-blur-xl bg-white/30 dark:bg-gray-800/30 border-white/20 dark:border-gray-700/20 shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-amber-600 dark:text-amber-400 font-medium">Atrasados</p>
                      <p className="text-2xl font-bold text-amber-900 dark:text-amber-300">{estatisticas.atrasados}</p>
                    </div>
                    <AlertTriangle className="w-8 h-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="backdrop-blur-xl bg-white/30 dark:bg-gray-800/30 border-white/20 dark:border-gray-700/20 shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-red-600 dark:text-red-400 font-medium">Urgentes</p>
                      <p className="text-2xl font-bold text-red-900 dark:text-red-300">{estatisticas.urgentes}</p>
                    </div>
                    <AlertTriangle className="w-8 h-8 text-red-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Novo Componente de Filtros Avançados */}
            <FilterBar
              filtros={filtros}
              onChange={setFiltros}
              lojas={lojas}
              laboratorios={laboratorios}
              statusConfig={STATUS_CONFIG}
              prioridadeConfig={PRIORIDADE_CONFIG}
              isVisible={filtrosVisiveis}
              totalFiltrados={pedidosFiltrados.length}
              totalGeral={estatisticas.total}
            />

            {/* Tabela de Pedidos Melhorada */}
            <Card className="backdrop-blur-xl bg-white/30 dark:bg-gray-800/30 border-white/20 dark:border-gray-700/20 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Package className="w-5 h-5 mr-2 text-slate-700 dark:text-gray-300" />
                    <span className="text-slate-800 dark:text-white">Lista de Pedidos</span>
                    {loading && !isInitialLoading && (
                      <span className="ml-2 text-xs text-gray-500 animate-pulse">Atualizando...</span>
                    )}
                  </div>
                  {!isInitialLoading && (
                    <Badge variant="secondary" className="text-sm">
                      {pedidos.length} resultados
                    </Badge>
                  )}
                </CardTitle>
                {!isInitialLoading && pedidos.length > 0 && (
                  <CardDescription>
                    {isHydrated && permissions.canViewFinancialData() && (
                      <>
                        Ticket médio: R$ {estatisticas.ticketMedio.toLocaleString('pt-BR', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })} •
                      </>
                    )}
                    {estatisticas.atrasados} atrasados • {estatisticas.urgentes} urgentes
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                {isInitialLoading ? (
                  <div className="flex justify-center py-12">
                    <div className="text-center">
                      <LoadingSpinner />
                      <p className="text-gray-600 dark:text-gray-400 mt-4">Carregando pedidos...</p>
                    </div>
                  </div>
                ) : pedidos.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum pedido encontrado</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      {Object.values(filtros).some(v => v && v !== 'todos')
                        ? 'Tente ajustar os filtros para encontrar pedidos'
                        : 'Comece criando seu primeiro pedido'
                      }
                    </p>
                    <div className="flex justify-center gap-3">
                      {Object.values(filtros).some(v => v && v !== 'todos') && (
                        <Button variant="outline" onClick={() => setFiltrosVisiveis(true)}>
                          Ver Filtros
                        </Button>
                      )}
                      <Button asChild>
                        <Link href="/pedidos/novo">
                          <Plus className="w-4 h-4 mr-2" />
                          Criar Pedido
                        </Link>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Controles de Paginação */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 bg-white/50 backdrop-blur-sm rounded-lg border border-white/20">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Label className="text-sm font-medium">Mostrar:</Label>
                          <Select value={itensPorPagina.toString()} onValueChange={(value) => {
                            setItensPorPagina(Number(value))
                            setPaginaAtual(1)
                          }}>
                            <SelectTrigger className="w-20">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="10">10</SelectItem>
                              <SelectItem value="50">50</SelectItem>
                              <SelectItem value="100">100</SelectItem>
                            </SelectContent>
                          </Select>
                          <span className="text-sm text-gray-600">por página</span>
                        </div>

                        <div className="text-sm text-gray-600">
                          Mostrando <span className="font-medium">{((paginaAtual - 1) * itensPorPagina) + 1}</span> a{' '}
                          <span className="font-medium">{Math.min(paginaAtual * itensPorPagina, pedidosFiltrados.length)}</span> de{' '}
                          <span className="font-medium">{pedidosFiltrados.length}</span> resultados
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPaginaAtual(1)}
                          disabled={paginaAtual === 1}
                          className="px-2"
                        >
                          Primeira
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPaginaAtual(paginaAtual - 1)}
                          disabled={paginaAtual === 1}
                          className="px-2"
                        >
                          Anterior
                        </Button>
                        <span className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded border">
                          {paginaAtual} / {totalPaginas}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPaginaAtual(paginaAtual + 1)}
                          disabled={paginaAtual === totalPaginas}
                          className="px-2"
                        >
                          Próxima
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPaginaAtual(totalPaginas)}
                          disabled={paginaAtual === totalPaginas}
                          className="px-2"
                        >
                          Última
                        </Button>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader className="dark:bg-gray-800">
                          <TableRow className="dark:border-gray-700">
                            <TableHead className="w-16">Nº</TableHead>
                            <TableHead>Cliente</TableHead>
                            <TableHead>Loja</TableHead>
                            <TableHead>Laboratório</TableHead>
                            <TableHead>Classe</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Prioridade</TableHead>
                            <TableHead>Data</TableHead>
                            {isHydrated && permissions.canViewFinancialData() && (
                              <TableHead className="text-right">Valor</TableHead>
                            )}
                            <TableHead className="text-center">SLA</TableHead>
                            <TableHead className="text-center">Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {pedidos.map((pedido) => {
                            const statusConfig = STATUS_CONFIG[pedido.status]
                            const prioridadeConfig = PRIORIDADE_CONFIG[pedido.prioridade]

                            return (
                              <TableRow key={pedido.id} className="hover:bg-white/50 dark:hover:bg-gray-700/50 transition-colors duration-200 dark:border-gray-700">
                                <TableCell className="font-mono font-medium dark:text-gray-300">
                                  #{pedido.numero_sequencial}
                                </TableCell>
                                <TableCell>
                                  <div>
                                    <div className="font-medium dark:text-white">{pedido.cliente_nome}</div>
                                    {pedido.cliente_telefone && (
                                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        {pedido.cliente_telefone}
                                      </div>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <span className="text-sm dark:text-gray-300">{pedido.loja_nome}</span>
                                </TableCell>
                                <TableCell>
                                  <span className="text-sm dark:text-gray-300">{pedido.laboratorio_nome}</span>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center space-x-2">
                                    <div
                                      className="w-3 h-3 rounded-full border dark:border-gray-600"
                                      style={{ backgroundColor: pedido.classe_cor }}
                                    />
                                    <span className="text-sm dark:text-gray-300">{pedido.classe_nome}</span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge className={`${statusConfig.color} border text-xs`}>
                                    {statusConfig.label}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline" className={`${prioridadeConfig.color} text-xs`}>
                                    {prioridadeConfig.label}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="text-sm dark:text-gray-300">
                                    {format(new Date(pedido.data_pedido), 'dd/MM/yy', { locale: ptBR })}
                                  </div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400">
                                    {pedido.dias_desde_pedido}d atrás
                                  </div>
                                </TableCell>
                                {isHydrated && permissions.canViewFinancialData() && (
                                  <TableCell className="text-right">
                                    {pedido.valor_pedido ? (
                                      <div className="text-sm font-medium">
                                        R$ {pedido.valor_pedido.toLocaleString('pt-BR', {
                                          minimumFractionDigits: 2,
                                          maximumFractionDigits: 2
                                        })}
                                      </div>
                                    ) : (
                                      <span className="text-gray-400 text-sm">-</span>
                                    )}
                                  </TableCell>
                                )}
                                <TableCell className="text-center">
                                  {pedido.dias_para_vencer_sla !== null ? (
                                    <Badge
                                      variant={pedido.dias_para_vencer_sla >= 0 ? 'default' : 'destructive'}
                                      className="text-xs"
                                    >
                                      {pedido.dias_para_vencer_sla >= 0 ? '+' : ''}{pedido.dias_para_vencer_sla}d
                                    </Badge>
                                  ) : (
                                    <span className="text-gray-400 text-sm">-</span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <div className="flex justify-center space-x-1">
                                    <Button variant="ghost" size="sm" asChild>
                                      <Link href={`/pedidos/${pedido.id}`}>
                                        <Eye className="w-4 h-4" />
                                      </Link>
                                    </Button>

                                    <PrintOrderButton
                                      pedido={pedido}
                                      variant="ghost"
                                      size="sm"
                                      showLabel={false}
                                    />

                                    {pedido.status !== 'ENTREGUE' && pedido.status !== 'CANCELADO' && (
                                      <Button variant="ghost" size="sm" asChild>
                                        <Link href={`/pedidos/${pedido.id}/editar`}>
                                          <Edit className="w-4 h-4" />
                                        </Link>
                                      </Button>
                                    )}
                                  </div>
                                </TableCell>
                              </TableRow>
                            )
                          })}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Controles de Paginação Inferiores */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border-t dark:border-gray-700">
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        Mostrando <span className="font-medium">{((paginaAtual - 1) * itensPorPagina) + 1}</span> a{' '}
                        <span className="font-medium">{Math.min(paginaAtual * itensPorPagina, pedidosFiltrados.length)}</span> de{' '}
                        <span className="font-medium">{pedidosFiltrados.length}</span> resultados
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPaginaAtual(1)}
                          disabled={paginaAtual === 1}
                          className="px-2"
                        >
                          Primeira
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPaginaAtual(paginaAtual - 1)}
                          disabled={paginaAtual === 1}
                          className="px-2"
                        >
                          Anterior
                        </Button>
                        <span className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded border">
                          {paginaAtual} / {totalPaginas}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPaginaAtual(paginaAtual + 1)}
                          disabled={paginaAtual === totalPaginas}
                          className="px-2"
                        >
                          Próxima
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPaginaAtual(totalPaginas)}
                          disabled={paginaAtual === totalPaginas}
                          className="px-2"
                        >
                          Última
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}