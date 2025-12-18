'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAuth } from '@/components/providers/AuthProvider'
import { useIntelligentTheme } from '@/lib/contexts/IntelligentThemeContext'
import { canAccessPage } from '@/lib/utils/page-permissions'
import {
  LayoutDashboard,
  Package,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  Store,
  Bell,
  ClipboardCheck
} from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface SidebarProps {
  isCollapsed: boolean
  onToggle: () => void
}

const NAVIGATION_ITEMS = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    gradient: 'from-blue-500 to-cyan-500',
    permission: 'dashboard'
  },
  {
    href: '/kanban',
    label: 'Kanban',
    icon: Package,
    gradient: 'from-purple-500 to-pink-500',
    permission: 'kanban'
  },
  {
    href: '/controle-os',
    label: 'Controle de OSs',
    icon: ClipboardCheck,
    gradient: 'from-yellow-500 to-orange-500',
    permission: 'controle-os'
  },
  {
    href: '/alertas',
    label: 'Alertas',
    icon: Bell,
    gradient: 'from-red-500 to-orange-500',
    permission: 'alertas'
  },
  {
    href: '/pedidos',
    label: 'Pedidos',
    icon: FileText,
    gradient: 'from-green-500 to-emerald-500',
    permission: 'pedidos'
  },
  {
    href: '/configuracoes',
    label: 'Configurações',
    icon: Settings,
    gradient: 'from-orange-500 to-red-500',
    permission: 'configuracoes'
  },
] as const

export function ModernSidebar({ isCollapsed, onToggle }: SidebarProps) {
  const pathname = usePathname()
  const { userProfile } = useAuth()
  const { currentTheme } = useIntelligentTheme()
  const userRole = userProfile?.role || ''
  const isDark = currentTheme.mode === 'dark'

  // Filtrar itens por permissão
  const visibleItems = NAVIGATION_ITEMS.filter(item => 
    canAccessPage(userRole, item.permission)
  )

  return (
    <TooltipProvider delayDuration={0}>
      <motion.aside
        initial={{ x: 0 }}
        animate={{ 
          width: isCollapsed ? 100 : 280,
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={cn(
          "fixed left-0 top-20 h-[calc(100vh-5rem)] border-r shadow-2xl z-40 flex flex-col transition-colors duration-300",
          isDark 
            ? "bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950 border-gray-800" 
            : "bg-gradient-to-b from-white via-gray-50 to-gray-100 border-gray-200"
        )}
      >
        {/* Menu Items */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={cn(
                  "text-xs font-semibold px-3 mb-3 uppercase tracking-wider",
                  isDark ? "text-gray-500" : "text-gray-600"
                )}
              >
                Menu Principal
              </motion.p>
            )}
          </AnimatePresence>
          
          {visibleItems.map((item, index) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`)
            
            const menuButton = (
              <Link href={item.href} key={item.href}>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ x: isCollapsed ? 0 : 4 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    "relative flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 group overflow-hidden cursor-pointer",
                    isActive 
                      ? isDark 
                        ? "bg-gray-800 text-white shadow-lg" 
                        : "bg-white text-gray-900 shadow-lg border border-gray-200"
                      : isDark
                        ? "text-gray-400 hover:text-white hover:bg-gray-800/50"
                        : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
                  )}
                >
                  {/* Gradient overlay on hover */}
                  <motion.div
                    className={cn(
                      "absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-10 transition-opacity",
                      `bg-gradient-to-r ${item.gradient}`
                    )}
                  />

                  {/* Icon with gradient background */}
                  <div className={cn(
                    "relative w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300",
                    isActive 
                      ? `bg-gradient-to-br ${item.gradient} shadow-md` 
                      : isDark
                        ? "bg-gray-800 group-hover:bg-gray-700"
                        : "bg-gray-100 group-hover:bg-gray-200"
                  )}>
                    <Icon size={14} className={cn(
                      "relative z-10",
                      isActive ? "text-white" : ""
                    )} />
                  </div>

                  {/* Label */}
                  <AnimatePresence mode="wait">
                    {!isCollapsed && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                        className="font-medium flex-1 text-left text-sm"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>

                  {/* Active indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className={cn(
                        "absolute right-0 w-1 h-8 rounded-l-full",
                        `bg-gradient-to-b ${item.gradient}`
                      )}
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}

                  {/* Hover arrow */}
                  {!isCollapsed && (
                    <ChevronRight 
                      size={16} 
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                  )}
                </motion.div>
              </Link>
            )

            // Wrap with tooltip when collapsed
            if (isCollapsed) {
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>
                    {menuButton}
                  </TooltipTrigger>
                  <TooltipContent side="right" className="bg-gray-900 text-white border-gray-800">
                    <p>{item.label}</p>
                  </TooltipContent>
                </Tooltip>
              )
            }

            return menuButton
          })}
        </nav>

        {/* User Info Section (bottom) */}
        <div className={cn(
          "border-t p-4",
          isDark ? "border-gray-800" : "border-gray-200"
        )}>
          <AnimatePresence mode="wait">
            {!isCollapsed ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg",
                  isDark ? "bg-gray-800/50" : "bg-white/70 border border-gray-200"
                )}
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 
                              flex items-center justify-center text-white font-bold flex-shrink-0 shadow-md">
                  {userProfile?.nome?.[0] || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "text-sm font-medium truncate",
                    isDark ? "text-white" : "text-gray-900"
                  )}>
                    {userProfile?.nome || 'Usuário'}
                  </p>
                  <p className={cn(
                    "text-xs truncate",
                    isDark ? "text-gray-400" : "text-gray-500"
                  )}>
                    {userProfile?.role || 'Loja'}
                  </p>
                </div>
              </motion.div>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-center"
                  >
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 
                                  flex items-center justify-center text-white font-bold">
                      {userProfile?.nome?.[0] || 'U'}
                    </div>
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-gray-900 text-white border-gray-800">
                  <p className="font-medium">{userProfile?.nome || 'Usuário'}</p>
                  <p className="text-xs text-gray-400">{userProfile?.role || 'Loja'}</p>
                </TooltipContent>
              </Tooltip>
            )}
          </AnimatePresence>
        </div>
      </motion.aside>
    </TooltipProvider>
  )
}
