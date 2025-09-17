'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Settings, 
  Save, 
  Bell, 
  Shield, 
  Database,
  Globe,
  Clock,
  Users,
  Mail
} from 'lucide-react'

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

interface ConfiguracaoFormProps {
  initialData?: Partial<ConfigData>
  onSave?: (data: ConfigData) => void
}

export function ConfiguracaoForm({ initialData, onSave }: ConfiguracaoFormProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    // Configurações gerais
    nomeEmpresa: initialData?.nomeEmpresa || 'Desenrola DCL',
    emailPrincipal: initialData?.emailPrincipal || '',
    telefoneEmpresa: initialData?.telefoneEmpresa || '',
    
    // Configurações do sistema
    slaDefaultDias: initialData?.slaDefaultDias || 5,
    horasTrabalho: initialData?.horasTrabalho || '08:00-18:00',
    fusoHorario: initialData?.fusoHorario || 'America/Sao_Paulo',
    
    // Notificações
    notificacoesEmail: initialData?.notificacoesEmail ?? true,
    notificacoesPush: initialData?.notificacoesPush ?? true,
    alertasSLA: initialData?.alertasSLA ?? true,
    
    // Segurança
    sessaoTimeout: initialData?.sessaoTimeout || 30,
    logarAcessos: initialData?.logarAcessos ?? true,
    autenticacao2FA: initialData?.autenticacao2FA ?? false,
    
    // Aparência
    temaPadrao: initialData?.temaPadrao || 'light',
    corPrimaria: initialData?.corPrimaria || '#1C3B5A',
    corSecundaria: initialData?.corSecundaria || '#3182f6'
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      // Se existe callback onSave, usar ele (chamada será feita pela página)
      if (onSave) {
        onSave(formData)
      } else {
        // Fallback: chamar API diretamente se não houver callback
        const response = await fetch('/api/configuracoes/sistema', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        })

        if (!response.ok) {
          throw new Error('Erro ao salvar configurações')
        }

        const result = await response.json()
        
        // Verificar se foi uma simulação
        if (result.message.includes('simulação')) {
          alert('Configurações salvas com sucesso! (Modo demonstração - dados não persistem)')
        } else {
          alert('Configurações salvas com sucesso!')
        }
      }
    } catch (error) {
      console.error('Erro ao salvar configurações:', error)
      alert('Erro ao salvar configurações. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const configSections = [
    {
      title: 'Configurações Gerais',
      icon: Settings,
      gradient: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-50/80 to-indigo-50/80',
      fields: [
        {
          id: 'nomeEmpresa',
          label: 'Nome da Empresa',
          type: 'text',
          icon: Users
        },
        {
          id: 'emailPrincipal',
          label: 'Email Principal',
          type: 'email',
          icon: Mail
        },
        {
          id: 'telefoneEmpresa',
          label: 'Telefone da Empresa',
          type: 'text',
          icon: Settings
        }
      ]
    },
    {
      title: 'Sistema e SLA',
      icon: Clock,
      gradient: 'from-emerald-500 to-green-600',
      bgGradient: 'from-emerald-50/80 to-green-50/80',
      fields: [
        {
          id: 'slaDefaultDias',
          label: 'SLA Padrão (dias)',
          type: 'number',
          icon: Clock
        },
        {
          id: 'horasTrabalho',
          label: 'Horário de Trabalho',
          type: 'text',
          icon: Clock
        },
        {
          id: 'fusoHorario',
          label: 'Fuso Horário',
          type: 'select',
          options: [
            { value: 'America/Sao_Paulo', label: 'São Paulo (UTC-3)' },
            { value: 'America/Brasilia', label: 'Brasília (UTC-3)' },
            { value: 'America/Manaus', label: 'Manaus (UTC-4)' }
          ],
          icon: Globe
        }
      ]
    }
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-6">
      <div className="text-center bg-gradient-to-r from-white/80 to-gray-50/80 backdrop-blur-sm rounded-xl p-6 border border-white/30">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent mb-2">
          Configurações do Sistema
        </h1>
        <p className="text-gray-600">Gerencie as configurações e preferências do sistema</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {configSections.map((section, sectionIndex) => {
          const SectionIcon = section.icon
          return (
            <Card 
              key={sectionIndex}
              className={`bg-gradient-to-br ${section.bgGradient} backdrop-blur-sm border-white/20 shadow-lg`}
            >
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${section.gradient} shadow-lg`}>
                    <SectionIcon className="w-5 h-5 text-white" />
                  </div>
                  <span className="bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">
                    {section.title}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {section.fields.map((field) => {
                  const FieldIcon = field.icon
                  return (
                    <div key={field.id} className="space-y-2">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <FieldIcon className="w-4 h-4 text-gray-600" />
                        {field.label}
                      </Label>
                      
                      {field.type === 'select' ? (
                        <Select 
                          value={formData[field.id as keyof typeof formData] as string}
                          onValueChange={(value) => setFormData(prev => ({ ...prev, [field.id]: value }))}
                        >
                          <SelectTrigger className="bg-white/70 backdrop-blur-sm border-gray-300 hover:bg-white/90 transition-all duration-200">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-white/95 backdrop-blur-lg border-white/20">
                            {field.options?.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : field.type === 'textarea' ? (
                        <Textarea
                          value={formData[field.id as keyof typeof formData] as string}
                          onChange={(e) => setFormData(prev => ({ ...prev, [field.id]: e.target.value }))}
                          className="bg-white/70 backdrop-blur-sm border-gray-300 hover:bg-white/90 focus:bg-white transition-all duration-200"
                          rows={3}
                        />
                      ) : (
                        <Input
                          type={field.type}
                          value={formData[field.id as keyof typeof formData] as string}
                          onChange={(e) => setFormData(prev => ({ ...prev, [field.id]: e.target.value }))}
                          className="bg-white/70 backdrop-blur-sm border-gray-300 hover:bg-white/90 focus:bg-white transition-all duration-200"
                        />
                      )}
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          )
        })}

        {/* Switches para configurações boolean */}
        <Card className="bg-gradient-to-br from-purple-50/80 to-violet-50/80 backdrop-blur-sm border-white/20 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg">
                <Bell className="w-5 h-5 text-white" />
              </div>
              <span className="bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">
                Notificações e Segurança
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {[
              { id: 'notificacoesEmail', label: 'Notificações por Email', icon: Mail },
              { id: 'notificacoesPush', label: 'Notificações Push', icon: Bell },
              { id: 'alertasSLA', label: 'Alertas de SLA', icon: Clock },
              { id: 'logarAcessos', label: 'Log de Acessos', icon: Database },
              { id: 'autenticacao2FA', label: 'Autenticação 2FA', icon: Shield }
            ].map((setting) => {
              const SettingIcon = setting.icon
              return (
                <div key={setting.id} className="flex items-center justify-between p-4 bg-white/50 backdrop-blur-sm rounded-lg border border-white/30">
                  <div className="flex items-center gap-3">
                    <SettingIcon className="w-5 h-5 text-gray-600" />
                    <span className="font-medium text-gray-700">{setting.label}</span>
                  </div>
                  <Switch
                    checked={formData[setting.id as keyof typeof formData] as boolean}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, [setting.id]: checked }))}
                  />
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Botão de salvar */}
        <div className="flex justify-end pt-6">
          <Button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-8"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Salvar Configurações
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
