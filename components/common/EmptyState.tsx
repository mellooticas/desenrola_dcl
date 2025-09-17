import { ReactNode } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { FileX, Sparkles } from 'lucide-react'

interface EmptyStateProps {
  title: string
  description?: string
  icon?: ReactNode
  action?: ReactNode
  variant?: 'default' | 'search' | 'create'
}

export function EmptyState({ 
  title, 
  description, 
  icon,
  action,
  variant = 'default'
}: EmptyStateProps) {
  
  const getDefaultIcon = () => {
    switch (variant) {
      case 'search':
        return <FileX className="w-16 h-16 text-gray-400" />
      case 'create':
        return <Sparkles className="w-16 h-16 text-blue-400" />
      default:
        return <FileX className="w-16 h-16 text-gray-400" />
    }
  }

  const getCardStyles = () => {
    switch (variant) {
      case 'create':
        return 'bg-gradient-to-br from-blue-50/90 to-indigo-50/90 border-blue-200/50'
      case 'search':
        return 'bg-gradient-to-br from-gray-50/90 to-slate-50/90 border-gray-200/50'
      default:
        return 'bg-gradient-to-br from-white/90 to-gray-50/90 border-white/20'
    }
  }

  return (
    <Card className={`w-full max-w-md mx-auto backdrop-blur-lg shadow-lg transition-all duration-300 hover:shadow-xl ${getCardStyles()}`}>
      <CardContent className="flex flex-col items-center text-center p-8 space-y-6">
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-300 opacity-0 group-hover:opacity-100" />
          <div className="relative transform group-hover:scale-110 transition-transform duration-300">
            {icon || getDefaultIcon()}
          </div>
        </div>
        
        <div className="space-y-3">
          <h3 className="text-xl font-bold bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">
            {title}
          </h3>
          
          {description && (
            <p className="text-sm text-gray-600 leading-relaxed max-w-xs">
              {description}
            </p>
          )}
        </div>
        
        {action && (
          <div className="pt-2">
            {action}
          </div>
        )}
      </CardContent>
    </Card>
  )
}