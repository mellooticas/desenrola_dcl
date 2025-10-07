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

export function AlertsSection() {
  // Hook para buscar alertas críticos usando a API
  const { data: responseData, isLoading, error } = useQuery({
    queryKey: ['dashboard', 'alertas_criticos'],
    queryFn: async () => {
      const response = await fetch('/api/dashboard/alertas-criticos')
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
  
  const handleAlertAction = (action: string, alerta: AlertaCritico) => {
    switch (action) {
      case 'phone':
        toast.info(`Ligando para cliente ${alerta.dados?.cliente_nome || 'do alerta'}...`)
        // Aqui você pode implementar integração com sistema de telefonia
        break
      case 'email':
        toast.info(`Enviando email para cliente ${alerta.dados?.cliente_nome || 'do alerta'}...`)
        // Aqui você pode implementar envio de email
        break
      case 'details':
        toast.info(`Abrindo detalhes do ${alerta.titulo}...`)
        // Aqui você pode navegar para página de detalhes
        break
      default:
        break
    }
  }
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Centro de Alertas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-32 bg-gray-100 animate-pulse rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }
  
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Centro de Alertas</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">Erro ao carregar alertas</p>
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
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
            <p className="text-muted-foreground">Nenhum alerta crítico no momento</p>
            <p className="text-sm text-gray-500">Sistema operando normalmente</p>
          </div>
        ) : (
          <>
            {/* Resumo dos Alertas */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {alertasPorPrioridade['CRITICA'].length}
                </div>
                <div className="text-sm text-red-600">Críticos</div>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {alertasPorPrioridade['ALTA'].length}
                </div>
                <div className="text-sm text-orange-600">Alta</div>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {alertasPorPrioridade['MEDIA'].length}
                </div>
                <div className="text-sm text-yellow-600">Média</div>
              </div>
            </div>
            
            {/* Lista de Alertas */}
            <div className="space-y-4">
              {alertas.map((alerta: AlertaCritico, index: number) => (
                <AlertCard
                  key={index}
                  alerta={alerta}
                  onAction={handleAlertAction}
                />
              ))}
            </div>
            
            {/* Ações em Lote */}
            {alertasCriticos > 0 && (
              <div className="mt-6 p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
                <h4 className="font-medium text-red-800 mb-2">
                  Ação Recomendada
                </h4>
                <p className="text-sm text-red-700 mb-3">
                  Você tem {alertasCriticos} alertas de alta prioridade que requerem atenção imediata.
                </p>
                <div className="flex gap-2">
                  <button 
                    className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                    onClick={() => toast.info('Enviando relatório para gestores...')}
                  >
                    Enviar Relatório Urgente
                  </button>
                  <button 
                    className="px-3 py-1 bg-red-100 text-red-700 text-sm rounded hover:bg-red-200"
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