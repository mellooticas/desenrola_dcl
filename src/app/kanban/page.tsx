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

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Search, Bell, Eye, ArrowLeft, ArrowRight, CheckCircle, Lock, RefreshCw, Copy, Package, AlertCircle, X, DollarSign, Clock, MapPin, Truck } from 'lucide-react'
import { useAuth } from '@/components/providers/AuthProvider'
import { PedidoCompleto, StatusPedido, PrioridadeLevel, Montador } from '@/lib/types/database'
import { STATUS_COLORS, STATUS_LABELS } from '@/lib/utils/constants'
import NovaOrdemForm from '@/components/forms/NovaOrdemForm'
import { KanbanCard } from '@/components/kanban/KanbanCard'
import { PedidoDetailDrawer } from '@/components/kanban/PedidoDetailDrawer'
import { usePermissions } from '@/lib/hooks/use-user-permissions'
import { DemoModeAlert } from '@/components/permissions/DemoModeAlert'

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
    canEdit: ['REGISTRADO', 'PAGO', 'PRODUCAO', 'PRONTO', 'ENVIADO'], // NÃO pode editar AG_PAGAMENTO nem CHEGOU (é da loja)
    canMoveFrom: {
      'REGISTRADO': ['AG_PAGAMENTO', 'CANCELADO'],
      'AG_PAGAMENTO': [], // Só visualiza, não pode mover (responsabilidade do financeiro)
      'PAGO': ['PRODUCAO', 'CANCELADO'],
      'PRODUCAO': ['PRONTO', 'CANCELADO'],
      'PRONTO': ['ENVIADO', 'CANCELADO'],
      'ENVIADO': ['CHEGOU', 'CANCELADO'],
      'CHEGOU': [], // Só visualiza, não pode mover (responsabilidade da loja)
      'ENTREGUE': [],
      'CANCELADO': []
    },
    canViewFinancial: false, // Pode ver AG_PAGAMENTO mas não dados financeiros sensíveis
    canCreateOrder: true,
    canCancel: true // Pode cancelar nos status que controla
  },
  'financeiro': {
    // Financeiro ESC: financeiroesc@hotmail.com
    visibleColumns: ['REGISTRADO', 'AG_PAGAMENTO', 'PAGO'], // Precisa ver REGISTRADO para acompanhar fluxo
    canEdit: ['AG_PAGAMENTO', 'PAGO'],
    canMoveFrom: {
      'REGISTRADO': [], // Só visualiza
      'AG_PAGAMENTO': ['PAGO', 'CANCELADO'], // Move para PAGO quando recebe pagamento
      'PAGO': ['AG_PAGAMENTO', 'CANCELADO'], // Pode reverter pagamento se necessário
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
    visibleColumns: ['ENVIADO', 'CHEGOU'], // Só vê final do fluxo
    canEdit: ['CHEGOU'], // Só pode editar CHEGOU para entregar
    canMoveFrom: {
      'REGISTRADO': [],
      'AG_PAGAMENTO': [],
      'PAGO': [],
      'PRODUCAO': [],
      'PRONTO': [],
      'ENVIADO': [], // Só visualiza (aguardando chegada)
      'CHEGOU': ['ENTREGUE', 'CANCELADO'], // Move para ENTREGUE quando cliente busca
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
  
  // ========== PERMISSÕES DEMO ==========
  const demoPermissions = usePermissions()

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
  const [isHydrated, setIsHydrated] = useState(false)

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

  // ========== EFFECT DE HIDRATAÇÃO ==========
  useEffect(() => {
    setIsHydrated(true)
  }, [])

  // ========== FUNÇÕES DE AÇÃO ==========
  const handleDragEnd = async (result: DropResult) => {
    // 🔒 PROTEÇÃO DEMO: Bloquear drag & drop
    if (demoPermissions.isDemo) {
      alert('👁️ Modo Visualização: Você não pode mover cards no Kanban.');
      return;
    }
    
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
    console.log('🔍 handleAdvanceStatus - Debug:', {
      pedidoId: pedido.id,
      statusAtual: pedido.status,
      proximoStatus: nextStatus,
      allowedMoves: permissions.getAllowedMoves(pedido.status),
      userRole: userRole
    })
    
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

        if (error) {
          console.error('❌ Erro ao marcar pagamento:', error)
          throw error
        }
      } else {
        const { error } = await supabase
          .rpc('alterar_status_pedido', {
            pedido_uuid: pedido.id,
            novo_status: nextStatus,
            observacao: observacao,
            usuario: userProfile?.nome || user?.email || 'Sistema'
          })

        if (error) {
          console.error('❌ Erro ao alterar status:', error)
          throw error
        }
      }

      console.log('✅ Status avançado com sucesso!')
      await loadPedidos()
    } catch (error) {
      console.error('❌ Erro ao avançar status:', error)
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

  const handleSelectMontador = async (pedidoId: string, montador: Montador) => {
    if (!supabase) return

    try {
      const { error } = await supabase
        .from('pedidos')
        .update({
          montador_id: montador.id,
          montador_nome: montador.nome,
          montador_local: montador.local,
          montador_contato: montador.contato,
          custo_montagem: montador.preco_base,
          data_montagem: new Date().toISOString()
        })
        .eq('id', pedidoId)

      if (error) throw error

      await loadPedidos()
      alert(`✅ Montador ${montador.nome} selecionado com sucesso!`)
    } catch (error) {
      console.error('Erro ao selecionar montador:', error)
      alert(`Erro ao selecionar montador: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
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
            className="mb-3"
          >
            <KanbanCard
              pedido={pedido}
              onClick={() => setSelectedPedido(pedido)}
              isDragging={snapshot.isDragging}
              onMoveLeft={canMovePrev ? () => handleRegressStatus(pedido) : undefined}
              onMoveRight={canMoveNext ? () => handleAdvanceStatus(pedido) : undefined}
              canMoveLeft={canMovePrev && canEdit}
              canMoveRight={canMoveNext && canEdit}
            />
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
          {/* 🔒 ALERTA MODO DEMO */}
          <DemoModeAlert message="Você pode visualizar o Kanban, mas não pode mover cards ou criar pedidos." />
          
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

                {/* 🔒 PROTEÇÃO: Ocultar botão de criar para demo */}
                {permissions.canCreateOrder() && !demoPermissions.isDemo && (
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
                          {column.pedidos.length > 0 && isHydrated && (
                            <div className="mt-2 text-xs text-gray-600">
                              {permissions.canViewFinancialData() && (
                                <div className="flex gap-4">
                                  <span>
                                    💰 R$ {column.pedidos
                                      .filter(p => p.custo_lentes && !p.eh_garantia)
                                      .reduce((sum, p) => sum + (p.custo_lentes || 0), 0)
                                      .toLocaleString('pt-BR', { minimumFractionDigits: 0 })
                                    } <span className="text-orange-600">(custo)</span>
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

          {/* ========== DRAWER DE DETALHES PROFISSIONAL ========== */}
          <PedidoDetailDrawer
            pedido={selectedPedido}
            isOpen={!!selectedPedido}
            onClose={() => setSelectedPedido(null)}
            onAdvanceStatus={handleAdvanceStatus}
            onRegressStatus={handleRegressStatus}
            onCancelPedido={handleCancelPedido}
            onSelectMontador={handleSelectMontador}
            canMoveNext={selectedPedido ? permissions.canMoveToNext(selectedPedido.status) : false}
            canMovePrev={selectedPedido ? permissions.canMoveToPrev(selectedPedido.status) : false}
            canCancel={selectedPedido ? permissions.canEditColumn(selectedPedido.status) && selectedPedido.status !== 'CANCELADO' : false}
            nextStatusLabel={
              selectedPedido?.status === 'AG_PAGAMENTO' ? 'Marcar Pago' :
              selectedPedido?.status === 'CHEGOU' ? 'Marcar Entregue' :
              'Avançar'
            }
            prevStatusLabel="Voltar"
          />

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