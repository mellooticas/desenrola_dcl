// 🔔 Badge Indicador de OSs Pendentes

'use client'

import { useState } from 'react'
import { useOSPendentes } from '@/hooks/useOSControl'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle } from 'lucide-react'
import { OSNaoLancadaModal } from './OSNaoLancadaModal'
import { cn } from '@/lib/utils'

interface OSPendentesBadgeProps {
  showButton?: boolean
  className?: string
}

export function OSPendentesBadge({ showButton = true, className }: OSPendentesBadgeProps) {
  const { totalPendentes } = useOSPendentes()
  const [modalOpen, setModalOpen] = useState(false)

  if (totalPendentes === 0) return null

  return (
    <>
      {showButton ? (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setModalOpen(true)}
          className={cn(
            "relative gap-2 border-yellow-300 dark:border-yellow-700 hover:bg-yellow-50 dark:hover:bg-yellow-950/20",
            className
          )}
        >
          <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-500" />
          <span className="hidden sm:inline">OSs Pendentes</span>
          <Badge 
            variant="destructive" 
            className="ml-1 bg-yellow-600 hover:bg-yellow-700"
          >
            {totalPendentes}
          </Badge>
        </Button>
      ) : (
        <div 
          onClick={() => setModalOpen(true)}
          className={cn("cursor-pointer", className)}
        >
          <Badge 
            variant="destructive" 
            className="gap-1 bg-yellow-600 hover:bg-yellow-700 transition-colors"
          >
            <AlertTriangle className="h-3 w-3" />
            {totalPendentes} OS{totalPendentes > 1 ? 's' : ''} pendente{totalPendentes > 1 ? 's' : ''}
          </Badge>
        </div>
      )}

      <OSNaoLancadaModal 
        open={modalOpen} 
        onClose={() => setModalOpen(false)}
        autoShowNext={true}
      />
    </>
  )
}
