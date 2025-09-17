// ================================================================
// src/components/dashboard/AlertCard.tsx
// ================================================================

'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Phone, Mail, Eye } from 'lucide-react'
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
      case 'CRÍTICA': return 'destructive'
      case 'ALTA': return 'destructive' 
      case 'MÉDIA': return 'secondary'
      default: return 'outline'
    }
  }

  const getPriorityIcon = (prioridade: string) => {
    switch (prioridade) {
      case 'CRÍTICA': return '🔴'
      case 'ALTA': return '🟠'
      case 'MÉDIA': return '🟡'
      default: return '⚪'
    }
  }

  return (
    <Card className={`${alerta.prioridade === 'CRÍTICA' ? 'border-red-500' : ''}`}>
      <CardContent className={`${compact ? 'p-4' : 'p-6'}`}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{getPriorityIcon(alerta.prioridade)}</span>
              <Badge variant={getPriorityColor(alerta.prioridade)}>
                {alerta.prioridade}
              </Badge>
              <Badge variant="outline">{alerta.tipo_alerta}</Badge>
            </div>
            
            <h4 className="font-semibold text-lg mb-1">{alerta.laboratorio_nome}</h4>
            <p className="text-gray-700 mb-2">{alerta.problema}</p>
            
            <div className="grid grid-cols-2 gap-4 text-sm mb-3">
              <div>
                <span className="text-gray-500">Pedidos afetados:</span>
                <span className="ml-2 font-medium">{alerta.pedidos_afetados}</span>
              </div>
              <div>
                <span className="text-gray-500">Valor em risco:</span>
                <span className="ml-2 font-medium">R$ {alerta.valor_risco.toLocaleString('pt-BR')}</span>
              </div>
            </div>
            
            <div className="bg-blue-50 p-3 rounded-lg mb-3">
              <div className="font-medium text-blue-800 text-sm">Ação Sugerida:</div>
              <div className="text-blue-700 text-sm">{alerta.acao_sugerida}</div>
              <div className="text-xs text-blue-600 mt-1">Prazo: {alerta.prazo_acao}</div>
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
              <Phone className="w-4 h-4" />
              Ligar
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => onAction?.('email', alerta)}
              className="flex items-center gap-1"
            >
              <Mail className="w-4 h-4" />
              Email
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => onAction?.('details', alerta)}
              className="flex items-center gap-1"
            >
              <Eye className="w-4 h-4" />
              Detalhes
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}