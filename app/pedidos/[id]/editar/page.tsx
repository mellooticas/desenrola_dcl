'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { 
  Save, 
  Loader2,
  AlertTriangle,
  Building,
  User,
  Calculator,
  Clock,
  Shield
} from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { PedidoHeader } from '@/components/pedidos/PedidoHeader'
import type { StatusPedido, PrioridadeLevel } from '@/lib/types/database'

interface PedidoEdicao {
  id: string
  numero_sequencial: number
  numero_os_fisica: string | null
  numero_pedido_laboratorio: string | null
  status: StatusPedido
  prioridade: PrioridadeLevel
  cliente_nome: string
  cliente_telefone: string | null
  valor_pedido: number | null
  custo_lentes: number | null
  eh_garantia: boolean
  observacoes: string | null
  observacoes_garantia: string | null
  data_prevista_pronto: string | null
  loja_nome: string
  laboratorio_nome: string
  classe_nome: string
}

const STATUS_OPTIONS: { value: StatusPedido; label: string }[] = [
  { value: 'REGISTRADO', label: 'Registrado' },
  { value: 'AG_PAGAMENTO', label: 'Aguardando Pagamento' },
  { value: 'PAGO', label: 'Pago' },
  { value: 'PRODUCAO', label: 'Em Produção' },
  { value: 'PRONTO', label: 'Pronto no DCL' },
  { value: 'ENVIADO', label: 'Enviado para Loja' },
  { value: 'CHEGOU', label: 'Chegou na Loja' },
  { value: 'ENTREGUE', label: 'Entregue ao Cliente' },
  { value: 'CANCELADO', label: 'Cancelado' }
]

const PRIORIDADE_OPTIONS: { value: PrioridadeLevel; label: string }[] = [
  { value: 'BAIXA', label: 'Baixa' },
  { value: 'NORMAL', label: 'Normal' },
  { value: 'ALTA', label: 'Alta' },
  { value: 'URGENTE', label: 'Urgente' }
]

export default function EditarPedidoPage() {
  const router = useRouter()
  const params = useParams()
  const { userProfile, loading: authLoading } = useAuth()
  
  const [pedido, setPedido] = useState<PedidoEdicao | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  const pedidoId = params?.id as string

  const [formData, setFormData] = useState({
    numero_os_fisica: '',
    numero_pedido_laboratorio: '',
    status: 'REGISTRADO' as StatusPedido,
    prioridade: 'NORMAL' as PrioridadeLevel,
    cliente_nome: '',
    cliente_telefone: '',
    valor_pedido: '',
    custo_lentes: '',
    eh_garantia: false,
    observacoes: '',
    observacoes_garantia: '',
    data_prevista_pronto: ''
  })

  useEffect(() => {
    if (!authLoading && !userProfile) {
      router.push('/login')
    }
  }, [authLoading, userProfile, router])

  const carregarPedido = useCallback(async () => {
    try {
      setLoading(true)
      
      const { data: pedidoData, error: pedidoError } = await supabase
        .from('v_pedidos_kanban')
        .select('*')
        .eq('id', pedidoId)
        .single()

      if (pedidoError) {
        console.error('Erro ao carregar pedido:', pedidoError)
        throw pedidoError
      }

      setPedido(pedidoData)
      
      setFormData({
        numero_os_fisica: pedidoData.numero_os_fisica || '',
        numero_pedido_laboratorio: pedidoData.numero_pedido_laboratorio || '',
        status: pedidoData.status,
        prioridade: pedidoData.prioridade,
        cliente_nome: pedidoData.cliente_nome || '',
        cliente_telefone: pedidoData.cliente_telefone || '',
        valor_pedido: pedidoData.valor_pedido ? String(pedidoData.valor_pedido) : '',
        custo_lentes: pedidoData.custo_lentes ? String(pedidoData.custo_lentes) : '',
        eh_garantia: pedidoData.eh_garantia,
        observacoes: pedidoData.observacoes || '',
        observacoes_garantia: pedidoData.observacoes_garantia || '',
        data_prevista_pronto: pedidoData.data_prevista_pronto || ''
      })
      
    } catch (error) {
      console.error('Erro ao carregar dados do pedido:', error)
      toast.error('Erro ao carregar pedido')
    } finally {
      setLoading(false)
    }
  }, [pedidoId])

  useEffect(() => {
    if (!pedidoId || !userProfile) return
    carregarPedido()
  }, [pedidoId, userProfile, carregarPedido])

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    setHasChanges(true)
  }

  const handleSave = async () => {
    if (!pedido) return

    try {
      setSaving(true)

      const updateData = {
        numero_os_fisica: formData.numero_os_fisica || null,
        numero_pedido_laboratorio: formData.numero_pedido_laboratorio || null,
        status: formData.status,
        prioridade: formData.prioridade,
        cliente_nome: formData.cliente_nome,
        cliente_telefone: formData.cliente_telefone || null,
        valor_pedido: formData.valor_pedido ? parseFloat(formData.valor_pedido) : null,
        custo_lentes: formData.custo_lentes ? parseFloat(formData.custo_lentes) : null,
        eh_garantia: formData.eh_garantia,
        observacoes: formData.observacoes || null,
        observacoes_garantia: formData.observacoes_garantia || null,
        data_prevista_pronto: formData.data_prevista_pronto || null,
        updated_at: new Date().toISOString(),
        updated_by: userProfile?.id || 'sistema'
      }

      const { error } = await supabase
        .from('pedidos')
        .update(updateData)
        .eq('id', pedidoId)

      if (error) throw error

      if (formData.status !== pedido.status) {
        const { error: timelineError } = await supabase
          .from('pedidos_timeline')
          .insert({
            pedido_id: pedidoId,
            status_anterior: pedido.status,
            status_novo: formData.status,
            responsavel_id: userProfile?.id,
            observacoes: `Status alterado via edição para ${formData.status}`,
            created_at: new Date().toISOString()
          })

        if (timelineError) {
          console.error('Erro ao criar timeline:', timelineError)
        }
      }

      toast.success('Pedido atualizado com sucesso!')
      setHasChanges(false)
      await carregarPedido()
      
    } catch (error) {
      console.error('Erro ao salvar pedido:', error)
      toast.error('Erro ao salvar alterações')
    } finally {
      setSaving(false)
    }
  }

  if (!userProfile) {
    return <LoadingSpinner />
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="backdrop-blur-xl bg-white/30 border-white/20 shadow-xl">
          <CardContent className="flex items-center justify-center p-8">
            <LoadingSpinner />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!pedido) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="backdrop-blur-xl bg-white/30 border-b border-white/20">
          <PedidoHeader 
            mode="edit"
            pedidoId={pedidoId}
          />
        </div>
        
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <Card className="backdrop-blur-xl bg-white/30 border-white/20 shadow-xl max-w-md w-full text-center">
              <CardContent className="pt-6">
                <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-4">Pedido não encontrado</h2>
                <p className="text-muted-foreground mb-6">
                  O pedido com ID &quot;{pedidoId}&quot; não foi encontrado ou você não tem permissão para editá-lo.
                </p>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="backdrop-blur-xl bg-white/30 border-b border-white/20">
        <PedidoHeader 
          mode="edit"
          pedidoId={pedidoId}
          numeroSequencial={pedido.numero_sequencial}
          status={pedido.status}
          prioridade={pedido.prioridade}
        />
      </div>

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Botão Salvar Superior */}
          <div className="flex justify-end">
            <Button 
              onClick={handleSave}
              disabled={!hasChanges || saving}
              className="flex items-center gap-2 backdrop-blur-sm bg-primary/90 hover:bg-primary shadow-lg"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{saving ? 'Salvando...' : 'Salvar Alterações'}</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="backdrop-blur-xl bg-white/30 border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  <span>Informações do Cliente</span>
                </CardTitle>
                <CardDescription>
                  Dados básicos do cliente e contato
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="cliente_nome" className="text-sm font-medium required">Nome do Cliente *</Label>
                  <Input
                    id="cliente_nome"
                    value={formData.cliente_nome}
                    onChange={(e) => handleInputChange('cliente_nome', e.target.value)}
                    placeholder="Nome completo do cliente"
                    className="backdrop-blur-sm bg-white/50 border-white/30"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="cliente_telefone">Telefone</Label>
                  <Input
                    id="cliente_telefone"
                    value={formData.cliente_telefone}
                    onChange={(e) => handleInputChange('cliente_telefone', e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="backdrop-blur-sm bg-white/50 border-white/30"
                  />
                </div>

                <div>
                  <Label htmlFor="numero_os_fisica">Número da OS Física</Label>
                  <Input
                    id="numero_os_fisica"
                    value={formData.numero_os_fisica}
                    onChange={(e) => handleInputChange('numero_os_fisica', e.target.value)}
                    placeholder="Número da ordem de serviço física"
                    className="backdrop-blur-sm bg-white/50 border-white/30"
                  />
                </div>

                <div>
                  <Label htmlFor="numero_pedido_laboratorio">Número do Pedido no Laboratório</Label>
                  <Input
                    id="numero_pedido_laboratorio"
                    value={formData.numero_pedido_laboratorio}
                    onChange={(e) => handleInputChange('numero_pedido_laboratorio', e.target.value)}
                    placeholder="Número do pedido no laboratório"
                    className="backdrop-blur-sm bg-white/50 border-white/30"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-xl bg-white/30 border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  <span>Status e Controle</span>
                </CardTitle>
                <CardDescription>
                  Controle de status e prioridade do pedido
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="status">Status do Pedido</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value) => handleInputChange('status', value)}
                  >
                    <SelectTrigger className="backdrop-blur-sm bg-white/50 border-white/30">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="prioridade">Prioridade</Label>
                  <Select 
                    value={formData.prioridade} 
                    onValueChange={(value) => handleInputChange('prioridade', value)}
                  >
                    <SelectTrigger className="backdrop-blur-sm bg-white/50 border-white/30">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRIORIDADE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="data_prevista_pronto">Data Prevista Pronto</Label>
                  <Input
                    id="data_prevista_pronto"
                    type="date"
                    value={formData.data_prevista_pronto}
                    onChange={(e) => handleInputChange('data_prevista_pronto', e.target.value)}
                    className="backdrop-blur-sm bg-white/50 border-white/30"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    id="eh_garantia"
                    checked={formData.eh_garantia}
                    onCheckedChange={(checked) => handleInputChange('eh_garantia', checked)}
                  />
                  <Label htmlFor="eh_garantia" className="flex items-center gap-1">
                    É Garantia
                  </Label>
                </div>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-xl bg-white/30 border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  <span>Valores</span>
                </CardTitle>
                <CardDescription>
                  Informações financeiras do pedido
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="valor_pedido">Valor do Pedido</Label>
                  <Input
                    id="valor_pedido"
                    type="number"
                    step="0.01"
                    value={formData.valor_pedido}
                    onChange={(e) => handleInputChange('valor_pedido', e.target.value)}
                    placeholder="0,00"
                    className="backdrop-blur-sm bg-white/50 border-white/30"
                  />
                </div>

                <div>
                  <Label htmlFor="custo_lentes">Custo das Lentes</Label>
                  <Input
                    id="custo_lentes"
                    type="number"
                    step="0.01"
                    value={formData.custo_lentes}
                    onChange={(e) => handleInputChange('custo_lentes', e.target.value)}
                    placeholder="0,00"
                    className="backdrop-blur-sm bg-white/50 border-white/30"
                  />
                </div>

                {/* Preview de Margem - Cálculo Dinâmico */}
                {formData.valor_pedido && formData.custo_lentes && (
                  <div className="bg-green-50/50 backdrop-blur-sm border border-green-200/50 rounded-lg p-3">
                    <Label className="text-sm font-medium text-muted-foreground">Margem Calculada</Label>
                    <div className="text-lg font-bold text-green-600">
                      R$ {(parseFloat(formData.valor_pedido) - parseFloat(formData.custo_lentes)).toFixed(2)}
                      <span className="text-sm text-gray-500 ml-2">
                        ({(((parseFloat(formData.valor_pedido) - parseFloat(formData.custo_lentes)) / parseFloat(formData.valor_pedido)) * 100).toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="backdrop-blur-xl bg-white/30 border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <span>Observações</span>
                </CardTitle>
                <CardDescription>
                  Anotações e observações sobre o pedido
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="observacoes">Observações Gerais</Label>
                  <Textarea
                    id="observacoes"
                    value={formData.observacoes}
                    onChange={(e) => handleInputChange('observacoes', e.target.value)}
                    placeholder="Observações sobre o pedido..."
                    rows={3}
                    className="backdrop-blur-sm bg-white/50 border-white/30"
                  />
                </div>

                {formData.eh_garantia && (
                  <div>
                    <Label htmlFor="observacoes_garantia">Observações da Garantia</Label>
                    <Textarea
                      id="observacoes_garantia"
                      value={formData.observacoes_garantia}
                      onChange={(e) => handleInputChange('observacoes_garantia', e.target.value)}
                      placeholder="Detalhes sobre a garantia..."
                      rows={3}
                      className="backdrop-blur-sm bg-white/50 border-white/30"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Botão Salvar Fixo no Rodapé */}
          <div className="flex justify-between items-center pt-6 border-t border-white/20 sticky bottom-0 bg-gradient-to-br from-slate-50/80 via-blue-50/80 to-indigo-100/80 backdrop-blur-xl py-4 px-4 -mx-4 rounded-t-lg shadow-lg">
            <Button 
              variant="outline" 
              onClick={() => router.back()}
              className="backdrop-blur-sm bg-white/50 border-white/30 hover:bg-white/70"
            >
              Cancelar
            </Button>
            <div className="flex gap-2">
              {hasChanges && (
                <span className="text-sm text-orange-600 flex items-center gap-1">
                  ⚠️ Alterações não salvas
                </span>
              )}
              <Button 
                onClick={handleSave}
                disabled={!hasChanges || saving}
                className="flex items-center gap-2 backdrop-blur-sm bg-primary/90 hover:bg-primary shadow-lg"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>{saving ? 'Salvando...' : 'Salvar Alterações'}</span>
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
