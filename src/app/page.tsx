'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Package, 
  BarChart3, 
  Plus, 
  Settings, 
  Clock,
  AlertTriangle,
  TrendingUp,
  Users,
  Activity,
  Bell,
  LogOut
} from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/components/providers/AuthProvider'

interface ModuleCard {
  id: string
  title: string
  description: string
  href: string
  icon: any
  color: string
  roles: string[]
}

export default function HomePage() {
  const router = useRouter()
  const { user, userProfile, loading, logout } = useAuth()
  const userRole = userProfile?.role
  
  const [stats, setStats] = useState<any>(null)
  const [loadingStats, setLoadingStats] = useState(true)

  useEffect(() => {
    // Redirecionar para login se não autenticado
    if (!loading && (!user || !userProfile)) {
      router.push('/login')
      return
    }

    // Redirecionar baseado no role do usuário
    if (!loading && user && userProfile && userProfile.role) {
      const defaultPage = getDefaultPageForRole(userProfile.role)
      router.push(defaultPage)
      return
    }

    // Carregar dados básicos simples se necessário
    if (user && userProfile) {
      carregarDadosBasicos()
    }
  }, [user, userProfile, loading, router])

  // Helper para obter página padrão baseado no role
  const getDefaultPageForRole = (role: string): string => {
    switch (role) {
      case 'gestor':
        return '/dashboard'
      case 'financeiro':
        return '/dashboard'
      case 'dcl':
        return '/kanban'
      case 'loja':
        return '/mission-control' // Operadores de loja vão direto para Mission Control
      default:
        return '/kanban'
    }
  }

  const carregarDadosBasicos = async () => {
    try {
      // Queries simples que funcionam
      const [pedidosResult, alertasResult] = await Promise.all([
        supabase.from('pedidos').select('id, status'),
        supabase.from('alertas').select('id').eq('lido', false)
      ])

      const pedidos = pedidosResult.data || []
      const alertas = alertasResult.data || []

      setStats({
        pedidos_total: pedidos.length,
        pedidos_producao: pedidos.filter(p => p.status === 'PRODUCAO').length,
        pedidos_aguardando: pedidos.filter(p => p.status === 'AG_PAGAMENTO').length,
        alertas_ativos: alertas.length
      })
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      // Definir valores padrão se der erro
      setStats({
        pedidos_total: 0,
        pedidos_producao: 0,
        pedidos_aguardando: 0,
        alertas_ativos: 0
      })
    } finally {
      setLoadingStats(false)
    }
  }

  const modules: ModuleCard[] = [
    {
      id: 'kanban',
      title: 'Kanban',
      description: 'Gestão visual de pedidos em tempo real',
      href: '/kanban',
      icon: Package,
      color: 'bg-blue-500 hover:bg-blue-600',
      roles: ['dcl', 'loja', 'gestor', 'admin']
    },
    {
      id: 'dashboard',
      title: 'Dashboard',
      description: 'Métricas, relatórios e análises',
      href: '/dashboard',
      icon: BarChart3,
      color: 'bg-purple-500 hover:bg-purple-600',
      roles: ['gestor', 'admin']
    },
    {
      id: 'nova-ordem',
      title: 'Nova Ordem',
      description: 'Registrar novo pedido rapidamente',
      href: '/pedidos/novo',
      icon: Plus,
      color: 'bg-green-500 hover:bg-green-600',
      roles: ['dcl', 'loja', 'admin']
    },
    {
      id: 'pedidos',
      title: 'Pedidos',
      description: 'Listar e gerenciar todos os pedidos',
      href: '/pedidos',
      icon: Activity,
      color: 'bg-orange-500 hover:bg-orange-600',
      roles: ['dcl', 'loja', 'gestor', 'admin']
    },
    {
      id: 'configuracoes',
      title: 'Configurações',
      description: 'Laboratórios, classes e configurações',
      href: '/configuracoes',
      icon: Settings,
      color: 'bg-gray-500 hover:bg-gray-600',
      roles: ['admin']
    }
  ]

  const visibleModules = modules.filter(module => 
    module.roles.includes(userRole || 'loja')
  )

  const handleModuleClick = (href: string) => {
    router.push(href)
  }

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  // Loading inicial
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Carregando sistema...</p>
        </div>
      </div>
    )
  }

  // Se não autenticado, mostrar loading até redirect
  if (!user || !userProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-slate-600">Redirecionando para login...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Desenrola DCL</h1>
                <p className="text-sm text-slate-500">Sistema de Gestão de Pedidos</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {!loadingStats && stats?.alertas_ativos > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {stats.alertas_ativos} alertas
                </Badge>
              )}
              
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-900">{userProfile?.nome || 'Usuário'}</p>
                  <p className="text-xs text-slate-500">
                    {userRole === 'admin' ? 'Administrador' : 
                     userRole === 'gestor' ? 'Gestor' : 
                     userRole === 'dcl' ? 'DCL' : 'Loja'}
                  </p>
                </div>
                
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Bem-vindo, {userProfile?.nome?.split(' ')[0] || 'Usuário'}!
          </h2>
          <p className="text-slate-600">
            Escolha um módulo abaixo para começar. Você tem acesso aos módulos permitidos para seu perfil.
          </p>
        </div>

        {/* Stats Cards - Só mostra se tiver dados */}
        {!loadingStats && stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{stats.pedidos_total}</p>
                    <p className="text-sm text-slate-500">Total de Pedidos</p>
                  </div>
                  <Package className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{stats.pedidos_producao}</p>
                    <p className="text-sm text-slate-500">Em Produção</p>
                  </div>
                  <Activity className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-yellow-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{stats.pedidos_aguardando}</p>
                    <p className="text-sm text-slate-500">Aguard. Pagamento</p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>

            <Card className={`border-l-4 ${stats.alertas_ativos > 0 ? 'border-l-red-500' : 'border-l-gray-400'}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{stats.alertas_ativos}</p>
                    <p className="text-sm text-slate-500">Alertas Ativos</p>
                  </div>
                  <AlertTriangle className={`w-8 h-8 ${stats.alertas_ativos > 0 ? 'text-red-500' : 'text-gray-400'}`} />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Module Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleModules.map((module) => (
            <Card 
              key={module.id} 
              className="hover:shadow-lg transition-all duration-200 cursor-pointer group border-2 hover:border-blue-200"
              onClick={() => handleModuleClick(module.href)}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className={`w-12 h-12 ${module.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                    <module.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div>
                  <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                    {module.title}
                  </CardTitle>
                  <CardDescription className="text-sm text-slate-500 mt-1">
                    {module.description}
                  </CardDescription>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="flex items-center justify-end">
                  <Button variant="ghost" size="sm" className="h-6 px-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                    Acessar →
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-slate-500">
          <p>Sistema Desenrola DCL • Gestão Inteligente de Pedidos Ópticos</p>
        </div>
      </div>
    </div>
  )
}