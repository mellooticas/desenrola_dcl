'use client'

/**
 * 🎯 WIZARD DE CRIAÇÃO DE PEDIDOS - FLUXO DECISÓRIO
 * 
 * Fluxo em 4 etapas otimizado para decisão rápida:
 * 1. Seleção de Lente Canônica (do catálogo)
 * 2. Escolha de Laboratório (com comparação de preços/prazos)
 * 3. Dados do Cliente e Detalhes
 * 4. Confirmação e Finalização
 * 
 * Status: Pedidos criados já vão direto para "REGISTRADO"
 */

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  ArrowRight, ArrowLeft, CheckCircle, Clock, DollarSign, 
  TrendingUp, Award, AlertCircle, Truck, Package, User, Phone
} from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { lentesClient } from '@/lib/supabase/lentes-client'
import { toast } from 'sonner'
import type { Laboratorio, Loja, PrioridadeLevel } from '@/lib/types/database'

interface LaboratorioComPreco extends Laboratorio {
  custo_estimado: number
  prazo_dias: number
  disponivel: boolean
  motivo_indisponivel?: string
}

interface CriarPedidoWizardProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (pedidoId: string) => void
  lojaPreSelecionada?: string
}

export function CriarPedidoWizard({ 
  open, 
  onOpenChange, 
  onSuccess,
  lojaPreSelecionada 
}: CriarPedidoWizardProps) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [loadingLentes, setLoadingLentes] = useState(false)
  
  // Dados de referência
  const [lojas, setLojas] = useState<Loja[]>([])
  const [laboratorios, setLaboratorios] = useState<LaboratorioComPreco[]>([])
  const [lentesEncontradas, setLentesEncontradas] = useState<any[]>([])
  
  // Dados do formulário
  const [formData, setFormData] = useState({
    // Etapa 1: Lente
    loja_id: lojaPreSelecionada || '',
    grupo_canonico_id: null as string | null,
    lente_id: null as string | null,
    lente_nome: '',
    lente_tipo: '',
    classe_lente_id: '',
    
    // Etapa 2: Laboratório
    laboratorio_id: '',
    laboratorio_nome: '',
    custo_lentes: 0,
    prazo_estimado_dias: 0,
    
    // Etapa 3: Cliente e Detalhes
    cliente_nome: '',
    cliente_telefone: '',
    numero_os_fisica: '',
    prioridade: 'NORMAL' as PrioridadeLevel,
    valor_pedido: 0,
    eh_garantia: false,
    observacoes: ''
  })
  
  // Carregar lojas
  useEffect(() => {
    if (open) {
      carregarLojas()
    }
  }, [open])
  
  const carregarLojas = async () => {
    const { data } = await supabase
      .from('lojas')
      .select('*')
      .eq('ativo', true)
      .order('nome')
    
    if (data) {
      setLojas(data)
      if (lojaPreSelecionada) {
        setFormData(prev => ({ ...prev, loja_id: lojaPreSelecionada }))
      }
    }
  }
  
  // Buscar lentes
  const handleBuscarLentes = async (termo: string) => {
    if (termo.length < 3) return
    
    setLoadingLentes(true)
    try {
      // Buscar na view de grupos canônicos
      const { data, error } = await lentesClient
        .from('v_grupos_canonicos')
        .select('*')
        .ilike('nome_comercial', `%${termo}%`)
        .limit(10)
      
      if (error) throw error
      
      setLentesEncontradas(data || [])
    } catch (error) {
      console.error('Erro ao buscar lentes:', error)
      toast.error('Erro ao buscar lentes')
    } finally {
      setLoadingLentes(false)
    }
  }
  
  // Selecionar lente e buscar laboratórios
  const handleSelecionarLente = async (lente: any) => {
    setFormData(prev => ({
      ...prev,
      grupo_canonico_id: lente.grupo_canonico_id,
      lente_id: lente.id,
      lente_nome: lente.nome_comercial,
      lente_tipo: lente.tipo,
      classe_lente_id: lente.classe_lente_id || ''
    }))
    
    // Buscar laboratórios com preços para esta lente
    await buscarLaboratoriosComPrecos(lente.id)
    setStep(2)
  }
  
  // Buscar laboratórios com preços e prazos
  const buscarLaboratoriosComPrecos = async (lenteId: string) => {
    setLoading(true)
    
    try {
      // Buscar todos laboratórios ativos
      const { data: labs } = await supabase
        .from('laboratorios')
        .select('*')
        .eq('ativo', true)
        .order('nome')
      
      if (!labs) {
        setLaboratorios([])
        return
      }
      
      // Para cada laboratório, buscar preço da lente (simulação por enquanto)
      const labsComPreco: LaboratorioComPreco[] = labs.map(lab => {
        // TODO: Integrar com tabela de preços real quando disponível
        const custoBase = Math.random() * 200 + 100 // R$ 100-300
        const prazo = lab.sla_padrao_dias || 5
        
        return {
          ...lab,
          custo_estimado: parseFloat(custoBase.toFixed(2)),
          prazo_dias: prazo,
          disponivel: true
        }
      })
      
      // Ordenar por melhor custo-benefício (custo vs prazo)
      labsComPreco.sort((a, b) => {
        const scoreA = a.custo_estimado * 0.7 + a.prazo_dias * 10 * 0.3
        const scoreB = b.custo_estimado * 0.7 + b.prazo_dias * 10 * 0.3
        return scoreA - scoreB
      })
      
      setLaboratorios(labsComPreco)
    } catch (error) {
      console.error('Erro ao buscar laboratórios:', error)
      toast.error('Erro ao buscar laboratórios disponíveis')
    } finally {
      setLoading(false)
    }
  }
  
  // Selecionar laboratório
  const handleSelecionarLaboratorio = (lab: LaboratorioComPreco) => {
    setFormData(prev => ({
      ...prev,
      laboratorio_id: lab.id,
      laboratorio_nome: lab.nome,
      custo_lentes: lab.custo_estimado,
      prazo_estimado_dias: lab.prazo_dias
    }))
    setStep(3)
  }
  
  // Finalizar e criar pedido
  const handleFinalizarPedido = async () => {
    // Validações
    if (!formData.cliente_nome) {
      toast.error('Nome do cliente é obrigatório')
      return
    }
    
    setLoading(true)
    
    try {
      const pedidoData = {
        loja_id: formData.loja_id,
        laboratorio_id: formData.laboratorio_id,
        classe_lente_id: formData.classe_lente_id,
        grupo_canonico_id: formData.grupo_canonico_id,
        lente_id: formData.lente_id,
        lente_nome_snapshot: formData.lente_nome,
        cliente_nome: formData.cliente_nome,
        cliente_telefone: formData.cliente_telefone || null,
        numero_os_fisica: formData.numero_os_fisica || null,
        prioridade: formData.prioridade,
        valor_pedido: formData.valor_pedido || null,
        custo_lentes: formData.custo_lentes,
        eh_garantia: formData.eh_garantia,
        observacoes: formData.observacoes || null
      }
      
      const response = await fetch('/api/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pedidoData)
      })
      
      if (!response.ok) {
        throw new Error('Erro ao criar pedido')
      }
      
      const pedidoCriado = await response.json()
      
      toast.success(`Pedido #${pedidoCriado.numero_sequencial} criado com sucesso!`, {
        description: `Status: REGISTRADO • Laboratório: ${formData.laboratorio_nome}`
      })
      
      onSuccess?.(pedidoCriado.id)
      handleFechar()
      
    } catch (error) {
      console.error('Erro ao criar pedido:', error)
      toast.error('Erro ao criar pedido')
    } finally {
      setLoading(false)
    }
  }
  
  const handleFechar = () => {
    setStep(1)
    setFormData({
      loja_id: lojaPreSelecionada || '',
      grupo_canonico_id: null,
      lente_id: null,
      lente_nome: '',
      lente_tipo: '',
      classe_lente_id: '',
      laboratorio_id: '',
      laboratorio_nome: '',
      custo_lentes: 0,
      prazo_estimado_dias: 0,
      cliente_nome: '',
      cliente_telefone: '',
      numero_os_fisica: '',
      prioridade: 'NORMAL',
      valor_pedido: 0,
      eh_garantia: false,
      observacoes: ''
    })
    setLentesEncontradas([])
    setLaboratorios([])
    onOpenChange(false)
  }
  
  return (
    <Dialog open={open} onOpenChange={handleFechar}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Novo Pedido - Etapa {step} de 3
          </DialogTitle>
          <div className="flex gap-2 mt-2">
            <div className={`h-1 flex-1 rounded ${step >= 1 ? 'bg-blue-600' : 'bg-gray-200'}`} />
            <div className={`h-1 flex-1 rounded ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`} />
            <div className={`h-1 flex-1 rounded ${step >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`} />
          </div>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* ETAPA 1: Seleção de Lente */}
          {step === 1 && (
            <div className="space-y-4">
              <Alert>
                <AlertCircle className="w-4 h-4" />
                <AlertDescription>
                  Primeiro, selecione a lente desejada do catálogo
                </AlertDescription>
              </Alert>
              
              <div className="space-y-2">
                <Label>Loja</Label>
                <Select value={formData.loja_id} onValueChange={(v) => setFormData(prev => ({ ...prev, loja_id: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a loja" />
                  </SelectTrigger>
                  <SelectContent>
                    {lojas.map(loja => (
                      <SelectItem key={loja.id} value={loja.id}>
                        {loja.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Buscar Lente</Label>
                <Input 
                  placeholder="Digite o nome da lente (ex: Varilux, Eyezen...)"
                  onChange={(e) => handleBuscarLentes(e.target.value)}
                  disabled={!formData.loja_id}
                />
              </div>
              
              {lentesEncontradas.length > 0 && (
                <div className="grid gap-3 max-h-96 overflow-y-auto">
                  {lentesEncontradas.map((lente) => (
                    <Card 
                      key={lente.id}
                      className="cursor-pointer hover:border-blue-500 transition-colors"
                      onClick={() => handleSelecionarLente(lente)}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold">{lente.nome_comercial}</h4>
                            <p className="text-sm text-muted-foreground">{lente.fabricante || 'Fabricante N/D'}</p>
                            <div className="flex gap-2 mt-2">
                              <Badge variant="outline">{lente.tipo}</Badge>
                              {lente.material && <Badge variant="secondary">{lente.material}</Badge>}
                            </div>
                          </div>
                          <ArrowRight className="w-5 h-5 text-blue-600" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* ETAPA 2: Escolha de Laboratório */}
          {step === 2 && (
            <div className="space-y-4">
              <Alert className="bg-blue-50 border-blue-200">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <AlertDescription>
                  <strong>Lente selecionada:</strong> {formData.lente_nome}
                  <br />
                  Agora escolha o laboratório com melhor custo-benefício
                </AlertDescription>
              </Alert>
              
              <div className="grid gap-3">
                {laboratorios.map((lab, index) => (
                  <Card 
                    key={lab.id}
                    className={`cursor-pointer hover:border-blue-500 transition-all ${index === 0 ? 'border-green-500 border-2' : ''}`}
                    onClick={() => handleSelecionarLaboratorio(lab)}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{lab.nome}</h4>
                            {index === 0 && <Badge className="bg-green-600">Melhor Escolha</Badge>}
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 mt-3">
                            <div className="flex items-center gap-2">
                              <DollarSign className="w-4 h-4 text-green-600" />
                              <div>
                                <p className="text-xs text-muted-foreground">Custo</p>
                                <p className="font-semibold">R$ {lab.custo_estimado.toFixed(2)}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-blue-600" />
                              <div>
                                <p className="text-xs text-muted-foreground">Prazo</p>
                                <p className="font-semibold">{lab.prazo_dias} dias</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <ArrowRight className="w-5 h-5 text-blue-600" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <Button variant="outline" onClick={() => setStep(1)} className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar para seleção de lente
              </Button>
            </div>
          )}
          
          {/* ETAPA 3: Dados do Cliente */}
          {step === 3 && (
            <div className="space-y-4">
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <AlertDescription>
                  <strong>Lente:</strong> {formData.lente_nome} <br />
                  <strong>Lab:</strong> {formData.laboratorio_nome} • R$ {formData.custo_lentes.toFixed(2)} • {formData.prazo_estimado_dias} dias
                </AlertDescription>
              </Alert>
              
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nome do Cliente *</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <Input 
                        className="pl-9"
                        value={formData.cliente_nome}
                        onChange={(e) => setFormData(prev => ({ ...prev, cliente_nome: e.target.value }))}
                        placeholder="Nome completo"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Telefone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <Input 
                        className="pl-9"
                        value={formData.cliente_telefone}
                        onChange={(e) => setFormData(prev => ({ ...prev, cliente_telefone: e.target.value }))}
                        placeholder="(00) 00000-0000"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Nº OS Física</Label>
                    <Input 
                      value={formData.numero_os_fisica}
                      onChange={(e) => setFormData(prev => ({ ...prev, numero_os_fisica: e.target.value }))}
                      placeholder="Ex: 12345"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Prioridade</Label>
                    <Select 
                      value={formData.prioridade}
                      onValueChange={(v: any) => setFormData(prev => ({ ...prev, prioridade: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NORMAL">Normal</SelectItem>
                        <SelectItem value="ALTA">Alta</SelectItem>
                        <SelectItem value="URGENTE">Urgente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Valor Venda (R$)</Label>
                    <Input 
                      type="number"
                      step="0.01"
                      value={formData.valor_pedido || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, valor_pedido: parseFloat(e.target.value) || 0 }))}
                      placeholder="0.00"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Observações</Label>
                  <Textarea 
                    value={formData.observacoes}
                    onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                    placeholder="Informações adicionais..."
                    rows={3}
                  />
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
                <Button 
                  onClick={handleFinalizarPedido} 
                  disabled={!formData.cliente_nome || loading}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {loading ? (
                    'Criando...'
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Criar Pedido (REGISTRADO)
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
