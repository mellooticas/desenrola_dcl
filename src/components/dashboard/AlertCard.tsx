// ================================================================
// src/components/dashboard/AlertCard.tsx
// ================================================================

'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
// Ícones como constantes  
const IconesAlertCard = {
  AlertTriangle: '⚠️',
  Phone: '📞',
  Mail: '📧',
  Eye: '👁️'
}
import type { AlertaCritico } from '@/lib/types/dashboard-bi'

interface AlertCardProps {
  alerta: AlertaCritico
  onAction?: (action: string, alerta: AlertaCritico) => void
  showActions?: boolean
  compact?: boolean
}

export function AlertCard({ alerta, onAction, showActions = true, compact = false }: AlertCardProps) {
  const getPriorityColor = (prioridade: string) => {
    switch (prioridade) {
      case 'CRITICA': return 'destructive'
      case 'ALTA': return 'destructive' 
      case 'MEDIA': return 'secondary'
      default: return 'outline'
    }
  }

  const getPriorityIcon = (prioridade: string) => {
    switch (prioridade) {
      case 'CRITICA': return '🔴'
      case 'ALTA': return '🟠'
      case 'MEDIA': return '🟡'
      default: return '⚪'
    }
  }

  return (
    <Card className={`${alerta.prioridade === 'CRITICA' ? 'border-red-500' : ''}`}>
      <CardContent className={`${compact ? 'p-4' : 'p-6'}`}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{getPriorityIcon(alerta.prioridade)}</span>
              <Badge variant={getPriorityColor(alerta.prioridade)}>
                {alerta.prioridade}
              </Badge>
              <Badge variant="outline">{alerta.tipo}</Badge>
            </div>
            
            <h4 className="font-semibold text-lg mb-1">{alerta.titulo}</h4>
            <p className="text-gray-700 mb-2">{alerta.descricao}</p>
            
            {alerta.dados && (
              <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                <div>
                  <span className="text-gray-500">Cliente:</span>
                  <span className="ml-2 font-medium">{alerta.dados.cliente_nome}</span>
                </div>
                <div>
                  <span className="text-gray-500">Pedido:</span>
                  <span className="ml-2 font-medium">#{alerta.dados.numero_sequencial}</span>
                </div>
              </div>
            )}
            
            <div className="bg-blue-50 p-3 rounded-lg mb-3">
              <div className="font-medium text-blue-800 text-sm">Status:</div>
              <div className="text-blue-700 text-sm">{alerta.mensagem}</div>
              <div className="text-xs text-blue-600 mt-1">
                Criado em: {new Date(alerta.created_at).toLocaleString('pt-BR')}
              </div>
            </div>
          </div>
        </div>
        
        {showActions && (
          <div className="flex gap-2 pt-3 border-t">
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => onAction?.('phone', alerta)}
              className="flex items-center gap-1"
            >
              <span>{IconesAlertCard.Phone}</span>
              Ligar
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => onAction?.('email', alerta)}
              className="flex items-center gap-1"
            >
              <span>{IconesAlertCard.Mail}</span>
              Email
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => onAction?.('details', alerta)}
              className="flex items-center gap-1"
            >
              <span>{IconesAlertCard.Eye}</span>
              Detalhes
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}