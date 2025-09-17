'use client'

import { useEffect, useRef } from 'react'
import type { User, Usuario } from '@/components/providers/AuthProvider'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  User as UserIcon, 
  Settings, 
  LogOut, 
  Building2,
  Shield
} from 'lucide-react'
import Link from 'next/link'

interface UserMenuProps {
  user: User | null
  userProfile: Usuario | null
  onClose: () => void
  onSignOut: () => Promise<void>
}

export function UserMenu({ user, userProfile, onClose, onSignOut }: UserMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  const handleSignOut = async () => {
    try {
      await onSignOut()
      // Garantir que qualquer estado legado de auth baseado em localStorage seja limpo
      try { localStorage.removeItem('desenrola_user') } catch {}
      // Redirecionar para a tela inicial/login
      if (typeof window !== 'undefined') {
        window.location.replace('/')
      }
      onClose()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const getRoleLabel = (role: string | null) => {
    switch (role) {
      case 'admin':
        return 'Administrador'
      case 'gestor':
        return 'Gestor'
      case 'operador':
        return 'Operador'
      case 'financeiro':
        return 'Financeiro'
      default:
        return 'Usuário'
    }
  }

  const getRoleColor = (role: string | null) => {
    switch (role) {
      case 'admin':
        return 'error'
      case 'gestor':
        return 'warning'
      case 'operador':
        return 'success'
      case 'financeiro':
        return 'outline'
      default:
        return 'outline'
    }
  }

  return (
    <div className="absolute right-0 top-full mt-2 w-72 z-50" ref={menuRef}>
      <Card className="shadow-lg border">
        <CardContent className="p-0">
          {/* User Info Section */}
          <div className="p-4 border-b bg-gray-50">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <UserIcon className="w-5 h-5 text-white" />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {userProfile?.nome || user?.email}
                </p>
                <p className="text-xs text-gray-600 truncate">
                  {user?.email}
                </p>
              </div>
            </div>

            {/* Role & Loja */}
            <div className="mt-3 flex flex-wrap gap-2">
              {userProfile?.role && (
                <Badge variant={getRoleColor(userProfile.role) as 'default' | 'secondary' | 'destructive' | 'outline' | 'warning' | 'success' | 'error'} className="text-xs">
                  <Shield className="w-3 h-3 mr-1" />
                  {getRoleLabel(userProfile.role)}
                </Badge>
              )}
              
              {userProfile?.loja_id && userProfile.loja && (
                <Badge variant="outline" className="text-xs">
                  <Building2 className="w-3 h-3 mr-1" />
                  {userProfile.loja.nome}
                </Badge>
              )}
            </div>
          </div>

          {/* Menu Items */}
          <div className="p-2">
            <Link href="/perfil">
              <Button
                variant="ghost"
                className="w-full justify-start text-sm"
                onClick={onClose}
              >
                <UserIcon className="w-4 h-4 mr-3" />
                Meu Perfil
              </Button>
            </Link>

            <Link href="/configuracoes">
              <Button
                variant="ghost"
                className="w-full justify-start text-sm"
                onClick={onClose}
              >
                <Settings className="w-4 h-4 mr-3" />
                Configurações
              </Button>
            </Link>

            {/* Admin/Gestor only */}
            {(userProfile?.role === 'admin' || userProfile?.role === 'gestor') && (
              <>
                <Link href="/configuracoes/usuarios">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-sm"
                    onClick={onClose}
                  >
                    <Shield className="w-4 h-4 mr-3" />
                    Usuários
                  </Button>
                </Link>

                <Link href="/configuracoes/laboratorios">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-sm"
                    onClick={onClose}
                  >
                    <Building2 className="w-4 h-4 mr-3" />
                    Laboratórios
                  </Button>
                </Link>
              </>
            )}

            <div className="border-t my-2" />

            <Button
              variant="ghost"
              className="w-full justify-start text-sm text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleSignOut}
            >
              <LogOut className="w-4 h-4 mr-3" />
              Sair
            </Button>
          </div>

          {/* Footer Info */}
          <div className="p-3 border-t bg-gray-50 text-center">
            <p className="text-xs text-gray-500">
              Desenrola DCL v1.0
            </p>
            <p className="text-xs text-gray-400">
              Última atualização: {new Date().toLocaleDateString('pt-BR')}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}