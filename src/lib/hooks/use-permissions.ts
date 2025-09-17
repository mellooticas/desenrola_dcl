// lib/hooks/use-permissions.ts
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import { StatusPedido } from '@/lib/types/database'
import { useAuth } from '@/components/providers/AuthProvider'

export interface RolePermission {
  role: string
  status_origem: string[]
  status_destino_permitidos: string[]
  acoes_especiais: string[]
}

export interface UserPermissions {
  canView: (status: StatusPedido) => boolean
  canEdit: (status: StatusPedido) => boolean
  canMoveTo: (fromStatus: StatusPedido, toStatus: StatusPedido) => boolean
  hasAction: (action: string) => boolean
  getVisibleColumns: () => StatusPedido[]
  getAllowedMoves: (fromStatus: StatusPedido) => StatusPedido[]
}

export const usePermissions = (): UserPermissions => {
  const { userProfile } = useAuth() // Usar perfil consolidado
  const [permissions, setPermissions] = useState<RolePermission | null>(null)
  const [loading, setLoading] = useState(true)

  const loadPermissions = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('role_permissions')
        .select('*')
        .eq('role', userProfile?.role)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao carregar permissões:', error)
        return
      }

      setPermissions(data)
    } catch (error) {
      console.error('Erro ao carregar permissões:', error)
    } finally {
      setLoading(false)
    }
  }, [userProfile?.role])

  useEffect(() => {
    const run = async () => {
      if (userProfile?.role) {
        await loadPermissions()
      }
    }
    run()
  }, [userProfile?.role, loadPermissions])

  // Função para verificar se pode visualizar um status
  const canView = (status: StatusPedido): boolean => {
    if (!permissions) return false
    if (permissions.role === 'gestor') return true
    if (permissions.role === 'loja') return true // Loja vê todos
    
    return permissions.status_origem.includes(status) || 
           permissions.status_destino_permitidos.includes(status)
  }

  // Função para verificar se pode editar um status
  const canEdit = (status: StatusPedido): boolean => {
    if (!permissions) return false
    if (permissions.role === 'gestor') return true
    
    return permissions.status_origem.includes(status) || permissions.status_origem.includes('*')
  }

  // Função para verificar se pode mover de um status para outro
  const canMoveTo = (fromStatus: StatusPedido, toStatus: StatusPedido): boolean => {
    if (!permissions) return false
    if (permissions.role === 'gestor') return true
    
    // Verifica se pode mexer no status de origem
    if (!permissions.status_origem.includes(fromStatus) && !permissions.status_origem.includes('*')) {
      return false
    }
    
    // Verifica se o status de destino é permitido
    return permissions.status_destino_permitidos.includes(toStatus) || 
           permissions.status_destino_permitidos.includes('*')
  }

  // Função para verificar se tem uma ação especial
  const hasAction = (action: string): boolean => {
    if (!permissions) return false
    if (permissions.role === 'gestor') return true
    
    return permissions.acoes_especiais.includes(action) || 
           permissions.acoes_especiais.includes('*')
  }

  // Função para obter colunas visíveis no Kanban
  const getVisibleColumns = (): StatusPedido[] => {
    if (!permissions) return []
    
    const allStatuses: StatusPedido[] = [
      'REGISTRADO', 'AG_PAGAMENTO', 'PAGO', 'PRODUCAO', 
      'PRONTO', 'ENVIADO', 'CHEGOU', 'ENTREGUE', 'CANCELADO'
    ]

    if (permissions.role === 'gestor') {
      return allStatuses
    }

    if (permissions.role === 'loja') {
      return allStatuses // Loja vê tudo mas só mexe em CHEGOU → ENTREGUE
    }

    if (permissions.role === 'financeiro') {
      return ['AG_PAGAMENTO', 'PAGO']
    }

    if (permissions.role === 'dcl') {
      return ['REGISTRADO', 'AG_PAGAMENTO', 'PAGO', 'PRODUCAO', 'PRONTO', 'ENVIADO', 'CHEGOU']
    }

    return []
  }

  // Função para obter movimentos permitidos a partir de um status
  const getAllowedMoves = (fromStatus: StatusPedido): StatusPedido[] => {
    if (!permissions) return []
    if (permissions.role === 'gestor') {
      return ['REGISTRADO', 'AG_PAGAMENTO', 'PAGO', 'PRODUCAO', 'PRONTO', 'ENVIADO', 'CHEGOU', 'ENTREGUE', 'CANCELADO']
    }

    if (!canEdit(fromStatus)) return []

    return permissions.status_destino_permitidos.filter(status => 
      status !== '*'
    ) as StatusPedido[]
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

// (Contexto de usuário vem de '@/components/providers/AuthProvider')