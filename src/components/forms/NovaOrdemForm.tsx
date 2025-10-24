'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { 
  Plus, Clock, Calculator, AlertCircle, Shield, DollarSign, 
  Building2, MapPin, User, CheckCircle2, ArrowLeft, ArrowRight, Calendar, Printer, CheckCircle
} from 'lucide-react'
import { supabaseHelpers } from '@/lib/supabase/helpers'
import { Laboratorio, Loja, ClasseLente, Tratamento, PrioridadeLevel, PRIORIDADE_LABELS, PedidoCompleto } from '@/lib/types/database'
import { PrintOrderButton } from '@/components/pedidos/PrintOrderButton'
import { supabase } from '@/lib/supabase/client'

interface NovaOrdemFormProps {
  onSuccess?: () => void
}

export default function NovaOrdemForm({ onSuccess }: NovaOrdemFormProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [loadingData, setLoadingData] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [pedidoCriado, setPedidoCriado] = useState<PedidoCompleto | null>(null)
  
  // Dados para seleção
  const [lojas, setLojas] = useState<Loja[]>([])
  const [laboratorios, setLaboratorios] = useState<Laboratorio[]>([])
  const [classes, setClasses] = useState<ClasseLente[]>([])
  const [tratamentos, setTratamentos] = useState<Tratamento[]>([])
  
  // Form data otimizado
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
    data_prometida_manual: '' // Novo campo para data prometida personalizada
  })
  
  // SLA calculado com separação lab vs cliente
  const [slaInfo, setSlaInfo] = useState<{
    diasSlaLab: number
    diasPromessaCliente: number
    dataSlaLab: string
    dataPromessaCliente: string
    custoTratamentos: number
    margemSeguranca: number
  } | null>(null)

  const calculateSLA = useCallback(() => {
    const classe = classes.find(c => c.id === formData.classe_lente_id)
    const loja = lojas.find(l => l.id === formData.loja_id)
    if (!classe || !loja) return

    // 1. CALCULAR SLA REAL DO LABORATÓRIO
    let diasSlaLab = classe.sla_base_dias

    // Somar dias dos tratamentos
    let custoTratamentos = 0
    if (tratamentos.length > 0) {
      const tratamentosSelecionados = tratamentos.filter(t => formData.tratamentos_ids.includes(t.id))
      const diasTratamentos = tratamentosSelecionados.reduce((acc, t) => acc + (t.tempo_adicional_dias || 0), 0)
      custoTratamentos = tratamentosSelecionados.reduce((acc, t) => acc + (t.custo_adicional || 0), 0)
      diasSlaLab += diasTratamentos
    }

    // Ajustar por prioridade (apenas SLA interno)
    switch (formData.prioridade) {
      case 'BAIXA': diasSlaLab += 2; break
      case 'ALTA': diasSlaLab -= 1; break
      case 'URGENTE': diasSlaLab -= 3; break
    }

    diasSlaLab = Math.max(1, diasSlaLab)

    // 2. CALCULAR PROMESSA AO CLIENTE (SLA + Margem de Segurança)
    const margemSeguranca = loja.margem_seguranca_dias || 2
    const diasPromessaCliente = diasSlaLab + margemSeguranca

    // 3. CALCULAR DATAS
    const dataSlaLab = addBusinessDays(new Date(), diasSlaLab)
    const dataPromessaCliente = addBusinessDays(new Date(), diasPromessaCliente)
    
    setSlaInfo({
      diasSlaLab,
      diasPromessaCliente,
      dataSlaLab: dataSlaLab.toLocaleDateString('pt-BR'),
      dataPromessaCliente: dataPromessaCliente.toLocaleDateString('pt-BR'),
      custoTratamentos,
      margemSeguranca
    })
  }, [classes, lojas, formData.classe_lente_id, formData.loja_id, formData.prioridade, formData.tratamentos_ids, tratamentos])

  // Carregar dados uma única vez quando abre
  useEffect(() => {
    if (open && lojas.length === 0) {
      loadInitialData()
    }
  }, [open, lojas.length])

  // Recalcular SLA quando dados relevantes mudarem
  useEffect(() => {
    if (formData.classe_lente_id) {
      calculateSLA()
    }
  }, [formData.classe_lente_id, calculateSLA])

  const loadInitialData = async () => {
    try {
      setLoadingData(true)
      
      const [lojasData, labsData, classesData, tratamentosData] = await Promise.all([
        supabaseHelpers.getLojas(),
        supabaseHelpers.getLaboratorios(),
        supabaseHelpers.getClassesLente(),
        supabaseHelpers.getTratamentos().catch(() => []) // Não quebra se falhar
      ])
      
      setLojas(lojasData)
      setLaboratorios(labsData)
      setClasses(classesData)
      setTratamentos(tratamentosData)
    } catch {
      // Erro ao carregar dados
    } finally {
      setLoadingData(false)
    }
  }

  const addBusinessDays = (date: Date, days: number): Date => {
    const result = new Date(date)
    let addedDays = 0
    
    while (addedDays < days) {
      result.setDate(result.getDate() + 1)
      if (result.getDay() !== 0 && result.getDay() !== 6) {
        addedDays++
      }
    }
    
    return result
  }

  const handleTratamentoChange = (tratamentoId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      tratamentos_ids: checked 
        ? [...prev.tratamentos_ids, tratamentoId]
        : prev.tratamentos_ids.filter(id => id !== tratamentoId)
    }))
  }

  const resetForm = () => {
    setFormData({
      loja_id: '',
      laboratorio_id: '',
      classe_lente_id: '',
      prioridade: 'NORMAL',
      cliente_nome: '',
      cliente_telefone: '',
      numero_os_fisica: '',
      numero_pedido_laboratorio: '',
      valor_pedido: '',
      custo_lentes: '',
      eh_garantia: false,
      tratamentos_ids: [],
      observacoes: '',
      observacoes_garantia: '',
      data_prometida_manual: '' // Limpar data prometida manual
    })
    setStep(1)
    setSlaInfo(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.loja_id || !formData.laboratorio_id || !formData.classe_lente_id || !formData.cliente_nome) {
      alert('Preencha todos os campos obrigatórios')
      return
    }

    try {
      setLoading(true)
      
      const pedidoData = {
        loja_id: formData.loja_id,
        laboratorio_id: formData.laboratorio_id,
        classe_lente_id: formData.classe_lente_id,
        prioridade: formData.prioridade,
        cliente_nome: formData.cliente_nome,
        cliente_telefone: formData.cliente_telefone || undefined,
        numero_os_fisica: formData.numero_os_fisica || undefined,
        numero_pedido_laboratorio: formData.numero_pedido_laboratorio || undefined,
        valor_pedido: formData.valor_pedido ? parseFloat(formData.valor_pedido) : undefined,
        custo_lentes: formData.custo_lentes ? parseFloat(formData.custo_lentes) : undefined,
        eh_garantia: formData.eh_garantia,
        tratamentos_ids: formData.tratamentos_ids,
        observacoes: formData.observacoes || undefined,
        observacoes_garantia: formData.eh_garantia ? formData.observacoes_garantia : undefined,
        data_prometida_manual: formData.data_prometida_manual || undefined // Nova data prometida
      }
      
      // DEBUG: Log dos dados que estão sendo enviados
      console.log('📋 Dados sendo enviados para API:', {
        numero_os_fisica: pedidoData.numero_os_fisica,
        numero_pedido_laboratorio: pedidoData.numero_pedido_laboratorio,
        cliente_nome: pedidoData.cliente_nome,
        eh_garantia: pedidoData.eh_garantia
      })
      
      const resultado = await supabaseHelpers.criarPedidoCompleto(pedidoData)

      // Buscar dados completos do pedido para impressão
      if (resultado?.id) {
        const { data: pedidoBase, error: pedidoError } = await supabase
          .from('pedidos')
          .select('*')
          .eq('id', resultado.id)
          .single()

        if (!pedidoError && pedidoBase) {
          // Buscar dados relacionados
          const [lojaData, labData, classeData] = await Promise.allSettled([
            supabase.from('lojas').select('nome').eq('id', pedidoBase.loja_id).single(),
            supabase.from('laboratorios').select('nome').eq('id', pedidoBase.laboratorio_id).single(),
            supabase.from('classes_lente').select('nome').eq('id', pedidoBase.classe_lente_id).single()
          ])

          // Montar objeto completo
          const pedidoCompleto: PedidoCompleto = {
            ...pedidoBase,
            loja_nome: lojaData.status === 'fulfilled' ? lojaData.value.data?.nome || 'N/A' : 'N/A',
            laboratorio_nome: labData.status === 'fulfilled' ? labData.value.data?.nome || 'N/A' : 'N/A',
            classe_nome: classeData.status === 'fulfilled' ? classeData.value.data?.nome || 'N/A' : 'N/A',
          }

          setPedidoCriado(pedidoCompleto)
        }
      }

      resetForm()
      setOpen(false)
      setShowSuccessModal(true)
      onSuccess?.()
    } catch (error) {
      // Erro ao criar pedido
      console.error('❌ Erro ao criar pedido:', error)
      alert('Erro ao criar pedido. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const canProceedStep1 = formData.loja_id && formData.laboratorio_id
  const canProceedStep2 = formData.classe_lente_id
  const canSubmit = Boolean(
    formData.cliente_nome && 
    formData.numero_pedido_laboratorio
  )

  const selectedLoja = lojas.find(l => l.id === formData.loja_id)
  const selectedLab = laboratorios.find(l => l.id === formData.laboratorio_id)

  const renderStepIndicator = () => (
    <div className="flex items-center justify-between mb-4 sm:mb-6 px-1 sm:px-2">
      {[
        { num: 1, label: 'Local', icon: MapPin },
        { num: 2, label: 'Especificações', icon: Calculator },
        { num: 3, label: 'Cliente', icon: User }
      ].map(({ num, label, icon: Icon }, index) => (
        <React.Fragment key={num}>
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-medium transition-all ${
              num === step
                ? 'bg-blue-600 text-white shadow-lg scale-110'
                : num < step
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-600'
            }`}>
              {num < step ? <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" /> : <Icon className="w-3 h-3 sm:w-4 sm:h-4" />}
            </div>
            <span className="text-xs mt-1 font-medium text-center px-1">{label}</span>
          </div>
          {index < 2 && (
            <div className={`flex-1 h-0.5 mx-1 sm:mx-2 transition-all ${
              num < step ? 'bg-green-600' : 'bg-gray-200'
            }`} />
          )}
        </React.Fragment>
      ))}
    </div>
  )

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center bg-gradient-to-r from-white/80 to-gray-50/80 backdrop-blur-sm rounded-lg p-4 border border-white/30">
        <h3 className="text-lg font-semibold bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">Local e Identificação</h3>
        <p className="text-sm text-gray-600 mt-1">Escolha onde será feito o pedido</p>
      </div>

      <div className="space-y-4">
        {/* Loja */}
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-600" />
            Loja *
          </Label>
          <Select value={formData.loja_id} onValueChange={(value) => setFormData(prev => ({ ...prev, loja_id: value }))}>
            <SelectTrigger className="h-12 bg-white/70 backdrop-blur-sm border-gray-300 hover:bg-white/90 transition-all duration-200">
              <SelectValue placeholder="Selecione a loja" />
            </SelectTrigger>
            <SelectContent className="bg-white/95 backdrop-blur-lg border-white/20">
              {lojas.map(loja => (
                <SelectItem key={loja.id} value={loja.id} className="hover:bg-blue-50/80">
                  <div className="flex items-center justify-between w-full">
                    <span className="font-medium">{loja.nome}</span>
                    <Badge variant="outline" className="ml-2 bg-white/80">{loja.codigo}</Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Laboratório */}
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Calculator className="w-4 h-4 text-green-600" />
            Laboratório *
          </Label>
          <Select value={formData.laboratorio_id} onValueChange={(value) => setFormData(prev => ({ ...prev, laboratorio_id: value }))}>
            <SelectTrigger className="h-12 bg-white/70 backdrop-blur-sm border-gray-300 hover:bg-white/90 transition-all duration-200">
              <SelectValue placeholder="Selecione o laboratório" />
            </SelectTrigger>
            <SelectContent className="bg-white/95 backdrop-blur-lg border-white/20">
              {laboratorios.map(lab => (
                <SelectItem key={lab.id} value={lab.id} className="hover:bg-green-50/80">
                  <div className="flex items-center justify-between w-full">
                    <span className="font-medium">{lab.nome}</span>
                    <Badge className="ml-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                      {lab.sla_padrao_dias}d SLA
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* OS Física */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Número da OS Física</Label>
          <Input
            value={formData.numero_os_fisica}
            onChange={(e) => setFormData(prev => ({ ...prev, numero_os_fisica: e.target.value }))}
            placeholder="Ex: OS-2024-001234"
            className="h-12 bg-white/70 backdrop-blur-sm border-gray-300 hover:bg-white/90 focus:bg-white transition-all duration-200"
          />
          <p className="text-xs text-gray-500">Número para controle físico (opcional)</p>
        </div>
      </div>

      {/* Resumo Seleção */}
      {selectedLoja && selectedLab && (
        <Card className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 backdrop-blur-sm border-blue-200/50 shadow-lg">
          <CardHeader className="pb-3">
            <div className="text-sm font-medium text-blue-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Resumo da Seleção
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2 text-sm">
              <div><strong>Loja:</strong> {selectedLoja.nome} ({selectedLoja.codigo})</div>
              <div><strong>Laboratório:</strong> {selectedLab.nome}</div>
              <div><strong>SLA Base:</strong> {selectedLab.sla_padrao_dias} dias úteis</div>
            </div>
          </CardContent>
        </Card>
      )}

      <Button 
        onClick={() => setStep(2)} 
        disabled={!canProceedStep1}
        className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
      >
        <ArrowRight className="w-4 h-4 mr-2" />
        Próximo: Especificações
      </Button>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center bg-gradient-to-r from-white/80 to-gray-50/80 backdrop-blur-sm rounded-lg p-4 border border-white/30">
        <h3 className="text-lg font-semibold bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">Especificações Técnicas</h3>
        <p className="text-sm text-gray-600 mt-1">Defina o tipo de lente e tratamentos</p>
      </div>

      <div className="space-y-4">
        {/* Classe da Lente */}
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Shield className="w-4 h-4 text-purple-600" />
            Classe da Lente *
          </Label>
          <Select value={formData.classe_lente_id} onValueChange={(value) => setFormData(prev => ({ ...prev, classe_lente_id: value }))}>
            <SelectTrigger className="h-12 bg-white/70 backdrop-blur-sm border-gray-300 hover:bg-white/90 transition-all duration-200">
              <SelectValue placeholder="Selecione a classe da lente" />
            </SelectTrigger>
            <SelectContent className="bg-white/95 backdrop-blur-lg border-white/20">
              {classes.map(classe => (
                <SelectItem key={classe.id} value={classe.id} className="hover:bg-purple-50/80">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-3 h-3 rounded shadow-sm"
                      style={{ backgroundColor: classe.cor_badge }}
                    />
                    <span className="font-medium">{classe.nome}</span>
                    <Badge className="text-xs bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                      {classe.sla_base_dias}d
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Prioridade */}
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Clock className="w-4 h-4 text-orange-600" />
            Prioridade
          </Label>
          <Select value={formData.prioridade} onValueChange={(value) => setFormData(prev => ({ ...prev, prioridade: value as PrioridadeLevel }))}>
            <SelectTrigger className="h-12 bg-white/70 backdrop-blur-sm border-gray-300 hover:bg-white/90 transition-all duration-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white/95 backdrop-blur-lg border-white/20">
              {Object.entries(PRIORIDADE_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key} className="hover:bg-orange-50/80">
                  <div className="flex items-center gap-2">
                    <span>{label}</span>
                    {key === 'URGENTE' && <AlertCircle className="w-4 h-4 text-red-500" />}
                    {key === 'ALTA' && <Clock className="w-4 h-4 text-orange-500" />}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Número do Lab */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Número do Pedido no Laboratório *</Label>
          <Input
            value={formData.numero_pedido_laboratorio}
            onChange={(e) => setFormData(prev => ({ ...prev, numero_pedido_laboratorio: e.target.value }))}
            placeholder="Ex: LAB-2024-001234"
            className="h-12"
          />
          <p className="text-xs text-gray-500">Informe o número fornecido pelo laboratório (obrigatório)</p>
        </div>

        {/* Tratamentos */}
        {tratamentos.length > 0 && (
          <div className="space-y-3">
            <Label className="text-sm font-medium">Tratamentos Adicionais</Label>
            <Card className="p-4">
              <ScrollArea className="h-32">
                <div className="space-y-3">
                  {tratamentos.map(tratamento => (
                    <div key={tratamento.id} className="flex items-center space-x-3 p-2 rounded hover:bg-gray-50">
                      <Checkbox
                        id={tratamento.id}
                        checked={formData.tratamentos_ids.includes(tratamento.id)}
                        onCheckedChange={(checked: boolean) => handleTratamentoChange(tratamento.id, checked)}
                      />
                      <div className="flex items-center gap-2 flex-1">
                        <div 
                          className="w-3 h-3 rounded"
                          style={{ backgroundColor: tratamento.cor_badge }}
                        />
                        <label htmlFor={tratamento.id} className="text-sm font-medium cursor-pointer flex-1">
                          {tratamento.nome}
                        </label>
                        <div className="text-xs text-gray-500 text-right">
                          {tratamento.tempo_adicional_dias > 0 && (
                            <div>+{tratamento.tempo_adicional_dias}d</div>
                          )}
                          {tratamento.custo_adicional > 0 && (
                            <div>+R${tratamento.custo_adicional.toFixed(2)}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </Card>
          </div>
        )}

        {/* SLA Preview */}
        {slaInfo && (
          <Card className="bg-gradient-to-r from-blue-50 via-green-50 to-blue-50 border border-blue-200 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-gray-700 mb-3">
                <CheckCircle2 className="w-4 h-4" />
                <span className="font-medium">Prazos Calculados</span>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                {/* SLA Lab - Controle Interno */}
                <div className="bg-blue-100/60 rounded-lg p-3 border border-blue-200">
                  <div className="text-xs font-medium text-blue-600 mb-1">🔧 SLA Lab (Interno)</div>
                  <div className="font-bold text-blue-700">{slaInfo.diasSlaLab} dias úteis</div>
                  <div className="text-xs text-blue-600">{slaInfo.dataSlaLab}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    ⏰ Contagem inicia no pagamento do pedido
                  </div>
                </div>

                {/* Data Prometida ao Cliente - NOVA SEÇÃO */}
                <div className="bg-green-100/60 rounded-lg p-3 border border-green-200">
                  <div className="text-xs font-medium text-green-600 mb-2">🤝 Data Prometida ao Cliente</div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        id="data_automatica_step2"
                        name="data_prometida_opcao_step2"
                        checked={!formData.data_prometida_manual}
                        onChange={() => setFormData(prev => ({ ...prev, data_prometida_manual: '' }))}
                        className="w-3 h-3 text-green-600"
                      />
                      <label htmlFor="data_automatica_step2" className="text-xs text-gray-700 cursor-pointer">
                        <span className="font-medium">Automática:</span> {slaInfo.dataPromessaCliente}
                        <span className="text-gray-500 ml-1">({slaInfo.diasPromessaCliente} dias)</span>
                      </label>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        id="data_manual_step2"
                        name="data_prometida_opcao_step2"
                        checked={!!formData.data_prometida_manual}
                        onChange={() => {
                          const hoje = new Date()
                          const amanha = new Date(hoje.getTime() + 24 * 60 * 60 * 1000)
                          const dataFormatada = amanha.toISOString().split('T')[0]
                          setFormData(prev => ({ ...prev, data_prometida_manual: dataFormatada }))
                        }}
                        className="w-3 h-3 text-green-600"
                      />
                      <label htmlFor="data_manual_step2" className="text-xs font-medium text-gray-700 cursor-pointer">
                        Personalizada:
                      </label>
                    </div>
                    
                    {formData.data_prometida_manual && (
                      <div className="ml-6 mt-2">
                        <Input
                          type="date"
                          value={formData.data_prometida_manual}
                          onChange={(e) => setFormData(prev => ({ ...prev, data_prometida_manual: e.target.value }))}
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full text-xs h-8"
                        />
                        <div className="text-xs text-green-600 mt-1">
                          📅 Esta data será prometida ao cliente
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Informações Adicionais */}
              <div className="mt-3 pt-2 border-t border-gray-200/50 flex justify-between items-center text-xs text-gray-600">
                <span>Margem segurança: +{slaInfo.margemSeguranca} dias</span>
                {slaInfo.custoTratamentos > 0 && (
                  <span className="font-medium">Tratamentos: +R$ {slaInfo.custoTratamentos.toFixed(2)}</span>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => setStep(1)} className="flex-1 h-12">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <Button 
          onClick={() => setStep(3)} 
          disabled={!canProceedStep2}
          className="flex-1 h-12 bg-blue-600 hover:bg-blue-700"
        >
          <ArrowRight className="w-4 h-4 mr-2" />
          Próximo: Cliente
        </Button>
      </div>
    </div>
  )

  const renderStep3 = () => {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900">Cliente e Financeiro</h3>
          <p className="text-sm text-gray-600 mt-1">Dados do cliente e valores do pedido</p>
        </div>

        <div className="space-y-4">
          {/* Cliente */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600" />
              Nome do Cliente *
            </Label>
            <Input
              value={formData.cliente_nome}
              onChange={(e) => setFormData(prev => ({ ...prev, cliente_nome: e.target.value }))}
              placeholder="Nome completo do cliente"
              className="h-12"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Telefone</Label>
            <Input
              value={formData.cliente_telefone}
              onChange={(e) => setFormData(prev => ({ ...prev, cliente_telefone: e.target.value }))}
              placeholder="(11) 99999-9999"
              className="h-12"
            />
          </div>

          {/* Número do Pedido no Laboratório */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Número do Pedido no Laboratório *</Label>
            <Input
              value={formData.numero_pedido_laboratorio}
              onChange={(e) => setFormData(prev => ({ ...prev, numero_pedido_laboratorio: e.target.value }))}
              placeholder="Ex: LAB-2024-001234"
              className="h-12"
            />
            <p className="text-xs text-gray-500">Número fornecido pelo laboratório</p>
          </div>

          {/* Switch Garantia */}
          <Card className={`p-4 border-2 transition-all ${formData.eh_garantia ? 'border-orange-300 bg-orange-50' : 'border-gray-200'}`}>
            <div className="flex items-center space-x-3">
              <Switch
                checked={formData.eh_garantia}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, eh_garantia: checked }))}
              />
              <div className="flex items-center gap-2 flex-1">
                <Shield className="w-4 h-4 text-orange-600" />
                <Label className="text-orange-800 font-medium cursor-pointer">
                  Pedido de Garantia
                </Label>
              </div>
            </div>
          </Card>

          {/* SLA Preview - mantém na tela */}
          {slaInfo && (
            <Card className="bg-gradient-to-r from-blue-50 to-green-50 border border-gray-300 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-4 h-4 text-gray-600" />
                  <span className="font-medium text-gray-800">Resumo dos Prazos</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-blue-100/50 p-2 rounded border-l-2 border-blue-400">
                    <span className="text-blue-600 font-medium">SLA Lab:</span>
                    <div className="font-bold text-blue-700">{slaInfo.diasSlaLab} dias</div>
                    <div className="text-xs text-blue-600">{slaInfo.dataSlaLab}</div>
                  </div>
                  <div className="bg-green-100/50 p-2 rounded border-l-2 border-green-400">
                    <span className="text-green-600 font-medium">Cliente:</span>
                    <div className="font-bold text-green-700">
                      {slaInfo ? slaInfo.dataPromessaCliente : 'Será calculada automaticamente'}
                    </div>
                    <div className="text-xs text-green-600">
                      Data calculada automaticamente baseada no SLA
                    </div>
                  </div>
                </div>
                {slaInfo.custoTratamentos > 0 && (
                  <div className="mt-2 pt-2 border-t border-green-200">
                    <span className="text-xs text-green-600">
                      Custo tratamentos: R$ {slaInfo.custoTratamentos.toFixed(2)}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* SLA Preview - Resumo Final */}
          {slaInfo && (
            <Card className="bg-gradient-to-r from-blue-50 to-green-50 border border-gray-300 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-4 h-4 text-gray-600" />
                  <span className="font-medium text-gray-800">Resumo Final dos Prazos</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-blue-100/50 p-2 rounded border-l-2 border-blue-400">
                    <span className="text-blue-600 font-medium">SLA Lab:</span>
                    <div className="font-bold text-blue-700">{slaInfo.diasSlaLab} dias</div>
                    <div className="text-xs text-blue-600">{slaInfo.dataSlaLab}</div>
                    <div className="text-xs text-gray-500">Inicia no pagamento</div>
                  </div>
                  <div className="bg-green-100/50 p-2 rounded border-l-2 border-green-400">
                    <span className="text-green-600 font-medium">Cliente:</span>
                    <div className="font-bold text-green-700">
                      {formData.data_prometida_manual || slaInfo.dataPromessaCliente}
                    </div>
                    <div className="text-xs text-green-600">
                      {formData.data_prometida_manual ? '📅 Data personalizada' : '🤖 Data automática'}
                    </div>
                  </div>
                </div>
                {slaInfo.custoTratamentos > 0 && (
                  <div className="mt-2 pt-2 border-t border-green-200">
                    <span className="text-xs text-green-600">
                      Custo tratamentos: R$ {slaInfo.custoTratamentos.toFixed(2)}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Observações Garantia */}
          {formData.eh_garantia && (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-orange-700">Detalhes da Garantia</Label>
              <Textarea
                value={formData.observacoes_garantia}
                onChange={(e) => setFormData(prev => ({ ...prev, observacoes_garantia: e.target.value }))}
                placeholder="Descrição do problema ou defeito..."
                rows={3}
                className="resize-none"
              />
            </div>
          )}

          {/* Valores */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-1">
                <DollarSign className="w-3 h-3 text-green-600" />
                Valor Venda
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-4 text-gray-500 text-sm">R$</span>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.valor_pedido}
                  onChange={(e) => setFormData(prev => ({ ...prev, valor_pedido: e.target.value }))}
                  placeholder="0,00"
                  className="pl-10 h-12"
                  disabled={formData.eh_garantia}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-1">
                <Calculator className="w-3 h-3 text-blue-600" />
                Custo Real
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-4 text-gray-500 text-sm">R$</span>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.custo_lentes}
                  onChange={(e) => setFormData(prev => ({ ...prev, custo_lentes: e.target.value }))}
                  placeholder="0,00"
                  className="pl-10 h-12"
                />
              </div>
            </div>
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Observações Gerais</Label>
            <Textarea
              value={formData.observacoes}
              onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
              placeholder="Informações adicionais sobre o pedido..."
              rows={3}
              className="resize-none"
            />
          </div>
        </div>

        {/* Botões de ação */}
        <div className="flex gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => setStep(2)} className="flex-1 h-12">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!canSubmit || loading}
            className="flex-1 h-12 bg-green-600 hover:bg-green-700"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Criando...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Criar Pedido
              </>
            )}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <Plus className="w-4 h-4 mr-2" />
            Nova Ordem
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 mx-4 w-[calc(100vw-2rem)] sm:w-full bg-gradient-to-br from-white/95 to-gray-50/95 backdrop-blur-xl border-white/20 shadow-2xl">
          <DialogHeader className="sticky top-0 bg-gradient-to-r from-white/90 to-gray-50/90 backdrop-blur-lg z-10 p-4 sm:p-6 pb-3 sm:pb-4 border-b border-white/30">
            <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              Nova Ordem Completa
            </DialogTitle>
            <DialogDescription className="text-gray-600 text-sm">
              Crie um novo pedido em 3 etapas simples
            </DialogDescription>
          </DialogHeader>

          <div className="sticky top-[100px] sm:top-[120px] bg-white z-10 px-4 sm:px-6 py-2 sm:py-3 border-b">
            {renderStepIndicator()}
          </div> 

          <div className="px-4 sm:px-6 pb-4 sm:pb-6">
            {loadingData ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Carregando dados...</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
                {step === 3 && renderStep3()} 
              </form>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Sucesso */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mx-auto mb-4">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <DialogTitle className="text-center text-xl font-bold">
            Pedido Criado com Sucesso!
          </DialogTitle>
          <DialogDescription className="text-center">
            {pedidoCriado && `Pedido #${pedidoCriado.numero_sequencial} foi criado`}
          </DialogDescription>
        </DialogHeader>

        {pedidoCriado && (
          <div className="space-y-4">
            <div className="bg-slate-50 rounded-lg p-4 space-y-2">
              <div>
                <p className="text-sm text-slate-500">Cliente</p>
                <p className="font-medium">{pedidoCriado.cliente_nome}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Loja</p>
                <p className="font-medium">{pedidoCriado.loja_nome}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Laboratório</p>
                <p className="font-medium">{pedidoCriado.laboratorio_nome}</p>
              </div>
              {pedidoCriado.numero_os_fisica && (
                <div>
                  <p className="text-sm text-slate-500">OS Loja</p>
                  <p className="font-medium">{pedidoCriado.numero_os_fisica}</p>
                </div>
              )}
            </div>

            <Alert className="border-blue-200 bg-blue-50">
              <Printer className="h-4 w-4 text-blue-600" />
              <AlertTitle className="text-blue-900">Deseja imprimir agora?</AlertTitle>
              <AlertDescription className="text-blue-700">
                Você pode imprimir os detalhes deste pedido antes de continuar.
              </AlertDescription>
            </Alert>
          </div>
        )}

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowSuccessModal(false)}
            className="w-full sm:w-auto"
          >
            Fechar
          </Button>
          {pedidoCriado && (
            <PrintOrderButton
              pedido={pedidoCriado}
              variant="default"
              size="default"
              className="w-full sm:w-auto"
            />
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  )
}