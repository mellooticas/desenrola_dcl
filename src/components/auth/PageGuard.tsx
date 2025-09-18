// ========================================
// 5. COMPONENT WRAPPER PARA PÁGINAS
// components/auth/PageGuard.tsx
'use client'
import { useAuth } from '@/components/providers/AuthProvider'
import { canAccessPage } from '@/lib/utils/page-permissions'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface PageGuardProps {
  children: React.ReactNode
  page: 'dashboard' | 'kanban' | 'pedidos' | 'configuracoes'
}

export function PageGuard({ children, page }: PageGuardProps) {
  const { userProfile, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && userProfile) {
      const hasAccess = canAccessPage(userProfile.role || '', page)
      
      if (!hasAccess) {
        // Redirecionar para página padrão do role
        const defaultPage = getDefaultPageForRole(userProfile.role || '')
        router.replace(defaultPage)
      }
    }
  }, [loading, userProfile, page, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!userProfile) {
    return null // AuthProvider já vai redirecionar para login
  }

  const hasAccess = canAccessPage(userProfile.role || '', page)
  
  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Acesso Negado</h2>
          <p className="text-gray-600">Você não tem permissão para acessar esta página.</p>
          <p className="text-sm text-gray-500 mt-2">
            Seu perfil: {userProfile.role?.toUpperCase()}
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

function getDefaultPageForRole(role: string): string {
  switch (role) {
    case 'gestor':
      return '/dashboard'
    case 'financeiro':
      return '/dashboard'
    case 'dcl':
      return '/kanban'
    case 'loja':
      return '/kanban'
    default:
      return '/kanban'
  }
}