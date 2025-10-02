import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Eye,
  Play,
  CheckCircle,
  Clock,
  Target,
  Star,
  ChevronRight
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface Mission {
  id: string
  titulo?: string
  missao_nome?: string
  descricao: string
  prioridade?: 'baixa' | 'media' | 'alta' | 'critica'
  prazo_vencimento?: string
  data_vencimento?: string
  pontos_total: number
  status: 'pendente' | 'ativa' | 'concluida'
}

interface MissionKanbanCardProps {
  mission: Mission
  onClick: () => void
  onStart?: () => void
  onComplete?: () => void
  isDragging?: boolean
}

export function MissionKanbanCard({ 
  mission, 
  onClick, 
  onStart,
  onComplete,
  isDragging = false
}: MissionKanbanCardProps) {

  const getPriorityColor = (prioridade?: string) => {
    switch (prioridade) {
      case 'critica': return 'bg-red-500'
      case 'alta': return 'bg-orange-500'
      case 'media': return 'bg-yellow-500'
      case 'baixa': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pendente': 
        return { 
          color: 'text-gray-600', 
          bg: 'bg-gray-100', 
          icon: Target,
          label: 'Pendente'
        }
      case 'ativa': 
        return { 
          color: 'text-blue-600', 
          bg: 'bg-blue-100', 
          icon: Play,
          label: 'Em Andamento'
        }
      case 'concluida': 
        return { 
          color: 'text-green-600', 
          bg: 'bg-green-100', 
          icon: CheckCircle,
          label: 'Concluída'
        }
      default: 
        return { 
          color: 'text-gray-600', 
          bg: 'bg-gray-100', 
          icon: Target,
          label: 'Pendente'
        }
    }
  }

  const statusInfo = getStatusInfo(mission.status)

  return (
    <Card
      className={cn(
        "group relative cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02]",
        isDragging && "opacity-50 rotate-1 scale-95 shadow-xl",
        mission.status === 'concluida' 
          ? "bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 opacity-75" 
          : "bg-white border border-gray-200 hover:border-blue-300",
        "rounded-lg overflow-hidden"
      )}
      onClick={onClick}
    >
      {/* Header colorido baseado na prioridade */}
      <div className={cn(
        "h-1",
        mission.prioridade 
          ? getPriorityColor(mission.prioridade)
          : "bg-gray-300"
      )} />
      
      <CardContent className="p-4">
        {/* Cabeçalho da missão */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h4 className={cn(
              "font-medium text-sm leading-tight mb-1",
              mission.status === 'concluida' && "line-through text-gray-500"
            )}>
              {mission.titulo || mission.missao_nome || 'Missão sem título'}
            </h4>
            
            <p className={cn(
              "text-xs text-gray-600 line-clamp-2",
              mission.status === 'concluida' && "text-gray-400"
            )}>
              {mission.descricao}
            </p>
          </div>
          
          <statusInfo.icon className={cn(
            "w-4 h-4 ml-2 flex-shrink-0",
            statusInfo.color
          )} />
        </div>

        {/* Badges e informações */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            {mission.prioridade && (
              <Badge className={cn(
                "text-xs text-white",
                getPriorityColor(mission.prioridade)
              )}>
                {mission.prioridade.toUpperCase()}
              </Badge>
            )}
            
            <Badge className={cn(
              "text-xs",
              statusInfo.bg,
              statusInfo.color
            )}>
              {statusInfo.label}
            </Badge>
          </div>
          
          <div className="flex items-center space-x-1 text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
            <Star className="w-3 h-3" />
            <span className="font-medium">{mission.pontos_total}pts</span>
          </div>
        </div>

        {/* Prazo */}
        {(mission.prazo_vencimento || mission.data_vencimento) && (
          <div className="flex items-center text-xs text-gray-500 mb-3">
            <Clock className="w-3 h-3 mr-1" />
            <span>
              Prazo: {new Date(mission.prazo_vencimento || mission.data_vencimento!).toLocaleDateString('pt-BR')}
            </span>
          </div>
        )}

        {/* Ações rápidas */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={(e) => {
              e.stopPropagation()
              onClick()
            }}
          >
            <Eye className="w-3 h-3 mr-1" />
            Detalhes
          </Button>
          
          {mission.status === 'pendente' && onStart && (
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2 text-xs border-blue-300 text-blue-600 hover:bg-blue-50"
              onClick={(e) => {
                e.stopPropagation()
                onStart()
              }}
            >
              <Play className="w-3 h-3 mr-1" />
              Iniciar
            </Button>
          )}
          
          {mission.status === 'ativa' && onComplete && (
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2 text-xs border-green-300 text-green-600 hover:bg-green-50"
              onClick={(e) => {
                e.stopPropagation()
                onComplete()
              }}
            >
              <CheckCircle className="w-3 h-3 mr-1" />
              Finalizar
            </Button>
          )}
          
          {mission.status === 'concluida' && (
            <div className="flex items-center text-xs text-green-600">
              <CheckCircle className="w-3 h-3 mr-1" />
              Concluída
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}