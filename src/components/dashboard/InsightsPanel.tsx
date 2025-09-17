'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Lightbulb, TrendingUp, Target, AlertCircle } from 'lucide-react'

interface InsightsPanelProps {
  insights: string[]
  title?: string
  maxInsights?: number
}

export function InsightsPanel({ 
  insights, 
  title = "Insights Automáticos",
  maxInsights = 6 
}: InsightsPanelProps) {
  
  const getInsightIcon = (insight: string) => {
    if (insight.includes('🚀') || insight.includes('melhor')) {
      return <TrendingUp className="w-4 h-4 text-green-600" />
    }
    if (insight.includes('🎯') || insight.includes('SLA')) {
      return <Target className="w-4 h-4 text-blue-600" />
    }
    if (insight.includes('⚠️') || insight.includes('piorou') || insight.includes('caiu')) {
      return <AlertCircle className="w-4 h-4 text-orange-600" />
    }
    return <Lightbulb className="w-4 h-4 text-purple-600" />
  }
  
  const getInsightType = (insight: string) => {
    if (insight.includes('🚀') || insight.includes('✅')) return 'positive'
    if (insight.includes('⚠️') || insight.includes('📉')) return 'warning'
    if (insight.includes('💰')) return 'financial'
    return 'neutral'
  }
  
  const getInsightColor = (type: string) => {
    switch (type) {
      case 'positive': return 'bg-green-50 border-green-200 text-green-800'
      case 'warning': return 'bg-orange-50 border-orange-200 text-orange-800'
      case 'financial': return 'bg-blue-50 border-blue-200 text-blue-800'
      default: return 'bg-gray-50 border-gray-200 text-gray-800'
    }
  }
  
  const displayInsights = insights.slice(0, maxInsights)
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-purple-600" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {displayInsights.map((insight, index) => {
            const type = getInsightType(insight)
            return (
              <div 
                key={index}
                className={`flex items-start gap-3 p-3 rounded-lg border ${getInsightColor(type)}`}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {getInsightIcon(insight)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {insight.replace(/[🚀🎯💰📅📈📉✅⚠️]/g, '').trim()}
                  </p>
                </div>
                <Badge variant="outline" className="text-xs">
                  {type === 'positive' ? 'Positivo' : 
                   type === 'warning' ? 'Atenção' :
                   type === 'financial' ? 'Financeiro' : 'Info'}
                </Badge>
              </div>
            )
          })}
          
          {insights.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Lightbulb className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Nenhum insight disponível no momento</p>
            </div>
          )}
          
          {insights.length > maxInsights && (
            <div className="text-center pt-3 border-t">
              <Badge variant="outline">
                +{insights.length - maxInsights} insights adicionais
              </Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}