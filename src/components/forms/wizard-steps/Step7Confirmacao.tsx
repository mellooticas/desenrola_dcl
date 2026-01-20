'use client'

import { CheckCircle, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Step7Props {
  onClose: () => void
}

export function Step7Confirmacao({ onClose }: Step7Props) {
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-6">
      <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center">
        <CheckCircle className="w-12 h-12 text-green-600" />
      </div>

      <div className="text-center space-y-2">
        <h3 className="text-2xl font-bold">Pedido Criado com Sucesso!</h3>
        <p className="text-muted-foreground">
          O pedido foi salvo e já aparece no sistema.
        </p>
      </div>

      <div className="flex gap-3">
        <Button onClick={onClose} variant="outline">
          Fechar
        </Button>
        <Button onClick={() => window.location.href = '/kanban'}>
          Ver no Kanban
          <ExternalLink className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}
