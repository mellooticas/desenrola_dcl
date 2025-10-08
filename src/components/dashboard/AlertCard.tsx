// ================================================================
// src/components/dashboard/AlertCard.tsx
// VERSÃO PROFISSIONAL - Alertas com dados completos e ações funcionais
// ================================================================

'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { openWhatsApp, WhatsAppTemplates } from '@/lib/utils/whatsapp'
import { toast } from 'sonner'

// Ícones como constantes  
const IconesAlertCard = {
  AlertTriangle: '⚠️',
  WhatsApp: '💬',
  Eye: '👁️',
  Store: '🏪',
  Factory: '🏭',
  Calendar: '�',
  Money: '💰',
  Phone: '�'
}

import type { AlertaCritico } from '@/lib/types/dashboard-bi'

interface AlertCardProps {
  alerta: AlertaCritico
  onAction?: (action: string, alerta: AlertaCritico) => void
  showActions?: boolean
  compact?: boolean
}

export function AlertCard({ alerta, onAction, showActions = true, compact = false }: AlertCardProps) {
  const router = useRouter()
  
  const getPriorityColor = (prioridade: string) => {
    switch (prioridade) {
      case 'CRITICA': return 'bg-red-50 border-red-200'
      case 'ALTA': return 'bg-orange-50 border-orange-200' 
      case 'MEDIA': return 'bg-yellow-50 border-yellow-200'
      default: return 'bg-gray-50 border-gray-200'
    }
  }

  const getPriorityBadgeColor = (prioridade: string) => {
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

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case 'PEDIDO_ATRASADO': return 'Pedido Atrasado'
      case 'SLA_PROXIMO_VENCIMENTO': return 'SLA Vencendo'
      case 'PAGAMENTO_PENDENTE': return 'Pagamento Pendente'
      default: return tipo
    }
  }

  // Ações funcionais
  const handleWhatsApp = () => {
    const dados = alerta.dados
    if (!dados?.cliente_telefone) {
      toast.error('Telefone do cliente não disponível')
      return
    }

    let message = ''
    
    switch (alerta.tipo) {
      case 'PEDIDO_ATRASADO':
        const diasAtraso = Math.floor(
          (new Date().getTime() - new Date(dados.data_prevista_pronto).getTime()) / (1000 * 60 * 60 * 24)
        )
        message = WhatsAppTemplates.pedidoAtrasado(
          dados.cliente_nome,
          dados.numero_sequencial,
          diasAtraso
        )
        break
      
      case 'SLA_PROXIMO_VENCIMENTO':
        const diasRestantes = Math.floor(
          (new Date(dados.data_prevista_pronto).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        )
        message = WhatsAppTemplates.slaVencendo(
          dados.cliente_nome,
          dados.numero_sequencial,
          diasRestantes
        )
        break
      
      case 'PAGAMENTO_PENDENTE':
        message = WhatsAppTemplates.pagamentoPendente(
          dados.cliente_nome,
          dados.numero_sequencial,
          dados.valor_pedido
        )
        break
    }

    openWhatsApp(dados.cliente_telefone, message)
    toast.success(`WhatsApp aberto para ${dados.cliente_nome}`)
  }

  const handleVerDetalhes = () => {
    if (alerta.dados?.id) {
      router.push(`/pedidos/${alerta.dados.id}`)
      toast.info('Abrindo detalhes do pedido...')
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  return (
    <Card className={`border-l-4 ${getPriorityColor(alerta.prioridade)}`}>
      <CardContent className={`${compact ? 'p-4' : 'p-6'}`}>
        <div className="space-y-4">
          {/* Header com Prioridade e Tipo */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{getPriorityIcon(alerta.prioridade)}</span>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={getPriorityBadgeColor(alerta.prioridade)} className="font-semibold">
                    {alerta.prioridade}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {getTipoLabel(alerta.tipo)}
                  </Badge>
                </div>
                <h4 className="font-bold text-lg">{alerta.titulo}</h4>
              </div>
            </div>
          </div>
          
          {/* Informações Cruciais do Pedido */}
          {alerta.dados && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 bg-white p-3 rounded-lg border">
              <div className="space-y-1">
                <div className="text-xs text-gray-500 font-medium">Cliente</div>
                <div className="font-semibold text-sm truncate" title={alerta.dados.cliente_nome}>
                  {alerta.dados.cliente_nome}
                </div>
                {alerta.dados.cliente_telefone && (
                  <div className="text-xs text-gray-600">
                    {IconesAlertCard.Phone} {alerta.dados.cliente_telefone}
                  </div>
                )}
              </div>
              
              <div className="space-y-1">
                <div className="text-xs text-gray-500 font-medium">Pedido</div>
                <div className="font-bold text-sm text-blue-600">
                  #{alerta.dados.numero_sequencial}
                </div>
                {alerta.dados.valor_pedido && (
                  <div className="text-xs text-green-600 font-semibold">
                    {IconesAlertCard.Money} {formatCurrency(alerta.dados.valor_pedido)}
                  </div>
                )}
              </div>
              
              {alerta.dados.lojas && (
                <div className="space-y-1">
                  <div className="text-xs text-gray-500 font-medium">
                    {IconesAlertCard.Store} Loja
                  </div>
                  <div className="font-semibold text-sm truncate" title={alerta.dados.lojas.nome}>
                    {alerta.dados.lojas.nome}
                  </div>
                  {alerta.dados.lojas.telefone && (
                    <div className="text-xs text-gray-600">
                      {alerta.dados.lojas.telefone}
                    </div>
                  )}
                </div>
              )}
              
              {alerta.dados.laboratorios && (
                <div className="space-y-1">
                  <div className="text-xs text-gray-500 font-medium">
                    {IconesAlertCard.Factory} Laboratório
                  </div>
                  <div className="font-semibold text-sm truncate" title={alerta.dados.laboratorios.nome}>
                    {alerta.dados.laboratorios.nome}
                  </div>
                  {alerta.dados.laboratorios.telefone && (
                    <div className="text-xs text-gray-600">
                      {alerta.dados.laboratorios.telefone}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          
          {/* Mensagem do Alerta */}
          <div className={`p-3 rounded-lg ${
            alerta.prioridade === 'CRITICA' ? 'bg-red-100 border border-red-200' :
            alerta.prioridade === 'ALTA' ? 'bg-orange-100 border border-orange-200' :
            'bg-yellow-100 border border-yellow-200'
          }`}>
            <div className="text-sm font-medium">{alerta.mensagem}</div>
            <div className="text-xs text-gray-600 mt-1 flex items-center gap-1">
              {IconesAlertCard.Calendar} {new Date(alerta.created_at).toLocaleString('pt-BR')}
            </div>
          </div>
        </div>
        
        {/* Botões de Ação FUNCIONAIS */}
        {showActions && alerta.dados && (
          <div className="flex gap-2 pt-4 border-t mt-4">
            <Button 
              size="sm" 
              variant="default"
              onClick={handleWhatsApp}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
            >
              <span className="text-lg">{IconesAlertCard.WhatsApp}</span>
              WhatsApp
            </Button>
            
            <Button 
              size="sm" 
              variant="outline"
              onClick={handleVerDetalhes}
              className="flex items-center gap-2"
            >
              <span>{IconesAlertCard.Eye}</span>
              Ver Detalhes
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}