
// 1. HELPER DE PERMISSÕES DE PÁGINAS
// lib/utils/page-permissions.ts
export const PAGE_PERMISSIONS = {
  dashboard: ['gestor', 'financeiro'],
  kanban: ['gestor', 'dcl', 'financeiro', 'loja'],
  alertas: ['gestor', 'dcl'],
  pedidos: ['gestor', 'dcl', 'financeiro', 'loja'],
  configuracoes: ['gestor']
} as const

export function canAccessPage(userRole: string, page: keyof typeof PAGE_PERMISSIONS): boolean {
  if (!userRole) return false
  return PAGE_PERMISSIONS[page].includes(userRole as any)
}