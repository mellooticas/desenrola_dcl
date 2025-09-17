'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Treemap, ResponsiveContainer, Tooltip } from 'recharts'
import { useRankingLaboratorios } from '@/lib/hooks/useDashboardBI'
import { Building2 } from 'lucide-react'
import type { DashboardFilters } from '@/components/dashboard/FiltrosPeriodo'

interface PowerBITreemapProps {
  filters?: DashboardFilters
}

export function PowerBITreemap({ filters }: PowerBITreemapProps) {
    const { data: laboratorios = [] } = useRankingLaboratorios(50)

  // Transformar dados para treemap
  const treemapData = laboratorios.map((lab: any, index: number) => ({
    name: lab.nome_laboratorio,
    value: lab.total_pedidos,
    receita: lab.receita_total,
    sla: lab.sla_compliance,
    fill: getTreemapColor(lab.sla_compliance, index)
  }))

  function getTreemapColor(sla: number, index: number): string {
    if (sla >= 95) return '#10B981' // Verde - Excelente
    if (sla >= 90) return '#F59E0B' // Amarelo - Bom  
    if (sla >= 80) return '#EF4444' // Vermelho - Crítico
    return '#6B7280' // Cinza - Sem dados
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{data.name}</p>
          <p className="text-sm text-gray-600">Pedidos: {data.value}</p>
          <p className="text-sm text-gray-600">Receita: R$ {(data.receita / 1000).toFixed(0)}k</p>
          <p className="text-sm text-gray-600">SLA: {data.sla.toFixed(1)}%</p>
        </div>
      )
    }
    return null
  }

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-blue-600" />
          Treemap: Volume por Laboratório
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <Treemap
              data={treemapData}
              dataKey="value"
              aspectRatio={4/3}
              stroke="#fff"
              content={<CustomTreemapContent />}
            >
              <Tooltip content={<CustomTooltip />} />
            </Treemap>
          </ResponsiveContainer>
        </div>
        
        {/* Legenda */}
        <div className="flex justify-center gap-4 mt-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>SLA ≥ 95%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
            <span>SLA 90-94%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span>SLA 80-89%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-gray-500 rounded"></div>
            <span>SLA &lt; 80%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Componente customizado para células do treemap
const CustomTreemapContent = (props: any) => {
  const { x, y, width, height, name, value, fill } = props
  
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={fill}
        stroke="#fff"
        strokeWidth={2}
        className="hover:opacity-80 cursor-pointer"
      />
      {width > 60 && height > 40 && (
        <>
          <text
            x={x + width / 2}
            y={y + height / 2 - 8}
            textAnchor="middle"
            fill="white"
            fontSize="12"
            fontWeight="bold"
          >
            {name?.length > 8 ? `${name.substring(0, 8)}...` : name}
          </text>
          <text
            x={x + width / 2}
            y={y + height / 2 + 8}
            textAnchor="middle"
            fill="white"
            fontSize="10"
          >
            {value} pedidos
          </text>
        </>
      )}
    </g>
  )
}