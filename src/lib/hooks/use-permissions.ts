// lib/hooks/use-permissions.ts - VERSÃO TEMPORÁRIA SEM BANCO
import { StatusPedido } from '@/lib/types/database'
import { useAuth } from '@/components/providers/AuthProvider'

export interface UserPermissions {
  canView: (status: StatusPedido) => boolean
  canEdit: (status: StatusPedido) => boolean
  canMoveTo: (fromStatus: StatusPedido, toStatus: StatusPedido) => boolean
  hasAction: (action: string) => boolean
  getVisibleColumns: () => StatusPedido[]
  getAllowedMoves: (fromStatus: StatusPedido) => StatusPedido[]
}

// DADOS HARDCODED (baseados no banco)
const ROLE_PERMISSIONS = {
  financeiro: {
    colunas_visiveis: ['AG_PAGAMENTO', 'PAGO'],
    status_origem: ['AG_PAGAMENTO'],
    status_destino_permitidos: ['PAGO', 'CANCELADO']
  },
  dcl: {
    colunas_visiveis: ['REGISTRADO', 'AG_PAGAMENTO', 'PAGO', 'PRODUCAO', 'PRONTO', 'ENVIADO', 'CHEGOU'],
    status_origem: ['REGISTRADO', 'PAGO', 'PRODUCAO', 'PRONTO', 'ENVIADO'],
    status_destino_permitidos: ['REGISTRADO', 'AG_PAGAMENTO', 'PRODUCAO', 'PRONTO', 'ENVIADO', 'CHEGOU', 'CANCELADO']
  },
  gestor: {
    colunas_visiveis: ['REGISTRADO', 'AG_PAGAMENTO', 'PAGO', 'PRODUCAO', 'PRONTO', 'ENVIADO', 'CHEGOU'],
    status_origem: ['*'],
    status_destino_permitidos: ['*']
  },
  loja: {
    colunas_visiveis: ['PRODUCAO', 'PRONTO', 'ENVIADO', 'CHEGOU'],
    status_origem: ['CHEGOU'],
    status_destino_permitidos: ['ENTREGUE']
  }
}

export const usePermissions = (): UserPermissions => {
  const { userProfile } = useAuth()
  const role = userProfile?.role || 'financeiro'
  const permissions = ROLE_PERMISSIONS[role as keyof typeof ROLE_PERMISSIONS] || ROLE_PERMISSIONS.financeiro

  const canView = (status: StatusPedido): boolean => {
    return permissions.colunas_visiveis.includes(status)
  }

  const canEdit = (status: StatusPedido): boolean => {
    if (role === 'gestor') return true
    return permissions.status_origem.includes(status) || permissions.status_origem.includes('*')
  }

  const canMoveTo = (fromStatus: StatusPedido, toStatus: StatusPedido): boolean => {
    if (role === 'gestor') return true
    if (!permissions.status_origem.includes(fromStatus) && !permissions.status_origem.includes('*')) {
      return false
    }
    return permissions.status_destino_permitidos.includes(toStatus) || permissions.status_destino_permitidos.includes('*')
  }

  const hasAction = (action: string): boolean => {
    return role === 'gestor'
  }

  const getVisibleColumns = (): StatusPedido[] => {
    return permissions.colunas_visiveis as StatusPedido[]
  }

  const getAllowedMoves = (fromStatus: StatusPedido): StatusPedido[] => {
    if (role === 'gestor') {
      return ['REGISTRADO', 'AG_PAGAMENTO', 'PAGO', 'PRODUCAO', 'PRONTO', 'ENVIADO', 'CHEGOU', 'ENTREGUE', 'CANCELADO']
    }
    if (!canEdit(fromStatus)) return []
    return permissions.status_destino_permitidos.filter(status => status !== '*') as StatusPedido[]
  }

  return {
    canView,
    canEdit,
    canMoveTo,
    hasAction,
    getVisibleColumns,
    getAllowedMoves
  }
}