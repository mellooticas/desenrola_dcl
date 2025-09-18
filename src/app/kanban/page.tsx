'use client'

// ========== IMPORTS ==========
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
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Search, Bell, Eye, ArrowLeft, ArrowRight, CheckCircle, Lock, RefreshCw, Copy, Package, AlertCircle, X, DollarSign, Clock, MapPin, Truck } from 'lucide-react'
import { useAuth } from '@/components/providers/AuthProvider'
import { PedidoCompleto, StatusPedido, PrioridadeLevel } from '@/lib/types/database'
import { STATUS_COLORS, STATUS_LABELS } from '@/lib/utils/constants'
import NovaOrdemForm from '@/components/forms/NovaOrdemForm'

// ========== TYPES E INTERFACES ==========
type KanbanColumn = {
  id: StatusPedido
  title: string
  color: string
  pedidos: PedidoCompleto[]
}

interface Laboratorio {
  id: string
  nome: string
  codigo?: string
  ativo: boolean
  sla_padrao_dias?: number
  trabalha_sabado?: boolean
}

interface Loja {
  id: string
  nome: string
  codigo: string
  endereco?: string
  telefone?: string
  gerente?: string
  ativo: boolean
}

interface UserPermissions {
  canViewColumn: (status: StatusPedido) => boolean
  canEditColumn: (status: StatusPedido) => boolean
  canDragCard: (status: StatusPedido) => boolean
  canMoveToNext: (currentStatus: StatusPedido) => boolean
  canMoveToPrev: (currentStatus: StatusPedido) => boolean
  canViewFinancialData: () => boolean
  canCreateOrder: () => boolean
  canCancelOrder: () => boolean
  getVisibleColumns: () => StatusPedido[]
  getNextStatus: (currentStatus: StatusPedido) => StatusPedido | null
  getPrevStatus: (currentStatus: StatusPedido) => StatusPedido | null
  getAllowedMoves: (currentStatus: StatusPedido) => StatusPedido[]
}

// ========== CONSTANTES ==========
const STATUS_ICONS: Record<StatusPedido, React.ComponentType<any>> = {
  'REGISTRADO': Package,
  'AG_PAGAMENTO': DollarSign,
  'PAGO': CheckCircle,
  'PRODUCAO': Package,
  'PRONTO': CheckCircle,
  'ENVIADO': Truck,
  'CHEGOU': MapPin,
  // Removidos ENTREGUE e CANCELADO - não aparecem no Kanban
  'ENTREGUE': CheckCircle, // Mantido para compatibilidade com modal
  'CANCELADO': X // Mantido para compatibilidade com modal
}

// Permissões por role
const ROLE_PERMISSIONS: Record<string, {
  visibleColumns: StatusPedido[]
  canEdit: StatusPedido[]
  canMoveFrom: Record<StatusPedido, StatusPedido[]>
  canViewFinancial: boolean
  canCreateOrder: boolean
  canCancel: boolean
}> = {
  'admin': {
    visibleColumns: ['REGISTRADO', 'AG_PAGAMENTO', 'PAGO', 'PRODUCAO', 'PRONTO', 'ENVIADO', 'CHEGOU'],
    canEdit: ['REGISTRADO', 'AG_PAGAMENTO', 'PAGO', 'PRODUCAO', 'PRONTO', 'ENVIADO', 'CHEGOU'],
    canMoveFrom: {
      'REGISTRADO': ['AG_PAGAMENTO', 'CANCELADO'],
      'AG_PAGAMENTO': ['REGISTRADO', 'PAGO', 'CANCELADO'],
      'PAGO': ['AG_PAGAMENTO', 'PRODUCAO', 'CANCELADO'],
      'PRODUCAO': ['PAGO', 'PRONTO', 'CANCELADO'],
      'PRONTO': ['PRODUCAO', 'ENVIADO', 'CANCELADO'],
      'ENVIADO': ['PRONTO', 'CHEGOU', 'CANCELADO'],
      'CHEGOU': ['ENVIADO', 'ENTREGUE', 'CANCELADO'],
      'ENTREGUE': [],
      'CANCELADO': []
    },
    canViewFinancial: true,
    canCreateOrder: true,
    canCancel: true
  },
  'gestor': {
    // Todos os 3 gestores: admin@dcl.com.br, gestor@dcl.com.br, junior@oticastatymello.com.br
    visibleColumns: ['REGISTRADO', 'AG_PAGAMENTO', 'PAGO', 'PRODUCAO', 'PRONTO', 'ENVIADO', 'CHEGOU'],
    canEdit: ['REGISTRADO', 'AG_PAGAMENTO', 'PAGO', 'PRODUCAO', 'PRONTO', 'ENVIADO', 'CHEGOU'],
    canMoveFrom: {
      'REGISTRADO': ['AG_PAGAMENTO', 'CANCELADO'],
      'AG_PAGAMENTO': ['PAGO', 'CANCELADO'],
      'PAGO': ['PRODUCAO', 'CANCELADO'],
      'PRODUCAO': ['PRONTO', 'CANCELADO'],
      'PRONTO': ['ENVIADO', 'CANCELADO'],
      'ENVIADO': ['CHEGOU', 'CANCELADO'],
      'CHEGOU': ['ENTREGUE', 'CANCELADO'], // Move para fora do Kanban
      'ENTREGUE': [],
      'CANCELADO': []
    },
    canViewFinancial: true,
    canCreateOrder: true,
    canCancel: true
  },
  'dcl': {
    // DCL Laboratório: dcl@oticastatymello.com.br
    visibleColumns: ['REGISTRADO', 'AG_PAGAMENTO', 'PAGO', 'PRODUCAO', 'PRONTO', 'ENVIADO', 'CHEGOU'],
    canEdit: ['REGISTRADO', 'PAGO', 'PRODUCAO', 'PRONTO', 'ENVIADO', 'CHEGOU'], // NÃO pode editar AG_PAGAMENTO
    canMoveFrom: {
      'REGISTRADO': ['AG_PAGAMENTO', 'CANCELADO'],
      'AG_PAGAMENTO': [], // Só visualiza, não pode mover
      'PAGO': ['PRODUCAO', 'CANCELADO'],
      'PRODUCAO': ['PRONTO', 'CANCELADO'],
      'PRONTO': ['ENVIADO', 'CANCELADO'],
      'ENVIADO': ['CHEGOU'],
      'CHEGOU': [], // Final do fluxo para DCL
      'ENTREGUE': [],
      'CANCELADO': []
    },
    canViewFinancial: false, // Pode ver AG_PAGAMENTO mas não dados financeiros sensíveis
    canCreateOrder: true,
    canCancel: true // Pode cancelar nos status que controla
  },
  'financeiro': {
    // Financeiro ESC: financeiroesc@hotmail.com
    visibleColumns: ['AG_PAGAMENTO', 'PAGO'],
    canEdit: ['AG_PAGAMENTO', 'PAGO'],
    canMoveFrom: {
      'REGISTRADO': [],
      'AG_PAGAMENTO': ['PAGO', 'CANCELADO'],
      'PAGO': ['CANCELADO'], // Pode reverter pagamento
      'PRODUCAO': [],
      'PRONTO': [],
      'ENVIADO': [],
      'CHEGOU': [],
      'ENTREGUE': [],
      'CANCELADO': []
    },
    canViewFinancial: true,
    canCreateOrder: false,
    canCancel: true // Pode cancelar questões financeiras
  },
  'loja': {
    // Operadores Lojas: lojas@oticastatymello.com.br
    visibleColumns: ['ENVIADO', 'CHEGOU'], // Removido ENTREGUE do Kanban
    canEdit: ['CHEGOU'], // NÃO pode editar ENVIADO
    canMoveFrom: {
      'REGISTRADO': [],
      'AG_PAGAMENTO': [],
      'PAGO': [],
      'PRODUCAO': [],
      'PRONTO': [],
      'ENVIADO': [], // Só visualiza
      'CHEGOU': ['ENTREGUE'], // Move para fora do Kanban
      'ENTREGUE': [],
      'CANCELADO': []
    },
    canViewFinancial: false,
    canCreateOrder: false,
    canCancel: false // Não pode cancelar
  },
  'operador': {
    visibleColumns: ['REGISTRADO', 'AG_PAGAMENTO', 'PAGO', 'PRODUCAO', 'PRONTO', 'ENVIADO', 'CHEGOU'],
    canEdit: ['REGISTRADO', 'AG_PAGAMENTO'],
    canMoveFrom: {
      'REGISTRADO': ['AG_PAGAMENTO'],
      'AG_PAGAMENTO': ['REGISTRADO', 'PAGO'],
      'PAGO': [],
      'PRODUCAO': [],
      'PRONTO': [],
      'ENVIADO': [],
      'CHEGOU': [],
      'ENTREGUE': [],
      'CANCELADO': []
    },
    canViewFinancial: false,
    canCreateOrder: true,
    canCancel: false
  }
}

// ========== HOOK DE PERMISSÕES ==========
const useUserPermissions = (userRole: string): UserPermissions => {
  const permissions = ROLE_PERMISSIONS[userRole] || ROLE_PERMISSIONS['operador']

  const getVisibleColumns = (): StatusPedido[] => {
    return permissions.visibleColumns
  }

  const canViewColumn = (status: StatusPedido): boolean => {
    return permissions.visibleColumns.includes(status)
  }

  const canEditColumn = (status: StatusPedido): boolean => {
    return permissions.canEdit.includes(status)
  }

  const canDragCard = (status: StatusPedido): boolean => {
    return permissions.canEdit.includes(status)
  }

  const getAllowedMoves = (currentStatus: StatusPedido): StatusPedido[] => {
    return permissions.canMoveFrom[currentStatus] || []
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

    const nextStatus = statusFlow[currentStatus]
    const allowedMoves = getAllowedMoves(currentStatus)

    return nextStatus && allowedMoves.includes(nextStatus) ? nextStatus : null
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

    const prevStatus = statusFlow[currentStatus]
    const allowedMoves = getAllowedMoves(currentStatus)

    return prevStatus && allowedMoves.includes(prevStatus) ? prevStatus : null
  }

  const canMoveToNext = (currentStatus: StatusPedido): boolean => {
    return getNextStatus(currentStatus) !== null
  }

  const canMoveToPrev = (currentStatus: StatusPedido): boolean => {
    return getPrevStatus(currentStatus) !== null
  }

  const canViewFinancialData = (): boolean => {
    return permissions.canViewFinancial
  }

  const canCreateOrder = (): boolean => {
    return permissions.canCreateOrder
  }

  const canCancelOrder = (): boolean => {
    return permissions.canCancel
  }

  return useMemo(() => ({
    canViewColumn,
    canEditColumn,
    canDragCard,
    canMoveToNext,
    canMoveToPrev,
    canViewFinancialData,
    canCreateOrder,
    canCancelOrder,
    getVisibleColumns,
    getNextStatus,
    getPrevStatus,
    getAllowedMoves
  }), [permissions]) // Memorizar baseado nas permissões estáticas
}

// ========== COMPONENTE PRINCIPAL ==========
export default function KanbanBoard() {
  const router = useRouter()
  // CORREÇÃO: Usar cliente Supabase centralizado do AuthProvider
  const { user, userProfile, loading: authLoading, supabase } = useAuth()

  // ========== ESTADO ==========
  const [columns, setColumns] = useState<KanbanColumn[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLoja, setSelectedLoja] = useState<string>('all')
  const [selectedLab, setSelectedLab] = useState<string>('all')
  const [laboratorios, setLaboratorios] = useState<Laboratorio[]>([])
  const [lojas, setLojas] = useState<Loja[]>([])
  const [selectedPedido, setSelectedPedido] = useState<PedidoCompleto | null>(null)

  // ========== PERMISSÕES ==========
  const userRole = userProfile?.role || 'operador'
  const permissions = useUserPermissions(userRole)

  const visibleColumns = useMemo(() => {
    const baseColumns: KanbanColumn[] = [
      { id: 'REGISTRADO', title: 'Registrado', color: STATUS_COLORS.REGISTRADO, pedidos: [] },
      { id: 'AG_PAGAMENTO', title: 'Aguard. Pagamento', color: STATUS_COLORS.AG_PAGAMENTO, pedidos: [] },
      { id: 'PAGO', title: 'Pago', color: STATUS_COLORS.PAGO, pedidos: [] },
      { id: 'PRODUCAO', title: 'Em Produção no LAB', color: STATUS_COLORS.PRODUCAO, pedidos: [] },
      { id: 'PRONTO', title: 'Lentes no DCL', color: STATUS_COLORS.PRONTO, pedidos: [] },
      { id: 'ENVIADO', title: 'Montagem', color: STATUS_COLORS.ENVIADO, pedidos: [] },
      { id: 'CHEGOU', title: 'Na Loja', color: STATUS_COLORS.CHEGOU, pedidos: [] }
      // ✅ ENTREGUE e CANCELADO removidos - gerenciados na seção de pedidos
    ]

    // Filtrar apenas baseado nas permissões (sem controles de visualização para status finais)
    return baseColumns.filter(col => permissions.canViewColumn(col.id))
  }, [permissions])

  // ========== FUNÇÕES DE DADOS ==========
  const loadPedidos = useCallback(async () => {
    if (!supabase) return
    
    try {
      setLoading(true)
      setError(null)

      const visibleStatuses = permissions.getVisibleColumns()

      // ✅ BUSCA NORMAL: Apenas pedidos operacionais (sem ENTREGUE/CANCELADO)
      let query = supabase
        .from('v_pedidos_kanban')
        .select('*')
        .not('status', 'in', '("ENTREGUE","CANCELADO")') // Excluir status finais

      // Aplicar filtros existentes
      if (selectedLoja !== 'all') {
        query = query.eq('loja_id', selectedLoja)
      }
      if (selectedLab !== 'all') {
        query = query.eq('laboratorio_id', selectedLab)
      }

      const { data: pedidosData, error } = await query

      if (error) {
        console.error('Erro Supabase ao buscar pedidos:', error)
        throw new Error(error.message)
      }

      // Filtrar por status visível no frontend
      const pedidosFiltrados = (pedidosData || []).filter((p: any) => visibleStatuses.includes(p.status))

      // Organizar pedidos por coluna
      const newColumns = visibleColumns.map(column => ({
        ...column,
        pedidos: pedidosFiltrados.filter((p: any) => p.status === column.id)
      }))

      setColumns(newColumns)
      console.log('✅ Kanban: Carregados', pedidosFiltrados.length, 'pedidos operacionais (sem ENTREGUE/CANCELADO)')
    } catch (err) {
      console.error('Erro ao carregar pedidos:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido ao carregar pedidos')

      // Fallback com colunas vazias
      const emptyColumns = visibleColumns.map(column => ({
        ...column,
        pedidos: []
      }))
      setColumns(emptyColumns)
    } finally {
      setLoading(false)
    }
  }, [supabase, permissions, selectedLoja, selectedLab, visibleColumns])

  const loadInitialData = useCallback(async () => {
    if (!supabase) return
    
    try {
      // CORREÇÃO: Usar cliente Supabase direto para melhor performance
      const [labsData, lojasData] = await Promise.all([
        supabase
          .from('laboratorios')
          .select('id, nome, codigo, ativo, sla_padrao_dias, trabalha_sabado')
          .eq('ativo', true)
          .order('nome'),
        supabase
          .from('lojas')
          .select('id, nome, codigo, endereco, telefone, gerente, ativo')
          .eq('ativo', true)
          .order('nome')
      ])

      if (labsData.error) {
        console.error('Erro ao carregar laboratórios:', labsData.error)
      } else {
        setLaboratorios(labsData.data || [])
      }

      if (lojasData.error) {
        console.error('Erro ao carregar lojas:', lojasData.error)
      } else {
        setLojas(lojasData.data || [])
      }

      await loadPedidos()
    } catch (err) {
      console.error('Erro ao carregar dados iniciais:', err)
      setError('Erro ao carregar dados iniciais')
    }
  }, [supabase, loadPedidos])

  // ========== EFFECTS ==========
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }

    if (user && supabase) {
      // Função inline para evitar dependência circular
      const loadInitialDataInline = async () => {
        try {
          const [labsData, lojasData] = await Promise.all([
            supabase
              .from('laboratorios')
              .select('id, nome, codigo, ativo, sla_padrao_dias, trabalha_sabado')
              .eq('ativo', true)
              .order('nome'),
            supabase
              .from('lojas')
              .select('id, nome, codigo, endereco, telefone, gerente, ativo')
              .eq('ativo', true)
              .order('nome')
          ])

          if (labsData.error) {
            console.error('Erro ao carregar laboratórios:', labsData.error)
          } else {
            setLaboratorios(labsData.data || [])
          }

          if (lojasData.error) {
            console.error('Erro ao carregar lojas:', lojasData.error)
          } else {
            setLojas(lojasData.data || [])
          }
        } catch (err) {
          console.error('Erro ao carregar dados iniciais:', err)
          setError('Erro ao carregar dados iniciais')
        }
      }

      loadInitialDataInline()
    }
  }, [authLoading, user, supabase, router])

  useEffect(() => {
    if (user && supabase) {
      // Função inline para evitar dependência circular  
      const loadPedidosInline = async () => {
        try {
          setLoading(true)
          setError(null)

          const visibleStatuses = permissions.getVisibleColumns()

          // ✅ BUSCA NORMAL: Apenas pedidos operacionais (sem ENTREGUE/CANCELADO)
          let query = supabase
            .from('v_pedidos_kanban')
            .select('*')
            .not('status', 'in', '("ENTREGUE","CANCELADO")') // Excluir status finais

          // Aplicar filtros existentes
          if (selectedLoja !== 'all') {
            query = query.eq('loja_id', selectedLoja)
          }
          if (selectedLab !== 'all') {
            query = query.eq('laboratorio_id', selectedLab)
          }

          const { data: pedidosData, error } = await query

          if (error) {
            console.error('Erro Supabase ao buscar pedidos:', error)
            throw new Error(error.message)
          }

          const pedidosFiltrados = (pedidosData || []).filter((p: any) => visibleStatuses.includes(p.status))

          const newColumns = visibleColumns.map(column => ({
            ...column,
            pedidos: pedidosFiltrados.filter((p: any) => p.status === column.id)
          }))

          setColumns(newColumns)
          console.log('✅ Kanban: Carregados', pedidosFiltrados.length, 'pedidos operacionais (sem ENTREGUE/CANCELADO)')
        } catch (err) {
          console.error('Erro ao carregar pedidos:', err)
          setError(err instanceof Error ? err.message : 'Erro desconhecido ao carregar pedidos')

          const emptyColumns = visibleColumns.map(column => ({
            ...column,
            pedidos: []
          }))
          setColumns(emptyColumns)
        } finally {
          setLoading(false)
        }
      }

      loadPedidosInline()
    }
  }, [user, supabase, selectedLoja, selectedLab, userRole, permissions, visibleColumns])

  // ========== FUNÇÕES DE AÇÃO ==========
  const handleDragEnd = async (result: DropResult) => {
    if (!supabase) return
    
    const { destination, source, draggableId } = result

    if (!destination) return
    if (destination.droppableId === source.droppableId && destination.index === source.index) return

    // ✅ NOVA VALIDAÇÃO: Não permitir drag para status finais (tratados pela gestão de pedidos)
    if (destination.droppableId === 'ENTREGUE' || destination.droppableId === 'CANCELADO') {
      alert('Status finais são gerenciados na seção de pedidos. Use os botões de ação do card.')
      return
    }

    const sourceColumn = columns.find(col => col.id === source.droppableId)
    const destColumn = columns.find(col => col.id === destination.droppableId)

    if (!sourceColumn || !destColumn) return

    const pedido = sourceColumn.pedidos.find(p => p.id === draggableId)
    if (!pedido) return

    // Verificar permissões
    const allowedMoves = permissions.getAllowedMoves(pedido.status)
    if (!allowedMoves.includes(destination.droppableId as StatusPedido)) {
      alert(`Você não tem permissão para mover este pedido de ${STATUS_LABELS[pedido.status]} para ${STATUS_LABELS[destination.droppableId as StatusPedido]}.`)
      return
    }

    try {
      // CORREÇÃO: Usar cliente Supabase direto para melhor performance
      const { data, error } = await supabase
        .rpc('alterar_status_pedido', {
          pedido_uuid: pedido.id,
          novo_status: destination.droppableId,
          observacao: `Movido via drag & drop de ${STATUS_LABELS[source.droppableId as StatusPedido]} para ${STATUS_LABELS[destination.droppableId as StatusPedido]}`,
          usuario: userProfile?.nome || user?.email || 'Sistema'
        })

      if (error) {
        console.error('Erro Supabase ao alterar status:', error)
        throw error
      }

      // Atualizar estado local otimisticamente
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
      console.error('Erro ao mover pedido:', error)
      alert(`Erro ao mover pedido: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
      // Recarregar dados em caso de erro
      loadPedidos()
    }
  }

  const handleAdvanceStatus = async (pedido: PedidoCompleto) => {
    if (!supabase) return
    
    const nextStatus = permissions.getNextStatus(pedido.status)
    if (!nextStatus) {
      alert('Este pedido já está no status final ou você não tem permissão para avançá-lo.')
      return
    }

    try {
      let observacao = `Avançado de ${STATUS_LABELS[pedido.status]} para ${STATUS_LABELS[nextStatus]} por ${userProfile?.nome || user?.email || 'Sistema'}`

      // CORREÇÃO: Usar cliente Supabase direto para melhor performance
      if (pedido.status === 'AG_PAGAMENTO' && nextStatus === 'PAGO') {
        const dataAtual = new Date().toISOString().split('T')[0]
        const { error } = await supabase
          .rpc('marcar_pagamento', {
            pedido_uuid: pedido.id,
            data_pagamento: dataAtual,
            forma_pagamento: 'A confirmar',
            usuario: userProfile?.nome || user?.email || 'Sistema'
          })

        if (error) throw error
      } else {
        const { error } = await supabase
          .rpc('alterar_status_pedido', {
            pedido_uuid: pedido.id,
            novo_status: nextStatus,
            observacao: observacao,
            usuario: userProfile?.nome || user?.email || 'Sistema'
          })

        if (error) throw error
      }

      await loadPedidos()
    } catch (error) {
      console.error('Erro ao avançar status:', error)
      alert(`Erro ao avançar status: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
    }
  }

  const handleRegressStatus = async (pedido: PedidoCompleto) => {
    if (!supabase) return
    
    const prevStatus = permissions.getPrevStatus(pedido.status)
    if (!prevStatus) {
      alert('Este pedido já está no status inicial ou você não tem permissão para regredi-lo.')
      return
    }

    const confirmMessage = `Tem certeza que deseja voltar de ${STATUS_LABELS[pedido.status]} para ${STATUS_LABELS[prevStatus]}?`
    if (!confirm(confirmMessage)) return

    try {
      // CORREÇÃO: Usar cliente Supabase direto para melhor performance
      const { error } = await supabase
        .rpc('alterar_status_pedido', {
          pedido_uuid: pedido.id,
          novo_status: prevStatus,
          observacao: `Regredido de ${STATUS_LABELS[pedido.status]} para ${STATUS_LABELS[prevStatus]} por ${userProfile?.nome || user?.email || 'Sistema'}`,
          usuario: userProfile?.nome || user?.email || 'Sistema'
        })

      if (error) throw error

      await loadPedidos()
    } catch (error) {
      console.error('Erro ao regredir status:', error)
      alert(`Erro ao regredir status: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
    }
  }

  const handleCancelPedido = async (pedido: PedidoCompleto) => {
    if (!supabase) return

    // Confirmação dupla para cancelamento
    const confirmCancel = confirm(`⚠️ ATENÇÃO: Tem certeza que deseja CANCELAR o pedido #${pedido.numero_sequencial}?\n\nCliente: ${pedido.cliente_nome}\nEsta ação NÃO pode ser desfeita!`)
    if (!confirmCancel) return

    const observacao = prompt('Motivo do cancelamento (obrigatório):', '')
    if (!observacao || observacao.trim() === '') {
      alert('É obrigatório informar o motivo do cancelamento.')
      return
    }

    try {
      const { error } = await supabase
        .rpc('alterar_status_pedido', {
          pedido_uuid: pedido.id,
          novo_status: 'CANCELADO',
          observacao: `PEDIDO CANCELADO: ${observacao.trim()} - Por ${userProfile?.nome || user?.email || 'Sistema'}`,
          usuario: userProfile?.nome || user?.email || 'Sistema'
        })

      if (error) throw error

      await loadPedidos()
      alert('✅ Pedido cancelado com sucesso. O pedido foi movido para a seção de gestão de pedidos.')
    } catch (error) {
      console.error('Erro ao cancelar pedido:', error)
      alert(`Erro ao cancelar pedido: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
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

  const totalPedidos = columns.reduce((acc, col) => acc + col.pedidos.length, 0)
  const totalAlertas = columns.reduce((acc, col) => acc + col.pedidos.reduce((sum, p) => sum + p.alertas_count, 0), 0)

  // ========== RENDER CARD DO PEDIDO ==========
  const renderPedidoCard = (pedido: PedidoCompleto, index: number) => {
    const canEdit = permissions.canEditColumn(pedido.status)
    const canMoveNext = permissions.canMoveToNext(pedido.status)
    const canMovePrev = permissions.canMoveToPrev(pedido.status)
    const canViewFinancial = permissions.canViewFinancialData()
    const canDrag = permissions.canDragCard(pedido.status)

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
              className={`cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md mb-3 border ${
                snapshot.isDragging ? 'rotate-2 shadow-xl border-blue-400 bg-blue-50' : 'border-gray-200 bg-white hover:bg-gray-50'
              } ${pedido.eh_garantia ? 'border-l-4 border-l-orange-500' : ''} ${
                pedido.requer_atencao ? 'border-l-4 border-l-red-500' : ''
              } ${!canEdit ? 'opacity-80' : ''}`}
              onClick={() => setSelectedPedido(pedido)}
            >
              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* Header do card */}
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs font-mono bg-white/80">
                          #{pedido.numero_sequencial}
                        </Badge>
                        {pedido.eh_garantia && (
                          <Badge variant="outline" className="text-xs bg-orange-100 text-orange-700 border-orange-300">
                            🛡️ GARANTIA
                          </Badge>
                        )}
                        {pedido.requer_atencao && (
                          <Badge variant="outline" className="text-xs bg-red-100 text-red-700 border-red-300">
                            ⚠️ ATENÇÃO
                          </Badge>
                        )}
                        {!canEdit && (
                          <Lock className="w-3 h-3 text-gray-400" />
                        )}
                      </div>
                      {/* Números de referência */}
                      <div className="space-y-1">
                        {pedido.numero_os_fisica && (
                          <div className="text-xs text-gray-600 font-mono bg-gray-100 px-2 py-1 rounded">
                            OS: {pedido.numero_os_fisica}
                          </div>
                        )}
                        {pedido.numero_pedido_laboratorio && (
<div className="text-xs text-blue-600 font-mono bg-blue-50 px-2 py-1 rounded">
                            Lab: {pedido.numero_pedido_laboratorio}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {pedido.alertas_count > 0 && (
                        <div className="flex items-center gap-1">
                          <Bell className="w-4 h-4 text-red-500" />
                          <span className="text-xs text-red-600 font-semibold">{pedido.alertas_count}</span>
                        </div>
                      )}
                      {pedido.prioridade !== 'NORMAL' && (
                        <Badge
                          variant={pedido.prioridade === 'URGENTE' ? 'destructive' : 'secondary'}
                          className={`text-xs ${
                            pedido.prioridade === 'URGENTE' ? 'bg-red-100 text-red-800 border-red-300' :
                            pedido.prioridade === 'ALTA' ? 'bg-orange-100 text-orange-800 border-orange-300' :
                            'bg-blue-100 text-blue-800 border-blue-300'
                          }`}
                        >
                          {pedido.prioridade}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Cliente */}
                  <div className="bg-gray-50 p-2 rounded-lg">
                    <p className="font-medium text-sm text-gray-900">
                      {pedido.cliente_nome || 'Cliente não informado'}
                    </p>
                    {pedido.cliente_telefone && (
                      <p className="text-xs text-gray-600 mt-1">
                        📞 {pedido.cliente_telefone}
                      </p>
                    )}
                  </div>

                  {/* Loja e Lab */}
                  <div className="grid grid-cols-1 gap-2 text-xs">
                    <div className="bg-blue-50 p-2 rounded border border-blue-200">
                      <div className="font-semibold text-blue-800">🏪 {pedido.loja_nome}</div>
                      {pedido.loja_codigo && (
                        <div className="text-blue-600">({pedido.loja_codigo})</div>
                      )}
                    </div>
                    <div className="bg-purple-50 p-2 rounded border border-purple-200">
                      <div className="font-semibold text-purple-800">🔬 {pedido.laboratorio_nome}</div>
                      {pedido.laboratorio_codigo && (
                        <div className="text-purple-600">({pedido.laboratorio_codigo})</div>
                      )}
                    </div>
                  </div>

                  {/* Classe da lente e tratamentos */}
                  <div className="space-y-2">
                    <Badge
                      style={{ backgroundColor: pedido.classe_cor || '#6B7280' }}
                      className="text-white text-xs font-medium shadow-sm"
                    >
                      {pedido.classe_nome}
                    </Badge>

                    {pedido.tratamentos_nomes && (
                      <div className="text-xs bg-teal-50 border border-teal-200 text-teal-800 px-2 py-1 rounded">
                        <strong>Tratamentos:</strong> {pedido.tratamentos_nomes}
                      </div>
                    )}
                  </div>

                  {/* Valores financeiros - só se tiver permissão */}
                  {canViewFinancial && (
                    <div className="bg-green-50 border border-green-200 p-3 rounded-lg space-y-2">
                      <h5 className="text-xs font-semibold text-green-800">💰 Financeiro</h5>
                      {pedido.valor_pedido && !pedido.eh_garantia && (
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-green-600 font-medium">Venda:</span>
                            <div className="font-bold text-green-800">
                              R$ {pedido.valor_pedido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </div>
                          </div>
                          {pedido.custo_lentes && (
                            <div>
                              <span className="text-red-600 font-medium">Custo:</span>
                              <div className="font-bold text-red-700">
                                R$ {pedido.custo_lentes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Margem de lucro */}
                      {pedido.valor_pedido && pedido.custo_lentes && !pedido.eh_garantia && (
                        <div className="bg-white/80 p-2 rounded border border-green-300">
                          <span className="text-xs text-gray-600">Margem: </span>
                          <span className={`text-sm font-bold ${
                            ((pedido.valor_pedido - pedido.custo_lentes) / pedido.valor_pedido) * 100 > 50
                              ? 'text-green-700'
                              : 'text-orange-700'
                          }`}>
                            {(((pedido.valor_pedido - pedido.custo_lentes) / pedido.valor_pedido) * 100).toFixed(1)}%
                          </span>
                        </div>
                      )}

                      {pedido.eh_garantia && pedido.custo_lentes && (
                        <div className="text-xs text-orange-700">
                          <strong>Custo Garantia:</strong> R$ {pedido.custo_lentes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Flags de atenção */}
                  <div className="flex gap-1 flex-wrap">
                    {pedido.pagamento_atrasado && (
                      <Badge variant="destructive" className="text-xs bg-red-100 text-red-800 border-red-300">
                        💳 Pag. Atrasado
                      </Badge>
                    )}
                    {pedido.producao_atrasada && (
                      <Badge variant="destructive" className="text-xs bg-orange-100 text-orange-800 border-orange-300">
                        ⏰ Prod. Atrasada
                      </Badge>
                    )}
                    {pedido.requer_atencao && (
                      <Badge variant="outline" className="text-xs bg-yellow-100 border-yellow-500 text-yellow-800">
                        ⚠️ Requer Atenção
                      </Badge>
                    )}
                  </div>

                  {/* Informações de tempo e SLA */}
                  <div className="bg-gray-100 p-2 rounded-lg text-xs space-y-1">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3 text-gray-600" />
                      <span className="text-gray-700">
                        <strong>{pedido.dias_desde_pedido}</strong> dias desde o pedido
                      </span>
                    </div>

                    {pedido.dias_para_vencer_sla !== null && pedido.dias_para_vencer_sla !== undefined && (
                      <div className={`flex items-center gap-2 ${
                        pedido.dias_para_vencer_sla < 0 ? 'text-red-600' :
                        pedido.dias_para_vencer_sla <= 1 ? 'text-orange-600' : 'text-blue-600'
                      }`}>
                        <AlertCircle className="w-3 h-3" />
                        <span className="font-medium">
                          {pedido.dias_para_vencer_sla < 0
                            ? `Vencido há ${Math.abs(pedido.dias_para_vencer_sla)} dias`
                            : `Vence em ${pedido.dias_para_vencer_sla} dias`
                          }
                        </span>
                      </div>
                    )}

                    {pedido.data_prometida && (
                      <div className="text-gray-600">
                        <strong>Prometido:</strong> {new Date(pedido.data_prometida).toLocaleDateString('pt-BR')}
                      </div>
                    )}
                  </div>

                  {/* Observações importantes */}
                  {pedido.observacoes && (
                    <div className="bg-blue-50 border border-blue-200 p-2 rounded text-xs">
                      <strong className="text-blue-800">Obs:</strong>
                      <p className="text-blue-700 mt-1">{pedido.observacoes}</p>
                    </div>
                  )}

                  {pedido.observacoes_garantia && pedido.eh_garantia && (
                    <div className="bg-orange-50 border border-orange-200 p-2 rounded text-xs">
                      <strong className="text-orange-800">Garantia:</strong>
                      <p className="text-orange-700 mt-1">{pedido.observacoes_garantia}</p>
                    </div>
                  )}

                  {/* Botões de ação - baseados em permissões */}
                  <div className="pt-2 border-t border-gray-200 space-y-2">
                    {/* Sempre mostrar botão ver detalhes */}
                    <div className="flex gap-1">
                      <Link href={`/pedidos/${pedido.id}`} className="flex-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => e.stopPropagation()}
                          className="w-full text-xs h-7 bg-white/70 hover:bg-white border-gray-300"
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          Detalhes
                        </Button>
                      </Link>
                      <Link href={`/pedidos/${pedido.id}/timeline`} className="flex-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => e.stopPropagation()}
                          className="w-full text-xs h-7 bg-blue-50 hover:bg-blue-100 border-blue-300 text-blue-700"
                        >
                          <Clock className="w-3 h-3 mr-1" />
                          Timeline
                        </Button>
                      </Link>
                    </div>

                    {/* Botões de status apenas para usuários com permissão */}
                    {canEdit && (canMoveNext || canMovePrev) && (
                      <div className="flex gap-1">
                        {canMovePrev && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleRegressStatus(pedido)
                            }}
                            className="flex-1 text-xs h-8 bg-gray-50 hover:bg-gray-100 border-gray-300"
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
                            className="flex-1 text-xs h-8 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium shadow-sm"
                          >
                            {pedido.status === 'CHEGOU' ? (
                              <>
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Finalizar
                              </>
                            ) : pedido.status === 'AG_PAGAMENTO' ? (
                              <>
                                <DollarSign className="w-3 h-3 mr-1" />
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
                      </div>
                    )}

                    {/* Badge de apenas visualização */}
                    {!canEdit && (
                      <div className="text-center">
                        <Badge variant="outline" className="text-xs text-gray-600 border-gray-400 bg-gray-50">
                          <Lock className="w-3 h-3 mr-1" />
                          Apenas Visualização ({userRole})
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </Draggable>
    )
  }

  // ========== LOADING E ERROR STATES ==========
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="text-center bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-white/20">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-700 font-medium text-lg">Verificando autenticação...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  // ========== RENDER PRINCIPAL ==========
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <main className="container mx-auto py-6 px-4">
        <div className="space-y-6">
          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="bg-red-50/80 backdrop-blur-sm border-red-200">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>{error}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setError(null)}
                  className="hover:bg-red-100"
                >
                  <X className="h-4 w-4" />
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Header do Kanban */}
          <div className="bg-gradient-to-br from-white/95 to-gray-50/95 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div className="flex items-center space-x-4">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-300" />
                  <div className="relative p-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg group-hover:scale-105 transition-transform duration-300">
                    <Package className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Kanban - {userRole.toUpperCase()}
                  </h1>
                  <p className="text-gray-600 font-medium">
                    {visibleColumns.length} colunas operacionais • {totalPedidos} pedidos ativos
                    {totalAlertas > 0 && (
                      <span className="text-red-600 font-semibold"> • {totalAlertas} alertas</span>
                    )}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Perfil: <strong>{userRole}</strong> •
                    Permissões: {permissions.canCreateOrder() ? 'Criar' : ''}
                    {permissions.canViewFinancialData() ? ' • Financeiro' : ''}
                    {permissions.canEditColumn('REGISTRADO') ? ' • Editar' : ' • Apenas Visualização'}
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

                <Link href="/pedidos">
                  <Button variant="outline" className="bg-white/70 backdrop-blur-sm border-gray-300 hover:bg-white/90">
                    📋 Ver Pedidos Concluídos
                  </Button>
                </Link>

                <Link href="/dashboard">
                  <Button variant="outline" className="bg-white/70 backdrop-blur-sm border-gray-300 hover:bg-white/90">
                    📊 Dashboard
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Filtros */}
          <div className="bg-gradient-to-br from-white/95 to-gray-50/95 backdrop-blur-xl border border-white/20 shadow-xl rounded-2xl p-6">
            {/* Filtros existentes */}
            <div className="flex flex-wrap gap-4">
            {/* Busca */}
            <div className="flex-1 min-w-[280px]">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-blue-600" />
                <Input
                  placeholder="Buscar por número, cliente, loja, OS, pedido lab..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/70 backdrop-blur-sm border-gray-300 hover:bg-white/90 transition-all duration-200"
                />
              </div>
            </div>

            {/* Filtro Loja */}
            {lojas.length > 0 && (
              <Select value={selectedLoja} onValueChange={setSelectedLoja}>
                <SelectTrigger className="w-[220px] bg-white/70 backdrop-blur-sm border-gray-300 hover:bg-white/90 transition-all duration-200">
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
            )}

            {/* Filtro Laboratório */}
            {laboratorios.length > 0 && (
              <Select value={selectedLab} onValueChange={setSelectedLab}>
                <SelectTrigger className="w-[220px] bg-white/70 backdrop-blur-sm border-gray-300 hover:bg-white/90 transition-all duration-200">
                  <SelectValue placeholder="Todos os labs" />
                </SelectTrigger>
                <SelectContent className="bg-white/95 backdrop-blur-lg border-white/20">
                  <SelectItem value="all">Todos os laboratórios</SelectItem>
                  {laboratorios.map(lab => (
                    <SelectItem key={lab.id} value={lab.id}>
                      {lab.nome} {lab.codigo && `(${lab.codigo})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            </div>
          </div>          {/* ========== KANBAN BOARD ========== */}
          <div className="flex-1 overflow-x-auto py-2">
            <DragDropContext onDragEnd={handleDragEnd}>
              <div className="flex gap-6 min-w-max px-2">
                {filteredColumns.map(column => {
                  const IconComponent = STATUS_ICONS[column.id]
                  return (
                    <div key={column.id} className="w-80 flex-shrink-0">
                      <div className="bg-gradient-to-br from-white/95 to-gray-50/95 backdrop-blur-xl border border-white/20 shadow-xl rounded-2xl overflow-hidden">
                        {/* Header da coluna */}
                        <div
                          className="p-4 bg-gradient-to-r from-white/50 to-transparent backdrop-blur-sm border-b border-white/20"
                          style={{
                            borderTopColor: column.color,
                            borderTopWidth: '4px',
                            borderTopStyle: 'solid'
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div
                                className="p-2 rounded-lg shadow-sm"
                                style={{ backgroundColor: `${column.color}20`, color: column.color }}
                              >
                                <IconComponent className="w-4 h-4" />
                              </div>
                              <h3 className="font-bold text-gray-900 text-base">{column.title}</h3>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant="secondary"
                                className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-700 border-blue-200 font-semibold"
                              >
                                {column.pedidos.length}
                              </Badge>
                              {!permissions.canEditColumn(column.id) && (
                                <div className="p-1 bg-gray-300/50 rounded-lg" title="Apenas visualização">
                                  <Lock className="w-4 h-4 text-gray-500" />
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Resumo da coluna */}
                          {column.pedidos.length > 0 && (
                            <div className="mt-2 text-xs text-gray-600">
                              {permissions.canViewFinancialData() && (
                                <div className="flex gap-4">
                                  <span>
                                    💰 R$ {column.pedidos
                                      .filter(p => p.valor_pedido && !p.eh_garantia)
                                      .reduce((sum, p) => sum + (p.valor_pedido || 0), 0)
                                      .toLocaleString('pt-BR', { minimumFractionDigits: 0 })
                                    }
                                  </span>
                                  {column.pedidos.some(p => p.alertas_count > 0) && (
                                    <span className="text-red-600 font-medium">
                                      🚨 {column.pedidos.reduce((sum, p) => sum + p.alertas_count, 0)} alertas
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
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
                              className={`p-4 min-h-[500px] space-y-3 transition-all duration-300 ${
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
                                <div className="text-center text-gray-500 text-sm mt-20 p-8">
                                  <div className="bg-gradient-to-br from-gray-100/50 to-gray-200/50 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50">
                                    <IconComponent className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                    <p className="font-medium text-gray-600">Nenhum pedido</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                      {!permissions.canEditColumn(column.id) && "Sem permissão para editar"}
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </Droppable>
                      </div>
                    </div>
                  )
                })}
              </div>
            </DragDropContext>
          </div>

          {/* ========== MODAL DE DETALHES SIMPLIFICADO ========== */}
          <Dialog open={!!selectedPedido} onOpenChange={() => setSelectedPedido(null)}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  Pedido #{selectedPedido?.numero_sequencial}
                </DialogTitle>
                <DialogDescription>
                  Detalhes do pedido - Perfil: {userRole.toUpperCase()}
                </DialogDescription>
              </DialogHeader>

              {selectedPedido && (
                <div className="space-y-4">
                  {/* Status atual */}
                  <div className="flex items-center gap-3">
                    <Badge
                      style={{ backgroundColor: STATUS_COLORS[selectedPedido.status] }}
                      className="text-white"
                    >
                      {STATUS_LABELS[selectedPedido.status]}
                    </Badge>
                    {selectedPedido.eh_garantia && (
                      <Badge className="bg-orange-100 text-orange-800 border-orange-300">
                        GARANTIA
                      </Badge>
                    )}
                  </div>

                  {/* Informações básicas */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <label className="text-sm font-medium text-gray-700">Cliente</label>
                      <p className="text-sm">{selectedPedido.cliente_nome || 'Não informado'}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <label className="text-sm font-medium text-gray-700">Telefone</label>
                      <p className="text-sm">{selectedPedido.cliente_telefone || 'Não informado'}</p>
                    </div>
                  </div>

                  {/* Informações do pedido */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-indigo-50 p-3 rounded-lg">
                      <label className="text-sm font-medium text-indigo-700">Loja</label>
                      <p className="text-sm text-indigo-900">{selectedPedido.loja_nome}</p>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <label className="text-sm font-medium text-purple-700">Laboratório</label>
                      <p className="text-sm text-purple-900">
                        {selectedPedido.laboratorio_nome}
                        {selectedPedido.laboratorio_codigo && ` (${selectedPedido.laboratorio_codigo})`}
                      </p>
                    </div>
                  </div>

                  {/* Especificações técnicas */}
{/* Especificações técnicas */}
                  <div className="bg-amber-50 p-3 rounded-lg">
                    <label className="text-sm font-medium text-amber-700">Classe da Lente</label>
                    <div className="flex items-center gap-3 mt-2">
                      <div 
                        className="w-4 h-4 rounded-full shadow-md border border-white"
                        style={{ backgroundColor: selectedPedido.classe_cor || '#6B7280' }}
                      />
                      <span className="text-sm text-amber-900">{selectedPedido.classe_nome}</span>
                    </div>
                    
                    {selectedPedido.tratamentos_nomes && (
                      <div className="mt-2">
                        <span className="text-xs text-teal-700 bg-teal-100 px-2 py-1 rounded">
                          Tratamentos: {selectedPedido.tratamentos_nomes}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Informações financeiras - só para quem tem permissão */}
                  {permissions.canViewFinancialData() && (
                    <div className="bg-green-50 p-3 rounded-lg space-y-3">
                      <h4 className="font-medium text-green-800">Informações Financeiras</h4>
                      
                      {selectedPedido.eh_garantia ? (
                        <div className="text-center">
                          <Badge className="bg-orange-100 text-orange-800 border-orange-300">
                            PEDIDO DE GARANTIA
                          </Badge>
                          {selectedPedido.custo_lentes && (
                            <div className="mt-2">
                              <label className="text-sm font-medium text-orange-700">Custo Estimado</label>
                              <p className="text-lg font-bold text-orange-800">
                                R$ {selectedPedido.custo_lentes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-3">
                          {selectedPedido.valor_pedido && (
                            <div>
                              <label className="text-sm font-medium text-green-700">Valor de Venda</label>
                              <p className="text-lg font-bold text-green-800">
                                R$ {selectedPedido.valor_pedido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </p>
                            </div>
                          )}
                          {selectedPedido.custo_lentes && (
                            <div>
                              <label className="text-sm font-medium text-red-700">Custo das Lentes</label>
                              <p className="text-lg font-bold text-red-700">
                                R$ {selectedPedido.custo_lentes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {selectedPedido.forma_pagamento && (
                        <div className="bg-blue-50 p-2 rounded">
                          <label className="text-sm font-medium text-blue-700">Forma de Pagamento</label>
                          <p className="text-sm text-blue-900">{selectedPedido.forma_pagamento}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Datas importantes */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <label className="text-sm font-medium text-slate-700">Data do Pedido</label>
                      <p className="text-sm">{new Date(selectedPedido.data_pedido).toLocaleDateString('pt-BR')}</p>
                      <p className="text-xs text-slate-600">{selectedPedido.dias_desde_pedido} dias atrás</p>
                    </div>
                    {selectedPedido.data_prometida && (
                      <div className="bg-slate-50 p-3 rounded-lg">
                        <label className="text-sm font-medium text-slate-700">Data Prometida</label>
                        <p className="text-sm">{new Date(selectedPedido.data_prometida).toLocaleDateString('pt-BR')}</p>
                      </div>
                    )}
                  </div>

                  {/* SLA */}
                  {selectedPedido.dias_para_vencer_sla !== null && selectedPedido.dias_para_vencer_sla !== undefined && (
                    <div className={`p-3 rounded-lg text-center ${
                      selectedPedido.dias_para_vencer_sla < 0 ? 'bg-red-100' : 
                      selectedPedido.dias_para_vencer_sla <= 1 ? 'bg-orange-100' : 'bg-blue-100'
                    }`}>
                      <label className="text-sm font-medium">Status SLA</label>
                      <p className="font-bold">
                        {selectedPedido.dias_para_vencer_sla < 0 
                          ? `Vencido há ${Math.abs(selectedPedido.dias_para_vencer_sla)} dias` 
                          : `Vence em ${selectedPedido.dias_para_vencer_sla} dias`
                        }
                      </p>
                    </div>
                  )}

                  {/* Observações */}
                  {selectedPedido.observacoes && (
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <label className="text-sm font-medium text-blue-700">Observações</label>
                      <p className="text-sm text-blue-800 mt-1">{selectedPedido.observacoes}</p>
                    </div>
                  )}

                  {selectedPedido.observacoes_garantia && selectedPedido.eh_garantia && (
                    <div className="bg-orange-50 p-3 rounded-lg">
                      <label className="text-sm font-medium text-orange-700">Observações da Garantia</label>
                      <p className="text-sm text-orange-800 mt-1">{selectedPedido.observacoes_garantia}</p>
                    </div>
                  )}

                  {/* Ações */}
                  <div className="flex gap-3 pt-4 border-t">
                    <Link href={`/pedidos/${selectedPedido.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        Ver Página Completa
                      </Button>
                    </Link>
                    
                    <Link href={`/pedidos/${selectedPedido.id}/timeline`}>
                      <Button variant="outline" size="sm" className="bg-blue-50 border-blue-300 text-blue-700">
                        <Clock className="w-4 h-4 mr-2" />
                        Ver Timeline
                      </Button>
                    </Link>
                    
                    {permissions.canEditColumn(selectedPedido.status) && (
                      <>
                        {permissions.canMoveToPrev(selectedPedido.status) && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              handleRegressStatus(selectedPedido)
                              setSelectedPedido(null)
                            }}
                          >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Voltar
                          </Button>
                        )}
                        
                        {permissions.canMoveToNext(selectedPedido.status) && (
                          <Button 
                            size="sm" 
                            onClick={() => {
                              handleAdvanceStatus(selectedPedido)
                              setSelectedPedido(null)
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            {selectedPedido.status === 'AG_PAGAMENTO' && (
                              <>
                                <DollarSign className="w-4 h-4 mr-2" />
                                Marcar Pago
                              </>
                            )}
                            {selectedPedido.status === 'CHEGOU' && (
                              <>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Marcar Entregue
                              </>
                            )}
                            {!['AG_PAGAMENTO', 'CHEGOU'].includes(selectedPedido.status) && (
                              <>
                                <ArrowRight className="w-4 h-4 mr-2" />
                                Avançar
                              </>
                            )}
                          </Button>
                        )}
                      </>
                    )}
                  </div>

                  {/* ✅ NOVA SEÇÃO: Ação de Cancelamento */}
                  {permissions.canEditColumn(selectedPedido.status) && selectedPedido.status !== 'CANCELADO' && (
                    <div className="flex justify-center pt-3 border-t border-red-200">
                      <Button 
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          handleCancelPedido(selectedPedido)
                          setSelectedPedido(null)
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white font-semibold"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancelar Pedido
                      </Button>
                    </div>
                  )}

                  {/* Indicador de permissões */}
                  <div className="bg-gray-100 p-3 rounded-lg text-xs text-gray-600">
                    <strong>Suas permissões ({userRole}):</strong>
                    <div className="mt-1 space-y-1">
                      <div>• Dados financeiros: {permissions.canViewFinancialData() ? '✅' : '❌'}</div>
                      <div>• Editar este status: {permissions.canEditColumn(selectedPedido.status) ? '✅' : '❌'}</div>
                      <div>• Criar pedidos: {permissions.canCreateOrder() ? '✅' : '❌'}</div>
                    </div>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* ========== LOADING OVERLAY ========== */}
          {loading && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-xl shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-200 border-t-blue-600"></div>
                  <span className="text-gray-700 font-medium">
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