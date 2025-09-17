/* ===================================================================
   🎭 PROVIDERS CENTRALIZADOS - DESENROLA DCL
   Centralizador de todos os providers do sistema inteligente
   ================================================================== */

'use client'

import React from 'react'
import { IntelligentThemeProvider } from '@/lib/contexts/IntelligentThemeContext'
import { AuthProvider } from '@/components/providers/AuthProvider'
import { ToastProvider } from '@/components/providers/ToastProvider'

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <IntelligentThemeProvider>
      <AuthProvider>
        <ToastProvider>
          {children}
        </ToastProvider>
      </AuthProvider>
    </IntelligentThemeProvider>
  )
}

export default Providers

// Re-exports dos providers individuais
export { IntelligentThemeProvider } from '@/lib/contexts/IntelligentThemeContext'
export { AuthProvider } from '@/components/providers/AuthProvider'
export { ToastProvider } from '@/components/providers/ToastProvider'