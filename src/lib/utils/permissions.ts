/**
 * Sistema de Permissões - Usuário Demo e Controle de Acesso
 * 
 * Este módulo centraliza toda a lógica de verificação de permissões,
 * incluindo proteção especial para usuário demo (somente leitura).
 */

export type User = {
  id: string;
  email: string;
  nome?: string;
  role: string;
  permissoes?: string[];
  loja_id?: string | null;
};

/**
 * Verifica se é usuário demo (somente visualização)
 */
export function isDemo(user: User | null | undefined): boolean {
  if (!user) return false;
  
  return (
    user.role === 'demo_viewer' || 
    user.email === 'demo@desenrola-dcl.com.br' ||
    user.email?.toLowerCase() === 'demo@desenrola-dcl.com.br'
  );
}

/**
 * Verifica se pode editar
 */
export function canEdit(user: User | null | undefined): boolean {
  if (!user || isDemo(user)) return false;
  
  // Roles com permissão de edição
  const editRoles = ['admin', 'gestor', 'dcl'];
  if (editRoles.includes(user.role)) return true;
  
  // Verificar permissões específicas
  if (user.permissoes?.includes('edit') || user.permissoes?.includes('all')) {
    return true;
  }
  
  return false;
}

/**
 * Verifica se pode criar
 */
export function canCreate(user: User | null | undefined): boolean {
  if (!user || isDemo(user)) return false;
  
  // Roles com permissão de criação
  const createRoles = ['admin', 'gestor', 'dcl'];
  if (createRoles.includes(user.role)) return true;
  
  // Verificar permissões específicas
  if (user.permissoes?.includes('create') || user.permissoes?.includes('all')) {
    return true;
  }
  
  return false;
}

/**
 * Verifica se pode deletar
 */
export function canDelete(user: User | null | undefined): boolean {
  if (!user || isDemo(user)) return false;
  
  // Apenas admin e gestor podem deletar
  const deleteRoles = ['admin', 'gestor'];
  if (deleteRoles.includes(user.role)) return true;
  
  // Verificar permissões específicas
  if (user.permissoes?.includes('delete') || user.permissoes?.includes('all')) {
    return true;
  }
  
  return false;
}

/**
 * Verifica se pode mover/arrastar cards no Kanban
 */
export function canDragCards(user: User | null | undefined): boolean {
  if (!user || isDemo(user)) return false;
  
  // Roles que podem mover cards
  const dragRoles = ['admin', 'gestor', 'dcl'];
  return dragRoles.includes(user.role);
}

/**
 * Verifica se pode alterar status de pedidos
 */
export function canChangeStatus(user: User | null | undefined): boolean {
  if (!user || isDemo(user)) return false;
  
  // Roles que podem alterar status
  const statusRoles = ['admin', 'gestor', 'dcl'];
  return statusRoles.includes(user.role);
}

/**
 * Verifica se pode acessar dados financeiros
 */
export function canViewFinancial(user: User | null | undefined): boolean {
  if (!user) return false;
  
  // Demo pode ver, mas não editar
  // Financeiro, Gestor e Admin podem ver
  const financialRoles = ['admin', 'gestor', 'financeiro', 'demo_viewer'];
  return financialRoles.includes(user.role);
}

/**
 * Verifica se pode editar dados financeiros
 */
export function canEditFinancial(user: User | null | undefined): boolean {
  if (!user || isDemo(user)) return false;
  
  // Apenas financeiro, gestor e admin podem editar
  const editFinancialRoles = ['admin', 'gestor', 'financeiro'];
  return editFinancialRoles.includes(user.role);
}

/**
 * Verifica permissão específica
 */
export function hasPermission(
  user: User | null | undefined, 
  permission: string
): boolean {
  if (!user) return false;
  
  // Demo só pode ter permissões .view
  if (isDemo(user) && !permission.endsWith('.view')) {
    return false;
  }
  
  // Admin tem todas as permissões
  if (user.role === 'admin') return true;
  
  // Verificar permissões específicas
  return (
    user.permissoes?.includes(permission) || 
    user.permissoes?.includes('all') ||
    false
  );
}

/**
 * Retorna mensagem de restrição para usuário demo
 */
export function getDemoRestrictionMessage(action: string = 'esta ação'): string {
  return `Usuários em modo visualização não podem ${action}.`;
}

/**
 * Verifica se pode acessar rota específica
 */
export function canAccessRoute(
  user: User | null | undefined, 
  route: string
): boolean {
  if (!user) return false;
  
  // Rotas bloqueadas para demo
  const demoBlockedRoutes = ['/novo', '/editar', '/criar'];
  
  if (isDemo(user)) {
    return !demoBlockedRoutes.some(blocked => route.includes(blocked));
  }
  
  return true;
}

/**
 * Retorna label do role formatado
 */
export function getRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    admin: 'Administrador',
    gestor: 'Gestor',
    dcl: 'DCL',
    loja: 'Loja',
    financeiro: 'Financeiro',
    demo_viewer: '👁️ Visualização',
  };
  
  return labels[role] || role;
}

/**
 * Retorna cor do badge do role
 */
export function getRoleBadgeColor(role: string): string {
  const colors: Record<string, string> = {
    admin: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    gestor: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    dcl: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    loja: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    financeiro: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    demo_viewer: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  };
  
  return colors[role] || 'bg-gray-100 text-gray-800';
}
