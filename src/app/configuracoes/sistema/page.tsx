'use client'

import { useState, useEffect } from 'react'
import { ConfiguracaoForm } from '@/components/forms/ConfiguracaoForm'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Settings, Save, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ConfigData {
  nomeEmpresa: string
  emailPrincipal: string
  telefoneEmpresa: string
  slaDefaultDias: number
  horasTrabalho: string
  fusoHorario: string
  notificacoesEmail: boolean
  notificacoesPush: boolean
  alertasSLA: boolean
  sessaoTimeout: number
  logarAcessos: boolean
  autenticacao2FA: boolean
  temaPadrao: string
  corPrimaria: string
  corSecundaria: string
}

export default function ConfiguracoesSistemaPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [config, setConfig] = useState<ConfigData | null>(null)

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/configuracoes/sistema')
      if (response.ok) {
        const data = await response.json()
        setConfig(data.configuracoes)
      } else {
        console.error('Erro ao carregar configurações')
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (newConfig: ConfigData) => {
    setSaving(true)
    try {
      const response = await fetch('/api/configuracoes/sistema', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newConfig),
      })

      if (response.ok) {
        const result = await response.json()
        setConfig(newConfig)
        
        // Verificar se foi uma simulação
        if (result.message.includes('simulação')) {
          alert('Configurações salvas com sucesso! (Modo demonstração - dados não persistem)')
        } else {
          alert('Configurações salvas com sucesso!')
        }
      } else {
        alert('Erro ao salvar configurações')
      }
    } catch (error) {
      console.error('Erro ao salvar configurações:', error)
      alert('Erro ao salvar configurações')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Settings className="w-6 h-6 mr-2" />
            Configurações do Sistema
          </h2>
          <p className="text-gray-600">Configure parâmetros gerais e comportamento do sistema</p>
        </div>
        
        <Button variant="outline" onClick={loadConfig} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Recarregar
        </Button>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Status do Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Online</div>
            <p className="text-sm text-gray-500">Todos os serviços funcionando</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Última Atualização</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">Hoje</div>
            <p className="text-sm text-gray-500">Configurações sincronizadas</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Backups</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">Ativo</div>
            <p className="text-sm text-gray-500">Backup automático diário</p>
          </CardContent>
        </Card>
      </div>

      {/* Formulário de Configurações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Save className="w-5 h-5 mr-2" />
            Configurações Gerais
          </CardTitle>
          <CardDescription>
            Modifique as configurações do sistema conforme necessário. 
            As alterações serão aplicadas imediatamente após salvar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="text-center">
                <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-gray-600">Carregando configurações...</p>
              </div>
            </div>
          ) : (
            <ConfiguracaoForm 
              initialData={config || undefined}
              onSave={handleSave}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}