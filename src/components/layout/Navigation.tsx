// ========================================
// 4. COMPONENTE DE NAVEGAÇÃO ATUALIZADO
// components/layout/Navigation.tsx
import { canAccessPage } from '@/lib/utils/page-permissions'
import { useAuth } from '@/components/providers/AuthProvider'
import Link from 'next/link'

export function Navigation() {
  const { userProfile } = useAuth()
  const userRole = userProfile?.role || ''

  const navItems = [
    {
      href: '/dashboard',
      label: 'Dashboard', 
      icon: 'BarChart3',
      show: canAccessPage(userRole, 'dashboard')
    },
    {
      href: '/kanban',
      label: 'Kanban',
      icon: 'Kanban', 
      show: canAccessPage(userRole, 'kanban')
    },
    {
      href: '/pedidos',
      label: 'Pedidos',
      icon: 'FileText',
      show: canAccessPage(userRole, 'pedidos')
    },
    {
      href: '/configuracoes', 
      label: 'Configurações',
      icon: 'Settings',
      show: canAccessPage(userRole, 'configuracoes')
    }
  ].filter(item => item.show) // Filtrar apenas itens permitidos

  return (
    <nav className="space-y-2">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100"
        >
          <span>{item.label}</span>
        </Link>
      ))}
    </nav>
  )
}