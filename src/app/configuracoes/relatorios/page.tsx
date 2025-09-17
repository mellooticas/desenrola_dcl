'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { FileText, BarChart3, TrendingUp, Download, Clock, Calendar } from 'lucide-react'

export default function RelatoriosConfigPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <FileText className="w-6 h-6 mr-2" />
          Configuração de Relatórios
        </h2>
        <p className="text-gray-600">Configure relatórios automatizados e análises</p>
      </div>

      {/* Quick Links to Existing Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Relatórios Disponíveis</CardTitle>
          <CardDescription>Acesso rápido aos relatórios existentes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/pedidos/relatorios" className="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <BarChart3 className="w-8 h-8 text-blue-600 mr-4" />
              <div>
                <h3 className="font-semibold">Relatório de Pedidos</h3>
                <p className="text-sm text-gray-600">Análise detalhada de pedidos por período</p>
              </div>
            </Link>
            
            <div className="flex items-center p-4 border rounded-lg bg-gray-50 opacity-50">
              <TrendingUp className="w-8 h-8 text-green-600 mr-4" />
              <div>
                <h3 className="font-semibold">Relatório Financeiro</h3>
                <p className="text-sm text-gray-600">Em desenvolvimento</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Future Configuration Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Relatórios Automáticos
            </CardTitle>
            <CardDescription>Configurar envio automático de relatórios</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Configure o envio automático de relatórios por email em intervalos programados.
            </p>
            <Button variant="outline" disabled>
              <Calendar className="w-4 h-4 mr-2" />
              Configurar Agendamento
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Download className="w-5 h-5 mr-2" />
              Formatos de Exportação
            </CardTitle>
            <CardDescription>Definir formatos padrão de exportação</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Configure os formatos padrão para exportação de relatórios (PDF, Excel, CSV).
            </p>
            <Button variant="outline" disabled>
              <FileText className="w-4 h-4 mr-2" />
              Configurar Formatos
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Note about future features */}
      <Card className="border-dashed">
        <CardContent className="p-6 text-center">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Mais configurações em breve</h3>
          <p className="text-gray-600">
            Esta seção será expandida com mais opções de configuração de relatórios, 
            incluindo relatórios customizados, dashboards personalizados e automações avançadas.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}