import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Clock, AlertTriangle, Star, Target } from 'lucide-react'

// Interface para representar uma missão da view v_missoes_timeline
export interface Mission {
  id: string
  tipo: 'critica' | 'rapida' | 'especial' | 'bonus' | 'operacional'
  categoria: string
  titulo: string
  descricao: string
  status: 'pendente' | 'ativa' | 'concluida' | 'pausada' | 'falhada'
  urgencia_status: 'baixa' | 'media' | 'alta' | 'critica'
  progresso_tempo?: number
  tempo_estimado?: number
  xp_recompensa: number
  pontos_qualidade?: number
  loja_nome: string
  created_at: string
  prazo_final?: string
  tags?: string[]
  observacoes?: string
}

interface MissionCardProps {
  mission: Mission
  onStart?: (missionId: string) => void
  onPause?: (missionId: string) => void
  onComplete?: (missionId: string) => void
  onFail?: (missionId: string) => void
  onClick?: (mission: Mission) => void
}

const MissionTypeIcons = {
  critica: <AlertTriangle className="w-5 h-5 text-red-500" />,
  rapida: <Clock className="w-5 h-5 text-blue-500" />,
  especial: <Star className="w-5 h-5 text-purple-500" />,
  bonus: <Target className="w-5 h-5 text-yellow-500" />,
  operacional: <Target className="w-5 h-5 text-gray-500" />
}

const StatusColors = {
  pendente: 'bg-gray-100 text-gray-800 border-gray-300',
  ativa: 'bg-blue-100 text-blue-800 border-blue-300',
  concluida: 'bg-green-100 text-green-800 border-green-300',
  pausada: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  falhada: 'bg-red-100 text-red-800 border-red-300'
}

const UrgencyColors = {
  baixa: 'border-l-green-500',
  media: 'border-l-yellow-500',
  alta: 'border-l-orange-500',
  critica: 'border-l-red-500'
}

export function MissionCard({ 
  mission, 
  onStart, 
  onPause, 
  onComplete, 
  onFail, 
  onClick 
}: MissionCardProps) {
  const handleCardClick = () => {
    if (onClick) {
      onClick(mission)
    }
  }

  const renderActionButtons = () => {
    switch (mission.status) {
      case 'pendente':
        return (
          <Button
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onStart?.(mission.id)
            }}
            className="w-full"
          >
            Iniciar Missão
          </Button>
        )
      
      case 'ativa':
        return (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation()
                onPause?.(mission.id)
              }}
              className="flex-1"
            >
              Pausar
            </Button>
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onComplete?.(mission.id)
              }}
              className="flex-1"
            >
              Concluir
            </Button>
          </div>
        )
      
      case 'pausada':
        return (
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onStart?.(mission.id)
              }}
              className="flex-1"
            >
              Retomar
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={(e) => {
                e.stopPropagation()
                onFail?.(mission.id)
              }}
              className="flex-1"
            >
              Falhar
            </Button>
          </div>
        )
      
      default:
        return null
    }
  }

  return (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-lg border-l-4 ${UrgencyColors[mission.urgencia_status]}`}
      onClick={handleCardClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {MissionTypeIcons[mission.tipo]}
            <div>
              <h3 className="font-semibold text-sm leading-tight">{mission.titulo}</h3>
              <p className="text-xs text-gray-600 mt-1">{mission.categoria}</p>
            </div>
          </div>
          <Badge className={StatusColors[mission.status]} variant="outline">
            {mission.status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <p className="text-sm text-gray-700 line-clamp-2">{mission.descricao}</p>

        {/* Progresso se missão ativa */}
        {mission.status === 'ativa' && mission.progresso_tempo !== undefined && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span>Progresso</span>
              <span>{mission.progresso_tempo}%</span>
            </div>
            <Progress value={mission.progresso_tempo} className="h-2" />
          </div>
        )}

        {/* Informações da missão */}
        <div className="flex justify-between text-xs text-gray-600">
          <span className="flex items-center gap-1">
            <Target className="w-3 h-3" />
            {mission.xp_recompensa} XP
          </span>
          {mission.tempo_estimado && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {mission.tempo_estimado}min
            </span>
          )}
        </div>

        {/* Loja */}
        <div className="text-xs text-gray-500">
          📍 {mission.loja_nome}
        </div>

        {/* Tags */}
        {mission.tags && mission.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {mission.tags.slice(0, 2).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {mission.tags.length > 2 && (
              <Badge variant="secondary" className="text-xs">
                +{mission.tags.length - 2}
              </Badge>
            )}
          </div>
        )}

        {/* Ações */}
        {renderActionButtons()}
      </CardContent>
    </Card>
  )
}