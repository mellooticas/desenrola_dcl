'use client'

import { RankingTable } from '@/components/dashboard/RankingTable'
import { useRankingLaboratorios } from '@/lib/hooks/useDashboardBI'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Factory, Filter, Download } from 'lucide-react'
import { useState } from 'react'

export function LabsSection() {
  const [filtroRisco, setFiltroRisco] = useState<string>('')
  const [limite, setLimite] = useState(10)
  
  const { data: laboratorios = [], isLoading, error } = useRankingLaboratorios(limite, filtroRisco)
  
  if (isLoading) {
    return (
      <Card> 
        <CardHeader>
          <CardTitle>Ranking de Laboratórios</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 animate-pulse rounded-lg" />
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
          <CardTitle>Ranking de Laboratórios</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">Erro ao carregar ranking</p>
        </CardContent>
      </Card>
    )
  }
  
  const labsPorRisco = {
    'BAIXO': laboratorios.filter(lab => lab.status_risco === 'BAIXO').length,
    'MÉDIO': laboratorios.filter(lab => lab.status_risco === 'MÉDIO').length,
    'ALTO': laboratorios.filter(lab => lab.status_risco === 'ALTO').length
  }
  
  const handleExport = () => {
    // Implementar exportação
    console.log('Exportando dados dos laboratórios...')
  }
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Factory className="w-5 h-5 text-blue-600" />
              Ranking de Laboratórios
            </CardTitle>
            <CardDescription>
              Performance completa ordenada por score geral • Últimos 90 dias
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Resumo de Status de Risco */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-3 bg-green-50 rounded-lg border">
            <div className="text-2xl font-bold text-green-600">
              {labsPorRisco['BAIXO']}
            </div>
            <div className="text-sm text-green-600">Baixo Risco</div>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg border">
            <div className="text-2xl font-bold text-yellow-600">
              {labsPorRisco['MÉDIO']}
            </div>
            <div className="text-sm text-yellow-600">Médio Risco</div>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg border">
            <div className="text-2xl font-bold text-red-600">
              {labsPorRisco['ALTO']}
            </div>
            <div className="text-sm text-red-600">Alto Risco</div>
          </div>
        </div>
        
        {/* Filtros */}
        <div className="flex gap-2 mb-4">
          <Button
            variant={filtroRisco === '' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFiltroRisco('')}
          >
            Todos
          </Button>
          <Button
            variant={filtroRisco === 'ALTO' ? 'destructive' : 'outline'}
            size="sm"
            onClick={() => setFiltroRisco('ALTO')}
          >
            Alto Risco
          </Button>
          <Button
            variant={filtroRisco === 'MÉDIO' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFiltroRisco('MÉDIO')}
          >
            Médio Risco
          </Button>
          <Button
            variant={filtroRisco === 'BAIXO' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFiltroRisco('BAIXO')}
          >
            Baixo Risco
          </Button>
        </div>
        
        {/* Tabela de Ranking */}
        {laboratorios.length > 0 ? (
          <RankingTable laboratorios={laboratorios} />
        ) : (
          <div className="text-center py-8">
            <Factory className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-muted-foreground">
              {filtroRisco ? 
                `Nenhum laboratório com risco ${filtroRisco.toLowerCase()}` :
                'Nenhum laboratório encontrado'
              }
            </p>
          </div>
        )}
        
        {/* Controles de Paginação */}
        {laboratorios.length === limite && (
          <div className="flex justify-center mt-4">
            <Button
              variant="outline"
              onClick={() => setLimite(limite + 10)}
            >
              Carregar Mais Laboratórios
            </Button>
          </div>
        )}
        
        {/* Insights Rápidos */}
        {laboratorios.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
            <h4 className="font-medium text-blue-800 mb-2">Insights Rápidos</h4>
            <div className="text-sm text-blue-700 space-y-1">
              <p>
                • <strong>Melhor performance:</strong> {laboratorios[0]?.laboratorio_nome} (Score: {laboratorios[0]?.score_geral})
              </p>
              <p>
                • <strong>SLA médio:</strong> {(laboratorios.reduce((acc, lab) => acc + lab.sla_compliance, 0) / laboratorios.length).toFixed(1)}%
              </p>
              <p>
                • <strong>Lead time médio:</strong> {(laboratorios.reduce((acc, lab) => acc + lab.lead_time_medio, 0) / laboratorios.length).toFixed(1)} dias
              </p>
              {labsPorRisco['ALTO'] > 0 && (
                <p className="text-red-700">
                  • <strong>Atenção:</strong> {labsPorRisco['ALTO']} laboratório(s) precisam de ação imediata
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}