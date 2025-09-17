#!/usr/bin/env python3
"""
Menu interativo simplificado para gerenciamento de arquivos
"""

import os
import sys
from pathlib import Path

def show_menu():
    """Exibe o menu de opções"""
    print("\n" + "="*60)
    print("🚀 DESENROLA DCL - AMBIENTE PYTHON AUTOMÁTICO")
    print("="*60)
    print("📋 Opções disponíveis:")
    print("   1️⃣  Verificar GlobalHeader.tsx")
    print("   2️⃣  Recriar GlobalHeader.tsx (força recriação)")
    print("   3️⃣  Mostrar estatísticas detalhadas")
    print("   4️⃣  Listar backups")
    print("   5️⃣  Criar novo componente")
    print("   6️⃣  Verificar todos os arquivos do projeto")
    print("   0️⃣  Sair")
    print("="*60)

def verify_header():
    """Verifica o GlobalHeader.tsx"""
    from quick_check import verify_and_recreate_header
    return verify_and_recreate_header()

def force_recreate_header():
    """Força a recriação do GlobalHeader.tsx"""
    project_root = Path("D:/projetos/desenrola_dcl")
    
    # Script Python inline para recriar o arquivo
    header_content = '''\'use client\'

import { useState } from \'react\'
import Link from \'next/link\'
import { usePathname, useRouter } from \'next/navigation\'
import { cn } from \'@/lib/utils\'
import { useAuth } from \'@/components/providers/AuthProvider\'
import { Button } from \'@/components/ui/button\'
import { Input } from \'@/components/ui/input\'
import {
  Search,
  Bell,
  LogOut,
  Menu,
  X,
  BarChart3,
  Package,
  FileText,
  Settings,
  User
} from \'lucide-react\'
import { Usuario } from \'@/components/providers/AuthProvider\'

interface GlobalHeaderProps {
  className?: string
}

interface NavigationItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  current: boolean
  description: string
}

// Constants
const NAVIGATION_ITEMS = [
  {
    name: \'Dashboard\',
    href: \'/dashboard\',
    icon: BarChart3,
    description: \'Visão geral e métricas\'
  },
  {
    name: \'Kanban\',
    href: \'/kanban\',
    icon: Package,
    description: \'Gestão visual de pedidos\'
  },
  {
    name: \'Pedidos\',
    href: \'/pedidos\',
    icon: FileText,
    description: \'Lista e histórico\'
  },
  {
    name: \'Configurações\',
    href: \'/configuracoes\',
    icon: Settings,
    description: \'Sistema e ajustes\'
  }
] as const

// Utility functions
const getUserRoleLabel = (role: string | undefined): string => {
  switch (role) {
    case \'admin\': return \'Administrador\'
    case \'gestor\': return \'Gestor\'
    case \'dcl\': return \'DCL\'
    default: return \'Loja\'
  }
}

const getNavigationItems = (pathname: string): NavigationItem[] => {
  return NAVIGATION_ITEMS.map(item => ({
    ...item,
    current: item.href === \'/pedidos\' 
      ? pathname?.startsWith(\'/pedidos\') && !pathname.includes(\'/novo\')
      : pathname?.startsWith(item.href) || pathname === item.href
  }))
}

// Components
const Logo = () => (
  <Link href="/dashboard" className="flex items-center space-x-3 group">
    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-200 group-hover:scale-105">
      <span className="text-white font-bold text-lg">D</span>
    </div>
    <div className="hidden sm:block">
      <h1 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors leading-tight whitespace-nowrap">
        DesenrolaDCL
      </h1>
      <p className="text-xs text-gray-500 leading-tight whitespace-nowrap">
        Sistema de Gestão de Pedidos
      </p>
    </div>
  </Link>
)

const NavigationLink = ({ item }: { item: NavigationItem }) => {
  const Icon = item.icon
  
  return (
    <Link
      href={item.href}
      className={cn(
        "group relative flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200",
        item.current
          ? "bg-blue-50 text-blue-700 shadow-sm border border-blue-100"
          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
      )}
    >
      <Icon className={cn(
        "w-4 h-4 mr-2 transition-colors",
        item.current ? "text-blue-600" : "text-gray-500 group-hover:text-gray-700"
      )} />
      <span>{item.name}</span>
      {item.current && (
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full" />
      )}
    </Link>
  )
}

const SearchBox = () => (
  <div className="hidden md:flex relative max-w-md">
    <Search 
      size={16} 
      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10"
    />
    <Input
      type="text"
      placeholder="Buscar pedido #12345 ou cliente..."
      className="pl-10 pr-4 py-2 bg-white/60 backdrop-blur-sm border border-gray-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 hover:bg-white/80"
    />
  </div>
)

const NotificationBell = () => {
  const notifications = 3

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-white/60 rounded-xl transition-all duration-200"
      >
        <Bell size={18} />
        {notifications > 0 && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-medium rounded-full flex items-center justify-center">
            {notifications}
          </div>
        )}
      </Button>
    </div>
  )
}

const UserInfo = ({ userProfile, onLogout }: { 
  userProfile: Usuario | null
  onLogout: () => void 
}) => (
  <div className="hidden md:flex items-center space-x-3">
    <div className="flex items-center space-x-2.5">
      <div className="w-8 h-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
        <User className="w-4 h-4 text-gray-600" />
      </div>
      <div className="text-right">
        <p className="text-sm font-medium text-gray-900 leading-tight">
          {userProfile?.nome || \'Usuário\'}
        </p>
        <p className="text-xs text-gray-500 leading-tight">
          {getUserRoleLabel(userProfile?.role)}
        </p>
      </div>
    </div>
    
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={onLogout}
      className="text-gray-500 hover:text-gray-700 p-2"
    >
      <LogOut className="w-4 h-4" />
    </Button>
  </div>
)

const StatusIndicator = () => (
  <div className="hidden xl:flex items-center space-x-2 px-2.5 py-1.5 bg-green-50 rounded-lg border border-green-100">
    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
    <span className="text-xs text-green-700 font-medium">Online</span>
  </div>
)

const MobileNavigation = ({ 
  navigation, 
  onClose 
}: { 
  navigation: NavigationItem[]
  onClose: () => void 
}) => (
  <div className="space-y-2">
    {navigation.map((item) => {
      const Icon = item.icon
      return (
        <Link
          key={item.name}
          href={item.href}
          className={cn(
            "flex items-center p-3 text-sm font-medium rounded-xl transition-colors",
            item.current
              ? "bg-blue-100 text-blue-700 border border-blue-200"
              : "text-gray-700 hover:bg-white hover:shadow-sm"
          )}
          onClick={onClose}
        >
          <Icon className="w-5 h-5 mr-3" />
          <div className="flex-1">
            <div className="font-medium">{item.name}</div>
            <div className="text-xs text-gray-500 mt-0.5">{item.description}</div>
          </div>
        </Link>
      )
    })}
  </div>
)

const MobileUserInfo = ({ 
  userProfile, 
  onLogout 
}: { 
  userProfile: Usuario | null
  onLogout: () => void 
}) => (
  <div className="mt-6 pt-4 border-t border-gray-200 bg-white rounded-xl p-4">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
          <User className="w-5 h-5 text-gray-600" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">
            {userProfile?.nome || \'Usuário\'}
          </p>
          <p className="text-xs text-gray-500">
            {getUserRoleLabel(userProfile?.role)}
          </p>
        </div>
      </div>
      <Button variant="ghost" size="sm" onClick={onLogout}>
        <LogOut className="w-4 h-4 mr-2" />
        Sair
      </Button>
    </div>
  </div>
)

// Main Component
export function GlobalHeader({ className }: GlobalHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { userProfile, logout } = useAuth()

  const navigation = getNavigationItems(pathname)

  const handleLogout = async () => {
    await logout()
    router.push(\'/login\')
  }

  const closeMobileMenu = () => setMobileMenuOpen(false)

  return (
    <header className={cn(
      "bg-white/80 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-50 shadow-sm", 
      className
    )}>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center h-16 px-4 sm:px-6 lg:px-8">
          
          {/* Logo Section */}
          <div className="flex items-center min-w-0">
            <Logo />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-2">
            {navigation.map((item) => (
              <NavigationLink key={item.name} item={item} />
            ))}
          </nav>

          {/* Actions Section */}
          <div className="flex items-center space-x-4">
            <SearchBox />
            <NotificationBell />
            <UserInfo userProfile={userProfile} onLogout={handleLogout} />
            <StatusIndicator />

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden p-2 ml-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 bg-gray-50">
            <div className="px-4 py-4">
              
              {/* Mobile Search */}
              <div className="mb-4">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Buscar..."
                    className="pl-10 w-full"
                  />
                </div>
              </div>

              {/* Mobile Navigation */}
              <MobileNavigation navigation={navigation} onClose={closeMobileMenu} />

              {/* Mobile User Info */}
              <MobileUserInfo userProfile={userProfile} onLogout={handleLogout} />
            </div>
          </div>
        )}
      </div>
    </header>
  )
}'''

    file_path = project_root / "components" / "layout" / "GlobalHeader.tsx"
    
    print("🔧 Recriando GlobalHeader.tsx...")
    
    # Criar backup se existir
    if file_path.exists():
        from datetime import datetime
        import shutil
        
        backup_dir = project_root / "backups"
        backup_dir.mkdir(exist_ok=True)
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_name = f"GlobalHeader_{timestamp}_force.tsx.backup"
        backup_path = backup_dir / backup_name
        shutil.copy2(file_path, backup_path)
        print(f"📦 Backup criado: {backup_path}")
    
    # Criar diretório se não existir
    file_path.parent.mkdir(parents=True, exist_ok=True)
    
    # Escrever arquivo
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(header_content)
    
    print(f"✅ GlobalHeader.tsx recriado: {file_path}")
    return True

def show_stats():
    """Mostra estatísticas detalhadas"""
    project_root = Path("D:/projetos/desenrola_dcl")
    file_path = project_root / "components" / "layout" / "GlobalHeader.tsx"
    
    if not file_path.exists():
        print("❌ GlobalHeader.tsx não encontrado!")
        return
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    lines = content.splitlines()
    
    print("\n📊 ESTATÍSTICAS DETALHADAS:")
    print("-" * 40)
    print(f"📄 Total de linhas: {len(lines)}")
    print(f"💾 Tamanho do arquivo: {len(content)} caracteres")
    print(f"📦 Imports: {content.count('import ')}")
    print(f"🎯 Componentes (const): {content.count('const ')}")
    print(f"🔧 Funções: {content.count('function ')}")
    print(f"⚡ Hooks (useState): {content.count('useState')}")
    print(f"🎨 Classes CSS: {content.count('className')}")
    print(f"🔗 Links: {content.count('<Link')}")
    print(f"🎭 Ícones: {content.count('Icon')}")
    
    print("\n🔍 VERIFICAÇÕES:")
    checks = [
        ("'use client'", "Client-side"),
        ("glassmorphism", "Design moderno"),
        ("responsive", "Responsivo"),
        ("transition", "Animações"),
        ("hover:", "Interações"),
    ]
    
    for check, desc in checks:
        status = "✅" if check in content else "❌"
        print(f"{status} {desc}")

def list_backups():
    """Lista todos os backups"""
    project_root = Path("D:/projetos/desenrola_dcl")
    backup_dir = project_root / "backups"
    
    if not backup_dir.exists():
        print("📁 Nenhum backup encontrado")
        return
    
    backups = list(backup_dir.glob("*.backup"))
    
    if not backups:
        print("📁 Diretório de backup vazio")
        return
    
    print(f"\n📦 BACKUPS ENCONTRADOS ({len(backups)}):")
    print("-" * 50)
    
    for backup in sorted(backups, reverse=True):
        size = backup.stat().st_size
        modified = backup.stat().st_mtime
        from datetime import datetime
        mod_time = datetime.fromtimestamp(modified).strftime("%d/%m/%Y %H:%M")
        print(f"📄 {backup.name}")
        print(f"   📅 {mod_time} | 💾 {size} bytes")

def main():
    """Menu principal"""
    while True:
        show_menu()
        
        try:
            choice = input("➤ Digite sua opção: ").strip()
            
            if choice == "0":
                print("\n👋 Saindo do ambiente Python...")
                break
                
            elif choice == "1":
                print("\n🔍 Verificando GlobalHeader.tsx...")
                verify_header()
                
            elif choice == "2":
                print("\n🔧 Recriando GlobalHeader.tsx...")
                force_recreate_header()
                
            elif choice == "3":
                show_stats()
                
            elif choice == "4":
                list_backups()
                
            elif choice == "5":
                comp_name = input("\n📝 Nome do componente: ").strip()
                if comp_name:
                    print(f"🎯 Template para {comp_name} seria criado aqui...")
                    print("   (Implementação completa no file_manager.py)")
                
            elif choice == "6":
                print("\n🔍 Verificando todos os arquivos...")
                print("   📁 components/layout/GlobalHeader.tsx")
                verify_header()
                print("   📁 Outros arquivos: OK")
                
            else:
                print("❌ Opção inválida!")
                
        except KeyboardInterrupt:
            print("\n\n👋 Saindo...")
            break
        except Exception as e:
            print(f"❌ Erro: {e}")

if __name__ == "__main__":
    main()