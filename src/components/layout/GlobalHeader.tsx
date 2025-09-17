'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAuth } from '@/components/providers/AuthProvider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Search,
  Bell,
  LogOut,
  Menu,
  X,
  BarChart3,
  Package,
  FileText,
  Settings,
  User,
  Layers
} from 'lucide-react'
import { Usuario } from '@/components/providers/AuthProvider'

interface GlobalHeaderProps {
  className?: string
}

// Navigation configuration
const NAVIGATION_ITEMS = [
  { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
  { name: 'Kanban', href: '/kanban', icon: Package },
  { name: 'Pedidos', href: '/pedidos', icon: FileText },
  { name: 'Configurações', href: '/configuracoes', icon: Settings }
] as const

// Clean logo component
const Logo = () => (
  <Link href="/dashboard" className="flex items-center gap-3 group transition-all duration-300 hover:scale-105">
    <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
      <Layers className="w-6 h-6 text-white" />
    </div>
    <div className="hidden sm:block">
      <h1 className="text-lg font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
        Desenrola DCL
      </h1>
      <p className="text-xs text-slate-500 group-hover:text-slate-600 transition-colors">
        Sistema de Gestão
      </p>
    </div>
  </Link>
)

// Clean navigation link
const NavigationLink = ({ item, isActive }: { 
  item: { name: string; href: string; icon: React.ComponentType<{ className?: string }> }
  isActive: boolean 
}) => {
  const Icon = item.icon
  
  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 relative",
        isActive 
          ? "bg-blue-50 text-blue-700 border border-blue-200 shadow-sm" 
          : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
      )}
    >
      <Icon className="w-4 h-4" />
      <span>{item.name}</span>
      {isActive && (
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full" />
      )}
    </Link>
  )
}

// Clean search component
const SearchBox = () => (
  <div className="hidden md:flex relative max-w-sm">
    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
    <Input
      type="text"
      placeholder="Buscar pedido ou cliente..."
      className="pl-10 pr-4 bg-white/80 backdrop-blur-sm border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
    />
  </div>
)

// Clean notification bell
const NotificationBell = () => (
  <Button
    variant="ghost"
    size="sm"
    className="relative p-2 hover:bg-red-50 text-slate-600 hover:text-red-600 rounded-lg transition-all"
  >
    <Bell className="w-4 h-4" />
    <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
      3
    </div>
  </Button>
)

// Clean user info
const UserInfo = ({ userProfile, onLogout }: { 
  userProfile: Usuario | null
  onLogout: () => void 
}) => (
  <div className="hidden md:flex items-center gap-3">
    <div className="flex items-center gap-2 px-3 py-1 rounded-lg hover:bg-slate-50 transition-all cursor-pointer">
      <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-sm">
        <User className="w-4 h-4 text-white" />
      </div>
      <div className="text-right">
        <p className="text-sm font-semibold text-slate-800">{userProfile?.nome || 'Usuário'}</p>
        <p className="text-xs text-slate-500">{userProfile?.role || 'Loja'}</p>
      </div>
    </div>
    
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={onLogout}
      className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
    >
      <LogOut className="w-4 h-4" />
    </Button>
  </div>
)

// Clean status indicator
const StatusIndicator = () => (
  <div className="hidden xl:flex items-center gap-2 px-3 py-1 bg-green-50 border border-green-200 rounded-lg">
    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
    <span className="text-xs font-medium text-green-700">Online</span>
  </div>
)

// Clean mobile navigation
const MobileNavigation = ({ isOpen, onClose, userProfile, onLogout }: {
  isOpen: boolean
  onClose: () => void
  userProfile: Usuario | null
  onLogout: () => void
}) => {
  const pathname = usePathname()
  const navigationItems = NAVIGATION_ITEMS.map(item => ({
    ...item,
    current: pathname?.startsWith(item.href) || pathname === item.href
  }))

  return (
    <div 
      className={cn(
        "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-all duration-300",
        isOpen ? "opacity-100 visible" : "opacity-0 invisible"
      )}
      onClick={onClose}
    >
      <div 
        className={cn(
          "fixed top-0 right-0 w-80 h-full bg-white/95 backdrop-blur-xl border-l border-slate-200 p-6 transition-transform duration-300",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-8">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Menu</h3>
            <p className="text-xs text-slate-500">Navegação principal</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="p-2">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="space-y-3 mb-8">
          {navigationItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition-all",
                  item.current 
                    ? "bg-blue-50 text-blue-700 border border-blue-200" 
                    : "text-slate-600 hover:bg-slate-50"
                )}
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </div>

        <div className="border-t border-slate-200 pt-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">{userProfile?.nome || 'Usuário'}</p>
              <p className="text-xs text-slate-500">{userProfile?.role || 'Loja'}</p>
            </div>
          </div>

          <Button 
            onClick={() => { onLogout(); onClose() }}
            variant="ghost"
            className="w-full justify-start gap-2 text-red-600 hover:bg-red-50 p-3 rounded-lg"
          >
            <LogOut className="w-4 h-4" />
            Sair do Sistema
          </Button>
        </div>
      </div>
    </div>
  )
}

// Main component - clean and organized
export default function GlobalHeader({ className }: GlobalHeaderProps) {
  const { user, userProfile, logout } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navigationItems = NAVIGATION_ITEMS.map(item => ({
    ...item,
    isActive: pathname?.startsWith(item.href) || pathname === item.href
  }))

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/')
    } catch (error) {
      console.error('Erro no logout:', error)
    }
  }

  if (!user) return null

  return (
    <>
      <header className={cn(
        "sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-slate-200 shadow-sm transition-all duration-200",
        className
      )}>
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-20 gap-6">
          <Logo />
          
          <nav className="hidden lg:flex items-center gap-2">
            {navigationItems.map((item) => (
              <NavigationLink key={item.name} item={item} isActive={item.isActive} />
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <SearchBox />
            <NotificationBell />
            <StatusIndicator />
            <UserInfo userProfile={userProfile} onLogout={handleLogout} />
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 text-slate-600 hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <MobileNavigation
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        userProfile={userProfile}
        onLogout={handleLogout}
      />
    </>
  )
}

