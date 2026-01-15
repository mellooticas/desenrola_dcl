'use client'

// ========== IMPORTS ==========
import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { useQueryClient } from '@tanstack/react-query'
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
import { cn } from '@/lib/utils'
import NovaOrdemForm from '@/components/forms/NovaOrdemForm'
import { KanbanCard } from '@/components/kanban/KanbanCard'
import { KanbanCardModern } from '@/components/kanban/KanbanCardModern'
import { KanbanColumnHeader } from '@/components/kanban/KanbanColumnHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton'
import { PedidoDetailDrawer } from '@/components/kanban/PedidoDetailDrawer'
import { usePermissions } from '@/lib/hooks/use-user-permissions'
import { DemoModeAlert } from '@/components/permissions/DemoModeAlert'
import { calcularUrgenciaPagamento, getPrioridadeOrdenacao, verificarFiltroPrazo, type NivelUrgencia, type FiltroPrazo } from '@/lib/utils/urgencia-pagamento'
import { MontadorSelectorDialog } from '@/components/kanban/MontadorSelectorDialog'

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
  canRevertStatus: boolean // ADMIN: Permissão para reverter status
}

// ========== CONSTANTES ==========
const STATUS_ICONS: Record<StatusPedido, React.ComponentType<any>> = {
  'PENDENTE': Clock, // 🆕 Novo status para DCL escolher lente
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

// Gradientes por status para modernização
const STATUS_GRADIENTS: Record<StatusPedido, string> = {
  'PENDENTE': 'from-slate-400 to-slate-500', // 🆕 Novo status
  'REGISTRADO': 'from-blue-500 to-cyan-500',
  'AG_PAGAMENTO': 'from-yellow-500 to-amber-500',
  'PAGO': 'from-green-500 to-emerald-500',
  'PRODUCAO': 'from-orange-500 to-red-500',
  'PRONTO': 'from-purple-500 to-pink-500',
  'ENVIADO': 'from-indigo-500 to-blue-500',
  'CHEGOU': 'from-teal-500 to-cyan-500',
  'ENTREGUE': 'from-green-600 to-emerald-600',
  'CANCELADO': 'from-gray-500 to-slate-500'
}

// Mapeamento lab → gradiente
const LAB_GRADIENTS: Record<string, string> = {
  'Essilor': 'from-blue-500 to-cyan-500',
  'Zeiss': 'from-purple-500 to-pink-500',
  'Hoya': 'from-green-500 to-emerald-500',
  'default': 'from-gray-500 to-slate-500'
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
    visibleColumns: ['PENDENTE', 'REGISTRADO', 'AG_PAGAMENTO', 'PAGO', 'PRODUCAO', 'PRONTO', 'ENVIADO', 'CHEGOU'],
    canEdit: ['PENDENTE', 'REGISTRADO', 'AG_PAGAMENTO', 'PAGO', 'PRODUCAO', 'PRONTO', 'ENVIADO', 'CHEGOU'],
    canMoveFrom: {
      'PENDENTE': ['REGISTRADO', 'CANCELADO'], // 🆕 DCL escolhe lente → registra
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
    visibleColumns: ['PENDENTE', 'REGISTRADO', 'AG_PAGAMENTO', 'PAGO', 'PRODUCAO', 'PRONTO', 'ENVIADO', 'CHEGOU'],
    canEdit: ['PENDENTE', 'REGISTRADO', 'AG_PAGAMENTO', 'PAGO', 'PRODUCAO', 'PRONTO', 'ENVIADO', 'CHEGOU'],
    canMoveFrom: {
      'PENDENTE': ['REGISTRADO', 'CANCELADO'], // 🆕 DCL escolhe lente → registra
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
    visibleColumns: ['PENDENTE', 'REGISTRADO', 'AG_PAGAMENTO', 'PAGO', 'PRODUCAO', 'PRONTO', 'ENVIADO', 'CHEGOU'],
    canEdit: ['PENDENTE', 'REGISTRADO', 'PAGO', 'PRODUCAO', 'PRONTO', 'ENVIADO'], // NÃO pode editar AG_PAGAMENTO nem CHEGOU
    canMoveFrom: {
      'PENDENTE': ['REGISTRADO', 'CANCELADO'], // 🆕 DCL escolhe lente → registra
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
      'PENDENTE': [], // Só visualiza se tiver acesso
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
      'PENDENTE': [],
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
      'PENDENTE': [],
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
  const globalPermissions = usePermissions() // Hook global para canRevertStatus
  
  return useMemo(() => {
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
        'PENDENTE': 'REGISTRADO',
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
        'PENDENTE': null,
        'REGISTRADO': 'PENDENTE',
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

    return {
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
      getAllowedMoves,
      canRevertStatus: globalPermissions.canRevertStatus
    }
  }, [userRole, globalPermissions.canRevertStatus])
}

// ========== COMPONENTE PRINCIPAL ==========
export default function KanbanBoard() {
  console.log('🎨 KanbanBoard: Render')

  const router = useRouter()
  const queryClient = useQueryClient() // Para invalidar queries de alertas
  // CORREÇÃO: Usar cliente Supabase centralizado do AuthProvider
  const { user, userProfile, loading: authLoading, supabase } = useAuth()
  
  useEffect(() => {
    console.log('🎨 KanbanBoard: Auth State Changed', { 
      hasUser: !!user, 
      userId: user?.id,
      authLoading 
    })
  }, [user, authLoading])
  
  // ========== PERMISSÕES DEMO ==========
  const demoPermissions = usePermissions()

  // ========== ESTADO ==========
  const [columns, setColumns] = useState<KanbanColumn[]>([])
  const [loading, setLoading] = useState(true)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLoja, setSelectedLoja] = useState<string>('all')
  const [selectedLab, setSelectedLab] = useState<string>('all')
  const [laboratorios, setLaboratorios] = useState<Laboratorio[]>([])
  const [lojas, setLojas] = useState<Loja[]>([])
  const [selectedPedido, setSelectedPedido] = useState<PedidoCompleto | null>(null)
  const [isHydrated, setIsHydrated] = useState(false)
  const [filtroUrgencia, setFiltroUrgencia] = useState<NivelUrgencia | null>(null) // NOVO: Filtro de urgência
  const [filtroPrazo, setFiltroPrazo] = useState<FiltroPrazo>(null) // NOVO: Filtro de prazo
  
  // ========== ESTADO DO MODAL DE MONTADOR ==========
  const [showMontadorDialog, setShowMontadorDialog] = useState(false)
  const [pendingMove, setPendingMove] = useState<{
    pedido: PedidoCompleto
    destination: string
    source: string
  } | null>(null)

  // ========== PERMISSÕES ==========
  const userRole = userProfile?.role || 'operador'
  const permissions = useUserPermissions(userRole)

  const visibleColumns = useMemo(() => {
    const baseColumns: KanbanColumn[] = [
      { id: 'PENDENTE', title: 'Pendente - DCL', color: '#94a3b8', pedidos: [] }, // 🆕 Novo
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
    console.log('🎨 KanbanBoard: loadPedidos START')
    if (!supabase) {
      console.log('🎨 KanbanBoard: loadPedidos ABORT (No Supabase)')
      return
    }
    
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
      const newColumns = visibleColumns.map(column => {
        let pedidosColuna = pedidosFiltrados.filter((p: any) => p.status === column.id)
        
        // FILTRAGEM E ORDENAÇÃO INTELIGENTE PARA AG_PAGAMENTO
        if (column.id === 'AG_PAGAMENTO') {
          // FILTRO DE URGÊNCIA
          if (filtroUrgencia) {
            pedidosColuna = pedidosColuna.filter(p => {
              const urgencia = calcularUrgenciaPagamento(p.data_prometida, p.data_pedido)
              return urgencia.nivel === filtroUrgencia
            })
          }
          
          // FILTRO DE PRAZO
          if (filtroPrazo) {
            pedidosColuna = pedidosColuna.filter(p => {
              const urgencia = calcularUrgenciaPagamento(p.data_prometida, p.data_pedido)
              return verificarFiltroPrazo(urgencia, filtroPrazo)
            })
          }
          
          // ORDENAÇÃO POR URGÊNCIA (após filtros)
          pedidosColuna = pedidosColuna.sort((a, b) => {
            const urgenciaA = calcularUrgenciaPagamento(a.data_prometida, a.data_pedido)
            const urgenciaB = calcularUrgenciaPagamento(b.data_prometida, b.data_pedido)
            
            // Ordenar por prioridade (CRITICO → URGENTE → ATENCAO → FOLGA)
            const prioA = getPrioridadeOrdenacao(urgenciaA.nivel)
            const prioB = getPrioridadeOrdenacao(urgenciaB.nivel)
            
            if (prioA !== prioB) {
              return prioA - prioB // Menor prioridade = mais urgente
            }
            
            // Se mesma urgência, ordenar por dias restantes (menor primeiro)
            return urgenciaA.diasRestantes - urgenciaB.diasRestantes
          })
        }
        
        return {
          ...column,
          pedidos: pedidosColuna
        }
      })

      setColumns(newColumns)
      console.log('✅ Kanban: Carregados', pedidosFiltrados.length, 'pedidos operacionais')
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
      setIsInitialLoading(false)
    }
  }, [supabase, permissions, selectedLoja, selectedLab, visibleColumns, filtroUrgencia, filtroPrazo])

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
      loadPedidos()
    }
  }, [user, supabase, loadPedidos])

  // ========== EFFECT DE HIDRATAÇÃO ==========
  useEffect(() => {
    setIsHydrated(true)
  }, [])

  // ========== DEBUG: MONITORAR ESTADO DO MODAL ==========
  useEffect(() => {
    console.log('🔔 Estado do Modal de Montador:', {
      showMontadorDialog,
      hasPendingMove: !!pendingMove,
      pedidoNumero: pendingMove?.pedido.numero_sequencial
    })
  }, [showMontadorDialog, pendingMove])

  // ========== FUNÇÕES DE AÇÃO ==========
  
  // 🔄 Função para mover pedido para próximo status via botão
  const handleMoveToNextStatus = async (pedido: PedidoCompleto) => {
    console.log('⏩ handleMoveToNextStatus CHAMADO!', { pedidoId: pedido.id, status: pedido.status })
    
    if (demoPermissions.isDemo) {
      alert('👁️ Modo Visualização: Você não pode mover cards.');
      return;
    }
    
    if (!supabase) return;
    
    const allowedMoves = permissions.getAllowedMoves(pedido.status);
    const nextStatus = allowedMoves[0]; // Pega o primeiro status permitido
    
    console.log('🔍 Próximo status:', nextStatus)
    
    if (!nextStatus) {
      alert('Não há próximo status disponível para este pedido.');
      return;
    }

    // 🔒 VALIDAÇÃO: Se avançando para ENVIADO (Montagem), exigir montador
    if (nextStatus === 'ENVIADO') {
      console.log('🔍 Validando montador para ENVIADO/Montagem (botão):', {
        pedidoId: pedido.id,
        numeroSequencial: pedido.numero_sequencial,
        montadorId: pedido.montador_id
      })

      // SEMPRE abrir modal para ENVIADO/Montagem
      setPendingMove({
        pedido,
        destination: nextStatus,
        source: pedido.status
      })
      setShowMontadorDialog(true)
      console.log('✅ Modal ativado via botão!')
      return
    }
    
    try {
      const { error } = await supabase
        .rpc('alterar_status_pedido', {
          pedido_uuid: pedido.id,
          novo_status: nextStatus,
          observacao: `Avançado de ${STATUS_LABELS[pedido.status]} para ${STATUS_LABELS[nextStatus]} via botão`,
          usuario: userProfile?.nome || user?.email || 'Sistema'
        });
      
      if (error) throw error;
      
      // Invalidar queries de alertas para forçar atualização imediata
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'alertas_criticos'] })
      
      // Recarregar dados
      await loadPedidos();
    } catch (error) {
      console.error('Erro ao mover pedido:', error);
      alert(`Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };

  const handleRevertStatus = async (pedido: any) => {
    // 🔒 PROTEÇÃO DEMO
    if (demoPermissions.isDemo) {
      alert('👁️ Modo Visualização: Você não pode reverter status.');
      return;
    }

    if (!supabase) return;

    // Mapeamento reverso de status (baseado no fluxo real do sistema)
    const reverseFlow: Record<StatusPedido, StatusPedido | null> = {
      'PENDENTE': null, // Início do fluxo, não pode reverter
      'REGISTRADO': 'PENDENTE',
      'AG_PAGAMENTO': 'REGISTRADO',
      'PAGO': 'AG_PAGAMENTO',
      'PRODUCAO': 'PAGO',
      'PRONTO': 'PRODUCAO',
      'ENVIADO': 'PRONTO',
      'CHEGOU': 'ENVIADO',
      'ENTREGUE': 'CHEGOU',
      'CANCELADO': null // Status final, não pode reverter
    };

    const previousStatus = reverseFlow[pedido.status as StatusPedido];

    if (!previousStatus) {
      alert('Este status não pode ser revertido.');
      return;
    }

    // Confirmação
    const currentStatus = pedido.status as StatusPedido;
    const confirmMessage = `⚠️ ADMIN: Reverter pedido de ${STATUS_LABELS[currentStatus]} para ${STATUS_LABELS[previousStatus]}?\n\nEsta ação deve ser usada apenas em casos especiais.`;
    
    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      const { error } = await supabase
        .rpc('alterar_status_pedido', {
          pedido_uuid: pedido.id,
          novo_status: previousStatus,
          observacao: `🔄 Revertido por ADMIN (${userProfile?.nome || user?.email}) de ${STATUS_LABELS[currentStatus]} para ${STATUS_LABELS[previousStatus]}`,
          usuario: userProfile?.nome || user?.email || 'Admin'
        });
      
      if (error) throw error;
      
      // Invalidar queries de alertas para forçar atualização imediata
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'alertas_criticos'] })
      
      // Recarregar dados
      await loadPedidos();
    } catch (error) {
      console.error('Erro ao reverter status:', error);
      alert(`Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };
  
  const handleDragEnd = useCallback(async (result: DropResult) => {
    console.log('🎯 handleDragEnd CHAMADO!', result)
    
    // 🔒 PROTEÇÃO DEMO: Bloquear drag & drop
    if (demoPermissions.isDemo) {
      alert('👁️ Modo Visualização: Você não pode mover cards no Kanban.');
      return;
    }
    
    if (!supabase) {
      console.error('❌ Supabase não disponível')
      return
    }
    
    const { destination, source, draggableId } = result

    console.log('📦 Dados do drag:', {
      de: source.droppableId,
      para: destination?.droppableId,
      cardId: draggableId
    })

    if (!destination) {
      console.log('⚠️ Sem destino, cancelando')
      return
    }
    
    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      console.log('⚠️ Mesma posição, cancelando')
      return
    }

    // ✅ NOVA VALIDAÇÃO: Não permitir drag para status finais (tratados pela gestão de pedidos)
    if (destination.droppableId === 'ENTREGUE' || destination.droppableId === 'CANCELADO') {
      console.log('⚠️ Tentativa de mover para status final')
      alert('Status finais são gerenciados na seção de pedidos. Use os botões de ação do card.')
      return
    }

    const sourceColumn = columns.find(col => col.id === source.droppableId)
    const destColumn = columns.find(col => col.id === destination.droppableId)

    if (!sourceColumn || !destColumn) {
      console.error('❌ Coluna não encontrada')
      return
    }

    const pedido = sourceColumn.pedidos.find(p => p.id === draggableId)
    if (!pedido) {
      console.error('❌ Pedido não encontrado')
      return
    }

    console.log('📋 Pedido encontrado:', {
      id: pedido.id,
      numero: pedido.numero_sequencial,
      status: pedido.status,
      destino: destination.droppableId
    })

    // Verificar permissões
    const allowedMoves = permissions.getAllowedMoves(pedido.status)
    console.log('🔐 Movimentos permitidos:', allowedMoves)
    
    if (!allowedMoves.includes(destination.droppableId as StatusPedido)) {
      console.warn('⚠️ Movimento não permitido')
      alert(`Você não tem permissão para mover este pedido de ${STATUS_LABELS[pedido.status]} para ${STATUS_LABELS[destination.droppableId as StatusPedido]}.`)
      return
    }

    // 🔒 VALIDAÇÃO CRÍTICA: Se movendo para ENVIADO (Montagem), SEMPRE exigir montador
    console.log('🔍 Verificando se destino é ENVIADO (Montagem):', destination.droppableId === 'ENVIADO')
    
    if (destination.droppableId === 'ENVIADO') {
      console.log('🔍 VALIDAÇÃO MONTADOR ATIVADA! Abrindo modal...')
      console.log('🔍 Dados do pedido:', {
        pedidoId: pedido.id,
        numeroSequencial: pedido.numero_sequencial,
        montadorId: pedido.montador_id,
        temMontador: !!pedido.montador_id
      })

      // SEMPRE abrir modal para ENVIADO/Montagem (garante controle de estatísticas)
      setPendingMove({
        pedido,
        destination: destination.droppableId,
        source: source.droppableId
      })
      setShowMontadorDialog(true)
      console.log('✅ Modal setado para abrir!')
      return
    }

    // Prosseguir com a movimentação normal (outros status)
    await executarMovimentacao(pedido, destination.droppableId, source.droppableId)
  }, [columns, permissions, supabase, userProfile, user, queryClient, setPendingMove, setShowMontadorDialog])

  // Função auxiliar para executar a movimentação
  const executarMovimentacao = async (
    pedido: PedidoCompleto, 
    destinationStatus: string, 
    sourceStatus: string,
    montadorId?: string
  ) => {
    if (!supabase) return

    try {
      console.log('🚀 Executando movimentação:', {
        pedidoId: pedido.id,
        de: sourceStatus,
        para: destinationStatus,
        montadorId: montadorId || 'nenhum'
      })

      // Se há montador_id, atualizar primeiro usando API (Service Role)
      if (montadorId) {
        console.log('📝 Atualizando montador no pedido via API...', {
          pedidoId: pedido.id,
          numeroSequencial: pedido.numero_sequencial,
          montadorId: montadorId
        })
        
        // Usar API com Service Role Key para bypass RLS
        const response = await fetch('/api/pedidos/update-montador', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pedidoId: pedido.id,
            montadorId: montadorId
          })
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }))
          console.error('❌ Erro ao atualizar montador:', errorData)
          throw new Error(errorData.error || 'Falha ao atualizar montador')
        }

        const result = await response.json()
        console.log('✅ Montador atribuído com sucesso via API!', {
          updated: result.updated,
          data: result.data
        })
      }

      // Alterar status
      console.log('📝 Alterando status do pedido...')
      const { data, error } = await supabase
        .rpc('alterar_status_pedido', {
          pedido_uuid: pedido.id,
          novo_status: destinationStatus,
          observacao: montadorId 
            ? `Movido para ${STATUS_LABELS[destinationStatus as StatusPedido]} com montador atribuído`
            : `Movido de ${STATUS_LABELS[sourceStatus as StatusPedido]} para ${STATUS_LABELS[destinationStatus as StatusPedido]}`,
          usuario: userProfile?.nome || user?.email || 'Sistema'
        })

      if (error) {
        console.error('❌ Erro Supabase ao alterar status:', error)
        throw error
      }
      console.log('✅ Status alterado com sucesso!')

      // Invalidar queries de alertas para forçar atualização imediata
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'alertas_criticos'] })
      
      // 🔄 INVALIDAR QUERIES DE MONTAGENS quando montador é atribuído
      if (montadorId) {
        console.log('🔄 Invalidando queries de montagens...')
        queryClient.invalidateQueries({ queryKey: ['montagens'] })
        queryClient.invalidateQueries({ queryKey: ['montador-detalhes'] })
        queryClient.invalidateQueries({ queryKey: ['laboratorio-montadores'] })
        queryClient.invalidateQueries({ queryKey: ['laboratorio-kpis'] })
        queryClient.invalidateQueries({ queryKey: ['laboratorio-pedidos'] })
      }

      // Recarregar pedidos
      await loadPedidos()

    } catch (error) {
      console.error('Erro ao mover pedido:', error)
      alert(`Erro ao mover pedido: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
      // Recarregar dados em caso de erro
      loadPedidos()
    }
  }

  // Handler para quando o montador é selecionado
  const handleMontadorSelected = async (montadorId: string) => {
    console.log('👤 Montador selecionado:', montadorId)
    
    if (!pendingMove) {
      console.error('❌ Nenhuma movimentação pendente!')
      return
    }

    console.log('🔄 Processando movimentação pendente:', {
      pedido: pendingMove.pedido.numero_sequencial,
      de: pendingMove.source,
      para: pendingMove.destination,
      montadorId
    })

    await executarMovimentacao(
      pendingMove.pedido,
      pendingMove.destination,
      pendingMove.source,
      montadorId
    )

    // Limpar estado pendente
    setPendingMove(null)
    console.log('✅ Movimentação concluída e estado limpo')
  }

  const handleAdvanceStatus = async (pedido: PedidoCompleto) => {
    console.log('🎯 handleAdvanceStatus CHAMADO!', { pedidoId: pedido.id, status: pedido.status })
    
    if (!supabase) {
      console.error('❌ Supabase não inicializado!')
      alert('Erro: Sistema não está inicializado corretamente')
      return
    }
    
    const nextStatus = permissions.getNextStatus(pedido.status)
    console.log('🔍 handleAdvanceStatus - Debug:', {
      pedidoId: pedido.id,
      statusAtual: pedido.status,
      proximoStatus: nextStatus,
      allowedMoves: permissions.getAllowedMoves(pedido.status),
      userRole: userRole
    })
    
    if (!nextStatus) {
      console.warn('⚠️ Próximo status não disponível')
      alert('Este pedido já está no status final ou você não tem permissão para avançá-lo.')
      return
    }

    // 🔒 VALIDAÇÃO: Se avançando para ENVIADO (Montagem), exigir montador
    if (nextStatus === 'ENVIADO') {
      console.log('🔍 Validando montador para ENVIADO/Montagem (botão avançar):', {
        pedidoId: pedido.id,
        numeroSequencial: pedido.numero_sequencial,
        montadorId: pedido.montador_id
      })

      // SEMPRE abrir modal para ENVIADO/Montagem
      setPendingMove({
        pedido,
        destination: nextStatus,
        source: pedido.status
      })
      setShowMontadorDialog(true)
      return
    }

    console.log(`⏩ Avançando pedido #${pedido.numero_sequencial} de ${pedido.status} para ${nextStatus}`)

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
    if (!supabase) {
      console.error('❌ Supabase não inicializado')
      alert('Erro: Sistema não inicializado')
      return
    }

    try {
      console.log('🔧 Selecionando montador:', { pedidoId, montador })
      
      const updateData = {
        montador_id: montador.id,
        montador_nome: montador.nome,
        montador_local: montador.local,
        montador_contato: montador.contato,
        custo_montagem: montador.preco_base,
        data_montagem: new Date().toISOString()
      }
      
      console.log('📤 Dados do update:', updateData)

      const { data, error } = await supabase
        .from('pedidos')
        .update(updateData)
        .eq('id', pedidoId)
        .select()

      if (error) {
        console.error('❌ Erro do Supabase:', error)
        throw error
      }

      console.log('✅ Update bem-sucedido:', data)

      await loadPedidos()
      alert(`✅ Montador ${montador.nome} selecionado com sucesso!`)
    } catch (error) {
      console.error('❌ Erro ao selecionar montador:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      alert(`❌ Erro ao selecionar montador: ${errorMessage}`)
    }
  }

  // ========== FILTROS ==========
  const filteredColumns = columns.map(column => {
    let pedidosFiltrados = column.pedidos.filter(pedido =>
      searchTerm === '' ||
      pedido.numero_sequencial.toString().includes(searchTerm) ||
      pedido.cliente_nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pedido.loja_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pedido.laboratorio_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (pedido.numero_os_fisica && pedido.numero_os_fisica.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (pedido.numero_pedido_laboratorio && pedido.numero_pedido_laboratorio.toLowerCase().includes(searchTerm.toLowerCase()))
    )

    // FILTRO DE URGÊNCIA (somente AG_PAGAMENTO - baseado em data prometida)
    if (column.id === 'AG_PAGAMENTO' && filtroUrgencia) {
      pedidosFiltrados = pedidosFiltrados.filter(pedido => {
        if (!pedido.data_prometida) return false
        const urgencia = calcularUrgenciaPagamento(pedido.data_prometida, pedido.data_pedido)
        return urgencia.nivel === filtroUrgencia
      })
    }

    return {
      ...column,
      pedidos: pedidosFiltrados
    }
  })

  const totalPedidos = columns.reduce((acc, col) => acc + col.pedidos.length, 0)
  const totalAlertas = columns.reduce((acc, col) => acc + col.pedidos.reduce((sum, p) => sum + p.alertas_count, 0), 0)

  // ========== RENDER CARD DO PEDIDO ==========
  const renderPedidoCard = (pedido: PedidoCompleto, index: number, columnId: StatusPedido, laboratorioGradient?: string) => {
    const canEdit = permissions.canEditColumn(pedido.status)
    const canMoveNext = permissions.canMoveToNext(pedido.status)
    const canMovePrev = permissions.canMoveToPrev(pedido.status)
    const canDrag = permissions.canDragCard(pedido.status)
    
    // DEBUG: Log para ver se drag está habilitado
    if (index === 0 && columnId === 'PRONTO') {
      console.log('🎯 Card config:', {
        pedidoId: pedido.id,
        status: pedido.status,
        canDrag,
        isDragDisabled: !canDrag
      })
    }
    
    // Status que permitem reverter (não incluir REGISTRADO inicial e CANCELADO final)
    const canRevert = permissions.canRevertStatus && 
                      pedido.status !== 'REGISTRADO' && 
                      pedido.status !== 'CANCELADO'

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
            <KanbanCardModern
              pedido={pedido}
              laboratorioGradient={laboratorioGradient || LAB_GRADIENTS['default']}
              isDragging={snapshot.isDragging}
              onClick={() => setSelectedPedido(pedido)}
              columnStatus={columnId}
              onMoveToNextStatus={() => handleMoveToNextStatus(pedido)}
              onRevertStatus={() => handleRevertStatus(pedido)}
              canMoveNext={permissions.getAllowedMoves(pedido.status).length > 0}
              canRevert={canRevert}
            />
          </div>
        )}
      </Draggable>
    )
  }

  // ========== LOADING E ERROR STATES ==========
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 dark:border-blue-800 border-t-blue-600 dark:border-t-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-700 dark:text-gray-300 font-medium text-lg">Verificando autenticação...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  // ========== RENDER PRINCIPAL ==========
  return (
    <div className="space-y-6">
          {/* 🔒 ALERTA MODO DEMO */}
          <DemoModeAlert message="Você pode visualizar o Kanban, mas não pode mover cards ou criar pedidos." />
          
          {/* Alerta de Filtro de Urgência Ativo */}
          {(filtroUrgencia || filtroPrazo) && (
            <Alert className="bg-blue-50/80 backdrop-blur-sm border-blue-300">
              <Bell className="h-4 w-4 text-blue-600" />
              <AlertDescription className="flex items-center justify-between">
                <span className="text-blue-800 font-medium">
                  🔍 Filtrando {filtroUrgencia && filtroPrazo ? 'por urgência e prazo' : filtroUrgencia ? 'por urgência' : 'por prazo'}:
                  {filtroUrgencia && <strong className="ml-1">{filtroUrgencia}</strong>}
                  {filtroUrgencia && filtroPrazo && <span className="mx-1">+</span>}
                  {filtroPrazo && <strong className="ml-1">{filtroPrazo === 'vencido' ? 'Vencidos' : filtroPrazo === 'hoje' ? 'Vence Hoje' : filtroPrazo === 'amanha' ? 'Vence Amanhã' : filtroPrazo === 'proximos-3-dias' ? 'Próximos 3 dias' : 'Esta Semana'}</strong>}
                  <span className="ml-1">na coluna AGUARDANDO PAGAMENTO</span>
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFiltroUrgencia(null)
                    setFiltroPrazo(null)
                  }}
                  className="hover:bg-blue-100 text-blue-700"
                >
                  <X className="h-4 w-4 mr-1" />
                  Limpar Filtros
                </Button>
              </AlertDescription>
            </Alert>
          )}
          
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
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-lg rounded-2xl p-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div className="flex items-center space-x-4">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-300" />
                  <div className="relative p-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg group-hover:scale-105 transition-transform duration-300">
                    <Package className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Kanban - {userRole.toUpperCase()}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 font-medium">
                    {visibleColumns.length} colunas operacionais • {totalPedidos} pedidos ativos
                    {totalAlertas > 0 && (
                      <span className="text-red-600 font-semibold"> • {totalAlertas} alertas</span>
                    )}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
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
                  className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Atualizar
                </Button>

                {/* 🔒 PROTEÇÃO: Ocultar botão de criar para demo */}
                {permissions.canCreateOrder() && !demoPermissions.isDemo && (
                  <NovaOrdemForm onSuccess={loadPedidos} />
                )}

                <Link href="/pedidos">
                  <Button variant="outline" className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">
                    📋 Ver Pedidos Concluídos
                  </Button>
                </Link>

                <Link href="/dashboard">
                  <Button variant="outline" className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">
                    📊 Dashboard
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Filtros */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-lg rounded-2xl p-6">
            {/* Filtros existentes */}
            <div className="flex flex-wrap gap-4">
            {/* Busca */}
            <div className="flex-1 min-w-[280px]">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-blue-600 dark:text-blue-400" />
                <Input
                  placeholder="Buscar por número, cliente, loja, OS, pedido lab..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 focus:border-blue-500 dark:focus:border-blue-400 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 transition-all"
                />
              </div>
            </div>

            {/* Filtro Loja */}
            {lojas.length > 0 && (
              <Select value={selectedLoja} onValueChange={setSelectedLoja}>
                <SelectTrigger className="w-[220px] bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 text-gray-900 dark:text-white transition-all">
                  <SelectValue placeholder="Todas as lojas" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
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
                <SelectTrigger className="w-[220px] bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 text-gray-900 dark:text-white transition-all">
                  <SelectValue placeholder="Todos os labs" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
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
            <DragDropContext 
              onDragEnd={(result) => {
                console.log('🎯🎯🎯 onDragEnd DISPARADO!', result)
                handleDragEnd(result)
              }}
              onDragStart={(start) => {
                console.log('🚀 onDragStart:', start)
              }}
              onDragUpdate={(update) => {
                console.log('⏫ onDragUpdate:', update)
              }}
            >
              <div className="flex gap-6 min-w-max px-2">
                {filteredColumns.map(column => {
                  const IconComponent = STATUS_ICONS[column.id]
                  return (
                    <div key={column.id} className="w-80 flex-shrink-0">
                      <div className="bg-white/95 backdrop-blur-xl border border-gray-200 shadow-xl rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
                        {/* Header da coluna modernizado */}
                        <KanbanColumnHeader
                          title={column.title}
                          count={column.pedidos.length}
                          icon={IconComponent}
                          gradient={STATUS_GRADIENTS[column.id]}
                          color={column.color}
                          // NOVO: Alertas de urgência para AG_PAGAMENTO
                          pedidos={column.pedidos}
                          showUrgenciaAlerts={column.id === 'AG_PAGAMENTO'}
                          onFilterUrgencia={column.id === 'AG_PAGAMENTO' ? setFiltroUrgencia : undefined}
                          filtroAtivo={column.id === 'AG_PAGAMENTO' ? filtroUrgencia : null}
                          onFilterPrazo={column.id === 'AG_PAGAMENTO' ? setFiltroPrazo : undefined}
                          filtroPrazoAtivo={column.id === 'AG_PAGAMENTO' ? filtroPrazo : null}
                        />

                        {/* Resumo financeiro (se tiver permissão) */}
                        {column.pedidos.length > 0 && isHydrated && permissions.canViewFinancialData() && (
                          <div className="px-4 py-2 bg-gray-50/50 border-b border-gray-100">
                            <div className="flex gap-4 text-xs">
                              <span className="text-gray-600">
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
                          </div>
                        )}

                        {/* Lock indicator se não pode editar */}
                        {!permissions.canEditColumn(column.id) && (
                          <div className="px-4 py-2 bg-gray-100/50 border-b border-gray-200">
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                              <Lock className="w-3 h-3" />
                              <span>Apenas visualização</span>
                            </div>
                          </div>
                        )}

                        {/* Cards dos pedidos */}
                        <Droppable
                          droppableId={column.id}
                          isDropDisabled={!permissions.canEditColumn(column.id)}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                              className={cn(
                                "p-4 min-h-[500px] space-y-3 transition-all duration-300 rounded-b-2xl border",
                                snapshot.isDraggingOver
                                  ? permissions.canEditColumn(column.id)
                                    ? 'bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border-blue-200 dark:border-blue-800'
                                    : 'bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-950/30 dark:to-pink-950/30 border-red-200 dark:border-red-800'
                                  : 'bg-gradient-to-br from-gray-900/5 via-gray-800/10 to-blue-900/5 dark:from-gray-900/80 dark:via-gray-800/90 dark:to-blue-900/80 border-gray-200/50 dark:border-gray-700/50'
                              )}
                            >
                              {column.pedidos.map((pedido, index) => {
                                const labGradient = LAB_GRADIENTS[pedido.laboratorio_nome || ''] || LAB_GRADIENTS['default']
                                return renderPedidoCard(pedido, index, column.id, labGradient)
                              })}
                              {provided.placeholder}

                              {column.pedidos.length === 0 && (
                                <EmptyState
                                  icon={IconComponent}
                                  title="Nenhum pedido"
                                  description={
                                    !permissions.canEditColumn(column.id)
                                      ? "Sem permissão para editar"
                                      : "Arraste pedidos para cá"
                                  }
                                />
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

          {/* ========== MODAL DE SELEÇÃO DE MONTADOR ========== */}
          <MontadorSelectorDialog
            open={showMontadorDialog}
            onOpenChange={setShowMontadorDialog}
            onSelect={handleMontadorSelected}
            pedidoNumero={pendingMove?.pedido.numero_sequencial?.toString()}
          />

          {/* ========== LOADING OVERLAY ========== */}
          {isInitialLoading && (
            <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-xl border border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-200 dark:border-blue-800 border-t-blue-600 dark:border-t-blue-400"></div>
                  <span className="text-gray-700 dark:text-gray-300 font-medium">
                    {totalPedidos === 0 ? 'Carregando dados iniciais...' : 'Atualizando pedidos...'}
                  </span>
                </div>
              </div>
            </div>
          )}
    </div>
  )
}