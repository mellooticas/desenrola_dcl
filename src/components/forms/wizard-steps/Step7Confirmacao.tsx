'use client'

import { CheckCircle, ExternalLink, Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { PrintOrderButton } from '@/components/pedidos/PrintOrderButton'

interface Step7Props {
  pedido: any // Pedido criado (do Supabase)
  onClose: () => void
}

export function Step7Confirmacao({ pedido, onClose }: Step7Props) {
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-6">
      <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center">
        <CheckCircle className="w-12 h-12 text-green-600" />
      </div>

      <div className="text-center space-y-2">
        <h3 className="text-2xl font-bold">Pedido Criado com Sucesso!</h3>
        {pedido && (
          <p className="text-muted-foreground">
            Pedido <strong>#{pedido.numero_sequencial}</strong> foi salvo e já aparece no sistema.
          </p>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
        <Button onClick={onClose} variant="outline" className="flex-1">
          Fechar
        </Button>
        
        {pedido && (
          <PrintOrderButton 
            pedido={pedido} 
            variant="default"
            className="flex-1"
            showLabel={true}
          />
        )}
        
        <Button onClick={() => window.location.href = '/kanban'} className="flex-1">
          Ver no Kanban
          <ExternalLink className="w-4 h-4 ml-2" />
        </Button>
      </div>

      {pedido && (
        <p className="text-xs text-muted-foreground">
          💡 Dica: Você pode imprimir agora ou depois abrindo o pedido
        </p>
      )}
    </div>
  )
}
