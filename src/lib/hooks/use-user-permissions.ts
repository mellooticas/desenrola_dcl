/**
 * Hook customizado para verificação de permissões
 * Integra com AuthProvider e funções de permissions.ts
 */

import { useMemo } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import {
  isDemo,
  canEdit,
  canCreate,
  canDelete,
  canDragCards,
  canChangeStatus,
  canViewFinancial,
  canEditFinancial,
  canRevertStatus,
  hasPermission,
  canAccessRoute,
  getRoleLabel,
  getRoleBadgeColor,
  getDemoRestrictionMessage,
  type User,
} from '@/lib/utils/permissions';

export interface PermissionHook {
  // Estado do usuário
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  
  // Verificações de permissão
  isDemo: boolean;
  canEdit: boolean;
  canCreate: boolean;
  canDelete: boolean;
  canDragCards: boolean;
  canChangeStatus: boolean;
  canViewFinancial: boolean;
  canEditFinancial: boolean;
  canRevertStatus: boolean;
  
  // Funções auxiliares
  hasPermission: (permission: string) => boolean;
  canAccessRoute: (route: string) => boolean;
  getRoleLabel: () => string;
  getRoleBadgeColor: () => string;
  getDemoMessage: (action?: string) => string;
}

/**
 * Hook principal de permissões
 * 
 * @example
 * ```tsx
 * const permissions = usePermissions();
 * 
 * if (!permissions.canEdit) {
 *   return <ReadOnlyView />;
 * }
 * 
 * return <EditableView />;
 * ```
 */
export function usePermissions(): PermissionHook {
  const { userProfile, loading } = useAuth();
  
  // Converter userProfile para formato User
  const user = useMemo<User | null>(() => {
    if (!userProfile) return null;
    
    return {
      id: userProfile.id,
      email: userProfile.email,
      nome: userProfile.nome,
      role: userProfile.role || 'loja',
      permissoes: [],
      loja_id: userProfile.loja_id,
    };
  }, [userProfile]);

  // Memoizar todas as verificações de permissão
  const permissions = useMemo(() => {
    const isDemoUser = isDemo(user);
    
    return {
      user,
      isAuthenticated: !!user,
      loading,
      
      // Verificações básicas
      isDemo: isDemoUser,
      canEdit: canEdit(user),
      canCreate: canCreate(user),
      canDelete: canDelete(user),
      canDragCards: canDragCards(user),
      canChangeStatus: canChangeStatus(user),
      canViewFinancial: canViewFinancial(user),
      canEditFinancial: canEditFinancial(user),
      canRevertStatus: canRevertStatus(user),
      
      // Funções auxiliares
      hasPermission: (permission: string) => hasPermission(user, permission),
      canAccessRoute: (route: string) => canAccessRoute(user, route),
      getRoleLabel: () => getRoleLabel(user?.role || ''),
      getRoleBadgeColor: () => getRoleBadgeColor(user?.role || ''),
      getDemoMessage: (action?: string) => getDemoRestrictionMessage(action),
    };
  }, [user, loading]);

  return permissions;
}

/**
 * Hook para verificar permissão específica
 * 
 * @example
 * ```tsx
 * const canEditPedidos = useHasPermission('pedidos.edit');
 * ```
 */
export function useHasPermission(permission: string): boolean {
  const { userProfile } = useAuth();
  
  const userTyped = useMemo<User | null>(() => {
    if (!userProfile) return null;
    return {
      id: userProfile.id,
      email: userProfile.email || '',
      role: userProfile.role || 'loja',
      permissoes: [],
      loja_id: userProfile.loja_id,
    };
  }, [userProfile]);
  
  return useMemo(
    () => hasPermission(userTyped, permission),
    [userTyped, permission]
  );
}

/**
 * Hook para verificar se é usuário demo
 * 
 * @example
 * ```tsx
 * const isDemo = useIsDemo();
 * if (isDemo) return <ReadOnlyBanner />;
 * ```
 */
export function useIsDemo(): boolean {
  const { userProfile } = useAuth();
  
  return useMemo(() => {
    if (!userProfile) return false;
    
    const user: User = {
      id: userProfile.id,
      email: userProfile.email,
      role: userProfile.role || 'loja',
      loja_id: userProfile.loja_id,
    };
    
    return isDemo(user);
  }, [userProfile]);
}

/**
 * Hook para verificar se pode editar
 * 
 * @example
 * ```tsx
 * const canEdit = useCanEdit();
 * ```
 */
export function useCanEdit(): boolean {
  const { userProfile } = useAuth();
  
  return useMemo(() => {
    if (!userProfile) return false;
    
    const user: User = {
      id: userProfile.id,
      email: userProfile.email,
      role: userProfile.role || 'loja',
      loja_id: userProfile.loja_id,
    };
    
    return canEdit(user);
  }, [userProfile]);
}

/**
 * Hook para verificar se pode criar
 */
export function useCanCreate(): boolean {
  const { userProfile } = useAuth();
  
  return useMemo(() => {
    if (!userProfile) return false;
    
    const user: User = {
      id: userProfile.id,
      email: userProfile.email,
      role: userProfile.role || 'loja',
      loja_id: userProfile.loja_id,
    };
    
    return canCreate(user);
  }, [userProfile]);
}
