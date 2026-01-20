'use client'

import { useState, useEffect } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { User, Phone, Calendar, AlertCircle } from 'lucide-react'
import { calcularSLA } from '@/lib/utils/sla-calculator'
import { Badge } from '@/components/ui/badge'
import type { WizardData } from '../NovaOrdemWizard'

interface Step5Props {
  data: WizardData
  onChange: (data: WizardData) => void
}

export function Step5ClienteSLA({ data, onChange }: Step5Props) {
  const [slaCalculado, setSlaCalculado] = useState<ReturnType<typeof calcularSLA> | null>(null)

  // Calcula SLA quando mudam os valores
  useEffect(() => {
    const prazoLab = data.lente_dados?.prazo_dias || data.sla_dias_lab
    const resultado = calcularSLA(
      new Date(),
      prazoLab,
      data.sla_margem_cliente,
      data.data_prometida_manual ? new Date(data.data_prometida_manual) : undefined
    )
    setSlaCalculado(resultado)
  }, [data.sla_dias_lab, data.sla_margem_cliente, data.data_prometida_manual, data.lente_dados])

  return (
    <div className="space-y-6">
      <div className="text-center pb-4">
        <User className="w-12 h-12 mx-auto mb-3 text-primary" />
        <h3 className="text-lg font-semibold">Dados do Cliente e SLA</h3>
        <p className="text-sm text-muted-foreground">
          Informações de contato e prazo de entrega
        </p>
      </div>

      {/* Dados do Cliente */}
      <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
        <h4 className="font-medium text-sm flex items-center gap-2">
          <User className="w-4 h-4" />
          Dados do Cliente
        </h4>

        <div className="space-y-2">
          <Label htmlFor="cliente-nome">Nome Completo *</Label>
          <Input
            id="cliente-nome"
            value={data.cliente_nome}
            onChange={(e) => onChange({ ...data, cliente_nome: e.target.value })}
            placeholder="Nome do cliente"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cliente-telefone">Telefone *</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="cliente-telefone"
              value={data.cliente_telefone}
              onChange={(e) => onChange({ ...data, cliente_telefone: e.target.value })}
              placeholder="(00) 00000-0000"
              className="pl-9"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="cliente-cpf">CPF (opcional)</Label>
          <Input
            id="cliente-cpf"
            value={data.cliente_cpf || ''}
            onChange={(e) => onChange({ ...data, cliente_cpf: e.target.value })}
            placeholder="000.000.000-00"
          />
        </div>
      </div>

      {/* SLA e Prazo */}
      <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
        <h4 className="font-medium text-sm flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Prazo de Entrega (SLA)
        </h4>

        {data.lente_dados ? (
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded text-sm">
            <p><strong>Prazo do laboratório:</strong> {data.lente_dados.prazo_dias} dias úteis</p>
          </div>
        ) : (
          <div className="space-y-2">
            <Label htmlFor="sla-lab">Prazo do Laboratório (dias úteis)</Label>
            <Input
              id="sla-lab"
              type="number"
              min="1"
              value={data.sla_dias_lab}
              onChange={(e) => onChange({ ...data, sla_dias_lab: parseInt(e.target.value) || 7 })}
            />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="margem">Margem de Segurança (dias úteis)</Label>
          <Input
            id="margem"
            type="number"
            min="0"
            value={data.sla_margem_cliente}
            onChange={(e) => onChange({ ...data, sla_margem_cliente: parseInt(e.target.value) || 2 })}
          />
          <p className="text-xs text-muted-foreground">
            Dias extras adicionados ao prazo do laboratório para garantir entrega
          </p>
        </div>

        {/* Resultado SLA */}
        {slaCalculado && (
          <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Data prometida ao cliente:</span>
              <Badge variant="default" className="text-base">
                {slaCalculado.dataPromessaClienteFormatted}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Lab: {slaCalculado.dataSlaLabFormatted} + {data.sla_margem_cliente} dias = {slaCalculado.dataPromessaClienteFormatted}
            </p>
          </div>
        )}

        {/* Override manual (avançado) */}
        <div className="space-y-2">
          <Label htmlFor="data-manual">Data Manual (sobrescrever cálculo)</Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="data-manual"
              type="date"
              value={data.data_prometida_manual || ''}
              onChange={(e) => onChange({ ...data, data_prometida_manual: e.target.value })}
              className="pl-9"
            />
          </div>
          {slaCalculado?.isDataManualAntesSLA && (
            <div className="flex items-start gap-2 p-2 bg-destructive/10 border border-destructive/20 rounded text-xs">
              <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-destructive">
                <strong>Atenção:</strong> Data manual é antes do SLA do laboratório!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Prioridade */}
      <div className="space-y-2">
        <Label>Prioridade</Label>
        <RadioGroup
          value={data.prioridade}
          onValueChange={(value) => onChange({ ...data, prioridade: value as any })}
        >
          <div className="flex gap-3">
            <label className="flex items-center space-x-2 cursor-pointer">
              <RadioGroupItem value="NORMAL" id="prioridade-normal" />
              <span className="text-sm">Normal</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <RadioGroupItem value="URGENTE" id="prioridade-urgente" />
              <span className="text-sm">Urgente</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <RadioGroupItem value="CRITICA" id="prioridade-critica" />
              <span className="text-sm">Crítica</span>
            </label>
          </div>
        </RadioGroup>
      </div>

      {/* Garantia */}
      <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="garantia"
            checked={data.eh_garantia}
            onCheckedChange={(checked) => onChange({ ...data, eh_garantia: checked as boolean })}
          />
          <Label htmlFor="garantia" className="cursor-pointer">
            Este pedido é uma garantia
          </Label>
        </div>

        {data.eh_garantia && (
          <div className="space-y-2">
            <Label htmlFor="obs-garantia">Motivo da Garantia</Label>
            <Textarea
              id="obs-garantia"
              value={data.observacoes_garantia || ''}
              onChange={(e) => onChange({ ...data, observacoes_garantia: e.target.value })}
              placeholder="Descreva o motivo da garantia..."
              rows={3}
            />
          </div>
        )}
      </div>

      {/* Observações Gerais */}
      <div className="space-y-2">
        <Label htmlFor="observacoes">Observações Gerais (opcional)</Label>
        <Textarea
          id="observacoes"
          value={data.observacoes || ''}
          onChange={(e) => onChange({ ...data, observacoes: e.target.value })}
          placeholder="Informações adicionais sobre o pedido..."
          rows={3}
        />
      </div>
    </div>
  )
}
