"use client"

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Shield } from 'lucide-react'

interface PerfilAcesso {
  id: string
  nome: string
  descricao: string
  permissoes: string[]
  ativo: boolean
}

export default function PerfilPage() {
  const [perfis, setPerfis] = useState<PerfilAcesso[]>([])

  const perfisMock: PerfilAcesso[] = [
    {
      id: '1',
      nome: 'Administrador',
      descricao: 'Acesso total ao sistema',
      permissoes: ['pedidos.view', 'dashboard.view', 'configuracoes.edit'],
      ativo: true
    },
    {
      id: '2',
      nome: 'Operador',
      descricao: 'Acesso para operações do dia a dia',
      permissoes: ['pedidos.view', 'dashboard.view'],
      ativo: true
    }
  ]

  useEffect(() => {
    setPerfis(perfisMock)
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <Shield className="w-6 h-6 mr-2" />
            Perfis de Acesso
          </h2>
          <p className="text-gray-600">Configure diferentes níveis de permissão para usuários</p>
        </div>
        
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Novo Perfil
        </Button>
      </div>

      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="dark:text-white">Perfis Cadastrados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {perfis.map((perfil) => (
              <div key={perfil.id} className="border dark:border-gray-700 dark:bg-gray-700/30 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium dark:text-white">{perfil.nome}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{perfil.descricao}</p>
                    <div className="mt-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Permissões: {perfil.permissoes.join(', ')}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="sm">Editar</Button>
                    <Button variant="ghost" size="sm">Excluir</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
