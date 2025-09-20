// components/auth/LoginForm.tsx
'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { LogIn, AlertCircle, Shield, CreditCard, Building, Crown } from 'lucide-react'
import { useAuth } from '@/components/providers/AuthProvider'
import { useRouter } from 'next/navigation'

const USUARIOS_REAIS = [
  {  
    email: 'junior@oticastatymello.com.br', 
    nome: 'Junior - Admin', 
    role: 'gestor',
    icon: Crown,
    description: 'Acesso total ao sistema'
  },
  { 
    email: 'financeiroesc@hotmail.com', 
    nome: 'Financeiro ESC', 
    role: 'financeiro',
    icon: CreditCard,
    description: 'Gestão de pagamentos PIX'
  },
  { 
    email: 'usuario@exemplo.com', 
    nome: 'DCL Laboratório', 
    role: 'dcl',
    icon: Shield,
    description: 'Operações do laboratório (80% do trabalho)'
  },
  { 
    email: 'lojas@oticastatymello.com.br', 
    nome: 'Operadores Lojas', 
    role: 'loja',
    icon: Building,
    description: 'Mission Control - Central de comando da loja'
  }
]

export default function LoginForm() {
  const { login, loading } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email || !senha) {
      setError('Por favor, preencha email e senha')
      return
    }

    console.log('🔐 Tentando login com:', email)
    const success = await login(email, senha)
    
    if (success) {
      console.log('✅ Login bem-sucedido, redirecionando...')
      // Não redirecionar aqui - deixar o AuthProvider ou middleware lidar com isso
      // O redirecionamento baseado em role será feito automaticamente
      window.location.href = '/' // Força recarregamento para ativar o redirecionamento baseado em role
    } else {
      setError('Email ou senha incorretos. Verifique suas credenciais.')
    }
  }

  const handleUserSelect = (selectedEmail: string) => {
    setEmail(selectedEmail)
    setSenha('') // Limpar senha quando trocar de usuário
    setError('')
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'gestor': return 'text-purple-700 bg-purple-100 border-purple-300'
      case 'financeiro': return 'text-green-700 bg-green-100 border-green-300'
      case 'dcl': return 'text-blue-700 bg-blue-100 border-blue-300'
      case 'loja': return 'text-orange-700 bg-orange-100 border-orange-300'
      default: return 'text-gray-700 bg-gray-100 border-gray-300'
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
            <span className="text-white font-bold text-xl">DCL</span>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Desenrola DCL</CardTitle>
          <CardDescription className="text-gray-600">
            Sistema de Gestão de Pedidos - Laboratórios Ópticos
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert className="border-red-500 bg-red-50 text-red-800">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Seleção de usuário com cards visuais */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-700">
                Selecionar Perfil de Acesso
              </Label>
              
              <div className="grid grid-cols-1 gap-3">
                {USUARIOS_REAIS.map((usuario) => {
                  const IconComponent = usuario.icon
                  const isSelected = email === usuario.email
                  
                  return (
                    <div
                      key={usuario.email}
                      onClick={() => handleUserSelect(usuario.email)}
                      className={`
                        p-4 border-2 rounded-lg cursor-pointer transition-all
                        ${isSelected 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                        }
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`
                          p-2 rounded-lg 
                          ${isSelected ? 'bg-blue-100' : 'bg-gray-100'}
                        `}>
                          <IconComponent className={`
                            w-5 h-5 
                            ${isSelected ? 'text-blue-600' : 'text-gray-600'}
                          `} />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">
                              {usuario.nome}
                            </span>
                            <span className={`
                              px-2 py-1 text-xs font-medium rounded-full border
                              ${getRoleColor(usuario.role)}
                            `}>
                              {usuario.role.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {usuario.description}
                          </p>
                          <p className="text-xs text-gray-500 mt-1 font-mono">
                            {usuario.email}
                          </p>
                        </div>
                        
                        {isSelected && (
                          <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Campo email manual (para casos especiais) */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email do usuário
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@oticastatymello.com.br"
                className="w-full"
                required
              />
            </div>

            {/* Campo de senha */}
            <div className="space-y-2">
              <Label htmlFor="senha" className="text-sm font-medium text-gray-700">
                Senha
              </Label>
              <Input
                id="senha"
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Digite sua senha"
                className="w-full"
                required
              />
              <p className="text-xs text-gray-500">
                Digite sua senha cadastrada no sistema
              </p>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700" 
              disabled={loading || !email || !senha}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Conectando...
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4 mr-2" />
                  Entrar no Sistema
                </>
              )}
            </Button>
          </form>

          {/* Informações sobre o sistema */}
          <div className="mt-6 space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="text-sm font-medium text-blue-800 mb-2">
                💡 Como funciona o sistema de permissões:
              </h4>
              <div className="text-xs text-blue-700 space-y-2">
                <div className="flex items-center gap-2">
                  <Crown className="w-3 h-3" />
                  <span><strong>Gestor:</strong> Vê todas as colunas, pode editar tudo</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-3 h-3" />
                  <span><strong>DCL:</strong> AG_PAGAMENTO → ENVIADO (pode criar pedidos)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="w-3 h-3" />
                  <span><strong>Financeiro:</strong> Só AG_PAGAMENTO (upload PIX)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building className="w-3 h-3" />
                  <span><strong>Loja:</strong> CHEGOU → ENTREGUE (sem dados financeiros)</span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
              <p className="text-xs text-amber-800 text-center mb-2">
                � <strong>Sistema de autenticação ativo:</strong>
              </p>
              <div className="text-xs text-amber-700 space-y-1 text-center">
                <div>✅ Senhas criptografadas com BCrypt</div>
                <div>✅ Validação contra banco de dados</div>
                <div>✅ Controle de acesso por perfil</div>
                <div className="pt-2 border-t border-amber-200 mt-2">
                  <strong>💡 Digite sua senha cadastrada no sistema</strong>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}