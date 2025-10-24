'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Save, Clock, AlertCircle, Printer, CheckCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { Loja, Laboratorio, ClasseLente, Tratamento, PrioridadeLevel, PedidoCompleto } from '@/lib/types/database'
import { usePermissions } from '@/lib/hooks/use-user-permissions'
import { DemoModeAlert } from '@/components/permissions/DemoModeAlert'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { PrintOrderButton } from '@/components/pedidos/PrintOrderButton'

export default function NovaOrdemPage() {
  const router = useRouter()
  const permissions = usePermissions()
  const [loading, setLoading] = useState(false)
  const [carregandoDados, setCarregandoDados] = useState(true)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [pedidoCriado, setPedidoCriado] = useState<PedidoCompleto | null>(null)
  
  // Dados para selects
  const [lojas, setLojas] = useState<Loja[]>([])
  const [laboratorios, setLaboratorios] = useState<Laboratorio[]>([])
  const [classes, setClasses] = useState<ClasseLente[]>([])
  const [tratamentos, setTratamentos] = useState<Tratamento[]>([])
  
  // Form data
  const [formData, setFormData] = useState({
    loja_id: '',
    laboratorio_id: '',
    classe_lente_id: '',
    prioridade: 'NORMAL' as PrioridadeLevel,
    cliente_nome: '',
    cliente_telefone: '',
    numero_os_fisica: '',
    numero_pedido_laboratorio: '',
    valor_pedido: '',
    custo_lentes: '',
    eh_garantia: false,
    tratamentos_ids: [] as string[],
    observacoes: '',
    observacoes_garantia: '',
    data_prometida_manual: '' // Campo para data prometida ao cliente
  })
  
  // Calculados
  const [slaCalculado, setSlaCalculado] = useState<number | null>(null)
  const [valorTotal, setValorTotal] = useState(0)


  useEffect(() => {
    carregarDadosIniciais()
  }, [])

  useEffect(() => {
    calcularSLA()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.laboratorio_id, formData.classe_lente_id, formData.prioridade])

  useEffect(() => {
    calcularValorTotal()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.valor_pedido, formData.tratamentos_ids, tratamentos])

  const carregarDadosIniciais = async () => {
    try {
      const [lojasRes, labsRes, classesRes, tratamentosRes] = await Promise.all([
        supabase.from('lojas').select('*').eq('ativo', true).order('nome'),
        supabase.from('laboratorios').select('*').eq('ativo', true).order('nome'),
        supabase.from('classes_lente').select('*').eq('ativa', true).order('nome'),
        supabase.from('tratamentos').select('*').eq('ativo', true).order('nome')
      ])

      if (lojasRes.error) throw lojasRes.error
      if (labsRes.error) throw labsRes.error
      if (classesRes.error) throw classesRes.error
      if (tratamentosRes.error) throw tratamentosRes.error

      setLojas(lojasRes.data || [])
      setLaboratorios(labsRes.data || [])
      setClasses(classesRes.data || [])
      setTratamentos(tratamentosRes.data || [])
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      toast.error('Erro ao carregar dados iniciais')
    } finally {
      setCarregandoDados(false)
    }
  }

  const calcularSLA = async () => {
    if (!formData.laboratorio_id || !formData.classe_lente_id) {
      setSlaCalculado(null)
      return
    }

    try {
      // Buscar SLA específico
      const { data: slaEspecifico } = await supabase
        .from('laboratorio_sla')
        .select('sla_base_dias')
        .eq('laboratorio_id', formData.laboratorio_id)
        .eq('classe_lente_id', formData.classe_lente_id)
        .single()

      if (slaEspecifico) {
        let sla = slaEspecifico.sla_base_dias

        // Aplicar modificador de prioridade
        switch (formData.prioridade) {
          case 'BAIXA':
            sla += 2
            break
          case 'ALTA':
            sla = Math.max(1, sla - 1)
            break
          case 'URGENTE':
            sla = Math.max(1, sla - 3)
            break
        }

        setSlaCalculado(sla)
      } else {
        // Usar SLA padrão do laboratório
        const laboratorio = laboratorios.find(l => l.id === formData.laboratorio_id)
        const classe = classes.find(c => c.id === formData.classe_lente_id)
        
        if (laboratorio && classe) {
          let sla = Math.max(laboratorio.sla_padrao_dias, classe.sla_base_dias)
          
          switch (formData.prioridade) {
            case 'BAIXA':
              sla += 2
              break
            case 'ALTA':
              sla = Math.max(1, sla - 1)
              break
            case 'URGENTE':
              sla = Math.max(1, sla - 3)
              break
          }
          
          setSlaCalculado(sla)
        }
      }
    } catch (error) {
      console.error('Erro ao calcular SLA:', error)
    }
  }

  const calcularValorTotal = () => {
    let total = parseFloat(formData.valor_pedido) || 0
    
    // Somar valores dos tratamentos selecionados
    formData.tratamentos_ids.forEach(tratamentoId => {
      const tratamento = tratamentos.find(t => t.id === tratamentoId)
      if (tratamento) {
        total += tratamento.custo_adicional
      }
    })
    
    setValorTotal(total)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!formData.loja_id || !formData.laboratorio_id || !formData.classe_lente_id || !formData.cliente_nome) {
        toast.error('Preencha todos os campos obrigatórios')
        return
      }

      const dadosPedido = {
        loja_id: formData.loja_id,
        laboratorio_id: formData.laboratorio_id,
        classe_lente_id: formData.classe_lente_id,
        prioridade: formData.prioridade,
        cliente_nome: formData.cliente_nome,
        cliente_telefone: formData.cliente_telefone || null,
        numero_os_fisica: formData.numero_os_fisica || null,
        numero_pedido_laboratorio: formData.numero_pedido_laboratorio || null,
        valor_pedido: valorTotal > 0 ? valorTotal : null,
        custo_lentes: parseFloat(formData.custo_lentes) || null,
        eh_garantia: formData.eh_garantia,
        tratamentos_ids: formData.tratamentos_ids,
        observacoes: formData.observacoes || null,
        observacoes_garantia: formData.observacoes_garantia || null,
        // Montador será atribuído apenas ao mover para coluna "LENTES NO DCL"
        data_prometida_manual: formData.data_prometida_manual || null
      }

      const response = await fetch('/api/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dadosPedido)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao criar pedido')
      }

      const pedidoCriado = await response.json()
      
      // Buscar dados completos do pedido para impressão
      const { data: pedidoCompleto, error: pedidoError } = await supabase
        .from('view_pedidos_completo')
        .select('*')
        .eq('id', pedidoCriado.id)
        .single()

      if (pedidoError) {
        console.error('Erro ao buscar pedido completo:', pedidoError)
      }

      setPedidoCriado(pedidoCompleto || pedidoCriado)
      setShowSuccessModal(true)
      toast.success('Pedido criado com sucesso!')
    } catch (error: unknown) {
      console.error('Erro ao criar pedido:', error)
      toast.error(error instanceof Error ? error.message : 'Erro ao criar pedido')
    } finally {
      setLoading(false)
    }
  }

  const toggleTratamento = (tratamentoId: string) => {
    setFormData(prev => ({
      ...prev,
      tratamentos_ids: prev.tratamentos_ids.includes(tratamentoId)
        ? prev.tratamentos_ids.filter(id => id !== tratamentoId)
        : [...prev.tratamentos_ids, tratamentoId]
    }))
  }

  if (carregandoDados) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Carregando formulário...</div>
        </div>
      </div>
    )
  }

  // 🔒 PROTEÇÃO DEMO: Bloquear criação de pedidos
  if (permissions.isDemo || !permissions.canCreate) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="container mx-auto p-6 space-y-6">
          <div className="backdrop-blur-xl bg-white/30 border-white/20 shadow-xl rounded-lg p-6">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => router.back()}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-slate-800">Nova Ordem</h1>
                <p className="text-slate-600">Criar novo pedido</p>
              </div>
            </div>
          </div>

          <Alert className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
            <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
            <AlertTitle className="text-yellow-800 dark:text-yellow-200">Acesso Restrito</AlertTitle>
            <AlertDescription className="text-yellow-800 dark:text-yellow-200">
              {permissions.isDemo 
                ? 'Usuários em modo visualização não podem criar novos pedidos. Esta função está disponível apenas para usuários com permissões de criação.'
                : 'Você não tem permissão para criar novos pedidos. Entre em contato com o administrador se precisar deste acesso.'
              }
            </AlertDescription>
          </Alert>

          <div className="flex gap-4">
            <Button onClick={() => router.push('/kanban')}>
              Ir para Kanban
            </Button>
            <Button variant="outline" onClick={() => router.push('/pedidos')}>
              Ver Pedidos
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto p-6 space-y-6">
        <div className="backdrop-blur-xl bg-white/30 border-white/20 shadow-xl rounded-lg p-6">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Nova Ordem</h1>
              <p className="text-slate-600">Criar novo pedido em 10 segundos</p>
            </div>
          </div>
        </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Coluna 1: Dados Básicos */}
          <Card>
            <CardHeader>
              <CardTitle>Dados Básicos</CardTitle>
              <CardDescription>Informações essenciais do pedido</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="loja">Loja *</Label>
                <Select value={formData.loja_id} onValueChange={(value) => setFormData({ ...formData, loja_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a loja" />
                  </SelectTrigger>
                  <SelectContent>
                    {lojas.map(loja => (
                      <SelectItem key={loja.id} value={loja.id}>
                        {loja.nome} ({loja.codigo})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="laboratorio">Laboratório *</Label>
                <Select value={formData.laboratorio_id} onValueChange={(value) => setFormData({ ...formData, laboratorio_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o laboratório" />
                  </SelectTrigger>
                  <SelectContent>
                    {laboratorios.map(lab => (
                      <SelectItem key={lab.id} value={lab.id}>
                        {lab.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="classe">Classe de Lente *</Label>
                <Select value={formData.classe_lente_id} onValueChange={(value) => setFormData({ ...formData, classe_lente_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a classe" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map(classe => (
                      <SelectItem key={classe.id} value={classe.id}>
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-3 h-3 rounded"
                            style={{ backgroundColor: classe.cor_badge }}
                          />
                          <span>{classe.nome}</span>
                          <Badge variant="outline" className="text-xs">
                            {classe.sla_base_dias}d
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="prioridade">Prioridade</Label>
                <Select value={formData.prioridade} onValueChange={(value: PrioridadeLevel) => setFormData({ ...formData, prioridade: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BAIXA">Baixa (+2 dias)</SelectItem>
                    <SelectItem value="NORMAL">Normal</SelectItem>
                    <SelectItem value="ALTA">Alta (-1 dia)</SelectItem>
                    <SelectItem value="URGENTE">Urgente (-3 dias)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {slaCalculado && (
                <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">
                    SLA Calculado: {slaCalculado} dias úteis
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Coluna 2: Cliente e Financeiro */}
          <Card>
            <CardHeader>
              <CardTitle>Cliente e Financeiro</CardTitle>
              <CardDescription>Dados do cliente e valores</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cliente_nome">Nome do Cliente *</Label>
                <Input
                  id="cliente_nome"
                  value={formData.cliente_nome}
                  onChange={(e) => setFormData({ ...formData, cliente_nome: e.target.value })}
                  placeholder="Nome completo do cliente"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cliente_telefone">Telefone</Label>
                <Input
                  id="cliente_telefone"
                  value={formData.cliente_telefone}
                  onChange={(e) => setFormData({ ...formData, cliente_telefone: e.target.value })}
                  placeholder="(11) 99999-9999"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="valor_pedido">Valor do Pedido</Label>
                  <Input
                    id="valor_pedido"
                    type="number"
                    step="0.01"
                    value={formData.valor_pedido}
                    onChange={(e) => setFormData({ ...formData, valor_pedido: e.target.value })}
                    placeholder="R$ 0,00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="custo_lentes">Custo das Lentes</Label>
                  <Input
                    id="custo_lentes"
                    type="number"
                    step="0.01"
                    value={formData.custo_lentes}
                    onChange={(e) => setFormData({ ...formData, custo_lentes: e.target.value })}
                    placeholder="R$ 0,00"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="garantia"
                  checked={formData.eh_garantia}
                  onCheckedChange={(checked) => setFormData({ ...formData, eh_garantia: checked })}
                />
                <Label htmlFor="garantia">É garantia</Label>
              </div>

              {valorTotal > 0 && (
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="text-sm font-medium text-green-800">Valor Total:</span>
                  <span className="text-lg font-bold text-green-800">
                    R$ {valorTotal.toFixed(2).replace('.', ',')}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Data Prometida */}
        <Card>
          <CardHeader>
            <CardTitle>Prazo de Entrega</CardTitle>
            <CardDescription>Defina a data de entrega prometida ao cliente</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="data_prometida_manual">Data Prometida ao Cliente</Label>
              <Input
                id="data_prometida_manual"
                type="date"
                value={formData.data_prometida_manual}
                onChange={(e) => setFormData({ ...formData, data_prometida_manual: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
              />
              <p className="text-xs text-gray-500">
                Se não informada, será calculada automaticamente baseada no SLA
                {slaCalculado && ` (${slaCalculado} dias úteis)`}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Números de Controle */}
        <Card>
          <CardHeader>
            <CardTitle>Números de Controle</CardTitle>
            <CardDescription>Números de referência opcionais</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="numero_os">Número OS Física</Label>
              <Input
                id="numero_os"
                value={formData.numero_os_fisica}
                onChange={(e) => setFormData({ ...formData, numero_os_fisica: e.target.value })}
                placeholder="OS-2024-000001"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="numero_lab">Número do Laboratório</Label>
              <Input
                id="numero_lab"
                value={formData.numero_pedido_laboratorio}
                onChange={(e) => setFormData({ ...formData, numero_pedido_laboratorio: e.target.value })}
                placeholder="LAB-202409-0001"
              />
            </div>
          </CardContent>
        </Card>

        {/* Tratamentos */}
        {tratamentos.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Tratamentos Adicionais</CardTitle>
              <CardDescription>Selecione os tratamentos desejados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {tratamentos.map(tratamento => (
                  <div
                    key={tratamento.id}
                    className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                      formData.tratamentos_ids.includes(tratamento.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => toggleTratamento(tratamento.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{tratamento.nome}</h4>
                        {tratamento.descricao && (
                          <p className="text-xs text-muted-foreground">{tratamento.descricao}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          +R$ {tratamento.custo_adicional.toFixed(2)}
                        </div>
                        {tratamento.tempo_adicional_dias > 0 && (
                          <div className="text-xs text-muted-foreground">
                            +{tratamento.tempo_adicional_dias}d
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Observações */}
        <Card>
          <CardHeader>
            <CardTitle>Observações</CardTitle>
            <CardDescription>Informações adicionais sobre o pedido</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações Gerais</Label>
              <Textarea
                id="observacoes"
                value={formData.observacoes}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                placeholder="Observações sobre o pedido..."
                rows={3}
              />
            </div>

            {formData.eh_garantia && (
              <div className="space-y-2">
                <Label htmlFor="observacoes_garantia">Observações da Garantia</Label>
                <Textarea
                  id="observacoes_garantia"
                  value={formData.observacoes_garantia}
                  onChange={(e) => setFormData({ ...formData, observacoes_garantia: e.target.value })}
                  placeholder="Detalhes sobre a garantia..."
                  rows={3}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Botões de Ação */}
        <div className="flex justify-end space-x-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => router.back()}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Criando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Criar Pedido
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Modal de Sucesso com Opção de Impressão */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <DialogTitle>Pedido Criado com Sucesso!</DialogTitle>
                <DialogDescription>
                  Pedido #{pedidoCriado?.numero_sequencial || 'N/A'} foi registrado
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-slate-50 rounded-lg p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Cliente:</span>
                <span className="font-medium">{pedidoCriado?.cliente_nome}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Loja:</span>
                <span className="font-medium">{pedidoCriado?.loja_nome}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Laboratório:</span>
                <span className="font-medium">{pedidoCriado?.laboratorio_nome}</span>
              </div>
              {pedidoCriado?.numero_os_fisica && (
                <div className="flex justify-between">
                  <span className="text-slate-600">OS Loja:</span>
                  <span className="font-medium">{pedidoCriado.numero_os_fisica}</span>
                </div>
              )}
            </div>

            <Alert>
              <Printer className="h-4 w-4" />
              <AlertTitle>Deseja imprimir agora?</AlertTitle>
              <AlertDescription>
                Você pode imprimir o pedido agora ou visualizá-lo no Kanban
              </AlertDescription>
            </Alert>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowSuccessModal(false)
                router.push(`/kanban?highlight=${pedidoCriado?.id}`)
              }}
              className="w-full sm:w-auto"
            >
              Ver no Kanban
            </Button>
            
            {pedidoCriado && (
              <PrintOrderButton 
                pedido={pedidoCriado}
                variant="default"
                size="default"
                className="w-full sm:w-auto"
                showLabel={true}
              />
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  )
}