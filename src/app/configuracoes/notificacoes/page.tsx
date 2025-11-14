"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Bell, Mail, MessageSquare, AlertTriangle, Clock, CheckCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface ConfiguracaoNotificacao {
  id: string
  tipo: 'email' | 'sistema' | 'whatsapp'
  evento: string
  titulo: string
  descricao: string
  ativo: boolean
  template: string
  destinatarios: string[]
  condicoes: Record<string, unknown>
  created_at: string
  updated_at: string
}

const TIPOS_EVENTO = [
  { value: 'pedido_criado', label: 'Pedido Criado', icon: CheckCircle },
  { value: 'pagamento_pendente', label: 'Pagamento Pendente', icon: Clock },
  { value: 'sla_vencendo', label: 'SLA Vencendo', icon: AlertTriangle },
  { value: 'pedido_atrasado', label: 'Pedido Atrasado', icon: AlertTriangle },
  { value: 'status_alterado', label: 'Status Alterado', icon: MessageSquare },
  { value: 'pedido_entregue', label: 'Pedido Entregue', icon: CheckCircle },
]

const TIPOS_NOTIFICACAO = [
  { value: 'email', label: 'Email', icon: Mail },
  { value: 'sistema', label: 'Sistema', icon: Bell },
  { value: 'whatsapp', label: 'WhatsApp', icon: MessageSquare },
]

export default function ConfigNotificacoesPage() {
  const router = useRouter()
  const { userProfile, loading: authLoading } = useAuth()
  const [configuracoes, setConfiguracoes] = useState<ConfiguracaoNotificacao[]>([])
  const [loading, setLoading] = useState(true)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !userProfile) {
      router.push('/login')
    }
  }, [authLoading, userProfile, router])

  useEffect(() => {
    if (!userProfile) return
    carregarConfiguracoes()
  }, [userProfile])

  const carregarConfiguracoes = async () => {
    try {
      const { data, error } = await supabase
        .from('configuracoes_notificacao')
        .select('*')
        .order('evento')

      if (error) throw error
      setConfiguracoes(data || [])
    } catch (error) {
      console.error('Erro ao carregar configurações:', error)
      toast.error('Erro ao carregar configurações de notificação')
    } finally {
      setLoading(false)
    }
  }

  const toggleNotificacao = async (id: string, ativo: boolean) => {
    try {
      const { error } = await supabase
        .from('configuracoes_notificacao')
        .update({ 
          ativo,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)

      if (error) throw error
      
      toast.success(`Notificação ${ativo ? 'ativada' : 'desativada'} com sucesso!`)
      carregarConfiguracoes()
    } catch (error) {
      console.error('Erro ao alterar notificação:', error)
      toast.error('Erro ao alterar notificação')
    }
  }

  const criarConfiguracoesPadrao = async () => {
    try {
      const configuracoesPadrao = TIPOS_EVENTO.flatMap(evento => 
        TIPOS_NOTIFICACAO.map(tipo => ({
          id: crypto.randomUUID(),
          tipo: tipo.value as 'email' | 'sistema' | 'whatsapp',
          evento: evento.value,
          titulo: `${evento.label} - ${tipo.label}`,
          descricao: `Notificação via ${tipo.label} para ${evento.label.toLowerCase()}`,
          ativo: evento.value === 'sla_vencendo' || evento.value === 'pedido_atrasado',
          template: `Template padrão para ${evento.label}`,
          destinatarios: ['admin@sistema.com'],
          condicoes: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }))
      )

      const { error } = await supabase
        .from('configuracoes_notificacao')
        .insert(configuracoesPadrao)

      if (error) throw error
      
      toast.success('Configurações padrão criadas com sucesso!')
      carregarConfiguracoes()
    } catch (error) {
      console.error('Erro ao criar configurações padrão:', error)
      toast.error('Erro ao criar configurações padrão')
    }
  }

  // Gate de autenticação
  if (authLoading) {
    return (
      <div className="w-full h-[60vh] flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (!userProfile) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Configurações de Notificação</h1>
          <p className="text-gray-600 dark:text-gray-400">Gerencie alertas e avisos automáticos do sistema</p>
        </div>
        
        {configuracoes.length === 0 && (
          <Button onClick={criarConfiguracoesPadrao}>
            <Bell className="w-4 h-4 mr-2" />
            Criar Configurações Padrão
          </Button>
        )}
      </div>

      {/* Configurações Gerais */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 dark:text-white">
            <Bell className="w-5 h-5" />
            Configurações Gerais
          </CardTitle>
          <CardDescription className="dark:text-gray-300">
            Configurações globais para o sistema de notificações
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="email-servidor">Servidor de Email (SMTP)</Label>
                <Input
                  id="email-servidor"
                  placeholder="smtp.gmail.com"
                  defaultValue="smtp.sistema.com"
                />
              </div>
              <div>
                <Label htmlFor="email-porta">Porta SMTP</Label>
                <Input
                  id="email-porta"
                  type="number"
                  placeholder="587"
                  defaultValue="587"
                />
              </div>
              <div>
                <Label htmlFor="email-usuario">Usuário SMTP</Label>
                <Input
                  id="email-usuario"
                  type="email"
                  placeholder="notificacoes@sistema.com"
                  defaultValue="notificacoes@sistema.com"
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="whatsapp-token">Token WhatsApp API</Label>
                <Input
                  id="whatsapp-token"
                  placeholder="Token da API do WhatsApp"
                  type="password"
                />
              </div>
              <div>
                <Label htmlFor="whatsapp-numero">Número WhatsApp</Label>
                <Input
                  id="whatsapp-numero"
                  placeholder="+5511999999999"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="modo-producao" />
                <Label htmlFor="modo-producao">Modo Produção</Label>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end pt-4">
            <Button>Salvar Configurações</Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Notificações por Evento */}
      {loading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      ) : configuracoes.length === 0 ? (
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <p>Nenhuma configuração de notificação encontrada</p>
            <p className="text-sm">Clique em &quot;Criar Configurações Padrão&quot; para começar</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {TIPOS_EVENTO.map((evento) => {
            const EventoIcon = evento.icon
            const configsEvento = configuracoes.filter(c => c.evento === evento.value)
            
            return (
              <Card key={evento.value} className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg dark:text-white">
                    <EventoIcon className="w-5 h-5" />
                    {evento.label}
                  </CardTitle>
                  <CardDescription className="dark:text-gray-300">
                    Configurações de notificação para este tipo de evento
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {TIPOS_NOTIFICACAO.map((tipo) => {
                      const TipoIcon = tipo.icon
                      const config = configsEvento.find(c => c.tipo === tipo.value)
                      
                      return (
                        <div key={tipo.value} className="border dark:border-gray-700 rounded-lg p-4 dark:bg-gray-700/50">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <TipoIcon className="w-4 h-4" />
                              <span className="font-medium">{tipo.label}</span>
                            </div>
                            <Switch
                              checked={config?.ativo || false}
                              onCheckedChange={(checked) => {
                                if (config) {
                                  toggleNotificacao(config.id, checked)
                                }
                              }}
                            />
                          </div>
                          
                          {config && (
                            <div className="space-y-2 text-sm text-gray-600">
                              <p>{config.descricao}</p>
                              <div className="flex items-center gap-2">
                                <Badge 
                                  variant={config.ativo ? "default" : "secondary"}
                                  className="text-xs"
                                >
                                  {config.ativo ? 'Ativo' : 'Inativo'}
                                </Badge>
                                {config.destinatarios.length > 0 && (
                                  <Badge variant="outline" className="text-xs">
                                    {config.destinatarios.length} destinatário(s)
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Histórico de Notificações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Histórico Recente
          </CardTitle>
          <CardDescription>
            Últimas notificações enviadas pelo sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { tipo: 'email', evento: 'SLA Vencendo', destinatario: 'admin@sistema.com', status: 'enviado', tempo: '2 min atrás' },
              { tipo: 'sistema', evento: 'Pedido Criado', destinatario: 'Sistema', status: 'enviado', tempo: '5 min atrás' },
              { tipo: 'whatsapp', evento: 'Pagamento Pendente', destinatario: '+5511999999999', status: 'falhou', tempo: '10 min atrás' },
            ].map((notificacao, index) => {
              const TipoIcon = TIPOS_NOTIFICACAO.find(t => t.value === notificacao.tipo)?.icon || Bell
              
              return (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <TipoIcon className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="font-medium text-sm">{notificacao.evento}</p>
                      <p className="text-xs text-gray-500">{notificacao.destinatario}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={notificacao.status === 'enviado' ? 'default' : 'destructive'}
                      className="text-xs"
                    >
                      {notificacao.status === 'enviado' ? 'Enviado' : 'Falhou'}
                    </Badge>
                    <span className="text-xs text-gray-500">{notificacao.tempo}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}