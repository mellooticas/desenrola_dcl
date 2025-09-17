'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { useEvolucaoMensal } from '@/lib/hooks/useDashboardBI'
import { TrendingUp } from 'lucide-react'
import type { DashboardFilters } from '@/components/dashboard/FiltrosPeriodo'

interface PowerBIHeatmapProps {
  filters?: DashboardFilters
}

export function PowerBIHeatmap({ filters }: PowerBIHeatmapProps) {
  const { data: evolucao = [] } = useEvolucaoMensal()

  // Transformar dados para heatmap
  const heatmapData = evolucao.slice(-12).map((item, index) => ({
    mes: formatMonth(item.ano_mes),
    sla: item.sla_compliance || 0,
    pedidos: item.total_pedidos || 0,
    receita: item.faturamento_total || 0,
    color: getSLAColor(item.sla_compliance || 0)
  }))

  function formatMonth(anoMes: string): string {
    const [ano, mes] = anoMes.split('-')
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 
                   'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
    return `${meses[parseInt(mes) - 1]}/${ano.substring(2)}`
  }

  function getSLAColor(sla: number): string {
    if (sla >= 95) return '#10B981' // Verde
    if (sla >= 90) return '#F59E0B' // Amarelo
    if (sla >= 80) return '#EF4444' // Vermelho
    return '#6B7280' // Cinza
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{label}</p>
          <p className="text-sm text-blue-600">SLA: {data.sla.toFixed(1)}%</p>
          <p className="text-sm text-gray-600">Pedidos: {data.pedidos}</p>
          <p className="text-sm text-gray-600">Receita: R$ {(data.receita / 1000).toFixed(0)}k</p>
        </div>
      )
    }
    return null
  }

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-600" />
          Heatmap: Performance SLA Mensal
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <BarChart data={heatmapData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="mes" 
                tick={{ fontSize: 12 }}
                interval={0}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                domain={[70, 100]}
                tick={{ fontSize: 12 }}
                label={{ value: 'SLA (%)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="sla" radius={[4, 4, 0, 0]}>
                {heatmapData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Linha de meta SLA */}
        <div className="flex justify-between items-center mt-4 px-4">
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>Excelente (≥95%)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-yellow-500 rounded"></div>
              <span>Bom (90-94%)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span>Crítico (80-89%)</span>
            </div>
          </div>
          <div className="text-xs text-gray-500">
            Meta: 95% SLA
          </div>
        </div>
      </CardContent>
    </Card>
  )
}