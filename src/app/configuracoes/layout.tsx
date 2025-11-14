'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { 
  Settings, 
  Users, 
  Building2, 
  TestTube, 
  Package, 
  Shield, 
  Database,
  Bell,
  Palette,
  FileText,
  Activity,
  ChevronLeft,
  Menu,
  X
} from 'lucide-react'

const menuItems = [
  {
    category: 'Usuários & Acesso',
    items: [
      { name: 'Usuários', href: '/configuracoes/usuarios', icon: Users, description: 'Gerenciar usuários e permissões' },
      { name: 'Perfis de Acesso', href: '/configuracoes/perfis', icon: Shield, description: 'Configurar níveis de acesso' },
    ]
  },
  {
    category: 'Parceiros',
    items: [
      { name: 'Lojas', href: '/configuracoes/lojas', icon: Building2, description: 'Gerenciar lojas parceiras' },
      { name: 'Laboratórios', href: '/configuracoes/laboratorios', icon: TestTube, description: 'Configurar laboratórios' },
    ]
  },
  {
    category: 'Produtos & SLA',
    items: [
      { name: 'Classes de Lente', href: '/configuracoes/classes', icon: Package, description: 'Gerenciar tipos de lente' },
      { name: 'SLA & Prazos', href: '/configuracoes/slas', icon: Activity, description: 'Configurar prazos de entrega' },
    ]
  },
  {
    category: 'Sistema',
    items: [
      { name: 'Configurações Gerais', href: '/configuracoes/sistema', icon: Settings, description: 'Configurações do sistema' },
      { name: 'Notificações', href: '/configuracoes/notificacoes', icon: Bell, description: 'Configurar alertas e avisos' },
      { name: 'Relatórios', href: '/configuracoes/relatorios', icon: FileText, description: 'Configurar relatórios automatizados' },
      { name: 'Banco de Dados', href: '/configuracoes/database', icon: Database, description: 'Manutenção e backup' },
      { name: 'Personalização', href: '/configuracoes/personalizacao', icon: Palette, description: 'Temas e aparência' },
    ]
  }
]

export default function ConfiguracoesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="backdrop-blur-xl bg-white/30 dark:bg-gray-800/30 border-white/20 dark:border-gray-700/20 shadow-xl">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" asChild className="backdrop-blur-sm bg-white/50 dark:bg-gray-700 border-white/30 dark:border-gray-600 shadow-lg hover:bg-white/70 dark:hover:bg-gray-600 dark:text-white">
                <Link href="/dashboard">
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Voltar ao Dashboard
                </Link>
              </Button>
              
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg">
                  <Settings className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent dark:from-purple-400 dark:to-blue-400">
                    Configurações
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Centro de controle e administração</p>
                </div>
              </div>
            </div>

            {/* Mobile menu button */}
            <Button
              variant="outline"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-6">
          {/* Sidebar */}
          <div className={cn(
            "w-80 space-y-6",
            "lg:block",
            sidebarOpen ? "block" : "hidden"
          )}>
            {menuItems.map((category) => (
              <Card key={category.category} className="backdrop-blur-xl bg-white/30 dark:bg-gray-800 border-white/20 dark:border-gray-700 shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                    {category.category}
                  </h3>
                  <div className="space-y-1">
                    {category.items.map((item) => {
                      const isActive = pathname === item.href
                      const Icon = item.icon
                      
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={cn(
                            "flex items-center p-3 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-700",
                            isActive && "bg-blue-50 dark:bg-blue-900/40 border-l-4 border-blue-500 dark:border-blue-400"
                          )}
                          onClick={() => setSidebarOpen(false)}
                        >
                          <Icon className={cn(
                            "w-5 h-5 mr-3",
                            isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-300"
                          )} />
                          <div className="flex-1">
                            <div className={cn(
                              "font-medium",
                              isActive ? "text-blue-900 dark:text-blue-200" : "text-gray-900 dark:text-white"
                            )}>
                              {item.name}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-300">
                              {item.description}
                            </div>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Main content */}
          <div className="flex-1">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}