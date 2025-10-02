import { ReactNode } from 'react'
import { Badge } from '@/components/ui/badge'
import { Target, Clock, Trophy } from 'lucide-react'

interface MissionKanbanColumnProps {
  id: string
  title: string
  color: string
  count: number
  points?: number
  children: ReactNode
}

export function MissionKanbanColumn({ 
  id, 
  title, 
  color, 
  count, 
  points = 0,
  children 
}: MissionKanbanColumnProps) {
  return (
    <div className="flex flex-col h-full min-h-[600px]">
      {/* Column Header */}
      <div className="flex items-center justify-between p-4 border-b bg-white rounded-t-lg shadow-sm">
        <div className="flex items-center space-x-3">
          <div 
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: color }}
          />
          <h3 className="font-semibold text-gray-900">{title}</h3>
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-xs">
            {count} {count === 1 ? 'missão' : 'missões'}
          </Badge>
          
          {points > 0 && (
            <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800 border-yellow-300">
              <Trophy className="w-3 h-3 mr-1" />
              {points}pts
            </Badge>
          )}
        </div>
      </div>
      
      {/* Column Content */}
      <div className="flex-1 p-4 bg-gray-50 space-y-3 overflow-y-auto">
        {children}
      </div>
    </div>
  )
}