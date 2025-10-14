import React, { useState } from 'react'
import { PedidoCompleto, Montador } from '@/lib/types/database'
import { usePermissions } from '@/lib/hooks/use-permissions'
import { MontadorSelector } from '@/components/forms/MontadorSelector'
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle 
} from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  User,
  Phone,
  Building2,
  Beaker,
  Eye,
  Calendar,
  Clock,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Package,
  Sparkles,
  FileText,
  MessageSquare,
  TrendingUp,
  Timer,
  Target,
  ExternalLink,
  ArrowLeft,
  ArrowRight,
  X,
  Zap
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import Link from 'next/link'

interface PedidoDetailDrawerProps {
  pedido: PedidoCompleto | null
  isOpen: boolean
  onClose: () => void
  // Funções de ação
  onAdvanceStatus?: (pedido: PedidoCompleto) => Promise<void>
  onRegressStatus?: (pedido: PedidoCompleto) => Promise<void>
  onCancelPedido?: (pedido: PedidoCompleto) => Promise<void>
  onSelectMontador?: (pedidoId: string, montador: Montador) => Promise<void>
  // Permissões
  canMoveNext?: boolean
  canMovePrev?: boolean
  canCancel?: boolean
  // Labels dinâmicos para os botões
  nextStatusLabel?: string
  prevStatusLabel?: string
}

export function PedidoDetailDrawer({ 
  pedido, 
  isOpen, 
  onClose,
  onAdvanceStatus,
  onRegressStatus, 
  onCancelPedido,
  onSelectMontador,
  canMoveNext = false,
  canMovePrev = false,
  canCancel = false,
  nextStatusLabel = 'Avançar',
  prevStatusLabel = 'Retroceder'
}: PedidoDetailDrawerProps) {
  const permissions = usePermissions()
  const [showMontadorSelector, setShowMontadorSelector] = useState(false)
  
  if (!pedido) return null

  const formatCurrency = (value: number | null) => {
    if (!value) return 'N/A'
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    })
  }

  const formatDate = (date: string | null) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric'
    })
  }

  const formatDateTime = (date: string | null) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleString('pt-BR')
  }

  const handleMontadorSelect = async (montador: Montador) => {
    if (onSelectMontador) {
      try {
        await onSelectMontador(pedido.id, montador)
        setShowMontadorSelector(false)
        // Opcional: mostrar toast de sucesso
      } catch (error) {
        console.error('Erro ao selecionar montador:', error)
        // Opcional: mostrar toast de erro
      }
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'PEDIDO_CRIADO': 'bg-blue-100 text-blue-800 border-blue-300',
      'ENVIADO_LABORATORIO': 'bg-purple-100 text-purple-800 border-purple-300',
      'EM_PRODUCAO': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'PRONTO_LABORATORIO': 'bg-orange-100 text-orange-800 border-orange-300',
      'DESPACHADO': 'bg-indigo-100 text-indigo-800 border-indigo-300',
      'CHEGOU': 'bg-green-100 text-green-800 border-green-300',
      'PRONTO_PARA_ENTREGA': 'bg-emerald-100 text-emerald-800 border-emerald-300',
      'ENTREGUE': 'bg-gray-100 text-gray-800 border-gray-300'
    }
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300'
  }

  const getPriorityColor = (prioridade: string) => {
    const colors: Record<string, string> = {
      'URGENTE': 'bg-red-100 text-red-800 border-red-300',
      'ALTA': 'bg-orange-100 text-orange-800 border-orange-300', 
      'NORMAL': 'bg-blue-100 text-blue-800 border-blue-300',
      'BAIXA': 'bg-gray-100 text-gray-800 border-gray-300'
    }
    return colors[prioridade] || 'bg-gray-100 text-gray-800 border-gray-300'
  }

  // Função para determinar cor baseada no SLA (igual ao KanbanCard)
  const getSLAColor = () => {
    if (pedido.sla_atrasado) {
      return {
        bg: 'bg-red-50',
        border: 'border-red-200',
        accent: 'border-l-red-500',
        text: 'text-red-700'
      }
    }
    if (pedido.sla_alerta) {
      return {
        bg: 'bg-yellow-50',
        border: 'border-yellow-200', 
        accent: 'border-l-yellow-500',
        text: 'text-yellow-700'
      }
    }
    return {
      bg: 'bg-white',
      border: 'border-gray-200',
      accent: 'border-l-blue-500',
      text: 'text-gray-700'
    }
  }

  const slaColors = getSLAColor()

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-2xl lg:max-w-4xl overflow-y-auto">
        <SheetHeader className="pb-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-600" />
                <span>Pedido OS #{pedido.numero_sequencial}</span>
                {pedido.eh_garantia && (
                  <Badge className="bg-amber-500 text-white">
                    <Sparkles className="w-3 h-3 mr-1" />
                    GARANTIA
                  </Badge>
                )}
              </div>
            </SheetTitle>
            <Link href={`/pedidos/${pedido.id}`}>
              <Button variant="outline" size="sm">
                <ExternalLink className="w-4 h-4 mr-2" />
                Ver Completo
              </Button>
            </Link>
          </div>
          
          {/* Status e Prioridade */}
          <div className="flex items-center gap-2 mt-2">
            <Badge className={cn("text-xs border", getStatusColor(pedido.status))}>
              {pedido.status?.replace('_', ' ')}
            </Badge>
            <Badge className={cn("text-xs border", getPriorityColor(pedido.prioridade))}>
              {pedido.prioridade}
            </Badge>
            
            {/* Indicadores SLA */}
            {pedido.sla_atrasado && (
              <Badge className="bg-red-500 text-white text-xs">
                <AlertTriangle className="w-3 h-3 mr-1" />
                SLA ATRASADO
              </Badge>
            )}
            {pedido.sla_alerta && !pedido.sla_atrasado && (
              <Badge className="bg-yellow-500 text-white text-xs">
                <Timer className="w-3 h-3 mr-1" />
                SLA ALERTA
              </Badge>
            )}
            
            {/* Dias para SLA */}
            {pedido.dias_para_sla !== null && (
              <Badge variant="outline" className="text-xs">
                <Calendar className="w-3 h-3 mr-1" />
                {pedido.dias_para_sla > 0 ? `${pedido.dias_para_sla}d para SLA` : `${Math.abs(pedido.dias_para_sla)}d em atraso`}
              </Badge>
            )}
          </div>
        </SheetHeader>

        <div className="space-y-6">
          
          {/* Números de Referência */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-700">Números de Referência</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <div className="text-xs text-blue-600 font-medium">PEDIDO</div>
                  <div className="font-mono font-bold text-blue-800">#{pedido.numero_sequencial}</div>
                </div>
                {pedido.numero_os_fisica && (
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <div className="text-xs text-gray-600 font-medium">OS LOJA</div>
                    <div className="font-mono font-bold text-gray-800">{pedido.numero_os_fisica}</div>
                  </div>
                )}
                {pedido.numero_pedido_laboratorio && (
                  <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                    <div className="text-xs text-purple-600 font-medium">OS LAB</div>
                    <div className="font-mono font-bold text-purple-800">{pedido.numero_pedido_laboratorio}</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Cliente */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <User className="w-4 h-4" />
                Cliente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">
                    {(pedido.cliente_nome || 'C').charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{pedido.cliente_nome || 'Nome não informado'}</h3>
                  {pedido.cliente_telefone && (
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Phone className="w-3 h-3" />
                      {pedido.cliente_telefone}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Loja e Laboratório */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Loja
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-900">{pedido.loja_nome}</h3>
                  {pedido.loja_codigo && (
                    <div className="text-sm text-gray-600">Código: {pedido.loja_codigo}</div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Beaker className="w-4 h-4" />
                  Laboratório
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-900">{pedido.laboratorio_nome}</h3>
                  {pedido.laboratorio_codigo && (
                    <div className="text-sm text-gray-600">Código: {pedido.laboratorio_codigo}</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Produto */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Produto
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {pedido.classe_nome && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Classe:</span>
                  <Badge 
                    style={{ backgroundColor: pedido.classe_cor || '#6B7280' }}
                    className="text-white text-xs"
                  >
                    {pedido.classe_nome}
                  </Badge>
                </div>
              )}
              
              {pedido.tratamentos_nomes && (
                <div>
                  <span className="text-sm text-gray-600 block mb-2">Tratamentos:</span>
                  <div className="flex flex-wrap gap-1">
                    {pedido.tratamentos_nomes.split(',').map((tratamento, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {tratamento.trim()}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Montador - Apenas para DCL e quando status = PRODUCAO */}
          {permissions.canSelectMontador() && pedido.status === 'PRODUCAO' && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Montador Responsável
                </CardTitle>
              </CardHeader>
              <CardContent>
                {pedido.montador_nome ? (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {pedido.montador_nome.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-blue-900">{pedido.montador_nome}</div>
                          {pedido.montador_local && (
                            <div className="text-sm text-blue-700">{pedido.montador_local}</div>
                          )}
                          {pedido.montador_contato && (
                            <div className="text-xs text-blue-600">{pedido.montador_contato}</div>
                          )}
                        </div>
                      </div>
                      {pedido.custo_montagem && (
                        <div className="text-right">
                          <div className="text-xs text-blue-600">Custo</div>
                          <div className="font-bold text-blue-800">
                            {formatCurrency(pedido.custo_montagem)}
                          </div>
                        </div>
                      )}
                    </div>
                    {pedido.data_montagem && (
                      <div className="mt-3 pt-3 border-t border-blue-200">
                        <div className="text-xs text-blue-600">
                          Designado em: {formatDate(pedido.data_montagem)}
                        </div>
                      </div>
                    )}
                    
                    {/* Botão para trocar montador */}
                    <div className="mt-3 pt-3 border-t border-blue-200">
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="w-full border-blue-300 text-blue-600 hover:bg-blue-50"
                        onClick={() => setShowMontadorSelector(true)}
                      >
                        <User className="w-4 h-4 mr-2" />
                        Trocar Montador
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <div className="text-gray-500 text-sm mb-3">Nenhum montador selecionado</div>
                    <Button 
                      size="sm" 
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={() => setShowMontadorSelector(true)}
                    >
                      <User className="w-4 h-4 mr-2" />
                      Selecionar Montador
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Financeiro - Apenas se permitido */}
          {permissions.canViewFinancialData() && (pedido.valor_pedido || pedido.custo_lentes) && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Informações Financeiras
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {/* Financeiro mostra CUSTO, outros mostram VENDA */}
                  {permissions.canViewCostData() && (
                    <>
                      {pedido.valor_pedido && (
                        <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                          <div className="text-xs text-green-600 font-medium">VALOR VENDA</div>
                          <div className="text-lg font-bold text-green-800">
                            {formatCurrency(pedido.valor_pedido)}
                          </div>
                        </div>
                      )}
                      
                      {pedido.custo_lentes && (
                        <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                          <div className="text-xs text-red-600 font-medium">CUSTO LENTES</div>
                          <div className="text-lg font-bold text-red-800">
                            {formatCurrency(pedido.custo_lentes)}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
                
                {pedido.valor_pedido && pedido.custo_lentes && (
                  <div className="mt-4 bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-blue-600 font-medium">Margem de Lucro:</span>
                      <div className="text-right">
                        <div className="text-lg font-bold text-blue-800">
                          {(((pedido.valor_pedido - pedido.custo_lentes) / pedido.valor_pedido) * 100).toFixed(1)}%
                        </div>
                        <div className="text-xs text-blue-600">
                          {formatCurrency(pedido.valor_pedido - pedido.custo_lentes)}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Prazos e Datas */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Prazos e Datas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Data do Pedido:</span>
                  <div className="font-medium">{formatDate(pedido.data_pedido)}</div>
                </div>
                
                {pedido.data_prometida && (
                  <div>
                    <span className="text-gray-600">Data Prometida:</span>
                    <div className="font-medium">{formatDate(pedido.data_prometida)}</div>
                  </div>
                )}
                
                {pedido.data_prevista_pronto && (
                  <div>
                    <span className="text-gray-600">Previsto Pronto:</span>
                    <div className="font-medium">{formatDate(pedido.data_prevista_pronto)}</div>
                  </div>
                )}
                
                {pedido.data_prevista_envio && (
                  <div>
                    <span className="text-gray-600">Previsto Envio:</span>
                    <div className="font-medium">{formatDate(pedido.data_prevista_envio)}</div>
                  </div>
                )}
              </div>
              
              {/* Seção SLA Visual */}
              {pedido.data_sla_laboratorio && (
                <>
                  <Separator className="my-4" />
                  <div className={cn(
                    "p-4 rounded-lg border-l-4",
                    slaColors.bg,
                    slaColors.border,
                    slaColors.accent
                  )}>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className={cn("font-semibold flex items-center gap-2", slaColors.text)}>
                        <Zap className="w-4 h-4" />
                        SLA Laboratório
                      </h4>
                      {pedido.sla_atrasado && (
                        <Badge className="bg-red-500 text-white text-xs">
                          ATRASADO
                        </Badge>
                      )}
                      {pedido.sla_alerta && !pedido.sla_atrasado && (
                        <Badge className="bg-yellow-500 text-white text-xs">
                          ALERTA
                        </Badge>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Data SLA:</span>
                        <div className={cn("font-medium", slaColors.text)}>
                          {formatDate(pedido.data_sla_laboratorio)}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600">Situação:</span>
                        <div className={cn("font-medium", slaColors.text)}>
                          {pedido.dias_para_sla > 0 
                            ? `Vence ${new Date(pedido.data_sla_laboratorio).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}`
                            : `Venceu ${new Date(pedido.data_sla_laboratorio).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}`
                          }
                        </div>
                      </div>
                    </div>
                    
                    {pedido.observacoes_sla && (
                      <div className="mt-3 p-2 bg-white/50 rounded text-sm">
                        <span className="text-gray-600">Observações SLA:</span>
                        <div className="text-gray-800 mt-1">{pedido.observacoes_sla}</div>
                      </div>
                    )}
                  </div>
                </>
              )}
              
              {(pedido.dias_desde_pedido || pedido.dias_para_vencer_sla) && (
                <Separator className="my-4" />
              )}
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                {pedido.dias_desde_pedido && (
                  <div className="flex items-center gap-2">
                    <Timer className="w-4 h-4 text-blue-500" />
                    <span className="text-gray-600">Há {pedido.dias_desde_pedido} dias</span>
                  </div>
                )}
                
                {pedido.dias_para_vencer_sla !== null && pedido.dias_para_vencer_sla !== undefined && (
                  <div className={cn(
                    "flex items-center gap-2",
                    pedido.dias_para_vencer_sla < 0 ? "text-red-600" : 
                    pedido.dias_para_vencer_sla <= 1 ? "text-orange-600" : "text-green-600"
                  )}>
                    <Target className="w-4 h-4" />
                    <span>
                      {pedido.dias_para_vencer_sla < 0 
                        ? `Venceu ${pedido.data_prometida ? new Date(pedido.data_prometida).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) : 'data não definida'}`
                        : `Vence ${pedido.data_prometida ? new Date(pedido.data_prometida).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) : 'data não definida'}`
                      }
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Observações */}
          {(pedido.observacoes || pedido.observacoes_garantia) && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Observações
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {pedido.observacoes && (
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <div className="text-xs text-blue-600 font-medium mb-1">OBSERVAÇÃO GERAL</div>
                    <p className="text-sm text-blue-800">{pedido.observacoes}</p>
                  </div>
                )}
                
                {pedido.observacoes_garantia && pedido.eh_garantia && (
                  <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
                    <div className="text-xs text-amber-600 font-medium mb-1">OBSERVAÇÃO GARANTIA</div>
                    <p className="text-sm text-amber-800">{pedido.observacoes_garantia}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Alertas */}
          {pedido.alertas_count > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-red-700 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Alertas ({pedido.alertas_count})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {pedido.pagamento_atrasado && (
                    <Badge variant="destructive" className="text-xs">
                      💳 Pagamento Atrasado
                    </Badge>
                  )}
                  {pedido.producao_atrasada && (
                    <Badge variant="destructive" className="text-xs">
                      ⏰ Produção Atrasada
                    </Badge>
                  )}
                  {pedido.requer_atencao && (
                    <Badge className="bg-amber-500 text-white text-xs">
                      ⚠️ Requer Atenção
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* ========== SEÇÃO DE AÇÕES ========== */}
          {(canMoveNext || canMovePrev || canCancel) && (
            <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-blue-700 flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Ações Rápidas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3 justify-center">
                  
                  {/* Botão Retroceder */}
                  {canMovePrev && onRegressStatus && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        await onRegressStatus(pedido)
                        onClose()
                      }}
                      className="flex items-center gap-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      {prevStatusLabel}
                    </Button>
                  )}

                  {/* Botão Avançar */}
                  {canMoveNext && onAdvanceStatus && (
                    <Button
                      size="sm"
                      onClick={async () => {
                        await onAdvanceStatus(pedido)
                        onClose()
                      }}
                      className={cn(
                        "flex items-center gap-2 text-white font-semibold",
                        pedido.status === 'AG_PAGAMENTO' 
                          ? "bg-green-600 hover:bg-green-700" 
                          : pedido.status === 'CHEGOU'
                          ? "bg-blue-600 hover:bg-blue-700"
                          : "bg-indigo-600 hover:bg-indigo-700"
                      )}
                    >
                      {pedido.status === 'AG_PAGAMENTO' && (
                        <>
                          <DollarSign className="w-4 h-4" />
                          Marcar Pago
                        </>
                      )}
                      {pedido.status === 'CHEGOU' && (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          Marcar Entregue
                        </>
                      )}
                      {!['AG_PAGAMENTO', 'CHEGOU'].includes(pedido.status) && (
                        <>
                          <ArrowRight className="w-4 h-4" />
                          {nextStatusLabel}
                        </>
                      )}
                    </Button>
                  )}

                  {/* Botão Cancelar */}
                  {canCancel && onCancelPedido && pedido.status !== 'CANCELADO' && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={async () => {
                        await onCancelPedido(pedido)
                        onClose()
                      }}
                      className="flex items-center gap-2 bg-red-600 hover:bg-red-700"
                    >
                      <X className="w-4 h-4" />
                      Cancelar
                    </Button>
                  )}

                </div>

                {/* Links de navegação */}
                <div className="flex gap-2 mt-4 pt-3 border-t border-blue-200 justify-center">
                  <Link href={`/pedidos/${pedido.id}`}>
                    <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-100">
                      <Eye className="w-4 h-4 mr-2" />
                      Página Completa
                    </Button>
                  </Link>
                  
                  <Link href={`/pedidos/${pedido.id}/timeline`}>
                    <Button variant="ghost" size="sm" className="text-purple-600 hover:text-purple-700 hover:bg-purple-100">
                      <Clock className="w-4 h-4 mr-2" />
                      Timeline
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

        </div>
      </SheetContent>

      {/* Modal do MontadorSelector */}
      <MontadorSelector
        isOpen={showMontadorSelector}
        onClose={() => setShowMontadorSelector(false)}
        onSelect={handleMontadorSelect}
        selectedMontadorId={pedido.montador_id}
      />
    </Sheet>
  )
}