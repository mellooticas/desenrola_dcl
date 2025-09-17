'use client'

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Upload, DollarSign, CreditCard, MessageCircle, CheckCircle } from 'lucide-react'
import { PedidoCompleto } from '@/lib/types/database'
import { usePermissions } from '@/lib/hooks/use-permissions'
import { useAuth } from '@/components/providers/AuthProvider'

interface PagamentoPIXFormProps {
  pedido: PedidoCompleto
  onSuccess: () => void
}

export default function PagamentoPIXForm({ pedido, onSuccess }: PagamentoPIXFormProps) {
  const { user } = useAuth()
  const permissions = usePermissions()
  
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1) // 1: Upload, 2: Confirmação, 3: WhatsApp
  
  const [formData, setFormData] = useState({
    comprovante: null as File | null,
    valor_recebido: pedido.valor_pedido?.toString() || '',
    chave_utilizada: '',
    observacoes_pagamento: '',
    whatsapp_cliente: pedido.cliente_telefone || ''
  })

  // Verificar se tem permissão
  if (!permissions.hasAction('upload_comprovante') || pedido.status !== 'AG_PAGAMENTO') {
    return null
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validar tipo de arquivo
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
      if (!allowedTypes.includes(file.type)) {
        alert('Tipo de arquivo não permitido. Use JPG, PNG ou PDF.')
        return
      }
      
      // Validar tamanho (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Arquivo muito grande. Máximo 5MB.')
        return
      }
      
      setFormData(prev => ({ ...prev, comprovante: file }))
    }
  }

  const uploadComprovante = async (file: File): Promise<string> => {
    // Simular upload do comprovante
    // Em produção, usar Supabase Storage ou outro serviço
    const formData = new FormData()
    formData.append('file', file)
    formData.append('pedido_id', pedido.id)
    
    // Mock da URL do comprovante
    return `https://storage.exemplo.com/comprovantes/${pedido.id}_${Date.now()}.${file.name.split('.').pop()}`
  }

  const enviarWhatsApp = async () => {
    // Em produção, integrar com WhatsApp Business API
    // Enviando WhatsApp para o cliente
    
    // Mock do envio
    await new Promise(resolve => setTimeout(resolve, 1000))
    return true
  }

  const handleConfirmarPagamento = async () => {
    if (!formData.comprovante) {
      alert('Selecione o comprovante primeiro')
      return
    }

    try {
      setLoading(true)
      
      // 1. Upload do comprovante
      const comprovanteUrl = await uploadComprovante(formData.comprovante)
      
      // 2. Atualizar pedido no banco
      await fetch('/api/pedidos/pagamento', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pedido_id: pedido.id,
          valor_recebido: parseFloat(formData.valor_recebido),
          chave_utilizada: formData.chave_utilizada,
          comprovante_url: comprovanteUrl,
          observacoes_pagamento: formData.observacoes_pagamento,
          processado_por: user?.email ?? 'Usuário'
        })
      })
      
      setStep(2) // Ir para confirmação
    } catch {
      // Erro ao processar pagamento
      alert('Erro ao processar pagamento')
    } finally {
      setLoading(false)
    }
  }

  const handleEnviarWhatsApp = async () => {
    try {
      setLoading(true)
      await enviarWhatsApp()
      setStep(3) // Finalizado
      
      setTimeout(() => {
        setOpen(false)
        onSuccess()
      }, 2000)
    } catch {
      // Erro ao enviar WhatsApp
      alert('Pagamento processado, mas erro ao enviar WhatsApp')
    } finally {
      setLoading(false)
    }
  }

  const renderStep1 = () => (
    <div className="space-y-4">
      <Alert>
        <CreditCard className="h-4 w-4" />
        <AlertDescription>
          Confirme o recebimento do PIX para o pedido #{pedido.numero_sequencial}
        </AlertDescription>
      </Alert>

      {/* Info do pedido */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <span className="font-medium">Cliente: {pedido.cliente_nome}</span>
            <Badge variant="outline">#{pedido.numero_sequencial}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Valor esperado:</span>
              <div className="font-medium">R$ {pedido.valor_pedido?.toFixed(2)}</div>
            </div>
            <div>
              <span className="text-gray-600">Loja:</span>
              <div className="font-medium">{pedido.loja_nome}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upload do comprovante */}
      <div className="space-y-2">
        <Label>Comprovante PIX *</Label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
          <input
            type="file"
            accept=".jpg,.jpeg,.png,.pdf"
            onChange={handleFileUpload}
            className="hidden"
            id="comprovante-upload"
          />
          <label htmlFor="comprovante-upload" className="cursor-pointer">
            <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
            <p className="text-sm text-gray-600 mb-1">
              {formData.comprovante ? formData.comprovante.name : 'Clique para selecionar o comprovante'}
            </p>
            <p className="text-xs text-gray-500">JPG, PNG ou PDF até 5MB</p>
          </label>
        </div>
      </div>

      {/* Valor recebido */}
      <div className="space-y-2">
        <Label htmlFor="valor_recebido">Valor Recebido *</Label>
        <div className="relative">
          <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="valor_recebido"
            type="number"
            step="0.01"
            value={formData.valor_recebido}
            onChange={(e) => setFormData(prev => ({ ...prev, valor_recebido: e.target.value }))}
            className="pl-10"
            placeholder="0,00"
          />
        </div>
      </div>

      {/* Chave PIX utilizada */}
      <div className="space-y-2">
        <Label htmlFor="chave_utilizada">Chave PIX Utilizada</Label>
        <Input
          id="chave_utilizada"
          value={formData.chave_utilizada}
          onChange={(e) => setFormData(prev => ({ ...prev, chave_utilizada: e.target.value }))}
          placeholder="CPF, e-mail, telefone ou chave aleatória"
        />
      </div>

      {/* Observações */}
      <div className="space-y-2">
        <Label htmlFor="observacoes">Observações</Label>
        <Textarea
          id="observacoes"
          value={formData.observacoes_pagamento}
          onChange={(e) => setFormData(prev => ({ ...prev, observacoes_pagamento: e.target.value }))}
          placeholder="Observações sobre o pagamento..."
          rows={2}
        />
      </div>

      <Button 
        onClick={handleConfirmarPagamento}
        disabled={!formData.comprovante || !formData.valor_recebido || loading}
        className="w-full"
      >
        {loading ? 'Processando...' : 'Confirmar Pagamento PIX'}
      </Button>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-4 text-center">
      <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
        <CheckCircle className="h-8 w-8 text-green-600" />
      </div>
      
      <div>
        <h3 className="text-lg font-semibold text-green-700">Pagamento Confirmado!</h3>
        <p className="text-gray-600">O pedido foi marcado como PAGO</p>
      </div>

      <Card>
        <CardContent className="pt-4">
          <div className="text-left space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Valor recebido:</span>
              <span className="font-medium">R$ {formData.valor_recebido}</span>
            </div>
            {formData.chave_utilizada && (
              <div className="flex justify-between">
                <span>Chave PIX:</span>
                <span className="font-medium">{formData.chave_utilizada}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Processado por:</span>
              <span className="font-medium">{user?.email ?? 'Usuário'}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* WhatsApp */}
      <div className="space-y-3">
        <Label htmlFor="whatsapp_cliente">Enviar comprovante via WhatsApp</Label>
        <Input
          id="whatsapp_cliente"
          value={formData.whatsapp_cliente}
          onChange={(e) => setFormData(prev => ({ ...prev, whatsapp_cliente: e.target.value }))}
          placeholder="(11) 99999-9999"
        />
        
        <Button 
          onClick={handleEnviarWhatsApp}
          disabled={!formData.whatsapp_cliente || loading}
          className="w-full bg-green-600 hover:bg-green-700"
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          {loading ? 'Enviando...' : 'Enviar Comprovante por WhatsApp'}
        </Button>
        
        <Button 
          variant="outline"
          onClick={() => {
            setOpen(false)
            onSuccess()
          }}
          className="w-full"
        >
          Pular WhatsApp
        </Button>
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-4 text-center">
      <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
        <MessageCircle className="h-8 w-8 text-blue-600" />
      </div>
      
      <div>
        <h3 className="text-lg font-semibold text-blue-700">WhatsApp Enviado!</h3>
        <p className="text-gray-600">Comprovante enviado para {formData.whatsapp_cliente}</p>
      </div>

      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>
          Pedido #{pedido.numero_sequencial} processado com sucesso!
        </AlertDescription>
      </Alert>
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-green-600 hover:bg-green-700">
          <CreditCard className="w-4 h-4 mr-2" />
          Confirmar PIX
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Pagamento PIX
          </DialogTitle>
          <DialogDescription>
            {step === 1 && 'Upload do comprovante e confirmação'}
            {step === 2 && 'Pagamento processado - Enviar WhatsApp'}
            {step === 3 && 'Processo finalizado'}
          </DialogDescription>
        </DialogHeader>

        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-2 mb-4">
          {[1, 2, 3].map((stepNum) => (
            <div
              key={stepNum}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                stepNum === step
                  ? 'bg-blue-600 text-white'
                  : stepNum < step
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {stepNum < step ? '✓' : stepNum}
            </div>
          ))}
        </div>

        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </DialogContent>
    </Dialog>
  )
}
