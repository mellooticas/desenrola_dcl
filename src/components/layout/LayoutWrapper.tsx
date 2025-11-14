'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { ModernSidebar } from './ModernSidebar'
import { CleanHeader } from './CleanHeader'

interface LayoutWrapperProps {
  children: React.ReactNode
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Páginas que não devem mostrar o layout (sidebar + header)
  const pagesWithoutLayout = [
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password'
  ]

  const shouldShowLayout = !pagesWithoutLayout.includes(pathname)

  // Persistir estado da sidebar no localStorage
  useEffect(() => {
    const saved = localStorage.getItem('sidebar-collapsed')
    if (saved !== null) {
      setIsCollapsed(saved === 'true')
    }
  }, [])

  const handleToggleSidebar = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    localStorage.setItem('sidebar-collapsed', String(newState))
  }

  if (!shouldShowLayout) {
    return <div className="min-h-screen">{children}</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Sidebar */}
      <ModernSidebar 
        isCollapsed={isCollapsed} 
        onToggle={handleToggleSidebar} 
      />

      {/* Header */}
      <CleanHeader 
        isCollapsed={isCollapsed}
        onToggleSidebar={handleToggleSidebar}
      />

      {/* Main content */}
      <motion.main
        animate={{ 
          marginLeft: isCollapsed ? '100px' : '280px',
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="pt-20 min-h-screen"
      >
        <div className="p-6">
          {children}
        </div>
      </motion.main>
    </div>
  )
}