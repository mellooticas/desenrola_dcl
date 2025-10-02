'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { 
  Users, 
  Package, 
  Database,
  Activity,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react'

const quickStats = [
  { label: 'Usuários Ativos', value: '12', change: '+2', status: 'success' },
  { label: 'Lojas Conectadas', value: '8', change: '0', status: 'neutral' },
  { label: 'Laboratórios', value: '5', change: '+1', status: 'success' },
  { label: 'Classes de Lente', value: '24', change: '+3', status: 'success' },
]

const recentActivities = [
  { action: 'Novo usuário adicionado', user: 'Admin', time: '2 min atrás', type: 'user' },
  { action: 'SLA atualizado para Multifocal', user: 'Sistema', time: '1 hora atrás', type: 'config' },
  { action: 'Backup automático realizado', user: 'Sistema', time: '3 horas atrás', type: 'system' },
  { action: 'Nova loja cadastrada', user: 'Admin', time: '1 dia atrás', type: 'partner' },
]

const systemHealth = [
  { component: 'Banco de Dados', status: 'healthy', message: 'Funcionando normalmente' },
  { component: 'API Externa', status: 'healthy', message: 'Todos os serviços online' },
  { component: 'Notificações', status: 'warning', message: '2 notificações pendentes' },
  { component: 'Backup', status: 'healthy', message: 'Último backup: hoje às 03:00' },
]

export default function ConfiguracoesPage() {
  return (
    <main className="container mx-auto py-8 px-4">
      <div className="space-y-6">
        {/* Header da página */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Visão Geral</h2>
          <p className="text-gray-600">Dashboard administrativo e status do sistema</p>
        </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <Badge variant={stat.status === 'success' ? 'default' : 'secondary'}>
                  {stat.change}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ações Rápidas */}
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>Configurações mais acessadas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/configuracoes/usuarios" className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <Users className="w-5 h-5 text-blue-600 mr-3" />
              <div className="flex-1">
                <div className="font-medium">Gerenciar Usuários</div>
                <div className="text-sm text-gray-500">Adicionar, editar ou desativar usuários</div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </Link>
            
            <Link href="/configuracoes/classes" className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <Package className="w-5 h-5 text-green-600 mr-3" />
              <div className="flex-1">
                <div className="font-medium">Classes de Lente</div>
                <div className="text-sm text-gray-500">Configurar tipos e preços</div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </Link>
            
            <Link href="/configuracoes/slas" className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <Activity className="w-5 h-5 text-purple-600 mr-3" />
              <div className="flex-1">
                <div className="font-medium">SLA & Prazos</div>
                <div className="text-sm text-gray-500">Ajustar tempos de entrega</div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </Link>
            
            <Link href="/configuracoes/horarios-acoes" className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <Activity className="w-5 h-5 text-orange-600 mr-3" />
              <div className="flex-1">
                <div className="font-medium">Horários & Ações</div>
                <div className="text-sm text-gray-500">Configurar horários e ações por loja</div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </Link>
            
            <Link href="/configuracoes/database" className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <Database className="w-5 h-5 text-red-600 mr-3" />
              <div className="flex-1">
                <div className="font-medium">Backup & Manutenção</div>
                <div className="text-sm text-gray-500">Status do banco de dados</div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </Link>
          </CardContent>
        </Card>

        {/* Status do Sistema */}
        <Card>
          <CardHeader>
            <CardTitle>Status do Sistema</CardTitle>
            <CardDescription>Monitoramento em tempo real</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {systemHealth.map((item) => (
              <div key={item.component} className="flex items-center p-3 rounded-lg bg-gray-50">
                {item.status === 'healthy' && <CheckCircle className="w-5 h-5 text-green-600 mr-3" />}
                {item.status === 'warning' && <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3" />}
                {item.status === 'error' && <AlertTriangle className="w-5 h-5 text-red-600 mr-3" />}
                
                <div className="flex-1">
                  <div className="font-medium">{item.component}</div>
                  <div className="text-sm text-gray-500">{item.message}</div>
                </div>
                
                <Badge variant={
                  item.status === 'healthy' ? 'default' : 
                  item.status === 'warning' ? 'destructive' : 'secondary'
                }>
                  {item.status === 'healthy' ? 'OK' : 
                   item.status === 'warning' ? 'Atenção' : 'Erro'}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Atividades Recentes */}
        <Card>
          <CardHeader>
            <CardTitle>Atividades Recentes</CardTitle>
            <CardDescription>Últimas alterações no sistema</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-center p-3 rounded-lg bg-gray-50">
                <Info className="w-5 h-5 text-blue-600 mr-3" />
                <div className="flex-1">
                  <div className="font-medium">{activity.action}</div>
                  <div className="text-sm text-gray-500">por {activity.user} • {activity.time}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Shortcuts */}
        <Card>
          <CardHeader>
            <CardTitle>Links Úteis</CardTitle>
            <CardDescription>Acesso rápido a ferramentas importantes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" asChild className="w-full justify-start">
              <Link href="/dashboard">
                <ArrowRight className="w-4 h-4 mr-2" />
                Voltar ao Dashboard
              </Link>
            </Button>
            
            <Button variant="outline" asChild className="w-full justify-start">
              <Link href="/kanban">
                <ArrowRight className="w-4 h-4 mr-2" />
                Kanban de Pedidos
              </Link>
            </Button>
            
            <Button variant="outline" asChild className="w-full justify-start">
              <Link href="/pedidos">
                <ArrowRight className="w-4 h-4 mr-2" />
                Lista de Pedidos
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
      </div>
    </main>
  )
}