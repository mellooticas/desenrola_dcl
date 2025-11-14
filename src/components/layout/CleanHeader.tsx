'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useAuth } from '@/components/providers/AuthProvider'
import { useIntelligentTheme } from '@/lib/contexts/IntelligentThemeContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Search,
  Bell,
  LogOut,
  Menu,
  Sun,
  Moon,
  User,
  Settings,
  HelpCircle,
  PanelLeftClose,
  PanelLeft
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface CleanHeaderProps {
  isCollapsed: boolean
  onToggleSidebar: () => void
  className?: string
}

export function CleanHeader({ isCollapsed, onToggleSidebar, className }: CleanHeaderProps) {
  const { userProfile, logout } = useAuth()
  const { currentTheme, updateTheme } = useIntelligentTheme()
  const router = useRouter()
  const [searchValue, setSearchValue] = useState('')
  
  const isDark = currentTheme.mode === 'dark'
  
  const toggleTheme = () => {
    updateTheme({
      ...currentTheme,
      mode: isDark ? 'light' : 'dark'
    })
  }

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/')
    } catch (error) {
      console.error('Erro no logout:', error)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchValue.trim()) {
      // TODO: Implementar busca global
      console.log('Buscar:', searchValue)
    }
  }

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 shadow-sm",
        className
      )}
    >
      <div className="flex items-center justify-between h-20 px-6 gap-6">
        
        {/* Left section - Toggle + Logo + Search */}
        <div className="flex items-center gap-4 flex-1">
          {/* Sidebar toggle - Desktop */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onToggleSidebar}
            className="hidden lg:flex p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 
                     text-gray-600 dark:text-gray-400 transition-colors flex-shrink-0"
            title={isCollapsed ? 'Expandir menu' : 'Recolher menu'}
          >
            {isCollapsed ? <PanelLeft size={20} /> : <PanelLeftClose size={20} />}
          </motion.button>

          {/* Mobile menu toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 
                     text-gray-600 dark:text-gray-400 transition-colors flex-shrink-0"
          >
            <Menu size={20} />
          </motion.button>

          {/* Logo */}
          <Link 
            href="/dashboard" 
            className="flex items-center group transition-all duration-300 hover:opacity-80 flex-shrink-0"
          >
            <Image
              src="/logo_desenrola.svg"
              alt="Desenrola DCL"
              width={109}
              height={36}
              priority={true}
              className="hidden sm:block object-contain dark:invert"
              style={{ filter: isDark ? 'invert(1) brightness(1.2)' : 'none' }}
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = "/logo_desenrola.png"
              }}
            />
            <Image
              src="/logo_desenrola.svg"
              alt="DCL"
              width={88}
              height={30}
              priority={true}
              className="sm:hidden object-contain dark:invert"
              style={{ filter: isDark ? 'invert(1) brightness(1.2)' : 'none' }}
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = "/logo_desenrola.png"
              }}
            />
          </Link>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-lg ml-4">
            <div className="relative w-full group">
              <Search 
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 
                         group-focus-within:text-blue-500 transition-colors" 
                size={18} 
              />
              <Input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Buscar pedidos, clientes..."
                className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800
                         border-2 border-transparent focus:border-blue-500 
                         focus:bg-white dark:focus:bg-gray-900
                         text-gray-900 dark:text-white placeholder:text-gray-400
                         transition-all duration-200 outline-none"
              />
              
              {/* Shortcut hint */}
              <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden lg:flex
                            px-2 py-1 rounded bg-gray-200 dark:bg-gray-700
                            text-xs text-gray-500 dark:text-gray-400 font-mono 
                            opacity-50 group-focus-within:opacity-100 transition-opacity">
                ⌘K
              </div>
            </div>
          </form>
        </div>

        {/* Right section - Actions */}
        <div className="flex items-center gap-2">
          
          {/* Notifications */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="ghost"
              size="sm"
              className="relative p-2.5 hover:bg-red-50 dark:hover:bg-red-950/30 
                       text-gray-600 dark:text-gray-400 hover:text-red-600 
                       dark:hover:text-red-400 rounded-xl transition-colors"
            >
              <Bell size={18} />
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r 
                         from-red-500 to-pink-500 text-white text-xs rounded-full 
                         flex items-center justify-center shadow-lg font-bold"
              >
                3
              </motion.div>
            </Button>
          </motion.div>

          {/* Theme toggle */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="p-2.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 
                       dark:hover:bg-gray-800 rounded-xl transition-colors hidden sm:flex"
              title={isDark ? 'Modo claro' : 'Modo escuro'}
            >
              <motion.div
                initial={false}
                animate={{ rotate: isDark ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                {isDark ? <Sun size={18} /> : <Moon size={18} />}
              </motion.div>
            </Button>
          </motion.div>

          {/* Status indicator */}
          <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 bg-green-50 
                        dark:bg-green-950/30 border border-green-200 dark:border-green-900 
                        rounded-lg">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-2 h-2 bg-green-500 rounded-full"
            />
            <span className="text-xs font-medium text-green-700 dark:text-green-400">
              Online
            </span>
          </div>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-3 pl-3 pr-4 py-2 rounded-xl
                         hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 
                              flex items-center justify-center text-white font-bold shadow-lg
                              shadow-orange-500/30">
                  {userProfile?.nome?.[0] || 'U'}
                </div>
                <div className="text-left hidden lg:block">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {userProfile?.nome || 'Usuário'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {userProfile?.role || 'Loja'}
                  </p>
                </div>
              </motion.button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div>
                  <p className="font-medium">{userProfile?.nome || 'Usuário'}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-normal">
                    {userProfile?.email || ''}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Meu Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/configuracoes')}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Configurações</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <HelpCircle className="mr-2 h-4 w-4" />
                <span>Ajuda</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleLogout}
                className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
