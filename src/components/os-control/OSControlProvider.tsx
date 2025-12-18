// 🔔 Provider de Verificação Automática de OSs Não Lançadas

'use client'

import { useEffect, useState } from 'react'
import { useOSControl } from '@/hooks/useOSControl'
import { OSNaoLancadaModal } from './OSNaoLancadaModal'

interface OSControlProviderProps {
  children: React.ReactNode
  autoCheck?: boolean // Se true, verifica automaticamente ao carregar
  checkInterval?: number // Intervalo de verificação em ms (padrão: 5 min)
}

export function OSControlProvider({ 
  children, 
  autoCheck = true,
  checkInterval = 1000 * 60 * 5 // 5 minutos
}: OSControlProviderProps) {
  const { osGaps, isLoading } = useOSControl()
  const [modalOpen, setModalOpen] = useState(false)
  const [hasShownOnLoad, setHasShownOnLoad] = useState(false)

  // Verificação automática ao carregar a página
  useEffect(() => {
    if (!autoCheck || isLoading || hasShownOnLoad) return

    // Se houver OSs pendentes, mostra o modal
    if (osGaps && osGaps.length > 0) {
      setModalOpen(true)
      setHasShownOnLoad(true)
    }
  }, [osGaps, isLoading, autoCheck, hasShownOnLoad])

  // Verificação periódica
  useEffect(() => {
    if (!autoCheck || !checkInterval) return

    const interval = setInterval(() => {
      // Revalida a query para buscar novas OSs pendentes
      // TanStack Query já faz isso automaticamente com refetchInterval
    }, checkInterval)

    return () => clearInterval(interval)
  }, [autoCheck, checkInterval])

  return (
    <>
      {children}
      <OSNaoLancadaModal 
        open={modalOpen} 
        onClose={() => setModalOpen(false)}
        autoShowNext={true}
      />
    </>
  )
}
