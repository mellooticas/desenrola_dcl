'use client'

import { AlertCard } from '@/components/dashboard/AlertCard'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
// Ícones como constantes
const IconesAlertas = {
  AlertTriangle: '⚠️',
  CheckCircle: '✅'
}
import { toast } from 'sonner'
import type { AlertaCritico } from '@/lib/types/dashboard-bi'
import type { DashboardFilters } from '@/components/dashboard/FiltrosPeriodo'

interface AlertsSectionProps {
  filters?: DashboardFilters
}

export function AlertsSection({ filters }: AlertsSectionProps) {
  // Construir query params com os filtros
  const buildQueryParams = () => {
    const params = new URLSearchParams()
    
    if (filters?.dataInicio) params.append('data_inicio', filters.dataInicio)
    if (filters?.dataFim) params.append('data_fim', filters.dataFim)
    if (filters?.loja) params.append('loja_id', filters.loja)
    if (filters?.laboratorio) params.append('laboratorio_id', filters.laboratorio)
    
    return params.toString()
  }

  // Hook para buscar alertas críticos usando a API com filtros
  const { data: responseData, isLoading, error } = useQuery({
    queryKey: ['dashboard', 'alertas_criticos', filters],
    queryFn: async () => {
      const queryParams = buildQueryParams()
      const url = `/api/dashboard/alertas-criticos${queryParams ? `?${queryParams}` : ''}`
      
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error('Erro ao carregar alertas')
      }
      return response.json()
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000
  })

  // Extrair alertas da resposta da API
  const alertas: AlertaCritico[] = responseData?.alertas || []
  
  if (isLoading) {
    return (
      <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">Centro de Alertas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-32 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }
  
  if (error) {
    return (
      <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">Centro de Alertas</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600 dark:text-red-400">Erro ao carregar alertas</p>
        </CardContent>
      </Card>
    )
  }
  
  const alertasPorPrioridade = {
    'CRITICA': alertas.filter((a: AlertaCritico) => a.prioridade === 'CRITICA'),
    'ALTA': alertas.filter((a: AlertaCritico) => a.prioridade === 'ALTA'),
    'MEDIA': alertas.filter((a: AlertaCritico) => a.prioridade === 'MEDIA')
  }
  
  const totalAlertas = alertas.length
  const alertasCriticos = alertasPorPrioridade['CRITICA'].length + alertasPorPrioridade['ALTA'].length
  
  return (
    <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
          <span className="text-lg">{IconesAlertas.AlertTriangle}</span>
          Centro de Alertas Críticos
          {totalAlertas > 0 && (
            <Badge variant="destructive">{totalAlertas}</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {totalAlertas === 0 ? (
          <div className="text-center py-8">
            <span className="text-5xl mb-4">{IconesAlertas.CheckCircle}</span>
            <p className="text-gray-500 dark:text-gray-400">Nenhum alerta crítico no momento</p>
            <p className="text-sm text-gray-500 dark:text-gray-500">Sistema operando normalmente</p>
          </div>
        ) : (
          <>
            {/* Resumo dos Alertas */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-3 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-800">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {alertasPorPrioridade['CRITICA'].length}
                </div>
                <div className="text-sm text-red-600 dark:text-red-400">Críticos</div>
              </div>
              <div className="text-center p-3 bg-orange-50 dark:bg-orange-950/30 rounded-lg border border-orange-200 dark:border-orange-800">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {alertasPorPrioridade['ALTA'].length}
                </div>
                <div className="text-sm text-orange-600 dark:text-orange-400">Alta</div>
              </div>
              <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-950/30 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {alertasPorPrioridade['MEDIA'].length}
                </div>
                <div className="text-sm text-yellow-600 dark:text-yellow-400">Média</div>
              </div>
            </div>
            
            {/* Lista de Alertas */}
            <div className="space-y-4">
              {alertas.map((alerta: AlertaCritico, index: number) => (
                <AlertCard
                  key={index}
                  alerta={alerta}
                />
              ))}
            </div>
            
            {/* Ações em Lote */}
            {alertasCriticos > 0 && (
              <div className="mt-6 p-4 bg-red-50 dark:bg-red-950/30 rounded-lg border-l-4 border-red-500 dark:border-red-700">
                <h4 className="font-medium text-red-800 dark:text-red-300 mb-2">
                  Ação Recomendada
                </h4>
                <p className="text-sm text-red-700 dark:text-red-400 mb-3">
                  Você tem {alertasCriticos} alertas de alta prioridade que requerem atenção imediata.
                </p>
                <div className="flex gap-2">
                  <button 
                    className="px-3 py-1 bg-red-600 dark:bg-red-700 text-white text-sm rounded hover:bg-red-700 dark:hover:bg-red-800"
                    onClick={() => toast.info('Enviando relatório para gestores...')}
                  >
                    Enviar Relatório Urgente
                  </button>
                  <button 
                    className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-sm rounded hover:bg-red-200 dark:hover:bg-red-900/50"
                    onClick={() => toast.info('Marcando como analisado...')}
                  >
                    Marcar como Analisado
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}