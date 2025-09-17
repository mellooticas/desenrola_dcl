import { Card, CardContent } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import type { KPICardProps } from '@/lib/types/dashboard-bi'

export function KPICard({ 
  title, 
  value, 
  previousValue, 
  unit = '', 
  trend = 'stable',
  className = '',
  format = 'number'
}: KPICardProps) {
  
  const formatValue = (val: number | string) => {
    if (typeof val === 'string') return val
    if (val === null || val === undefined || isNaN(Number(val))) return '0'
    
    const numVal = Number(val)
    
    switch (format) {
      case 'currency':
        return `R$ ${numVal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
      case 'percentage':
        return `${numVal}%`
      default:
        return numVal.toLocaleString('pt-BR')
    }
  }
  
  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-600" />
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-600" />
      default:
        return <Minus className="w-4 h-4 text-gray-600" />
    }
  }
  
  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-green-600'
      case 'down':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }
  
  const calculatePercentChange = () => {
    if (!previousValue || typeof value === 'string' || !value) return null
    const numValue = Number(value)
    if (isNaN(numValue) || previousValue === 0) return null
    return ((numValue - previousValue) / previousValue * 100).toFixed(1)
  }
  
  const percentChange = calculatePercentChange()
  
  return (
    <Card className={`hover:shadow-md transition-shadow ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground mb-1">
              {title}
            </p>
            <p className="text-2xl font-bold">
              {formatValue(value)}{unit}
            </p>
            {previousValue && percentChange && (
              <div className={`flex items-center text-xs mt-2 ${getTrendColor()}`}>
                {getTrendIcon()}
                <span className="ml-1">
                  {Math.abs(Number(percentChange))}% vs mês anterior
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}