'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Search, Bell, Eye, ArrowLeft, ArrowRight, CheckCircle, Lock, RefreshCw, Copy, Package } from 'lucide-react'
import { supabaseHelpers } from '@/lib/supabase/helpers'
import { PedidoCompleto, StatusPedido, STATUS_COLORS, STATUS_LABELS, Laboratorio, Loja } from '@/lib/types/database'
import { useAuth } from '@/components/providers/AuthProvider'
import NovaOrdemForm from '@/components/forms/NovaOrdemForm'

// ========== INTERFACES ==========
interface KanbanColumn {
  id: StatusPedido
  title: string
  color: string
  pedidos: PedidoCompleto[]
} 

interface UserPermissions {
  canViewColumn: (status: StatusPedido) => boolean
  canEditColumn: (status: StatusPedido) => boolean
  canDragCard: (status: StatusPedido) => boolean
  canMoveToNext: (currentStatus: StatusPedido) => boolean
  canMoveToPrev: (currentStatus: StatusPedido) => boolean
  canViewFinancialData: () => boolean
  canCreateOrder: () => boolean
  getVisibleColumns: () => StatusPedido[]
  getNextStatus: (currentStatus: StatusPedido) => StatusPedido | null
  getPrevStatus: (currentStatus: StatusPedido) => StatusPedido | null
}

// ========== HOOK DE PERMISSÕES ==========
const useUserPermissions = (): UserPermissions => {

  const getVisibleColumns = (): StatusPedido[] => {
    return ['REGISTRADO', 'AG_PAGAMENTO', 'PAGO', 'PRODUCAO', 'PRONTO', 'ENVIADO', 'CHEGOU', 'ENTREGUE']
  }

  const canViewColumn = (): boolean => {
    return true // Todos podem ver todas as colunas
  }

  const canEditColumn = (): boolean => {
    return true // Banco vai validar as permissões
  }

  const canDragCard = (): boolean => {
    return true // Permitir arrastar todos os cards
  }

  const getNextStatus = (currentStatus: StatusPedido): StatusPedido | null => {
    const statusFlow: Record<StatusPedido, StatusPedido | null> = {
      'REGISTRADO': 'AG_PAGAMENTO',
      'AG_PAGAMENTO': 'PAGO',
      'PAGO': 'PRODUCAO',
      'PRODUCAO': 'PRONTO',
      'PRONTO': 'ENVIADO',
      'ENVIADO': 'CHEGOU',
      'CHEGOU': 'ENTREGUE',
      'ENTREGUE': null,
      'CANCELADO': null
    }
    return statusFlow[currentStatus]
  }

  const getPrevStatus = (currentStatus: StatusPedido): StatusPedido | null => {
    const statusFlow: Record<StatusPedido, StatusPedido | null> = {
      'REGISTRADO': null,
      'AG_PAGAMENTO': 'REGISTRADO',
      'PAGO': 'AG_PAGAMENTO',
      'PRODUCAO': 'PAGO',
      'PRONTO': 'PRODUCAO',
      'ENVIADO': 'PRONTO',
      'CHEGOU': 'ENVIADO',
      'ENTREGUE': 'CHEGOU',
      'CANCELADO': null
    }
    return statusFlow[currentStatus]
  }

  const canMoveToNext = (currentStatus: StatusPedido): boolean => {
    const nextStatus = getNextStatus(currentStatus)
    return nextStatus !== null // Apenas verifica se existe próximo status
  }

  const canMoveToPrev = (currentStatus: StatusPedido): boolean => {
    const prevStatus = getPrevStatus(currentStatus)
    return prevStatus !== null // Apenas verifica se existe status anterior
  }

  const canViewFinancialData = (): boolean => {
  return true // Todos podem ver dados financeiros
  }

  const canCreateOrder = (): boolean => {
  return true // Permitir que todos criem pedidos
  }

  return {
    canViewColumn,
    canEditColumn,
    canDragCard,
    canMoveToNext,
    canMoveToPrev,
    canViewFinancialData,
    canCreateOrder,
    getVisibleColumns,
    getNextStatus,
    getPrevStatus
  }
}

// ========== COMPONENTE PRINCIPAL ==========
export default function KanbanBoard() {
  const router = useRouter()
  const { user, userProfile, loading: authLoading } = useAuth()
  const permissions = useUserPermissions()
 
  // ========== ESTADO ==========
  // Colunas para pedidos ativos (excluindo ENTREGUE para performance)
  const [activeColumns] = useState<KanbanColumn[]>([
    { id: 'REGISTRADO', title: 'Registrado', color: STATUS_COLORS.REGISTRADO, pedidos: [] },
    { id: 'AG_PAGAMENTO', title: 'Aguard. Pagamento', color: STATUS_COLORS.AG_PAGAMENTO, pedidos: [] },
    { id: 'PAGO', title: 'Pago', color: STATUS_COLORS.PAGO, pedidos: [] },
    { id: 'PRODUCAO', title: 'Em Produção', color: STATUS_COLORS.PRODUCAO, pedidos: [] },
    { id: 'PRONTO', title: 'No DCL', color: STATUS_COLORS.PRONTO, pedidos: [] },
    { id: 'ENVIADO', title: 'Montador', color: STATUS_COLORS.ENVIADO, pedidos: [] },
    { id: 'CHEGOU', title: 'Em Loja', color: STATUS_COLORS.CHEGOU, pedidos: [] }
  ])

  const [columns, setColumns] = useState<KanbanColumn[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLoja, setSelectedLoja] = useState<string>('all')
  const [selectedLab, setSelectedLab] = useState<string>('all')
  const [laboratorios, setLaboratorios] = useState<Laboratorio[]>([])
  const [lojas, setLojas] = useState<Loja[]>([])
  const [selectedPedido, setSelectedPedido] = useState<PedidoCompleto | null>(null)

  // Apenas pedidos ativos visíveis (performance otimizada)
  const visibleColumns = useMemo(() => {
    return activeColumns
  }, [activeColumns])

  // Status permitidos apenas para pedidos ativos (exclui ENTREGUE)
  const allowedStatuses = useMemo(() => {
    return ['REGISTRADO', 'AG_PAGAMENTO', 'PAGO', 'PRODUCAO', 'PRONTO', 'ENVIADO', 'CHEGOU']
  }, [])

  // Carregar pedidos com filtros e organizar por colunas visíveis
  const loadPedidos = useCallback(async () => {
    try {
      setLoading(true)

      const filtros = {
        loja_id: selectedLoja !== 'all' ? selectedLoja : undefined,
        laboratorio_id: selectedLab !== 'all' ? selectedLab : undefined,
        // Filtrar apenas pedidos ativos (exclui ENTREGUE para performance)
        status: allowedStatuses.join(',') as any
      }

      const pedidos = await supabaseHelpers.getPedidosKanban(filtros)

      const newColumns = visibleColumns.map(column => ({
        ...column,
        pedidos: (pedidos || []).filter((p: PedidoCompleto) => p.status === column.id),
      }))

      setColumns(newColumns)
    } catch {
      // Erro ao carregar pedidos (API)

      const mockPedidos: PedidoCompleto[] = []
      const newColumns = visibleColumns.map(column => ({
        ...column,
        pedidos: mockPedidos.filter((p: PedidoCompleto) => p.status === column.id),
      }))
      setColumns(newColumns)
    } finally {
      setLoading(false)
    }
  }, [selectedLoja, selectedLab, visibleColumns, allowedStatuses])

  // Carregar opções e chamar loadPedidos
  const loadInitialData = useCallback(async () => {
    try {
      const [labsData, lojasData] = await Promise.all([
        supabaseHelpers.getLaboratorios(),
        supabaseHelpers.getLojas()
      ])

      setLaboratorios(labsData)
      setLojas(lojasData)
      await loadPedidos()
    } catch {
      // Erro ao carregar dados iniciais
      setLaboratorios([])
      setLojas([])
    }
  }, [loadPedidos])

  

  // ========== EFFECTS ==========
  useEffect(() => {
    if (!user) return
    loadInitialData()
  }, [user, loadInitialData])

  useEffect(() => {
    if (!user) return
    loadPedidos()
  }, [user, selectedLoja, selectedLab, userProfile?.role, loadPedidos])

  useEffect(() => {
    if (!user) return
    // Atualizar colunas visíveis quando mudar o papel do usuário
    const newColumns = visibleColumns.map(col => ({
      ...col,
      pedidos: col.pedidos || []
    }))
    setColumns(newColumns)
  }, [user, userProfile?.role, visibleColumns])

  // Gate de autenticação para esta página
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [authLoading, user, router])

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Component will redirect via useEffect
  }

  // (remoção de definições duplicadas)

  // ========== FUNÇÕES DE AÇÃO ==========
  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result

    if (!destination) {
      return
    }
    
    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return
    }

    const sourceColumn = columns.find(col => col.id === source.droppableId)
    const destColumn = columns.find(col => col.id === destination.droppableId)

    if (!sourceColumn || !destColumn) {
      return
    }

    const pedido = sourceColumn.pedidos.find(p => p.id === draggableId)
    if (!pedido) {
      return
    }

    // Verificação simples: apenas se o status de destino é válido
    const validStatuses = ['REGISTRADO', 'AG_PAGAMENTO', 'PAGO', 'PRODUCAO', 'PRONTO', 'ENVIADO', 'CHEGOU', 'ENTREGUE']
    if (!validStatuses.includes(destination.droppableId)) {
      alert('Status de destino inválido.')
      return
    }

    try {
      const observacao = `Movido via drag & drop de ${STATUS_LABELS[source.droppableId as StatusPedido]} para ${STATUS_LABELS[destination.droppableId as StatusPedido]}`

      await supabaseHelpers.atualizarStatus(
        pedido.id, 
        destination.droppableId as StatusPedido,
        observacao
      )

      // Atualizar estado local
      const newColumns = columns.map(column => {
        if (column.id === source.droppableId) {
          return {
            ...column,
            pedidos: column.pedidos.filter(p => p.id !== draggableId)
          }
        }
        if (column.id === destination.droppableId) {
          const updatedPedido = { ...pedido, status: destination.droppableId as StatusPedido }
          const newPedidos = [...column.pedidos]
          newPedidos.splice(destination.index, 0, updatedPedido)
          return {
            ...column,
            pedidos: newPedidos
          }
        }
        return column
      })

      setColumns(newColumns)
      
    } catch (error) {
      // Erro ao mover pedido
      const errorMessage = error instanceof Error ? error.message : String(error)
      alert(`Erro ao mover pedido: ${errorMessage}`)
    }
  }

  const handleAdvanceStatus = async (pedido: PedidoCompleto) => {
    const nextStatus = permissions.getNextStatus(pedido.status)
    if (!nextStatus) {
      alert('Este pedido já está no status final.')
      return
    }

    try {
      await supabaseHelpers.atualizarStatus(
        pedido.id,
        nextStatus,
  `Avançado de ${STATUS_LABELS[pedido.status]} para ${STATUS_LABELS[nextStatus]} por ${userProfile?.nome || user?.email || 'sistema'}`
      )
      
      await loadPedidos()
    } catch {
      // Erro ao avançar status
      alert('Erro ao avançar status. Tente novamente.')
    }
  }

  const handleRegressStatus = async (pedido: PedidoCompleto) => {
    const prevStatus = permissions.getPrevStatus(pedido.status)
    if (!prevStatus) {
      alert('Este pedido já está no status inicial.')
      return
    }

    const confirmMessage = `Tem certeza que deseja voltar de ${STATUS_LABELS[pedido.status]} para ${STATUS_LABELS[prevStatus]}?`
    if (!confirm(confirmMessage)) return

    try {
      await supabaseHelpers.atualizarStatus(
        pedido.id,
        prevStatus,
  `Regredido de ${STATUS_LABELS[pedido.status]} para ${STATUS_LABELS[prevStatus]} por ${userProfile?.nome || user?.email || 'sistema'}`
      )
      
      await loadPedidos()
    } catch {
      // Erro ao regredir status
      alert('Erro ao regredir status. Tente novamente.')
    }
  }

  // ========== FILTROS ==========
  const filteredColumns = columns.map(column => ({
    ...column,
    pedidos: column.pedidos.filter(pedido =>
      searchTerm === '' || 
      pedido.numero_sequencial.toString().includes(searchTerm) ||
      pedido.cliente_nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pedido.loja_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
  pedido.laboratorio_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
  (pedido.numero_os_fisica && pedido.numero_os_fisica.toLowerCase().includes(searchTerm.toLowerCase())) ||
  (pedido.numero_pedido_laboratorio && pedido.numero_pedido_laboratorio.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  }))

  // Calcular totais para exibição
  const totalPedidos = columns.reduce((acc, col) => acc + col.pedidos.length, 0)

  // ========== RENDER CARD DO PEDIDO ==========
  const renderPedidoCard = (pedido: PedidoCompleto, index: number) => {
    const canEdit = true // Remover bloqueio frontend - banco valida
    const canMoveNext = permissions.canMoveToNext(pedido.status)
    const canMovePrev = permissions.canMoveToPrev(pedido.status)
    const canViewFinancial = true // Permitir visualização de dados financeiros
    const canDrag = true // Permitir arrastar todos os cards

    return (
      <Draggable
        key={pedido.id}
        draggableId={pedido.id}
        index={index}
        isDragDisabled={!canDrag}
      >
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
          >
            <Card
              className={`cursor-pointer transition-shadow shadow-sm hover:shadow-md mb-2 ${
                snapshot.isDragging ? 'rotate-3 shadow-lg' : ''
              } ${pedido.eh_garantia ? 'border-l-4 border-l-orange-500' : ''} ${
                !canEdit ? 'opacity-75' : ''
              }`}
              onClick={() => setSelectedPedido(pedido)}
            >
              <CardContent className="p-3">
                <div className="space-y-2">
                  {/* Header do card */}
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs font-mono w-fit">
                          #{pedido.numero_sequencial}
                        </Badge>
                        {pedido.eh_garantia && (
                          <Badge variant="outline" className="text-xs bg-orange-100 text-orange-700 border-orange-300">
                            GARANTIA
                          </Badge>
                        )}
                        {!canEdit && (
                          <Lock className="w-3 h-3 text-gray-400" />
                        )}
                      </div>
                      {pedido.numero_os_fisica && (
                        <div className="text-xs text-gray-500 font-mono">
                          OS: {pedido.numero_os_fisica}
                        </div>
                      )}
                      <div className="text-xs text-gray-500 font-mono">
                        Lab: {pedido.numero_pedido_laboratorio || '—'}
                      </div>
                    </div>
                    {pedido.alertas_count > 0 && (
                      <Bell className="w-4 h-4 text-red-500" />
                    )}
                  </div>

                  {/* Cliente */}
                  <div>
                    <p className="font-medium text-sm">
                      {pedido.cliente_nome || 'Cliente não informado'}
                    </p>
                  </div>

                  {/* Loja e Lab */}
                  <div className="text-xs text-gray-600 space-y-1">
                    <div>🏪 {pedido.loja_nome}</div>
                    <div>
                      🔬 {pedido.laboratorio_nome}
                      {pedido.laboratorio_codigo ? ` (${pedido.laboratorio_codigo})` : ''}
                    </div>
                  </div>

                  {/* Classe da lente */}
                  <div className="space-y-1">
                    <Badge 
                      style={{ backgroundColor: pedido.classe_cor }}
                      className="text-white text-xs"
                    >
                      {pedido.classe_nome}
                    </Badge>
                    
                    {pedido.tratamentos_nomes && (
                      <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                        📋 {pedido.tratamentos_nomes}
                      </div>
                    )}
                  </div>

                  {/* Valores financeiros - só se tiver permissão */}
                  {canViewFinancial && (
                    <div className="grid grid-cols-2 gap-1">
                      {pedido.valor_pedido && !pedido.eh_garantia && (
                        <div className="text-xs">
                          <span className="text-gray-500">Venda:</span>
                          <div className="font-semibold text-green-600">
                            R$ {pedido.valor_pedido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </div>
                        </div>
                      )}
                      {pedido.custo_lentes && (
                        <div className="text-xs">
                          <span className="text-gray-500">Custo:</span>
                          <div className="font-semibold text-red-600">
                            R$ {pedido.custo_lentes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Margem de lucro - só se tiver permissão */}
                  {canViewFinancial && pedido.valor_pedido && pedido.custo_lentes && !pedido.eh_garantia && (
                    <div className="text-xs bg-gray-100 px-2 py-1 rounded">
                      <span className="text-gray-600">Margem: </span>
                      <span className={`font-semibold ${
                        ((pedido.valor_pedido - pedido.custo_lentes) / pedido.valor_pedido) * 100 > 50 
                          ? 'text-green-600' 
                          : 'text-orange-600'
                      }`}>
                        {(((pedido.valor_pedido - pedido.custo_lentes) / pedido.valor_pedido) * 100).toFixed(1)}%
                      </span>
                    </div>
                  )}

                  {/* Flags de atenção */}
                  <div className="flex gap-1 flex-wrap">
                    {pedido.pagamento_atrasado && (
                      <Badge variant="destructive" className="text-xs">
                        Pag. Atrasado
                      </Badge>
                    )}
                    {pedido.producao_atrasada && (
                      <Badge variant="destructive" className="text-xs">
                        Prod. Atrasada
                      </Badge>
                    )}
                    {pedido.requer_atencao && (
                      <Badge variant="outline" className="text-xs border-orange-500 text-orange-600">
                        Atenção
                      </Badge>
                    )}
                  </div>

                  {/* Tempo */}
                  <div className="text-xs text-gray-500">
                    {pedido.dias_desde_pedido} dias atrás
                    {pedido.dias_para_vencer_sla !== null && pedido.dias_para_vencer_sla !== undefined && (
                      <span className={pedido.dias_para_vencer_sla < 0 ? 'text-red-500' : 'text-blue-500'}>
                        {' • '}
                        {pedido.dias_para_vencer_sla < 0 ? 'Vencido há' : 'Vence em'} {Math.abs(pedido.dias_para_vencer_sla)} dias
                      </span>
                    )}
                  </div>

                  {/* Botões de ação - baseados em permissões */}
                  <div className="pt-2 border-t">
                    {/* Sempre mostrar botão timeline */}
                    <div className="flex gap-1 mb-1">
                      <Link href={`/pedidos/${pedido.id}/timeline`} className="flex-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => e.stopPropagation()}
                          className="w-full text-xs h-6 text-blue-600 hover:text-blue-700 border-blue-200"
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          Timeline
                        </Button>
                      </Link>
                    </div>
                    
                    {/* Botões de status apenas para usuários com permissão */}
                    {canEdit && (
                      <div className="flex gap-1">
                        {canMovePrev && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleRegressStatus(pedido)
                            }}
                            className="flex-1 text-xs h-7"
                          >
                            <ArrowLeft className="w-3 h-3 mr-1" />
                            Voltar
                          </Button>
                        )}
                        {canMoveNext && (
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleAdvanceStatus(pedido)
                            }}
                            className="flex-1 text-xs h-7 bg-blue-600 hover:bg-blue-700"
                          >
                            {pedido.status === 'CHEGOU' ? (
                              <>
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Entregar
                              </>
                            ) : pedido.status === 'AG_PAGAMENTO' ? (
                              <>
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Marcar Pago
                              </>
                            ) : (
                              <>
                                <ArrowRight className="w-3 h-3 mr-1" />
                                Avançar
                              </>
                            )}
                          </Button>
                        )}

                        {pedido.status === 'ENTREGUE' && (
                          <div className="flex-1 text-center">
                            <Badge variant="outline" className="text-xs text-green-600 border-green-500">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Concluído
                            </Badge>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Badge de apenas visualização removido - todos podem editar agora */}
                  </div>
                </div> {/* Fecha div space-y-2 */}
              </CardContent>
            </Card>
          </div>
        )}
      </Draggable>
    )
  }

  // ========== RENDER PRINCIPAL ==========
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Conteúdo Principal */}
      <main className="container mx-auto py-8 px-4">
        <div className="space-y-8">
          {/* Header do Kanban */}
          <div className="bg-gradient-to-br from-white/90 to-gray-50/90 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div className="flex items-center space-x-4">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-300" />
                  <div className="relative p-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg group-hover:scale-105 transition-transform duration-300">
                    <Package className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Kanban - Pedidos Ativos
                  </h2>
                  <p className="text-gray-600 font-medium">
                    Fluxo Operacional • Colunas: {visibleColumns.length} | Total: {totalPedidos} pedidos ativos
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Pedidos entregues estão disponíveis em <Link href="/pedidos" className="text-blue-600 hover:underline">Gestão de Pedidos</Link>
                  </p>
                </div>
              </div>
              
              {/* Controles do Kanban */}
              <div className="flex items-center space-x-3">
                <Button 
                  onClick={loadPedidos}
                  variant="outline"
                  disabled={loading}
                  className="bg-white/70 backdrop-blur-sm border-gray-300 hover:bg-white/90 transition-all duration-200"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Atualizar
                </Button>
                
                {permissions.canCreateOrder() && (
                  <NovaOrdemForm onSuccess={loadPedidos} />
                )}
              </div>
            </div>
          </div>

          {/* Filtros */}
          <div className="bg-gradient-to-br from-white/90 to-gray-50/90 backdrop-blur-xl border border-white/20 shadow-xl rounded-2xl p-6">
            <div className="flex flex-wrap gap-4">
              {/* Busca */}
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-blue-600" />
                  <Input
                    placeholder="Buscar por número, cliente, loja, OS..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white/70 backdrop-blur-sm border-gray-300 hover:bg-white/90 transition-all duration-200"
                  />
                </div>
              </div>
              
              {/* Filtro Loja */}
              <Select value={selectedLoja} onValueChange={setSelectedLoja}>
                <SelectTrigger className="w-[200px] bg-white/70 backdrop-blur-sm border-gray-300 hover:bg-white/90 transition-all duration-200">
                  <SelectValue placeholder="Todas as lojas" />
                </SelectTrigger>
                <SelectContent className="bg-white/95 backdrop-blur-lg border-white/20">
                  <SelectItem value="all">Todas as lojas</SelectItem>
                  {lojas.map(loja => (
                    <SelectItem key={loja.id} value={loja.id}>
                      {loja.nome} ({loja.codigo})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Filtro Laboratório */}
              <Select value={selectedLab} onValueChange={setSelectedLab}>
                <SelectTrigger className="w-[200px] bg-white/70 backdrop-blur-sm border-gray-300 hover:bg-white/90 transition-all duration-200">
                  <SelectValue placeholder="Todos os labs" />
                </SelectTrigger>
                <SelectContent className="bg-white/95 backdrop-blur-lg border-white/20">
                  <SelectItem value="all">Todos os laboratórios</SelectItem>
                  {laboratorios.map(lab => (
                    <SelectItem key={lab.id} value={lab.id}>
                      {lab.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* ========== KANBAN BOARD - PEDIDOS ATIVOS ========== */}
          <div className="flex-1 overflow-x-auto py-2">
            <DragDropContext onDragEnd={handleDragEnd}>
              <div className="flex gap-6 min-w-max px-2">
                {filteredColumns.map(column => (
                  <div key={column.id} className="w-80 flex-shrink-0">
                    <div className="bg-gradient-to-br from-white/90 to-gray-50/90 backdrop-blur-xl border border-white/20 shadow-xl rounded-2xl overflow-hidden">
                      {/* Header da coluna */}
                      <div 
                        className="p-4 bg-gradient-to-r from-white/50 to-transparent backdrop-blur-sm border-b border-white/20"
                        style={{ 
                          borderTopColor: column.color, 
                              borderTopWidth: '3px',
                              borderTopStyle: 'solid'
                            }}
                          >
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold text-gray-900 text-lg">{column.title}</h3>
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant="secondary" 
                              className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-700 border-blue-200 font-semibold"
                            >
                              {column.pedidos.length}
                            </Badge>
                            {!permissions.canEditColumn(column.id) && (
                              <div className="p-1 bg-gray-300/50 rounded-lg">
                                <Lock className="w-4 h-4 text-gray-500" />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Cards dos pedidos */}
                      <Droppable 
                        droppableId={column.id}
                        isDropDisabled={!permissions.canEditColumn(column.id)}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className={`p-4 min-h-[200px] space-y-3 transition-all duration-300 ${
                              snapshot.isDraggingOver 
                                ? permissions.canEditColumn(column.id)
                                  ? 'bg-gradient-to-br from-blue-100/50 to-purple-100/50 backdrop-blur-sm' 
                                  : 'bg-gradient-to-br from-red-100/50 to-pink-100/50 backdrop-blur-sm'
                                : 'bg-transparent'
                            }`}
                          >
                            {column.pedidos.map((pedido, index) => 
                              renderPedidoCard(pedido, index)
                            )}
                            {provided.placeholder}
                            
                            {column.pedidos.length === 0 && (
                              <div className="text-center text-gray-500 text-sm mt-12 p-6">
                                <div className="bg-gradient-to-br from-gray-100/50 to-gray-200/50 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50">
                                  <Package className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                  <p className="font-medium">Nenhum pedido</p>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </Droppable>
                    </div>
                  </div>
                ))}
              </div>
            </DragDropContext>
          </div>

          {/* ========== MODAL DE DETALHES ========== */}
          <Dialog open={!!selectedPedido} onOpenChange={() => setSelectedPedido(null)}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white/95 to-gray-50/95 backdrop-blur-xl border border-white/20 shadow-2xl">
              <DialogHeader>
                <DialogTitle className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent text-xl font-bold">
                  Pedido #{selectedPedido?.numero_sequencial}
                </DialogTitle>
                <DialogDescription className="text-gray-600 font-medium">
                  Detalhes completos do pedido - {(userProfile?.role || '').toUpperCase()}
                </DialogDescription>
              </DialogHeader>
              
              {selectedPedido && (
                <div className="space-y-6">
                  {/* Status e identificação */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <Badge 
                      style={{ backgroundColor: STATUS_COLORS[selectedPedido.status] }}
                      className="text-white font-semibold px-3 py-1 shadow-lg"
                    >
                      {STATUS_LABELS[selectedPedido.status]}
                    </Badge>
                    <Badge variant="outline" className="bg-white/70 backdrop-blur-sm border-gray-300 text-gray-700 font-medium">
                      {selectedPedido.prioridade}
                    </Badge>
                    {selectedPedido.eh_garantia && (
                      <Badge className="bg-orange-100 text-orange-800 border-orange-300 font-semibold">
                        🛡️ GARANTIA
                      </Badge>
                    )}
                    {!permissions.canEditColumn(selectedPedido.status) && (
                      <Badge variant="outline" className="border-amber-400 text-amber-700 bg-amber-50 font-medium">
                        <Lock className="w-3 h-3 mr-1" />
                        Apenas Visualização
                      </Badge>
                    )}
                  </div>

                  {/* OS Física */}
                  {selectedPedido.numero_os_fisica && (
                    <div className="bg-gradient-to-br from-blue-50/80 to-blue-100/80 backdrop-blur-sm p-4 rounded-xl border border-blue-200/50">
                      <label className="text-sm font-semibold text-blue-700">Número da OS Física</label>
                      <p className="text-lg font-mono text-blue-900 font-bold">{selectedPedido.numero_os_fisica}</p>
                    </div>
                  )}

                  {/* Número do Laboratório */}
                  <div className="bg-gradient-to-br from-green-50/80 to-green-100/80 backdrop-blur-sm p-4 rounded-xl border border-green-200/50">
                    <div className="flex items-start justify-between">
                      <div>
                        <label className="text-sm font-semibold text-green-700">Número do Pedido no Laboratório</label>
                        <p className="text-lg font-mono text-green-900 font-bold">{selectedPedido.numero_pedido_laboratorio || '—'}</p>
                      </div>
                      {selectedPedido.numero_pedido_laboratorio && (
                        <button
                          type="button"
                          onClick={() => navigator.clipboard.writeText(selectedPedido.numero_pedido_laboratorio!)}
                          className="h-10 w-10 p-0 inline-flex items-center justify-center rounded-xl hover:bg-green-200/50 text-green-800 transition-all duration-200 bg-white/50 backdrop-blur-sm"
                          aria-label="Copiar número do laboratório"
                          title="Copiar"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Informações do cliente */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-gray-50/80 to-gray-100/80 backdrop-blur-sm p-4 rounded-xl border border-gray-200/50">
                      <label className="text-sm font-semibold text-gray-700">Cliente</label>
                      <p className="text-sm text-gray-900 font-medium">{selectedPedido.cliente_nome || 'Não informado'}</p>
                    </div>
                    <div className="bg-gradient-to-br from-gray-50/80 to-gray-100/80 backdrop-blur-sm p-4 rounded-xl border border-gray-200/50">
                      <label className="text-sm font-semibold text-gray-700">Telefone</label>
                      <p className="text-sm text-gray-900 font-medium">{selectedPedido.cliente_telefone || 'Não informado'}</p>
                    </div>
                  </div>

                  {/* Informações do pedido */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-indigo-50/80 to-indigo-100/80 backdrop-blur-sm p-4 rounded-xl border border-indigo-200/50">
                      <label className="text-sm font-semibold text-indigo-700">Loja</label>
                      <p className="text-sm text-indigo-900 font-medium">{selectedPedido.loja_nome}</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50/80 to-purple-100/80 backdrop-blur-sm p-4 rounded-xl border border-purple-200/50">
                      <label className="text-sm font-semibold text-purple-700">Laboratório</label>
                      <p className="text-sm text-purple-900 font-medium">
                        {selectedPedido.laboratorio_nome}
                        {selectedPedido.laboratorio_codigo ? ` (${selectedPedido.laboratorio_codigo})` : ''}
                      </p>
                    </div>
                  </div>

                  {/* Especificações técnicas */}
                  <div className="space-y-4">
                    <div className="bg-gradient-to-br from-amber-50/80 to-amber-100/80 backdrop-blur-sm p-4 rounded-xl border border-amber-200/50">
                      <label className="text-sm font-semibold text-amber-700">Classe da Lente</label>
                      <div className="flex items-center gap-3 mt-2">
                        <div 
                          className="w-4 h-4 rounded-full shadow-md border border-white/50"
                          style={{ backgroundColor: selectedPedido.classe_cor }}
                        />
                        <span className="text-sm text-amber-900 font-medium">{selectedPedido.classe_nome}</span>
                      </div>
                    </div>
                    
                    {selectedPedido.tratamentos_nomes && (
                      <div className="bg-gradient-to-br from-teal-50/80 to-teal-100/80 backdrop-blur-sm p-4 rounded-xl border border-teal-200/50">
                        <div className="flex flex-wrap gap-2 mt-2">
                          {selectedPedido.tratamentos_nomes.split(',').map((tratamento, index) => (
                            <Badge key={index} variant="outline" className="bg-teal-100/50 border-teal-300 text-teal-700 font-medium">
                              {tratamento.trim()}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Informações financeiras - só para quem tem permissão */}
                  {permissions.canViewFinancialData() && !selectedPedido.eh_garantia && (
                    <div className="bg-gradient-to-br from-green-50/80 to-green-100/80 backdrop-blur-sm p-4 rounded-xl border border-green-200/50 space-y-4">
                      <h4 className="font-semibold text-green-800 flex items-center gap-2">💰 Informações Financeiras</h4>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/50 backdrop-blur-sm p-3 rounded-lg border border-green-200/30">
                          <label className="text-sm font-semibold text-green-700">Valor de Venda</label>
                          <p className="text-lg font-bold text-green-800">
                            {selectedPedido.valor_pedido 
                              ? `R$ ${selectedPedido.valor_pedido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                              : 'Não informado'
                            }
                          </p>
                        </div>
                        <div className="bg-white/50 backdrop-blur-sm p-3 rounded-lg border border-red-200/30">
                          <label className="text-sm font-semibold text-red-700">Custo das Lentes</label>
                          <p className="text-lg font-bold text-red-600">
                            {selectedPedido.custo_lentes 
                              ? `R$ ${selectedPedido.custo_lentes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                              : 'Não informado'
                            }
                          </p>
                        </div>
                      </div>

                      {selectedPedido.valor_pedido && selectedPedido.custo_lentes && (
                        <div className="bg-gradient-to-r from-white/80 to-green-50/80 backdrop-blur-sm p-4 rounded-xl border-2 border-green-300/50">
                          <label className="text-sm font-semibold text-gray-700">Margem de Lucro</label>
                          <div className="flex items-center justify-between">
                            <span className="text-xl font-bold text-green-600">
                              R$ {(selectedPedido.valor_pedido - selectedPedido.custo_lentes).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                            <span className={`text-lg font-semibold px-3 py-1 rounded-full ${
                              ((selectedPedido.valor_pedido - selectedPedido.custo_lentes) / selectedPedido.valor_pedido) * 100 > 50
                                ? 'bg-green-100 text-green-800'
                                : 'bg-orange-100 text-orange-800'
                            }`}>
                              {(((selectedPedido.valor_pedido - selectedPedido.custo_lentes) / selectedPedido.valor_pedido) * 100).toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Para loja - mostrar apenas valor sem custos */}
                  {!permissions.canViewFinancialData() && selectedPedido.valor_pedido && !selectedPedido.eh_garantia && (
                    <div className="bg-gradient-to-br from-blue-50/80 to-blue-100/80 backdrop-blur-sm p-4 rounded-xl border border-blue-200/50">
                      <h4 className="font-semibold text-blue-800 flex items-center gap-2">💰 Valor do Pedido</h4>
                      <p className="text-xl font-bold text-blue-900 mt-2">
                        R$ {selectedPedido.valor_pedido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  )}

                  {/* Informações de garantia */}
                  {selectedPedido.eh_garantia && (
                    <div className="bg-gradient-to-br from-orange-50/80 to-orange-100/80 backdrop-blur-sm p-4 rounded-xl border border-orange-200/50 space-y-4">
                      <h4 className="font-semibold text-orange-800 flex items-center gap-2">
                        🛡️ Informações da Garantia
                      </h4>
                      
                      {selectedPedido.observacoes_garantia && (
                        <div>
                          <label className="text-sm font-semibold text-orange-700">Detalhes da Garantia</label>
                          <p className="text-sm text-orange-900 bg-orange-100/70 backdrop-blur-sm p-3 rounded-lg mt-2 border border-orange-200/50">
                            {selectedPedido.observacoes_garantia}
                          </p>
                        </div>
                      )}

                      {permissions.canViewFinancialData() && selectedPedido.custo_lentes && (
                        <div>
                          <label className="text-sm font-semibold text-orange-700">Custo Estimado</label>
                          <p className="text-lg font-bold text-orange-800">
                            R$ {selectedPedido.custo_lentes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Datas importantes */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-slate-50/80 to-slate-100/80 backdrop-blur-sm p-4 rounded-xl border border-slate-200/50">
                      <label className="text-sm font-semibold text-slate-700">Data do Pedido</label>
                      <p className="text-sm text-slate-900 font-medium">
                        {new Date(selectedPedido.data_pedido).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-slate-50/80 to-slate-100/80 backdrop-blur-sm p-4 rounded-xl border border-slate-200/50">
                      <label className="text-sm font-semibold text-slate-700">Data Prometida</label>
                      <p className="text-sm text-slate-900 font-medium">
                        {selectedPedido.data_prometida 
                          ? new Date(selectedPedido.data_prometida).toLocaleDateString('pt-BR')
                          : 'Não definida'
                        }
                      </p>
                    </div>
                  </div>

                  {/* Observações */}
                  {selectedPedido.observacoes && (
                    <div className="bg-gradient-to-br from-gray-50/80 to-gray-100/80 backdrop-blur-sm p-4 rounded-xl border border-gray-200/50">
                      <label className="text-sm font-semibold text-gray-700">Observações Gerais</label>
                      <p className="text-sm text-gray-900 bg-white/50 backdrop-blur-sm p-3 rounded-lg mt-2 border border-gray-200/30">
                        {selectedPedido.observacoes}
                      </p>
                    </div>
                  )}

                  {/* Ações rápidas - baseadas em permissões */}
                  {permissions.canEditColumn(selectedPedido.status) && (
                    <div className="flex gap-3 pt-6 border-t border-gray-200/50">
                      {permissions.canMoveToPrev(selectedPedido.status) && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            handleRegressStatus(selectedPedido)
                            setSelectedPedido(null)
                          }}
                          className="bg-white/70 backdrop-blur-sm border-gray-300 hover:bg-white/90 transition-all duration-200"
                        >
                          <ArrowLeft className="w-4 h-4 mr-2" />
                          Voltar Status
                        </Button>
                      )}
                      
                      {permissions.canMoveToNext(selectedPedido.status) && (
                        <Button 
                          size="sm" 
                          onClick={() => {
                            handleAdvanceStatus(selectedPedido)
                            setSelectedPedido(null)
                          }}
                          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg transition-all duration-200"
                        >
                          {selectedPedido.status === 'AG_PAGAMENTO' && (
                            <>💰 Marcar Pago</>
                          )}
                          {selectedPedido.status === 'CHEGOU' && (
                            <>✅ Marcar Entregue</>
                          )}
                          {!['AG_PAGAMENTO', 'CHEGOU'].includes(selectedPedido.status) && (
                            <>
                              <ArrowRight className="w-4 h-4 mr-2" />
                              Avançar Status
                            </>
                          )}
                        </Button>
                      )}
                      
                      <Link href={`/pedidos/${selectedPedido.id}/timeline`}>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="bg-white/70 backdrop-blur-sm border-gray-300 hover:bg-white/90 transition-all duration-200"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Ver Timeline
                        </Button>
                      </Link>
                    </div>
                  )}

                  {/* Indicador de permissões no modal */}
                  <div className="bg-gradient-to-br from-gray-100/80 to-gray-200/80 backdrop-blur-sm p-4 rounded-xl border border-gray-300/50 text-xs text-gray-700">
                    <strong className="text-gray-800">Suas permissões ({userProfile?.role}):</strong>
                    <div className="mt-2 space-y-1">
                      <div>• Visualizar dados financeiros: {permissions.canViewFinancialData() ? '✅' : '❌'}</div>
                      <div>• Editar este status: {permissions.canEditColumn(selectedPedido.status) ? '✅' : '❌'}</div>
                      <div>• Criar pedidos: {permissions.canCreateOrder() ? '✅' : '❌'}</div>
                      <div>• Arrastar cards: {permissions.canDragCard(selectedPedido.status) ? '✅' : '❌'}</div>
                    </div>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* ========== LOADING ========== */}
          {loading && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-gradient-to-br from-white/95 to-gray-50/95 backdrop-blur-xl border border-white/20 shadow-2xl p-8 rounded-2xl">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-200 border-t-blue-600"></div>
                    <div className="absolute inset-0 animate-ping rounded-full h-8 w-8 border-4 border-blue-300 opacity-30"></div>
                  </div>
                  <span className="text-gray-700 font-medium text-lg">
                    {totalPedidos === 0 ? 'Carregando dados iniciais...' : 'Atualizando pedidos...'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}