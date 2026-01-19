'use client'

import { useState } from 'react'
import { usePermissions } from '@/lib/hooks/use-permissions'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PedidoCompleto, Usuario, StatusPedido } from '@/lib/types/database'
import { useUpdatePedidoStatus } from '@/lib/hooks/use-Pedidos'
import { 
  STATUS_LABELS, 
  PRIORITY_LABELS, 
  ALLOWED_TRANSITIONS,
  STATUS_COLORS 
} from '@/lib/utils/constants'
import {
  Calendar,
  DollarSign,
  User,
  Building2,
  AlertTriangle,
  Edit,
  CreditCard,
  ArrowRight,
  FileText,
  Copy
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import PagamentoForm from '../forms/PagamentoPIXForm'
import { PedidoTimeline } from './PedidoTimeline'

interface CardDetailsProps {
  pedido: PedidoCompleto
  open: boolean
  onClose: () => void
  onUpdate: () => void
  userProfile: Usuario
}

export function CardDetails({ pedido, open, onClose, onUpdate, userProfile }: CardDetailsProps) {
  const permissions = usePermissions()
  const [showPagamentoForm, setShowPagamentoForm] = useState(false)
  const updateStatusMutation = useUpdatePedidoStatus()

  const formatDate = (date: string | null) => {
    if (!date) return 'N/A'
    try {
      return format(parseISO(date), 'dd/MM/yyyy', { locale: ptBR })
    } catch {
      return 'Data inválida'
    }
  }

  const formatDateTime = (date: string | null) => {
    if (!date) return 'N/A'
    try {
      return format(parseISO(date), 'dd/MM/yyyy HH:mm', { locale: ptBR })
    } catch {
      return 'Data inválida'
    }
  }

  const formatCurrency = (value: number | null) => {
    if (!value) return 'N/A'
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    })
  }

  const getAvailableTransitions = () => {
    const allowed = ALLOWED_TRANSITIONS[pedido.status] || []
    return allowed.filter(status => status !== 'CANCELADO') // Handle cancel separately
  }

  const handleStatusChange = async (newStatus: string) => {
    try {
      await updateStatusMutation.mutateAsync({
        id: pedido.id,
        status: newStatus as StatusPedido,
        observacao: `Status alterado via detalhes: ${STATUS_LABELS[pedido.status]} → ${STATUS_LABELS[newStatus as keyof typeof STATUS_LABELS]}`,
        usuario: userProfile.email || 'sistema'
      })
      onUpdate()
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  const handlePagamentoSuccess = () => {
    setShowPagamentoForm(false)
    onUpdate()
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const availableTransitions = getAvailableTransitions()

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Pedido #{pedido.numero_sequencial}
            </DialogTitle>
            <DialogDescription>
              Detalhes completos do pedido e histórico de movimentações
            </DialogDescription>
            <div className="flex items-center space-x-3 pt-2">
              <Badge 
                variant={pedido.status.toLowerCase() as "default" | "secondary" | "destructive" | "outline"}
                style={{ 
                  backgroundColor: STATUS_COLORS[pedido.status],
                  color: 'white'
                }}
              >
                {STATUS_LABELS[pedido.status]}
              </Badge>
              {pedido.prioridade !== 'NORMAL' && (
                <Badge variant={pedido.prioridade.toLowerCase() as "default" | "secondary" | "destructive" | "outline"}>
                  {PRIORITY_LABELS[pedido.prioridade]}
                </Badge>
              )}
              {pedido.eh_garantia && (
                <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-300">
                  GARANTIA
                </Badge>
              )}
            </div>
          </DialogHeader>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Basic Info */}
            <div className="space-y-4">
              {/* Números do Sistema */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center">
                    <FileText className="w-4 h-4 mr-2" />
                    Números do Sistema
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Número da OS */}
                  <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                    <div>
                      <span className="text-sm text-gray-600">Número da OS Física:</span>
                      <div className="font-mono font-medium text-blue-700">
                        {pedido.numero_os_fisica || 'Não definido'}
                      </div>
                    </div>
                    {pedido.numero_os_fisica && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(pedido.numero_os_fisica!)}
                        className="h-8 w-8 p-0"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    )}
                  </div>

                  {/* Número do Laboratório */}
                  <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                    <div>
                      <span className="text-sm text-gray-600">Número do Laboratório:</span>
                      <div className="font-mono font-medium text-green-700">
                        {pedido.numero_pedido_laboratorio || '—'}
                      </div>
                    </div>
                    {pedido.numero_pedido_laboratorio && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(pedido.numero_pedido_laboratorio!)}
                        className="h-8 w-8 p-0"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    )}
                  </div>

                  {/* Status de envio ao lab */}
                  {!pedido.numero_pedido_laboratorio && ['REGISTRADO', 'AG_PAGAMENTO'].includes(pedido.status) && (
                    <div className="p-2 bg-yellow-50 rounded border border-yellow-200">
                      <span className="text-sm text-yellow-700">
                        ⏳ Pedido ainda não foi enviado ao laboratório
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Cliente Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    Informações do Cliente
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Nome:</span>
                    <span className="font-medium">{pedido.cliente_nome || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Telefone:</span>
                    <span className="font-medium">{pedido.cliente_telefone || 'N/A'}</span>
                  </div>
                  {!pedido.eh_garantia && permissions.canViewFinancialData() && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Valor:</span>
                      <span className="font-medium">{formatCurrency(pedido.valor_pedido)}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Informações Financeiras - apenas se não for garantia e permitido */}
              {!pedido.eh_garantia && permissions.canViewFinancialData() && (pedido.valor_pedido || pedido.custo_lentes) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center">
                      <DollarSign className="w-4 h-4 mr-2" />
                      Informações Financeiras
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      {pedido.valor_pedido && (
                        <div className="text-center p-3 bg-green-50 rounded">
                          <div className="text-sm text-gray-600">Valor de Venda</div>
                          <div className="text-lg font-semibold text-green-600">
                            {formatCurrency(pedido.valor_pedido)}
                          </div>
                        </div>
                      )}
                      {pedido.custo_lentes && (
                        <div className="text-center p-3 bg-orange-50 rounded">
                          <div className="text-sm text-gray-600">Custo das Lentes</div>
                          <div className="text-lg font-semibold text-orange-600">
                            {formatCurrency(pedido.custo_lentes)}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Margem de Lucro */}
                    {pedido.valor_pedido && pedido.custo_lentes && (
                      <div className="p-3 bg-gray-50 rounded border">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Margem de Lucro</span>
                          <div className="text-right">
                            <div className="font-semibold text-gray-800">
                              {formatCurrency(pedido.valor_pedido - pedido.custo_lentes)}
                            </div>
                            <div className={`text-sm font-medium ${
                              ((pedido.valor_pedido - pedido.custo_lentes) / pedido.valor_pedido) * 100 > 50 
                                ? 'text-green-600' 
                                : 'text-orange-600'
                            }`}>
                              {(((pedido.valor_pedido - pedido.custo_lentes) / pedido.valor_pedido) * 100).toFixed(1)}%
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Informações de Garantia */}
              {pedido.eh_garantia && (
                <Card className="border-orange-300 bg-orange-50">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center text-orange-800">
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Informações de Garantia
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="p-3 bg-white rounded border border-orange-200">
                      <div className="text-sm text-gray-600 mb-1">Motivo da Garantia:</div>
                      <div className="text-orange-700 font-medium">
                        {pedido.observacoes_garantia || 'Motivo não informado'}
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Custo do Refazer:</span>
                      <span className="font-medium text-orange-700">{formatCurrency(pedido.custo_lentes)}</span>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Loja & Lab Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center">
                    <Building2 className="w-4 h-4 mr-2" />
                    Loja & Laboratório
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Loja:</span>
                    <span className="font-medium">{pedido.loja_nome} ({pedido.loja_codigo})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Laboratório:</span>
                    <span className="font-medium">
                      {pedido.laboratorio_nome}
                      {pedido.laboratorio_codigo ? ` (${pedido.laboratorio_codigo})` : ''}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Classe:</span>
                    <Badge 
                      variant="outline"
                      style={{ 
                        borderColor: '#6B7280',
                        color: '#6B7280'
                      }}
                    >
                      {pedido.classe_lente_id}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Alertas */}
              {(pedido.pagamento_atrasado || pedido.producao_atrasada || pedido.requer_atencao) && (
                <Card className="border-amber-300 bg-amber-50">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center text-amber-800">
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Alertas
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {pedido.pagamento_atrasado && (
                      <Badge variant="warning" className="mr-2">
                        Pagamento Atrasado
                      </Badge>
                    )}
                    {pedido.producao_atrasada && (
                      <Badge variant="error" className="mr-2">
                        Produção Atrasada
                      </Badge>
                    )}
                    {pedido.requer_atencao && (
                      <Badge variant="error" className="mr-2">
                        Requer Atenção
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column - Dates & Actions */}
            <div className="space-y-4">
              {/* 🎯 SLA Intelligence */}
              <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
                <CardHeader>
                  <CardTitle className="text-base flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-2 text-blue-600" />
                    SLA Intelligence
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* SLA Laboratório */}
                  {pedido.data_sla_laboratorio && (
                    <div className="flex justify-between items-center p-2 bg-white rounded-lg border">
                      <div>
                        <span className="text-sm font-medium text-gray-700">SLA Laboratório:</span>
                        <div className="text-xs text-gray-500">Controle interno</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-blue-700">{formatDate(pedido.data_sla_laboratorio)}</div>
                        {(() => {
                          const hoje = new Date()
                          const dataSla = new Date(pedido.data_sla_laboratorio)
                          const diasRestantes = Math.ceil((dataSla.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))
                          return (
                            <div className={`text-xs font-medium ${
                              diasRestantes < 0 ? 'text-red-600' : 
                              diasRestantes <= 2 ? 'text-yellow-600' : 'text-green-600'
                            }`}>
                              {diasRestantes < 0 ? `${Math.abs(diasRestantes)}d atraso` : `${diasRestantes}d restam`}
                            </div>
                          )
                        })()}
                      </div>
                    </div>
                  )}

                  {/* Promessa ao Cliente */}
                  <div className="flex justify-between items-center p-2 bg-white rounded-lg border">
                    <div>
                      <span className="text-sm font-medium text-gray-700">Promessa Cliente:</span>
                      <div className="text-xs text-gray-500">Com margem de segurança</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-700">{formatDate(pedido.data_prometida)}</div>
                      {(() => {
                        const hoje = new Date()
                        const dataPromessa = pedido.data_prometida ? new Date(pedido.data_prometida) : null
                        if (!dataPromessa) return <div className="text-xs text-gray-400">Não definida</div>
                        const diasRestantes = Math.ceil((dataPromessa.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))
                        return (
                          <div className={`text-xs font-medium ${
                            diasRestantes < 0 ? 'text-red-600' : 
                            diasRestantes <= 3 ? 'text-yellow-600' : 'text-green-600'
                          }`}>
                            {diasRestantes < 0 ? `${Math.abs(diasRestantes)}d vencido` : `${diasRestantes}d restam`}
                          </div>
                        )
                      })()}
                    </div>
                  </div>

                  {/* Margem de Segurança */}
                  {pedido.margem_seguranca_dias && (
                    <div className="flex justify-between items-center p-2 bg-amber-50 rounded-lg border border-amber-200">
                      <span className="text-sm font-medium text-amber-700">Margem Segurança:</span>
                      <span className="font-bold text-amber-800">{pedido.margem_seguranca_dias} dias</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Datas */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    Cronologia Completa
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Pedido:</span>
                    <span className="font-medium">{formatDate(pedido.data_pedido)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Prev. Pronto:</span>
                    <span className="font-medium">{formatDate(pedido.data_prevista_pronto)}</span>
                  </div>
                  {/* Data de entrega - campo não existe na interface */}
                  {/* {pedido.data_entrega && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Entregue:</span>
                      <span className="font-medium text-green-600">{formatDate(pedido.data_entrega)}</span>
                    </div>
                  )} */}
                  {pedido.data_pagamento && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Pagamento:</span>
                      <span className="font-medium">{formatDate(pedido.data_pagamento)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Criado:</span>
                    <span className="font-medium">{formatDateTime(pedido.created_at || null)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Atualizado:</span>
                    <span className="font-medium">{formatDateTime(pedido.updated_at || null)}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Ações Rápidas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Payment Action */}
                  {pedido.status === 'AG_PAGAMENTO' && (
                    <Button
                      onClick={() => setShowPagamentoForm(true)}
                      className="w-full gradient-success"
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      Marcar Pagamento
                    </Button>
                  )}

                  {/* Status Transitions */}
                  {availableTransitions.map((status) => (
                    <Button
                      key={status}
                      variant="outline"
                      onClick={() => handleStatusChange(status)}
                      disabled={updateStatusMutation.isPending}
                      className="w-full"
                    >
                      <ArrowRight className="w-4 h-4 mr-2" />
                      Mover para {STATUS_LABELS[status as keyof typeof STATUS_LABELS]}
                    </Button>
                  ))}

                  {/* Edit Button */}
                  <Button variant="outline" className="w-full">
                    <Edit className="w-4 h-4 mr-2" />
                    Editar Pedido
                  </Button>
                </CardContent>
              </Card>

              {/* Observações */}
              {pedido.observacoes && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Observações Gerais</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-700">{pedido.observacoes}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* 🎯 Timeline Section */}
          <div className="mt-6">
            <PedidoTimeline pedido={pedido} />
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Form */}
      {showPagamentoForm && (
        <PagamentoForm
          pedido={pedido}
          onSuccess={handlePagamentoSuccess}
        />
      )}
    </>
  )
}