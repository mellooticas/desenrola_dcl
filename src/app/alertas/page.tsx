'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertsSection } from '@/components/dashboard/AlertsSection'
import { FiltrosPeriodo, type DashboardFilters } from '@/components/dashboard/FiltrosPeriodo'
import { useAuth } from '@/components/providers/AuthProvider'
import { Bell, MessageCircle, Phone, Mail, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'

export default function AlertasPage() {
  const { userProfile } = useAuth()
  const [filters, setFilters] = useState<DashboardFilters>({
    dataInicio: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    dataFim: new Date().toISOString().split('T')[0],
    laboratorio: '',
    classe: '',
    loja: ''
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-lg">
                <Bell className="text-white" size={24} />
              </div>
              Centro de Alertas
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Monitore alertas críticos e comunique-se com clientes
            </p>
          </div>

          {/* Info do Usuário */}
          <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                  {userProfile?.nome?.[0] || 'U'}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {userProfile?.nome || 'Usuário'}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {userProfile?.role === 'dcl' ? 'DCL - Distribuição' : userProfile?.role || 'Gestor'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="text-lg text-gray-900 dark:text-white">Filtros</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Filtre alertas por período, loja ou laboratório
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FiltrosPeriodo filters={filters} onFiltersChange={setFilters} />
          </CardContent>
        </Card>

        {/* Guia Rápido de Ações */}
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="text-lg text-blue-900 dark:text-blue-300 flex items-center gap-2">
              <MessageCircle size={20} />
              Ações Rápidas de Comunicação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                variant="outline"
                className="h-auto flex-col items-start p-4 border-blue-300 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900/50"
                onClick={() => toast.info('Abrindo WhatsApp Web...')}
              >
                <div className="flex items-center gap-2 mb-2 text-green-600 dark:text-green-400">
                  <MessageCircle size={20} />
                  <span className="font-semibold">WhatsApp</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 text-left">
                  Envie mensagens rápidas sobre pedidos atrasados
                </p>
              </Button>

              <Button
                variant="outline"
                className="h-auto flex-col items-start p-4 border-blue-300 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900/50"
                onClick={() => toast.info('Preparando lista de ligações...')}
              >
                <div className="flex items-center gap-2 mb-2 text-blue-600 dark:text-blue-400">
                  <Phone size={20} />
                  <span className="font-semibold">Ligações</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 text-left">
                  Lista de clientes com SLA próximo ao vencimento
                </p>
              </Button>

              <Button
                variant="outline"
                className="h-auto flex-col items-start p-4 border-blue-300 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900/50"
                onClick={() => toast.info('Abrindo modelo de e-mail...')}
              >
                <div className="flex items-center gap-2 mb-2 text-purple-600 dark:text-purple-400">
                  <Mail size={20} />
                  <span className="font-semibold">E-mail</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 text-left">
                  Envie atualizações em lote para múltiplos clientes
                </p>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Seção de Alertas */}
        <AlertsSection filters={filters} />

        {/* Footer com Dicas */}
        <Card className="bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-400">
              <ExternalLink size={16} className="mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white mb-1">
                  💡 Dica Profissional
                </p>
                <p>
                  Clique em qualquer alerta para ver detalhes completos do pedido. 
                  Você pode copiar informações do cliente e abrir diretamente no WhatsApp Web.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
