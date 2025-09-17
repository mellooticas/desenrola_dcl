import { PedidoCompleto } from '@/lib/types/database'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { 
  Calendar,
  Eye,
  AlertTriangle,
  Clock,
  Zap,
  DollarSign,
  Building2,
  ArrowRight,
  CheckCircle,
  ArrowLeft,
  Bell,
  Beaker,
  FileText,
  Glasses,
  History,
  Sparkles
} from 'lucide-react'
import { formatDistanceToNow, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils/cn'

interface KanbanCardProps {
  pedido: PedidoCompleto
  onClick: () => void
  isDragging?: boolean
  handleAdvanceStatus: (pedido: PedidoCompleto) => void
  handleRegressStatus: (pedido: PedidoCompleto) => void
}

export function KanbanCard({ 
  pedido, 
  onClick, 
  isDragging, 
  handleAdvanceStatus, 
  handleRegressStatus 
}: KanbanCardProps) {
  const formatCurrency = (value: number | null) => {
    if (!value) return 'N/A'
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    })
  }

  const getTimeAgo = (date: string | null) => {
    if (!date) return 'N/A'
    try {
      return formatDistanceToNow(parseISO(date), {
        addSuffix: true,
        locale: ptBR
      })
    } catch {
      return 'N/A'
    }
  }

  const getPriorityConfig = (prioridade: string) => {
    switch (prioridade) {
      case 'URGENTE':
        return {
          className: 'border-red-200 bg-gradient-to-br from-red-50/90 to-red-100/90 backdrop-blur-sm shadow-red-100/50',
          shadow: 'shadow-lg shadow-red-100/50',
          icon: <Zap className="w-3 h-3 text-red-500" />,
          badge: 'bg-red-500 text-white'
        }
      case 'ALTA':
        return {
          className: 'border-orange-200 bg-gradient-to-br from-orange-50/90 to-orange-100/90 backdrop-blur-sm shadow-orange-100/50',
          shadow: 'shadow-lg shadow-orange-100/50',
          icon: <AlertTriangle className="w-3 h-3 text-orange-500" />,
          badge: 'bg-orange-500 text-white'
        }
      case 'NORMAL':
        return {
          className: 'border-gray-200 bg-gradient-to-br from-white/90 to-gray-50/90 backdrop-blur-sm',
          shadow: 'shadow-lg shadow-gray-100/50',
          icon: null,
          badge: 'bg-gray-500 text-white'
        }
      case 'BAIXA':
        return {
          className: 'border-blue-200 bg-gradient-to-br from-blue-50/90 to-blue-100/90 backdrop-blur-sm shadow-blue-100/50',
          shadow: 'shadow-lg shadow-blue-100/50',
          icon: null,
          badge: 'bg-blue-500 text-white'
        }
      default:
        return {
          className: 'border-gray-200 bg-gradient-to-br from-white/90 to-gray-50/90 backdrop-blur-sm',
          shadow: 'shadow-lg shadow-gray-100/50',
          icon: null,
          badge: 'bg-gray-500 text-white'
        }
    }
  }

  const hasAlerts = pedido.pagamento_atrasado || pedido.producao_atrasada || pedido.requer_atencao
  const alertCount = (pedido.alertas_count || 0)
  const priorityConfig = getPriorityConfig(pedido.prioridade)

  return (
    <Card
      className={cn(
        "group relative cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1",
        priorityConfig.className,
        priorityConfig.shadow,
        isDragging && "scale-95 opacity-60 rotate-1",
        pedido.eh_garantia && "ring-2 ring-amber-300/60 ring-offset-1",
        "border backdrop-blur-sm"
      )}
      onClick={onClick}
    >
      <CardContent className="p-4 space-y-4">
        {/* Header com número e prioridade */}
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge 
                variant="outline"
                className="text-xs font-mono bg-white/80 backdrop-blur-sm border-gray-300 font-semibold"
              >
                #{pedido.numero_sequencial}
              </Badge>
              
              {pedido.eh_garantia && (
                <Badge className="text-xs bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm">
                  <Sparkles className="w-3 h-3 mr-1" />
                  GARANTIA
                </Badge>
              )}
              
              {pedido.prioridade !== 'NORMAL' && (
                <Badge className={cn("text-xs shadow-sm", priorityConfig.badge)}>
                  {priorityConfig.icon}
                  {priorityConfig.icon && <span className="ml-1">{pedido.prioridade}</span>}
                  {!priorityConfig.icon && pedido.prioridade}
                </Badge>
              )}
            </div>
            
            {/* Números do sistema */}
            <div className="text-xs text-gray-600 space-y-1">
              {pedido.numero_os_fisica && (
                <div className="flex items-center gap-1.5 bg-white/50 rounded px-2 py-1">
                  <FileText className="w-3 h-3 text-blue-500" />
                  <span className="font-mono">OS: {pedido.numero_os_fisica}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5 bg-white/50 rounded px-2 py-1">
                <Beaker className="w-3 h-3 text-purple-500" />
                <span className="font-mono">
                  Lab: {pedido.numero_pedido_laboratorio || '—'}
                </span>
              </div>
            </div>
          </div>
          
          {/* Indicadores de alerta */}
          <div className="flex flex-col items-end gap-1">
            {alertCount > 0 && (
              <Badge variant="destructive" className="text-xs shadow-sm animate-pulse">
                <Bell className="w-3 h-3 mr-1" />
                {alertCount}
              </Badge>
            )}
            {pedido.prioridade === 'URGENTE' && (
              <div className="animate-bounce">
                <Zap className="w-4 h-4 text-red-500" />
              </div>
            )}
          </div>
        </div>

        {/* Cliente */}
        <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3 border border-white/20">
          <p className="font-semibold text-sm text-gray-900 mb-1">
            {pedido.cliente_nome || 'Cliente não informado'}
          </p>
          {pedido.cliente_telefone && (
            <p className="text-xs text-gray-600 font-mono">{pedido.cliente_telefone}</p>
          )}
        </div>

        {/* Loja e Laboratório */}
        <div className="flex flex-wrap gap-2">
          <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm">
            <Building2 className="w-3 h-3 mr-1" />
            {pedido.loja_nome} ({pedido.loja_codigo})
          </Badge>
          <Badge className="bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-sm">
            <Beaker className="w-3 h-3 mr-1" />
            {pedido.laboratorio_nome}
            {pedido.laboratorio_codigo ? ` (${pedido.laboratorio_codigo})` : ''}
          </Badge>
        </div>

        {/* Classe da lente */}
        <div>
          <Badge 
            className="text-white text-xs shadow-sm"
            style={{ 
              backgroundColor: pedido.classe_cor || '#6B7280',
              backgroundImage: `linear-gradient(135deg, ${pedido.classe_cor || '#6B7280'}, ${pedido.classe_cor || '#6B7280'}dd)`
            }}
          >
            <Glasses className="w-3 h-3 mr-1" />
            {pedido.classe_nome || 'Classe não definida'}
          </Badge>
        </div>

        {/* Tratamentos selecionados */}
        {typeof pedido.tratamentos_count === 'number' && pedido.tratamentos_count > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-700">Tratamentos:</p>
            <div className="flex flex-wrap gap-1">
              {String(pedido.tratamentos_nomes || '')
                .split(',')
                .map((nome) => nome.trim())
                .filter(Boolean)
                .map((nome, idx) => (
                  <Badge 
                    key={`${pedido.id}-trat-${idx}`} 
                    variant="outline" 
                    className="text-[10px] bg-white/70 backdrop-blur-sm"
                  >
                    {nome}
                  </Badge>
                ))}
            </div>
          </div>
        )}

        {/* Valores financeiros */}
        {!pedido.eh_garantia && (pedido.valor_pedido || pedido.custo_lentes) && (
          <div className="bg-gradient-to-r from-green-50/80 to-emerald-50/80 backdrop-blur-sm rounded-lg p-3 border border-green-200/50">
            <div className="grid grid-cols-2 gap-3 text-xs">
              {pedido.valor_pedido && (
                <div>
                  <span className="text-gray-600 block mb-1">Venda:</span>
                  <div className="font-bold text-green-700 text-sm"> 
                    {formatCurrency(pedido.valor_pedido)}
                  </div> 
                </div>
              )}
              {pedido.custo_lentes && (
                <div>
                  <span className="text-gray-600 block mb-1">Custo:</span>
                  <div className="font-bold text-orange-700 text-sm">
                    {formatCurrency(pedido.custo_lentes)}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Margem de lucro */}
        {pedido.valor_pedido && pedido.custo_lentes && !pedido.eh_garantia && (
          <div className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 backdrop-blur-sm rounded-lg p-3 border border-blue-200/50">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Margem de Lucro:</span>
              <span className={cn(
                "font-bold text-sm",
                ((pedido.valor_pedido - pedido.custo_lentes) / pedido.valor_pedido) * 100 > 50 
                  ? 'text-green-600' 
                  : 'text-orange-600'
              )}>
                {(((pedido.valor_pedido - pedido.custo_lentes) / pedido.valor_pedido) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        )}

        {/* Flags de atenção */}
        {hasAlerts && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-700">Alertas:</p>
            <div className="flex gap-1 flex-wrap">
              {pedido.pagamento_atrasado && (
                <Badge className="text-xs bg-gradient-to-r from-red-500 to-red-600 text-white shadow-sm">
                  <DollarSign className="w-3 h-3 mr-1" />
                  Pag. Atrasado
                </Badge>
              )}
              {pedido.producao_atrasada && (
                <Badge className="text-xs bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-sm">
                  <Clock className="w-3 h-3 mr-1" />
                  Prod. Atrasada
                </Badge>
              )}
              {pedido.requer_atencao && (
                <Badge className="text-xs bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Requer Atenção
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Observações de garantia */}
        {pedido.eh_garantia && pedido.observacoes_garantia && (
          <div className="bg-gradient-to-r from-amber-50/80 to-orange-50/80 backdrop-blur-sm rounded-lg p-3 border border-amber-200/50">
            <div className="flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-amber-700 font-semibold text-xs block mb-1">Garantia:</span>
                <span className="text-amber-600 text-xs">{pedido.observacoes_garantia}</span>
              </div>
            </div>
          </div>
        )}

        {/* Timeline */}
        <div className="bg-white/50 backdrop-blur-sm rounded-lg p-3 border border-gray-200/50">
          <div className="text-xs text-gray-600 space-y-1">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3 h-3 text-blue-500" />
              <span>Criado {getTimeAgo(pedido.created_at || null)}</span>
            </div>
            {pedido.data_prevista_pronto && (
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3 h-3 text-green-500" />
                <span>Previsto: {new Date(pedido.data_prevista_pronto).toLocaleDateString('pt-BR')}</span>
              </div>
            )}
            {pedido.updated_at && pedido.updated_at !== pedido.created_at && (
              <div className="flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-purple-500" />
                <span>Atualizado {getTimeAgo(pedido.updated_at)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Observações gerais */}
        {pedido.observacoes && (
          <div className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 backdrop-blur-sm rounded-lg p-3 border border-blue-200/50">
            <div className="flex items-start gap-2">
              <FileText className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-blue-700 font-semibold text-xs block mb-1">Observações:</span>
                <span className="text-blue-600 text-xs">
                  {pedido.observacoes.length > 80 
                    ? `${pedido.observacoes.substring(0, 80)}...` 
                    : pedido.observacoes
                  }
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Botões de navegação de status */}
        <div className="flex gap-2 pt-3 border-t border-white/30">
          {/* Botão Voltar */}
          {pedido.status !== 'REGISTRADO' && pedido.status !== 'CANCELADO' && (
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation()
                handleRegressStatus(pedido)
              }}
              className="flex-1 text-xs h-8 bg-white/70 backdrop-blur-sm border-gray-300 hover:bg-white/90 transition-all duration-200"
            >
              <ArrowLeft className="w-3 h-3 mr-1" />
              Voltar
            </Button>
          )}
          
          {/* Botão Avançar */}
          {pedido.status !== 'ENTREGUE' && pedido.status !== 'CANCELADO' && (
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                handleAdvanceStatus(pedido)
              }}
              className="flex-1 text-xs h-8 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-sm transition-all duration-200"
            >
              {pedido.status === 'CHEGOU' ? (
                <>
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Entregar
                </>
              ) : (
                <>
                  <ArrowRight className="w-3 h-3 mr-1" />
                  Avançar
                </>
              )}
            </Button>
          )}

          {/* Status final - Entregue */}
          {pedido.status === 'ENTREGUE' && (
            <div className="flex-1 text-center">
              <Badge className="text-xs bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-sm">
                <CheckCircle className="w-3 h-3 mr-1" />
                Concluído
              </Badge>
            </div>
          )}

          {/* Status cancelado */}
          {pedido.status === 'CANCELADO' && (
            <div className="flex-1 text-center">
              <Badge className="text-xs bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-sm">
                Cancelado
              </Badge>
            </div>
          )}
        </div>

        {/* Botões de ação */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onClick()
            }}
            className="text-xs h-8 bg-white/50 backdrop-blur-sm hover:bg-white/70 text-gray-700 transition-all duration-200"
          >
            <Eye className="w-3 h-3 mr-1" />
            Detalhes
          </Button>
          
          <Link href={`/pedidos/${pedido.id}/timeline`}>
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs h-8 bg-white/50 backdrop-blur-sm hover:bg-white/70 text-blue-600 transition-all duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <History className="w-3 h-3 mr-1" />
              Timeline
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}