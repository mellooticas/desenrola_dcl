'use client'

import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { 
  ChevronLeft, 
  Package, 
  Edit, 
  Clock,
  Plus,
  Download,
  Filter,
  Eye
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface PedidoHeaderProps {
  mode?: 'list' | 'details' | 'timeline' | 'edit'
  pedidoId?: string
  numeroSequencial?: number
  status?: string
  prioridade?: string
  onExport?: () => void
  onFilter?: () => void
  totalCount?: number
  filteredCount?: number
  filtrosVisiveis?: boolean
  noContainer?: boolean
}

export function PedidoHeader({
  mode = 'list',
  pedidoId,
  numeroSequencial,
  status,
  prioridade,
  onExport,
  onFilter,
  totalCount,
  filteredCount,
  filtrosVisiveis = false,
  noContainer = false
}: PedidoHeaderProps) {
  const router = useRouter()
  const pathname = usePathname()

  const getModeConfig = () => {
    switch (mode) {
      case 'list':
        return {
          title: 'Pedidos',
          subtitle: `${filteredCount || totalCount || 0} pedidos encontrados`,
          icon: Package,
          breadcrumb: [{ label: 'Pedidos', href: '/pedidos', current: true }]
        }
      case 'details':
        return {
          title: `Pedido #${numeroSequencial}`,
          subtitle: 'Detalhes completos do pedido',
          icon: Eye,
          breadcrumb: [
            { label: 'Pedidos', href: '/pedidos', current: false },
            { label: `#${numeroSequencial}`, href: `/pedidos/${pedidoId}`, current: true }
          ]
        }
      case 'timeline':
        return {
          title: `Timeline - Pedido #${numeroSequencial}`,
          subtitle: 'Histórico completo e acompanhamento',
          icon: Clock,
          breadcrumb: [
            { label: 'Pedidos', href: '/pedidos', current: false },
            { label: `#${numeroSequencial}`, href: `/pedidos/${pedidoId}`, current: false },
            { label: 'Timeline', href: `/pedidos/${pedidoId}/timeline`, current: true }
          ]
        }
      case 'edit':
        return {
          title: `Editar Pedido #${numeroSequencial}`,
          subtitle: 'Modificar informações do pedido',
          icon: Edit,
          breadcrumb: [
            { label: 'Pedidos', href: '/pedidos', current: false },
            { label: `#${numeroSequencial}`, href: `/pedidos/${pedidoId}`, current: false },
            { label: 'Editar', href: `/pedidos/${pedidoId}/editar`, current: true }
          ]
        }
      default:
        return {
          title: 'Pedidos',
          subtitle: '',
          icon: Package,
          breadcrumb: []
        }
    }
  }

  const config = getModeConfig()
  const Icon = config.icon

  const getStatusBadge = () => {
    if (!status) return null
    
    const statusColors = {
      'REGISTRADO': 'bg-gray-100 text-gray-700 border-gray-200',
      'AG_PAGAMENTO': 'bg-yellow-100 text-yellow-700 border-yellow-200',
      'PAGO': 'bg-green-100 text-green-700 border-green-200',
      'PRODUCAO': 'bg-blue-100 text-blue-700 border-blue-200',
      'PRONTO': 'bg-purple-100 text-purple-700 border-purple-200',
      'ENVIADO': 'bg-indigo-100 text-indigo-700 border-indigo-200',
      'CHEGOU': 'bg-teal-100 text-teal-700 border-teal-200',
      'ENTREGUE': 'bg-green-100 text-green-700 border-green-200',
      'CANCELADO': 'bg-red-100 text-red-700 border-red-200'
    }
    
    return (
      <span className={cn(
        "px-3 py-1 text-xs font-medium rounded-full border",
        statusColors[status as keyof typeof statusColors] || statusColors.REGISTRADO
      )}>
        {status.replace('_', ' ').toUpperCase()}
      </span>
    )
  }

  const getPriorityBadge = () => {
    if (!prioridade) return null
    
    const priorityColors = {
      'URGENTE': 'bg-red-100 text-red-700 border-red-200',
      'ALTA': 'bg-orange-100 text-orange-700 border-orange-200',
      'NORMAL': 'bg-blue-100 text-blue-700 border-blue-200',
      'BAIXA': 'bg-gray-100 text-gray-700 border-gray-200'
    }
    
    return (
      <span className={cn(
        "px-3 py-1 text-xs font-medium rounded-full border",
        priorityColors[prioridade as keyof typeof priorityColors] || priorityColors.NORMAL
      )}>
        {prioridade}
      </span>
    )
  }

  const getActionButtons = () => {
    switch (mode) {
      case 'list':
        return (
          <div className="flex items-center space-x-3">
            {onFilter && (
              <Button variant="outline" onClick={onFilter} className="backdrop-blur-sm bg-white/50 border-white/30 shadow-lg hover:bg-white/70">
                <Filter className="w-4 h-4 mr-2" />
                {filtrosVisiveis ? 'Ocultar Filtros' : 'Mostrar Filtros'}
              </Button>
            )}
            {onExport && (
              <Button variant="outline" onClick={onExport} className="backdrop-blur-sm bg-white/50 border-white/30 shadow-lg hover:bg-white/70">
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
            )}
            <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg">
              <Link href="/pedidos/novo">
                <Plus className="w-4 h-4 mr-2" />
                Nova Ordem
              </Link>
            </Button>
          </div>
        )
      case 'details':
        return (
          <div className="flex items-center space-x-3">
            <Button variant="outline" asChild className="backdrop-blur-sm bg-white/50 border-white/30 shadow-lg hover:bg-white/70">
              <Link href={`/pedidos/${pedidoId}/timeline`}>
                <Clock className="w-4 h-4 mr-2" />
                Timeline
              </Link>
            </Button>
            <Button variant="outline" asChild className="backdrop-blur-sm bg-white/50 border-white/30 shadow-lg hover:bg-white/70">
              <Link href={`/pedidos/${pedidoId}/editar`}>
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </Link>
            </Button>
          </div>
        )
      case 'timeline':
        return (
          <div className="flex items-center space-x-3">
            <Button variant="outline" asChild className="backdrop-blur-sm bg-white/50 border-white/30 shadow-lg hover:bg-white/70">
              <Link href={`/pedidos/${pedidoId}`}>
                <Eye className="w-4 h-4 mr-2" />
                Detalhes
              </Link>
            </Button>
            <Button variant="outline" asChild className="backdrop-blur-sm bg-white/50 border-white/30 shadow-lg hover:bg-white/70">
              <Link href={`/pedidos/${pedidoId}/editar`}>
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </Link>
            </Button>
          </div>
        )
      case 'edit':
        return (
          <div className="flex items-center space-x-3">
            <Button variant="outline" asChild className="backdrop-blur-sm bg-white/50 border-white/30 shadow-lg hover:bg-white/70">
              <Link href={`/pedidos/${pedidoId}`}>
                <Eye className="w-4 h-4 mr-2" />
                Detalhes
              </Link>
            </Button>
            <Button variant="outline" asChild className="backdrop-blur-sm bg-white/50 border-white/30 shadow-lg hover:bg-white/70">
              <Link href={`/pedidos/${pedidoId}/timeline`}>
                <Clock className="w-4 h-4 mr-2" />
                Timeline
              </Link>
            </Button>
          </div>
        )
      default:
        return null
    }
  }

  if (noContainer) {
    return (
      <div className="w-full">
        <div className="px-4 py-6">
          <div className="space-y-6">
            <nav className="flex items-center gap-2">
              {config.breadcrumb.map((item, index) => (
                <div key={item.href} className="flex items-center gap-2">
                  {index > 0 && <span className="text-slate-400">/</span>}
                  {item.current ? (
                    <span className="text-slate-900 font-medium">{item.label}</span>
                  ) : (
                    <Link 
                      href={item.href} 
                      className="text-slate-600 transition-colors hover:text-slate-900"
                    >
                      {item.label}
                    </Link>
                  )}
                </div>
              ))}
            </nav>

            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-white/50 backdrop-blur-sm border border-white/30 shadow-lg">
                  <Icon className="w-6 h-6 text-blue-600" />
                </div>
                
                <div className="space-y-1">
                  <h1 className="text-2xl font-bold text-slate-900">{config.title}</h1>
                  {config.subtitle && (
                    <p className="text-slate-600">{config.subtitle}</p>
                  )}
                  {mode === 'list' && totalCount !== undefined && (
                    <p className="text-sm text-slate-500">
                      {filteredCount !== undefined && filteredCount !== totalCount 
                        ? `${filteredCount} de ${totalCount} pedidos` 
                        : `${totalCount} pedidos`
                      }
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                {mode === 'details' && pedidoId && numeroSequencial && (
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-sm text-slate-500">Pedido</div>
                      <div className="font-mono font-bold text-lg text-slate-900">#{numeroSequencial}</div>
                    </div>
                    {getStatusBadge()}
                    {getPriorityBadge()}
                  </div>
                )}
                
                {getActionButtons()}
              </div>
            </div>

            {mode !== 'list' && mode !== 'details' && pedidoId && (
              <div className="flex items-center space-x-1 border-b border-white/20">
                <Link 
                  href={`/pedidos/${pedidoId}`}
                  className={cn(
                    "px-4 py-2 text-sm font-medium rounded-t-lg transition-all",
                    "hover:bg-white/30 border-b-2",
                    pathname === `/pedidos/${pedidoId}` 
                      ? "text-blue-700 border-blue-500 bg-white/50" 
                      : "text-slate-600 border-transparent"
                  )}
                >
                  <Eye className="w-4 h-4 mr-2 inline" />
                  Detalhes
                </Link>

                <Link 
                  href={`/pedidos/${pedidoId}/timeline`}
                  className={cn(
                    "px-4 py-2 text-sm font-medium rounded-t-lg transition-all",
                    "hover:bg-white/30 border-b-2",
                    pathname === `/pedidos/${pedidoId}/timeline` 
                      ? "text-blue-700 border-blue-500 bg-white/50" 
                      : "text-slate-600 border-transparent"
                  )}
                >
                  <Clock className="w-4 h-4 mr-2 inline" />
                  Timeline
                </Link>

                <Link 
                  href={`/pedidos/${pedidoId}/editar`}
                  className={cn(
                    "px-4 py-2 text-sm font-medium rounded-t-lg transition-all",
                    "hover:bg-white/30 border-b-2",
                    pathname === `/pedidos/${pedidoId}/editar` 
                      ? "text-blue-700 border-blue-500 bg-white/50" 
                      : "text-slate-600 border-transparent"
                  )}
                >
                  <Edit className="w-4 h-4 mr-2 inline" />
                  Editar
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }  return (
    <div className="w-full">
      <div className="container mx-auto px-4 py-6">
        <div className="space-y-6">
          <nav className="flex items-center gap-2">
            {config.breadcrumb.map((item, index) => (
              <div key={item.href} className="flex items-center gap-2">
                {index > 0 && <span className="text-slate-400">/</span>}
                {item.current ? (
                  <span className="text-slate-900 font-medium">{item.label}</span>
                ) : (
                  <Link 
                    href={item.href} 
                    className="text-slate-600 transition-colors hover:text-slate-900"
                  >
                    {item.label}
                  </Link>
                )}
              </div>
            ))}
          </nav>

          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center gap-4">
              {mode !== 'list' && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => router.back()}
                  className="backdrop-blur-sm bg-white/50 border-white/30 shadow-lg hover:bg-white/70"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
              )}

              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-3">
                    {config.title}
                    {getStatusBadge()}
                    {getPriorityBadge()}
                  </h1>
                  <p className="text-gray-600 text-lg mt-1">
                    {config.subtitle}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {getActionButtons()}
            </div>
          </div>

          {(mode === 'details' || mode === 'timeline' || mode === 'edit') && pedidoId && (
            <div className="flex gap-1 border-b border-white/20 pb-0">
              <Link 
                href={`/pedidos/${pedidoId}`}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-t-lg transition-all",
                  "hover:bg-white/30 border-b-2",
                  pathname === `/pedidos/${pedidoId}` 
                    ? "text-blue-700 border-blue-500 bg-white/50" 
                    : "text-slate-600 border-transparent"
                )}
              >
                <Eye className="w-4 h-4 mr-2 inline" />
                Detalhes
              </Link>
              
              <Link 
                href={`/pedidos/${pedidoId}/timeline`}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-t-lg transition-all",
                  "hover:bg-white/30 border-b-2",
                  pathname === `/pedidos/${pedidoId}/timeline` 
                    ? "text-blue-700 border-blue-500 bg-white/50" 
                    : "text-slate-600 border-transparent"
                )}
              >
                <Clock className="w-4 h-4 mr-2 inline" />
                Timeline
              </Link>

              <Link 
                href={`/pedidos/${pedidoId}/editar`}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-t-lg transition-all",
                  "hover:bg-white/30 border-b-2",
                  pathname === `/pedidos/${pedidoId}/editar` 
                    ? "text-blue-700 border-blue-500 bg-white/50" 
                    : "text-slate-600 border-transparent"
                )}
              >
                <Edit className="w-4 h-4 mr-2 inline" />
                Editar
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
