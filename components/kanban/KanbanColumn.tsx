import { ReactNode } from 'react'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, Clock, Zap } from 'lucide-react'

interface KanbanColumnProps {
  id: string
  title: string
  color: string
  count: number
  atrasados?: number
  urgentes?: number
  children: ReactNode
}

export function KanbanColumn({ 
  id, 
  title, 
  color, 
  count, 
  atrasados = 0, 
  urgentes = 0, 
  children 
}: KanbanColumnProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Column Header */}
      <div className="flex items-center justify-between p-4 border-b bg-white rounded-t-lg">
        <div className="flex items-center space-x-3">
          <div 
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: color }}
          />
          <h3 className="font-semibold text-gray-900">{title}</h3>
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-xs">
            {count}
          </Badge>
          
          {atrasados > 0 && (
            <Badge variant="destructive" className="text-xs">
              <AlertTriangle className="w-3 h-3 mr-1" />
              {atrasados}
            </Badge>
          )}
          
          {urgentes > 0 && (
            <Badge variant="outline" className="text-xs border-orange-500 text-orange-600">
              <Zap className="w-3 h-3 mr-1" />
              {urgentes}
            </Badge>
          )}
        </div>
      </div>

      {/* Column Content */}
      <div className="flex-1 bg-gray-50 rounded-b-lg overflow-hidden">
        {children}
      </div>
    </div>
  )
}